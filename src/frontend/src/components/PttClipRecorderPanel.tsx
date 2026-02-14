/**
 * PTT Clip Recorder Panel
 * Non-real-time audio clip recording with press/hold interaction and local preview
 */

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, Play, Pause, Upload, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useMicPttRecorder } from '../hooks/useMicPttRecorder';
import { usePttClipUpload } from '../hooks/usePttClipUpload';

export default function PttClipRecorderPanel() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    startRecording,
    stopRecording,
    resetRecording,
    isRecording,
    error: micError,
    recordedBlob,
    recordedBlobUrl,
  } = useMicPttRecorder();

  const uploadMutation = usePttClipUpload();

  const handlePressStart = () => {
    if (!isRecording && !recordedBlob) {
      startRecording();
    }
  };

  const handlePressEnd = () => {
    if (isRecording) {
      stopRecording();
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current || !recordedBlobUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleUpload = () => {
    if (recordedBlob) {
      uploadMutation.mutate({ blob: recordedBlob });
    }
  };

  const handleDiscard = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    resetRecording();
    uploadMutation.reset();
  };

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'permission-denied':
        return 'Microphone permission denied. Please allow microphone access in your browser settings.';
      case 'not-found':
        return 'No microphone found. Please connect a microphone and try again.';
      default:
        return 'An error occurred while accessing the microphone. Please try again.';
    }
  };

  return (
    <Card className="console-panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Audio Clip Recorder</CardTitle>
        <CardDescription className="text-xs">
          Record short audio clips (non-real-time). Press and hold to record, release to stop.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {micError && (
          <Alert variant="destructive" className="console-panel">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs">{getErrorMessage(micError)}</AlertDescription>
          </Alert>
        )}

        {uploadMutation.isError && (
          <Alert variant="destructive" className="console-panel">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs">
              {uploadMutation.error?.message || 'Upload failed'}
            </AlertDescription>
          </Alert>
        )}

        {uploadMutation.isSuccess && (
          <Alert className="console-panel border-status-active/50 bg-status-active/10">
            <CheckCircle2 className="h-3.5 w-3.5 text-status-active" />
            <AlertDescription className="text-xs text-status-active">
              Clip uploaded successfully
            </AlertDescription>
          </Alert>
        )}

        {!recordedBlob && (
          <div className="flex flex-col items-center gap-4">
            <button
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              disabled={!!micError}
              className={`flex h-32 w-32 items-center justify-center rounded-full transition-all ${
                isRecording
                  ? 'bg-destructive text-destructive-foreground shadow-lg scale-95'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Mic className="h-12 w-12" />
            </button>
            <p className="text-xs text-muted-foreground text-center">
              {isRecording ? 'Recording... Release to stop' : 'Press and hold to record'}
            </p>
          </div>
        )}

        {recordedBlob && recordedBlobUrl && (
          <div className="space-y-3">
            <Alert className="console-panel">
              <AlertDescription className="text-xs">
                Recording complete. Preview, upload, or discard your clip.
              </AlertDescription>
            </Alert>

            <audio
              ref={audioRef}
              src={recordedBlobUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />

            <div className="flex gap-2">
              <Button
                onClick={handlePlayPause}
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
              >
                {isPlaying ? (
                  <>
                    <Pause className="mr-2 h-3.5 w-3.5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-3.5 w-3.5" />
                    Play
                  </>
                )}
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending || uploadMutation.isSuccess}
                size="sm"
                className="flex-1 text-xs"
              >
                <Upload className="mr-2 h-3.5 w-3.5" />
                {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
              </Button>
              <Button
                onClick={handleDiscard}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
