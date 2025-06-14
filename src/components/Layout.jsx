import React from 'react';

const Layout = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-500 to-white-1000 ${className}`}>
      {children}
    </div>
  );
};

export default Layout; 