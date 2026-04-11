import json
import uuid
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings


def _get_recording_tz():
    """Return the configured recording timezone, falling back to UTC."""
    try:
        return ZoneInfo(getattr(settings, "RECORDING_TIMEZONE", "UTC"))
    except ZoneInfoNotFoundError:
        return ZoneInfo("UTC")


RECORDING_TZ = _get_recording_tz()


class RecordingConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time audio streaming.

    Receives binary audio chunks from the client and appends them to an .ogg
    file on disk. Control messages (start, pause, resume, stop) are sent as
    JSON text frames.
    """

    async def connect(self):
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            await self.close()
            return

        self.file_handle = None
        self.session_id = None
        self.started_at = None

        await self.accept()

    async def disconnect(self, close_code):
        # Safety net: close any open file handle
        self._close_file()

    async def receive(self, text_data=None, bytes_data=None):
        if text_data:
            await self._handle_control_message(text_data)
        elif bytes_data:
            await self._handle_audio_data(bytes_data)

    # ── Control messages ──────────────────────────────────────────────

    async def _handle_control_message(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        msg_type = data.get("type")

        if msg_type == "start":
            await self._start_recording()
        elif msg_type == "stop":
            await self._stop_recording()

    async def _start_recording(self):
        # Close any previous session that wasn't stopped cleanly
        self._close_file()

        date_prefix = datetime.now(tz=RECORDING_TZ).strftime("%Y-%m-%d_%H-%M-%S")
        self.session_id = f"{date_prefix}_{uuid.uuid4().hex[:8]}"
        recordings_dir = Path(settings.MEDIA_ROOT) / "recordings"
        recordings_dir.mkdir(parents=True, exist_ok=True)

        file_path = recordings_dir / f"{self.session_id}.ogg"
        self.file_handle = open(file_path, "ab")  # noqa: SIM115
        self.started_at = datetime.now(tz=RECORDING_TZ)

        # Broadcast start
        await self.channel_layer.group_send(
            "broadcast",
            {
                "type": "recording_status",
                "status": "started",
                "user": self.user.username,
            },
        )

        await self.send(
            text_data=json.dumps({"type": "started", "session_id": self.session_id})
        )

    async def _stop_recording(self):
        file_name = f"{self.session_id}.ogg"
        self._close_file()

        # Aggregation logic: Group by day + Capture Snapshot
        from asgiref.sync import sync_to_async

        from .models import ChronicleSession, UserProfile

        today = datetime.now(tz=RECORDING_TZ).date()

        def get_snapshot():
            profiles = UserProfile.objects.select_related(
                "user", "active_character"
            ).all()
            return {
                p.user.id: p.active_character.id if p.active_character else None
                for p in profiles
            }

        snapshot = await sync_to_async(get_snapshot)()

        def update_session():
            session, _ = ChronicleSession.objects.get_or_create(date=today)
            # audio_files structure: [{"path": "...", "snapshot": {...}}]
            if not isinstance(session.audio_files, list):
                session.audio_files = []

            entry = {
                "path": f"recordings/{file_name}",
                "snapshot": snapshot,
                "timestamp": datetime.now(tz=RECORDING_TZ).isoformat(),
            }
            session.audio_files.append(entry)
            session.save()

        await sync_to_async(update_session)()

        # Broadcast stop
        await self.channel_layer.group_send(
            "broadcast",
            {
                "type": "recording_status",
                "status": "stopped",
                "user": self.user.username,
            },
        )

        await self.send(text_data=json.dumps({"type": "stopped"}))

    # ── Binary audio data ─────────────────────────────────────────────

    async def _handle_audio_data(self, bytes_data):
        if not self.file_handle:
            return

        # Enforce max duration
        max_duration = getattr(settings, "AUDIO_MAX_DURATION_SECONDS", 6 * 60 * 60)
        if self.started_at:
            elapsed = (datetime.now(tz=RECORDING_TZ) - self.started_at).total_seconds()
            if elapsed >= max_duration:
                self._close_file()
                await self.send(
                    text_data=json.dumps(
                        {
                            "type": "max_duration",
                            "message": "Se alcanzó el límite máximo de grabación (6 horas).",
                        }
                    )
                )
                return

        self.file_handle.write(bytes_data)
        self.file_handle.flush()

    # ── Helpers ────────────────────────────────────────────────────────

    def _close_file(self):
        if self.file_handle:
            try:
                self.file_handle.close()
            except Exception:
                pass
            finally:
                self.file_handle = None
                self.session_id = None
                self.started_at = None
