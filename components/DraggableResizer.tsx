import React from 'react';

interface DraggableResizerProps {
  onDrag: (dx: number) => void;
}

const DraggableResizer: React.FC<DraggableResizerProps> = ({ onDrag }) => {
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      onDrag(moveEvent.movementX);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <div
      className="w-1.5 cursor-col-resize bg-transparent hover:bg-sky-500 transition-colors duration-200 flex-shrink-0"
      onMouseDown={handleMouseDown}
      aria-label="Resize panel"
      role="separator"
      style={{ touchAction: 'none' }}
    />
  );
};

export default DraggableResizer;