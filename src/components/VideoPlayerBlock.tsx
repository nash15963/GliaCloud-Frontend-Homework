import { type UseMutationResult } from '@tanstack/react-query'
import React, { useState, useRef } from 'react'
import VideoPlayer from './VideoPlayer'
import type { ApiEndpoints } from '@/types/api'

interface Props {
  src: string;
  handleVideoProcess: (file: File) => void;
  currentTimestamp?: number | null;
  onTimestampHandled?: () => void;
  state : {
    videoProcessMutation: UseMutationResult<ApiEndpoints["IVideoProcess"]["response"], Error, File, unknown>;
  }
}

const VideoPlayerBlock = ({ src, handleVideoProcess, currentTimestamp, onTimestampHandled, state }: Props) => {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [videoSrc, setVideoSrc] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)


  /**
   * Handle file selection from input element
   * Creates object URL for video preview and triggers API processing
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setSelectedVideo(file)
      const url = URL.createObjectURL(file)
      setVideoSrc(url)
      
      // Automatically process the video after selection
      handleVideoProcess(file)
    }
  }

  /**
   * Trigger file input click programmatically
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      style={{ width: "49%", height: "90vh" }}
      className="border border-gray-300 rounded-lg bg-white shadow-sm box-border">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Video Player</h3>

      <div className="mb-5">
        <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
        <button
          onClick={handleUploadClick}
          disabled={state.videoProcessMutation.isPending}
          className="px-5 py-2.5 bg-blue-600 text-white border-none rounded cursor-pointer hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
          {state.videoProcessMutation.isPending ? "Processing..." : selectedVideo ? "Change Video" : "Upload Video"}
        </button>
      </div>

      {videoSrc && (
        <VideoPlayer 
          src={src} 
          currentTimestamp={currentTimestamp}
          onTimestampHandled={onTimestampHandled}
        />
      )}
    </div>
  );
}

export default VideoPlayerBlock