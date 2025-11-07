
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold leading-tight text-gray-900">
          Patient Note Grader Agent
        </h1>
        <p className="text-slate-500 mt-1">
          AI-powered feedback on clinical notes based on your custom rubric.
        </p>
      </div>
    </header>
  );
};

export default Header;
