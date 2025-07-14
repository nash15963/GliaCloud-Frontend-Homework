interface ScriptItem {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

interface TranscriptItemProps {
  scriptItem: ScriptItem;
  currentTime: number;
  selectedHighlights: string[];
  onHighlightToggle: (id: string) => void;
  onTimestampClick: (timestamp: number) => void;
  activeItemRef?: React.RefObject<HTMLDivElement | null>;
}

// Pure function to check if item is currently playing
const isCurrentlyPlaying = (currentTime: number, startTime: number, endTime: number): boolean => {
  return currentTime >= startTime && currentTime < endTime;
};

// Pure function to format timestamp
const formatTimestamp = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Pure function to get item className
const getItemClassName = (isHighlighted: boolean, isSelected: boolean): string => {
  const baseClasses = 'p-4 border-l-4 rounded-r-md hover:bg-gray-100 transition-all duration-200 shadow-sm';
  
  if (isHighlighted) {
    return `${baseClasses} bg-blue-100 border-blue-600 shadow-md transform scale-[1.02]`;
  }
  
  if (isSelected) {
    return `${baseClasses} bg-green-50 border-green-400 hover:shadow-md`;
  }
  
  return `${baseClasses} bg-white border-blue-400 hover:shadow-md`;
};

const TranscriptItem = ({ 
  scriptItem, 
  currentTime, 
  selectedHighlights, 
  onHighlightToggle, 
  onTimestampClick,
  activeItemRef
}: TranscriptItemProps) => {
  const isHighlighted = isCurrentlyPlaying(currentTime, scriptItem.startTime, scriptItem.endTime);
  const isSelected = selectedHighlights.includes(scriptItem.id);

  const handleParentClick = () => {
    onTimestampClick(scriptItem.startTime);
    if (!isSelected) {
      onHighlightToggle(scriptItem.id);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onHighlightToggle(scriptItem.id);
  };

  return (
    <div
      ref={isHighlighted ? activeItemRef : null}
      className={getItemClassName(isHighlighted, isSelected)}
      onClick={handleParentClick}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onClick={handleCheckboxClick}
          className="mt-1 w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
        />
        <span className="text-xs text-gray-500 font-mono min-w-max hover:text-blue-600">
          {formatTimestamp(scriptItem.startTime)}
        </span>
        
        <span className="text-sm text-gray-800 flex-1">
          {scriptItem.text}
        </span>
      </div>
    </div>
  );
};

export default TranscriptItem;