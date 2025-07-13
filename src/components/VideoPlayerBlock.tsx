import { type UseMutationResult } from "@tanstack/react-query";
import React, { useState, useRef } from "react";
import VideoPlayer from "./VideoPlayer";
import type { ApiEndpoints } from "@/types/api";

type ApiResponse = NonNullable<ApiEndpoints["IVideoData"]["response"]>;
type TRawVideoData = ApiResponse["data"];

// Subtitle interface
interface Subtitle {
  startTime: number;
  endTime: number;
  text: string;
}

// Pure function to transform video data to subtitle array
const transformToSubtitles = (videoData?: TRawVideoData): Subtitle[] => {
  if (!videoData?.transcript?.sections) {
    return [];
  }

  const subtitles: Subtitle[] = [];

  videoData.transcript.sections.forEach((section) => {
    section.sentences.forEach((sentence) => {
      subtitles.push({
        startTime: sentence.startTime,
        endTime: sentence.endTime,
        text: sentence.text,
      });
    });
  });

  // Sort by start time to ensure proper order
  return subtitles.sort((a, b) => a.startTime - b.startTime);
};

interface Props {
  handleVideoProcess: (file: File) => void;
  currentTimestamp?: number | null;
  onTimestampHandled?: () => void;
  onTimeUpdate?: (time: number) => void;
  videoDataMutation?: UseMutationResult<ApiResponse, Error, string | undefined, unknown>;
  state: {
    videoProcessMutation: UseMutationResult<ApiEndpoints["IVideoProcess"]["response"], Error, File, unknown>;
  };
}

const VideoPlayerBlock = ({
  handleVideoProcess,
  currentTimestamp,
  onTimestampHandled,
  onTimeUpdate,
  videoDataMutation,
  state,
}: Props) => {
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Transform subtitle data using pure function
  const subtitles = transformToSubtitles(videoDataMutation?.data?.data);

  /**
   * Handle file selection from input element
   * Creates object URL for video preview and triggers API processing
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setSelectedFileName(file.name);

      // Automatically process the video after selection
      handleVideoProcess(file);
    }
  };

  /**
   * Trigger file input click programmatically
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full min-h-[500px] border border-gray-300 rounded-lg bg-white shadow-sm p-4 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Video Player{selectedFileName && <span className="text-gray-600 font-normal"> - {selectedFileName}</span>}
      </h3>

      <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />

      {/* Video content area */}
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        {/* Show VideoPlayer only when we have successfully processed data and video URL */}
        {videoSrc && videoDataMutation?.isSuccess ? (
          <div className="w-full">
            {/* Change video button when video is loaded */}
            <div className="mb-4 flex justify-end">
              <button
                onClick={handleUploadClick}
                disabled={state.videoProcessMutation.isPending}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm">
                Change Video
              </button>
            </div>

            <VideoPlayer
              src={videoDataMutation?.data?.data?.url || videoSrc}
              currentTimestamp={currentTimestamp}
              onTimestampHandled={onTimestampHandled}
              onTimeUpdate={onTimeUpdate}
              subtitles={subtitles}
            />
          </div>
        ) : videoSrc && state.videoProcessMutation.isPending ? (
          /* Processing state */
          <div className="text-center text-gray-500 py-16">
            <div className="mb-6">
              <svg className="w-16 h-16 mx-auto text-blue-500 animate-spin mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-lg font-medium text-gray-700 mb-2">Processing Video</p>
              <p className="text-sm text-gray-500 mb-4">Please wait while we analyze your video...</p>
              <div className="w-64 mx-auto bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </div>
          </div>
        ) : videoSrc && (state.videoProcessMutation.isError || videoDataMutation?.isError) ? (
          /* Error state */
          <div className="text-center text-red-500 py-16">
            <div className="mb-6">
              <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-medium text-red-700 mb-2">Processing Failed</p>
              <p className="text-sm text-red-600 mb-6">
                {state.videoProcessMutation.error?.message || videoDataMutation?.error?.message || "An error occurred while processing your video. Please try again."}
              </p>
              <button
                onClick={handleUploadClick}
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white border-none rounded-lg cursor-pointer hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            </div>
          </div>
        ) : (
          /* Upload prompt area with icon and integrated button */
          <div className="text-center text-gray-500 py-16">
            <div className="mb-6">
              <svg
                className="w-24 h-24 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p className="text-xl font-medium text-gray-700 mb-2">Upload a Video</p>
              <p className="text-sm text-gray-500 mb-8">Select a video file to start creating highlights</p>
            </div>

            <button
              onClick={handleUploadClick}
              disabled={state.videoProcessMutation.isPending}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white border-none rounded-lg cursor-pointer hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Upload Video
            </button>

            <p className="text-xs text-gray-400 mt-4">Supported formats: MP4, MOV, AVI, WebM</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayerBlock;
