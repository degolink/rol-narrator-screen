import React, { useState } from 'react';
import * as v from 'valibot';
import { toast } from 'sonner';
import { authService } from '../services/authService';

function validateEmail(email) {
  return v.safeParse(v.pipe(v.string(), v.email()), email).success;
};

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [showUsername, setShowUsername] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast.error('Por favor ingresa un correo válido');
      return;
    }

    setLoading(true);
    try {
      await authService.requestMagicLink(email, showUsername ? username : undefined);
      setSent(true);
      toast.success('¡Enlace enviado!', {
        description: 'Revisa tu correo (o la terminal de backend en desarrollo).',
      });
    } catch (error) {
      if (error.response?.data?.code === 'USER_NOT_FOUND') {
        setShowUsername(true);
        toast.info('Usuario no encontrado', {
          description: 'Por favor ingresa un nombre de usuario para crear tu cuenta.',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [email, username, showUsername]);

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] p-4 font-inter">
        <div className="max-w-md w-full bg-[#16161a] border border-[#2d2d35] p-8 rounded-2xl shadow-2xl text-center space-y-6">
          <div className="w-20 h-20 bg-[#2d2d35] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">¡Revisa tu correo!</h1>
          <p className="text-gray-400">
            Hemos enviado un enlace mágico a <span className="text-blue-400 font-medium">{email}</span>.
          </p>
          <div className="bg-[#1e1e24] p-4 rounded-xl border border-yellow-500/30 text-yellow-200/80 text-sm">
            <p className="font-semibold mb-1">⚠️ Importante:</p>
            <p>Si no ves el correo, revisa tu carpeta de <strong>spam</strong>.</p>
            <p className="mt-2 text-xs italic opacity-60">(En modo desarrollo, el enlace aparece en la terminal del backend)</p>
          </div>
          <button
            onClick={() => setSent(false)}
            className="text-gray-500 hover:text-white transition-colors text-sm"
          >
            ¿Te equivocaste de correo? Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] p-4 font-inter">
      <div className="max-w-md w-full bg-[#16161a] border border-[#2d2d35] p-8 rounded-2xl shadow-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Pantalla De Narrador</h1>
          <p className="text-gray-500">Inicia sesión para continuar tu aventura</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              className="w-full bg-[#1e1e24] border border-[#2d2d35] text-white p-4 rounded-xl focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-600"
            />
          </div>

          {showUsername && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Nombre de Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Indica un nombre de usuario"
                required
                className="w-full bg-[#1e1e24] border border-[#2d2d35] text-white p-4 rounded-xl focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-600"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold p-4 rounded-xl shadow-lg shadow-blue-600/20 transform active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'Enviando...' : showUsername ? 'Crear Cuenta y Entrar' : 'Enviar Enlace Mágico'}
          </button>
        </form>

        <div className="pt-4 text-center">
          <p className="text-gray-600 text-xs">
            Sin contraseñas. Sin complicaciones. Solo rol.
          </p>
        </div>
      </div>
    </div>
  );
}
