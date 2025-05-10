'use client';

import React from 'react';

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-black p-6 space-y-6">
      <h1 className="text-4xl font-bold text-white text-center mb-6">Responsive Debug View</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Desktop Simulation */}
        <div className="bg-white rounded-xl overflow-hidden shadow-lg">
          <div className="bg-gray-800 text-white p-2 text-center text-sm font-semibold">Desktop (1024px)</div>
          <iframe
            src="/"
            style={{
              width: '100%',
              height: '100vh',
              minWidth: '1024px',
              border: 'none',
              zoom: '0.8',
              transform: 'scale(0.8)',
              transformOrigin: 'top left',
            }}
          />
        </div>

        {/* Mobile Simulation */}
        <div className="bg-white rounded-xl overflow-hidden shadow-lg">
          <div className="bg-gray-800 text-white p-2 text-center text-sm font-semibold">Mobile (375px)</div>
          <iframe
            src="/"
            style={{
              width: '375px',
              height: '100vh',
              border: 'none',
              zoom: '1',
              margin: '0 auto',
              display: 'block',
            }}
          />
        </div>
      </div>
    </div>
  );
}
