import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useUser } from '../context/UserContext';

export function VerifyPage() {
  const { user, loginWithMagicLink } = useUser();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState();
  const navigate = useNavigate();
  const calledRef = useRef(false);
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token || user) navigate('/', { replace: true });
  }, [user, token, navigate]);

  useEffect(() => {
    if (!token || user) return;

    // In local development the useEffect is called twice, so we need to use a ref to prevent the login from being called twice
    if (calledRef.current) return;
    calledRef.current = true;

    verify();

    async function verify() {
      try {
        const user = await loginWithMagicLink(token);
        toast.success(`¡Bienvenido ${user.username}!`);
      } catch (err) {
        console.error('VerifyPage: Verification error:', err);
        toast.error('Error de verificación', {
          description: 'El enlace puede haber expirado o ser incorrecto.',
        });

        const errorMsg =
          err.response?.data?.error || 'Enlace inválido o expirado';
        setError(errorMsg);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
