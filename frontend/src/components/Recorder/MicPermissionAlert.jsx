import { ShieldAlert, MicOff } from 'lucide-react';

export function MicPermissionAlert({ micPermission }) {
  if (micPermission === 'denied') {
    return (
      <div className="w-full rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-300">
            Micrófono bloqueado
          </p>
          <p className="text-xs text-red-300/70 mt-1">
            Para habilitarlo, haz clic en el ícono de candado en la barra de
            navegación de tu navegador y permite el acceso al micrófono.
          </p>
        </div>
      </div>
    );
  }

  if (micPermission === 'error') {
    return (
      <div className="w-full rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
        <MicOff className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-300">
            Micrófono no disponible
          </p>
          <p className="text-xs text-amber-300/70 mt-1">
            No se pudo acceder al micrófono. Verifica que tu dispositivo tenga
            un micrófono conectado.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
