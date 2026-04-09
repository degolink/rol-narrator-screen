import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { api } from '@/services/apiService';

const ENROLL_DURATION_SECONDS = 10;

export function VoiceEnrollment({ hasProfile }) {
  // State management for recording status and UI feedback
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ENROLL_DURATION_SECONDS);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(hasProfile);

  // References to handle mutable recording state without re-rendering
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const wasCancelledRef = useRef(false);

  // Cleanup on unmount to prevent memory leaks and stop ghost recordings
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startEnrollment = async () => {
    wasCancelledRef.current = false;
    try {
      // 1. Request microphone access from the browser
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // 2. Accumulate audio data chunks as they become available
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      // 3. Handle processing when the recording stops
      mediaRecorder.onstop = async () => {
        // If the user cancelled, we discard the data
        if (wasCancelledRef.current) {
          // Physically turn off the microphone hardware
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        // Combine chunks into a single audio file and upload
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        uploadVoice(audioBlob);
        // Physically turn off the microphone hardware
        stream.getTracks().forEach((t) => t.stop());
      };

      // 4. Start recording and initialize the timer
      setIsRecording(true);
      setTimeLeft(ENROLL_DURATION_SECONDS);
      mediaRecorder.start();

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      toast.error('No se pudo acceder al micrófono para el enrolamiento.');
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const cancelRecording = () => {
    wasCancelledRef.current = true;
    stopRecording();
    toast.info('Grabación cancelada.');
  };

  const uploadVoice = async (blob) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('audio', blob, 'enroll.wav');

    try {
      // Send audio to the backend for embedding extraction
      await api.post('/profile/enroll_voice/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIsSuccess(true);
      toast.success('¡Huella de voz registrada con éxito!');
    } catch (err) {
      toast.error('Error al subir la huella de voz.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  // Calculate progress percentage for the UI bar
  const progressValue =
    ((ENROLL_DURATION_SECONDS - timeLeft) / ENROLL_DURATION_SECONDS) * 100;

  return (
    <Card className="bg-[#1e1e24]/50 border-[#2d2d35] shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl uppercase tracking-wider flex items-center gap-2 text-gray-100">
          <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
          Huella de Voz
        </CardTitle>
        <CardDescription className="text-gray-400">
          Registra tu voz para que el Cronista pueda identificarte
          automáticamente en las sesiones.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isSuccess && !isRecording && (
          <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <div>
              <p className="text-sm font-bold text-green-400">
                Huella Registrada
              </p>
              <p className="text-xs text-green-500/60 font-medium">
                El sistema ya reconoce tu voz.
              </p>
            </div>
          </div>
        )}

        {!isSuccess && !isRecording && (
          <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
            <AlertCircle className="w-6 h-6 text-amber-500" />
            <div>
              <p className="text-sm font-bold text-amber-400">Sin Registrar</p>
              <p className="text-xs text-amber-500/60 font-medium">
                Graba un fragmento de 10s para activarlo.
              </p>
            </div>
          </div>
        )}

        {isRecording && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-xs font-black text-blue-500 uppercase tracking-widest animate-pulse">
                  Grabando muestra...
                </p>
                <p className="text-2xl font-mono font-bold text-white tabular-nums">
                  00:{timeLeft.toString().padStart(2, '0')}
                </p>
              </div>
              <Mic className="w-8 h-8 text-blue-600 animate-bounce" />
            </div>

            <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-600/40" />
              <p className="text-lg font-serif italic text-gray-200 leading-relaxed text-center px-4">
                "En las sombras del destino, mi voz resuena. Soy el eco de la
                aventura y el alma de mi héroe. Que el Cronista registre mis
                palabras, pues cada susurro forja el Códice de nuestra
                historia."
              </p>
            </div>

            <Progress value={progressValue} className="h-2 bg-gray-800" />
            <p className="text-[10px] text-gray-500 italic text-center uppercase tracking-tighter">
              Lee el texto superior en voz alta con tono natural.
            </p>
          </div>
        )}

        {isUploading && (
          <div className="flex flex-col items-center justify-center py-4 gap-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Extrayendo Huella Digital...
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-3 pt-2">
        {isRecording ? (
          <Button
            variant="destructive"
            onClick={cancelRecording}
            className="font-bold uppercase tracking-widest text-[10px]"
          >
            <Square className="w-3 h-3 mr-2" /> Cancelar
          </Button>
        ) : (
          <Button
            onClick={startEnrollment}
            disabled={isUploading}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest text-[10px] px-8"
          >
            {isSuccess ? 'Actualizar Huella' : 'Comenzar Registro'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
