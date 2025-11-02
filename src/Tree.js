import React, { memo } from 'react';

// Memoized Tree component for better performance
// Renders all trees but only animates half of them (based on animated prop)
const Tree = memo(({ variant = 'round', className = '', animated = true }) => {
  const TreeSVG = variant === 'alt' ? (
    <svg className="tree-svg" viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
      {/* Tree trunk - thinner */}
      <rect x="27" y="55" width="6" height="25" fill="#654321"/>
      {/* Triangle-shaped leaves */}
      <polygon points="30,10 15,45 45,45" fill="#1a4d0e"/>
      <polygon points="30,20 20,50 40,50" fill="#2d5016"/>
    </svg>
  ) : (
    <svg className="tree-svg" viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg">
      {/* Tree trunk */}
      <rect x="25" y="60" width="10" height="20" fill="#8b4513"/>
      {/* Tree leaves */}
      <circle cx="30" cy="45" r="15" fill="#2d5016"/>
      <circle cx="25" cy="40" r="12" fill="#2d5016"/>
      <circle cx="35" cy="40" r="12" fill="#2d5016"/>
      <circle cx="30" cy="35" r="10" fill="#2d5016"/>
    </svg>
  );

  // Only add no-animation class if animated is false
  const animationClass = animated ? '' : 'no-animation';
  
  return (
    <div className={`tree ${className}${animationClass ? ' ' + animationClass : ''}`}>
      {TreeSVG}
    </div>
  );
});

Tree.displayName = 'Tree';

export default Tree;

