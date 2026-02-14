/**
 * Received Clips Panel
 * Display and playback of received audio clips from configured HTTP endpoint
 */

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Pause, RefreshCw, AlertCircle, Headphones } from 'lucide-react';
import { useReceivedClips, type ReceivedClip } from '../hooks/useReceivedClips';

export default function ReceivedClipsPanel() {
  const { data: clips = [], isLoading, error, refetch, isRefetching } = useReceivedClips();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayPause = (clip: ReceivedClip) => {
    if (playingId === clip.id) {
      // Pause current
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(null);
    } else {
      // Play new clip
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(clip.url);
      audioRef.current = audio;
      
      audio.onended = () => {
        setPlayingId(null);
      };
      
      audio.onerror = () => {
        console.error('Failed to play audio clip:', clip.url);
        setPlayingId(null);
      };
      
      audio.play().catch((err) => {
        console.error('Audio playback error:', err);
        setPlayingId(null);
      });
      
      setPlayingId(clip.id);
    }
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <Card className="console-panel">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Received Clips</CardTitle>
            <CardDescription className="text-xs">
              Audio clips from your configured endpoint
            </CardDescription>
          </div>
          <Button
            onClick={() => refetch()}
            disabled={isRefetching}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <Alert variant="destructive" className="console-panel">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription className="text-xs">
              {error.message || 'Failed to load received clips'}
            </AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Loading clips...
          </div>
        )}

        {!isLoading && !error && clips.length === 0 && (
          <div className="py-8 text-center">
            <Headphones className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">No clips available</p>
          </div>
        )}

        {!isLoading && clips.length > 0 && (
          <div className="space-y-2">
            {clips.map((clip) => (
              <div
                key={clip.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card/30 p-3"
              >
                <Button
                  onClick={() => handlePlayPause(clip)}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  {playingId === clip.id ? (
                    <Pause className="h-3.5 w-3.5" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                </Button>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {clip.label || clip.id}
                  </p>
                  {clip.timestamp && (
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(clip.timestamp)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
