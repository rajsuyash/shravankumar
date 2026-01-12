import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  size?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className = '', size = '' }) => {
  return (
    <span className={`material-symbols-outlined ${size} ${className}`}>
      {name}
    </span>
  );
};
