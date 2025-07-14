import React from 'react';

type ButtonVariant = 'blue' | 'green' | 'yellow' | 'gray';

interface ControlButtonProps {
  variant?: ButtonVariant;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

// Pure function to get button variant styles
const getVariantStyles = (variant: ButtonVariant): string => {
  const variantMap = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    yellow: 'bg-yellow-500 hover:bg-yellow-600',
    gray: 'bg-gray-500 hover:bg-gray-600'
  };
  
  return variantMap[variant];
};

// Pure function to get full button className
const getButtonClassName = (variant: ButtonVariant, className?: string): string => {
  const baseClasses = 'flex items-center gap-2 text-white px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = getVariantStyles(variant);
  
  return `${baseClasses} ${variantClasses} ${className || ''}`.trim();
};

const ControlButton = ({
  variant = 'blue',
  onClick,
  disabled = false,
  title,
  children,
  className
}: ControlButtonProps) => {
  return (
    <button
      className={getButtonClassName(variant, className)}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
};

export default ControlButton;