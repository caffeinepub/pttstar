/**
 * PTT Clip Upload Hook
 * React Query mutation hook for uploading recorded audio clips to configured HTTP endpoint
 */

import { useMutation } from '@tanstack/react-query';
import { getPttClipHttpConfig } from '../utils/pttClipHttpConfig';

interface UploadClipParams {
  blob: Blob;
  filename?: string;
}

async function uploadClip({ blob, filename = 'recording.webm' }: UploadClipParams): Promise<void> {
  const config = getPttClipHttpConfig();
  
  if (!config.uploadUrl) {
    throw new Error('Upload URL not configured. Please configure it in Settings.');
  }

  const formData = new FormData();
  formData.append('audio', blob, filename);

  const response = await fetch(config.uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Upload failed: ${response.status} ${response.statusText}. ${errorText}`);
  }
}

export function usePttClipUpload() {
  return useMutation({
    mutationFn: uploadClip,
    onError: (error: Error) => {
      console.error('PTT clip upload error:', error);
    },
  });
}
