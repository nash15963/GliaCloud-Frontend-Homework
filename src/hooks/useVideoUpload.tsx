import React, { useState, useRef, type JSX } from 'react';

interface UseVideoUploadProps {
  onVideoProcess: (file: File) => void;
}

interface UseVideoUploadReturn {
  videoSrc: string;
  selectedFileName: string;
  handleUploadClick: () => void;
  resetUpload: () => void;
  FileInput: () => JSX.Element
}

/**
 * Custom hook for handling video file upload functionality
 * Manages video file selection, validation, URL creation, and API processing
 */
export const useVideoUpload = ({ onVideoProcess }: UseVideoUploadProps): UseVideoUploadReturn => {
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file selection from input element
   * Validates file type, creates object URL for preview, and triggers API processing
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      return;
    }

    // Validate file type - only accept video files
    if (!file.type.startsWith("video/")) {
      console.warn('Invalid file type. Please select a video file.');
      return;
    }

    // Create object URL for video preview
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setSelectedFileName(file.name);

    // Trigger API processing
    onVideoProcess(file);
  };

  /**
   * Trigger file input click programmatically
   * Opens the file selection dialog
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Reset upload state
   * Clears video source and filename, useful for error recovery
   */
  const resetUpload = () => {
    // Clean up object URL to prevent memory leaks
    if (videoSrc) {
      URL.revokeObjectURL(videoSrc);
    }
    
    setVideoSrc("");
    setSelectedFileName("");
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Hidden file input component
   * Renders the hidden input element for file selection
   */
  const FileInput = () => (
    <input 
      ref={fileInputRef} 
      type="file" 
      accept="video/*" 
      onChange={handleFileSelect} 
      className="hidden" 
    />
  );

  return {
    videoSrc,
    selectedFileName,
    handleUploadClick,
    resetUpload,
    FileInput,
  };
};