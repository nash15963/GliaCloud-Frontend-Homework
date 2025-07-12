import React, { useState, useRef } from 'react'

/**
 * Video player component with file upload functionality
 * Allows users to upload and preview video files
 */
const VideoPlayerBlock = () => {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [videoSrc, setVideoSrc] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * Handle file selection from input element
   * Creates object URL for video preview
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setSelectedVideo(file)
      const url = URL.createObjectURL(file)
      setVideoSrc(url)
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
          className="px-5 py-2.5 bg-blue-600 text-white border-none rounded cursor-pointer hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          {selectedVideo ? "Change Video" : "Upload Video"}
        </button>
        {selectedVideo && <span className="ml-2.5 text-gray-600 text-sm">{selectedVideo.name}</span>}
      </div>

      {videoSrc && (
        <div className="w-full">
          <video controls className="w-full max-w-2xl rounded border border-gray-200">
            <source src={videoSrc} type={selectedVideo?.type} />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
}

export default VideoPlayerBlock