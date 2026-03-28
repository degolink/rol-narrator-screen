import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export function VerifyPage() {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const calledRef = useRef(false);

  useEffect(() => {
    const verify = async () => {
      if (!token || calledRef.current) return;
      calledRef.current = true;

      try {
        const user = await authService.verifyMagicLink(token);

        login(user);

        toast.success(`¡Bienvenido ${user.username}!`);
        navigate('/', { replace: true });
      } catch (err) {
        console.error('VerifyPage: Verification error:', err);
        setError(err.response?.data?.error || 'Enlace inválido o expirado');
        toast.error('Error de verificación', {
          description: 'El enlace puede haber expirado o ser incorrecto.',
        });
      }
    };

    verify();
  }, [token, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] p-4 text-center">
      <div className="max-w-md w-full space-y-6">
        {!error ? (
          <>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h1 className="text-2xl font-bold text-white">
              Verificando tu enlace mágico...
            </h1>
            <p className="text-gray-400">
              Espera un momento, estamos preparando tu sesión.
            </p>
          </>
        ) : (
          <div className="bg-[#16161a] border border-red-900/50 p-8 rounded-2xl shadow-2xl space-y-4">
            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">
              ¡Ups! Algo salió mal
            </h1>
            <p className="text-red-400 font-medium">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold p-4 rounded-xl transition-colors"
            >
              Volver al Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
