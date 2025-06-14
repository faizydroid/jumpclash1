import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-xl backdrop-filter backdrop-blur-sm bg-opacity-90 border border-gray-100 p-6 md:p-8 ${className}`}>
      {children}
    </div>
  );
};

export default Card; 