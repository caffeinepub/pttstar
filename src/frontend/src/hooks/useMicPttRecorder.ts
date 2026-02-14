import { useState, useRef, useCallback } from 'react';

export type MicError = 'permission-denied' | 'not-found' | 'unknown';

export function useMicPttRecorder(onRecordingComplete?: (blobUrl: string, blob: Blob) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<MicError | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedBlobUrl(url);
        
        if (onRecordingComplete) {
          onRecordingComplete(url, blob);
        }
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('permission-denied');
      } else if (err.name === 'NotFoundError') {
        setError('not-found');
      } else {
        setError('unknown');
      }
      console.error('Microphone access error:', err);
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const resetRecording = useCallback(() => {
    if (recordedBlobUrl) {
      URL.revokeObjectURL(recordedBlobUrl);
    }
    setRecordedBlob(null);
    setRecordedBlobUrl(null);
  }, [recordedBlobUrl]);

  return {
    startRecording,
    stopRecording,
    resetRecording,
    isRecording,
    error,
    recordedBlob,
    recordedBlobUrl,
  };
}
