interface UploadPromptProps {
  onUploadClick: () => void;
}

const UploadPrompt = ({ onUploadClick }: UploadPromptProps) => {
  return (
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
        onClick={onUploadClick}
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
  );
};

export default UploadPrompt;