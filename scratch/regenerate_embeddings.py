import os

import numpy as np
import torch
from django.conf import settings
from django.contrib.auth.models import User
from pydub import AudioSegment
from speechbrain.inference import EncoderClassifier

from rol.models import VoiceProfile


def run():
    samples_dir = os.path.join(settings.MEDIA_ROOT, "voice_samples")
    model_dir = os.path.join(settings.MEDIA_ROOT, "models/speechbrain")
    os.makedirs(model_dir, exist_ok=True)

    print("Loading SpeechBrain model...")
    classifier = EncoderClassifier.from_hparams(
        source="speechbrain/spkrec-ecapa-voxceleb",
        savedir=model_dir,
        run_opts={"device": "cpu"},
    )

    files = [
        f
        for f in os.listdir(samples_dir)
        if f.startswith("user_") and f.endswith(".wav")
    ]
    print(f"Found {len(files)} voice samples.")

    for filename in files:
        try:
            # Extract user ID: user_1_sample.wav -> 1
            user_id = int(filename.split("_")[1])
            user = User.objects.filter(id=user_id).first()
            if not user:
                print(f"User with ID {user_id} not found. Skipping {filename}")
                continue

            print(f"Processing voice sample for user {user.username} ({user_id})...")
            full_path = os.path.join(samples_dir, filename)

            # Load and normalize audio
            audio = (
                AudioSegment.from_file(full_path).set_frame_rate(16000).set_channels(1)
            )
            samples = np.array(audio.get_array_of_samples()).astype(np.float32)
            if audio.sample_width == 2:
                samples /= 32768.0

            signal = torch.from_numpy(samples).unsqueeze(0)
            embedding = classifier.encode_batch(signal).squeeze().tolist()

            # Update or create VoiceProfile
            profile, created = VoiceProfile.objects.update_or_create(
                user=user, defaults={"embedding": embedding}
            )

            status = "Created" if created else "Updated"
            print(f"{status} voice profile for {user.username}")

        except Exception as e:
            print(f"Error processing {filename}: {e}")

    print("Done regenerating embeddings.")


run()
