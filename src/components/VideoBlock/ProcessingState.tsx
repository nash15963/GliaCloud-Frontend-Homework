const ProcessingState = () => {
  return (
    <div className="text-center text-gray-500 py-16">
      <div className="mb-6">
        <svg className="w-16 h-16 mx-auto text-blue-500 animate-spin mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg font-medium text-gray-700 mb-2">Processing Video</p>
      </div>
    </div>
  );
};

export default ProcessingState;