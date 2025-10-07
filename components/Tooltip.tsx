import React from 'react';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text }) => {
  return (
    <div className="relative flex items-center group">
      {children}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max
                      invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300
                      bg-gray-700 text-white text-xs rounded-md px-2 py-1 z-50">
        {text}
        <svg 
            className="absolute text-gray-700 h-2 w-full left-0 bottom-full" 
            style={{ transform: 'rotate(180deg)' }}
            x="0px" y="0px" viewBox="0 0 255 255"
        >
          <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
        </svg>
      </div>
    </div>
  );
};

export default Tooltip;