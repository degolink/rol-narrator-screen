import logging
import os

import numpy as np
import requests
import torch
from asgiref.sync import async_to_sync
from celery import shared_task
from channels.layers import get_channel_layer
from django.conf import settings
from django.utils import timezone
from faster_whisper import WhisperModel
from pydub import AudioSegment

from .models import ChronicleSession, TranscriptionFragment, VoiceProfile


def update_progress(session_id, progress, status):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "chronicler_updates",
        {
            "type": "chronicler_progress",
            "progress": progress,
            "status": status,
            "session_id": session_id,
        },
    )


def get_ai_summary(prompt):
    url = f"{settings.CHRONICLER_OLLAMA_URL}/api/generate"
    payload = {"model": "gemma4:e4b", "prompt": prompt, "stream": False}
    try:
        response = requests.post(url, json=payload, timeout=60)
        return response.json().get("response", "")
    except Exception as e:
        print(f"Ollama error: {e}")
        return "No se pudo generar el resumen."


def _build_known_profiles():
    """
    Fetches all voice profiles and maps them to a list of dicts with the
    data needed for speaker identification. Uses select_related to avoid
    N+1 queries.
    """
    profiles = VoiceProfile.objects.all().select_related("user__profile", "character")
    known_profiles = []
    for p in profiles:
        has_profile = hasattr(p.user, "profile")
        known_profiles.append(
            {
                "embedding": torch.tensor(p.embedding),
                "user_id": p.user_id,
                "profile_char_id": p.character_id,
                "is_dm": p.user.profile.is_dungeon_master if has_profile else False,
                "username": p.user.username,
                "active_char_id": p.user.profile.active_character_id
                if has_profile
                else None,
            }
        )
    return known_profiles


def _identify_speaker(seg_embedding, known_profiles, snapshot):
    """
    Compares a segment embedding against all known voice profiles using
    cosine similarity and resolves the speaker's character identity.

    Returns a tuple (identified_char_id, is_dm).
    Priority for character resolution:
      1. Character linked to the voice profile.
      2. Character in the session snapshot for this user.
      3. User's currently active character.
    """
    best_profile = None
    best_score = -1.0

    for p_data in known_profiles:
        score = torch.nn.functional.cosine_similarity(
            seg_embedding.unsqueeze(0), p_data["embedding"].unsqueeze(0)
        ).item()
        if score > best_score:
            best_score = score
            best_profile = p_data

    best_username = best_profile["username"] if best_profile else "Unknown"
    logging.warning(f"[Cronista] Best match: {best_username} | Score: {best_score:.4f}")

    identified_char_id = None
    is_dm = False

    if best_score > 0.55 and best_profile:
        char_id = best_profile["profile_char_id"]
        if not char_id:
            char_id = snapshot.get(str(best_profile["user_id"]))
        if not char_id:
            char_id = best_profile["active_char_id"]

        if char_id:
            identified_char_id = char_id
            logging.info(
                f"[Cronista]   -> Character ID {char_id} (Score: {best_score:.3f})"
            )
        elif best_profile["is_dm"]:
            is_dm = True
            logging.info(f"[Cronista]   -> DM identified (Score: {best_score:.3f})")
        else:
            logging.info(
                f"[Cronista]   -> User {best_username} without character (Score: {best_score:.3f})"
            )
    else:
        logging.info(f"[Cronista]   -> Unidentified (Score: {best_score:.3f})")

    return identified_char_id, is_dm


def _process_segment(
    segment, audio, classifier, known_profiles, snapshot, session, info
):
    """
    Processes a single Whisper segment: extracts its audio embedding,
    identifies the speaker, persists the transcription fragment, and
    returns the segment end time for checkpoint tracking.
    """
    duration = segment.end - segment.start

    if duration < 0.5:
        # Skip ultra-short segments — unreliable for diarization.
        TranscriptionFragment.objects.create(
            session=session,
            text=segment.text,
            timestamp=segment.start,
            identified_char_id=None,
            is_dm=False,
        )
        return segment.end

    start_ms = int(segment.start * 1000)
    end_ms = int(segment.end * 1000)

    # Normalize to 16kHz mono for SpeechBrain.
    segment_audio = audio[start_ms:end_ms].set_frame_rate(16000).set_channels(1)
    samples = np.array(segment_audio.get_array_of_samples()).astype(np.float32)
    if segment_audio.sample_width == 2:
        samples /= 32768.0  # Normalize 16-bit PCM to float range [-1.0, 1.0].

    signal = torch.from_numpy(samples).unsqueeze(0)
    seg_embedding = classifier.encode_batch(signal).squeeze()

    identified_char_id, is_dm = _identify_speaker(
        seg_embedding, known_profiles, snapshot
    )

    logging.warning(
        f"[Cronista] Segment: '{segment.text[:30]}...' | Duration: {duration:.2f}s"
    )

    TranscriptionFragment.objects.create(
        session=session,
        text=segment.text,
        timestamp=segment.start,
        character_id=identified_char_id,
        is_dm=is_dm,
    )
    return segment.end


def _process_audio_entry(entry, session, model):
    """
    Handles the full transcription and diarization pipeline for a single
    audio file entry. Marks the entry as processed when done.
    """
    from speechbrain.inference import EncoderClassifier

    audio_path = entry.get("path")
    snapshot = entry.get("snapshot", {})
    full_path = os.path.join(settings.MEDIA_ROOT, audio_path)

    if not os.path.exists(full_path):
        return

    audio = AudioSegment.from_file(full_path)
    known_profiles = _build_known_profiles()

    model_dir = os.path.join(settings.MEDIA_ROOT, "models/speechbrain")
    os.makedirs(model_dir, exist_ok=True)
    classifier = EncoderClassifier.from_hparams(
        source="speechbrain/spkrec-ecapa-voxceleb",
        savedir=model_dir,
        run_opts={"device": "cpu"},
    )

    segments, info = model.transcribe(full_path, beam_size=5)

    for segment in segments:
        segment_end = _process_segment(
            segment, audio, classifier, known_profiles, snapshot, session, info
        )
        # Checkpoint every N seconds of processed audio.
        if (
            segment_end - session.last_processed_timestamp
            >= settings.CHRONICLER_CHECKPOINT_SECONDS
        ):
            session.last_processed_timestamp = segment_end
            session.save()
            progress = int(segment_end / (info.duration or 1) * 80)
            update_progress(session.id, progress, "TRANSCRIBING")

    entry["processed"] = True
    session.save()


def _generate_summary(session):
    """
    Builds a narrative prompt from all transcription fragments and calls
    the local LLM (Ollama) to produce an epic RPG session summary.
    """
    fragments_with_names = []
    for f in session.fragments.all().select_related("character"):
        name = (
            f.character.name
            if f.character
            else ("Narrador" if f.is_dm else "Desconocido")
        )
        fragments_with_names.append(f"{name}: {f.text}")

    full_text = "\n".join(fragments_with_names)
    prompt = (
        "Genera una crónica épica para la siguiente sesión de RPG en español. "
        "Sigue este formato estrictamente:\n"
        "1. La primera línea debe ser UN TÍTULO ÉPICO Y CORTO para la sesión.\n"
        "2. El resto del texto debe ser un resumen narrativo detallado.\n"
        "Usa los nombres de los personajes para dar contexto.\n\n"
        f"Transcripción:\n{full_text}"
    )
    return get_ai_summary(prompt)


@shared_task(bind=True)
def process_chronicler_session(self, session_id):
    """
    Celery task that orchestrates the full chronicler pipeline:
      1. Transcribes unprocessed audio files with Whisper.
      2. Diarizes each segment to identify the speaking character.
      3. Generates a narrative summary via a local LLM.
    """
    session = ChronicleSession.objects.get(id=session_id)
    session.status = "TRANSCRIBING"
    session.celery_task_id = self.request.id
    session.save()

    update_progress(session.id, 10, "TRANSCRIBING")

    try:
        model = WhisperModel(
            settings.CHRONICLER_WHISPER_MODEL,
            device="cpu",
            compute_type=settings.CHRONICLER_WHISPER_COMPUTE_TYPE,
        )

        for entry in session.audio_files:
            if entry.get("processed"):
                continue
            _process_audio_entry(entry, session, model)

        session.status = "SUMMARIZING"
        session.save()
        update_progress(session.id, 90, "SUMMARIZING")

        summary_text = _generate_summary(session).strip()
        
        # Split by first newline to separate title from summary
        lines = summary_text.split('\n', 1)
        if len(lines) > 1:
            session.title = lines[0].strip()
            session.summary = lines[1].strip()
        else:
            session.title = "Sesión sin título"
            session.summary = summary_text

        session.status = "COMPLETED"
        session.save()
        update_progress(session.id, 100, "COMPLETED")

    except Exception as e:
        session.status = "PAUSED"
        session.save()
        update_progress(session.id, 0, f"Error: {str(e)}")
        raise e
