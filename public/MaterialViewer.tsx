'use client';

import React, { useEffect, useState } from 'react';

interface MaterialProps {
  link: string;
  type: string;
  description?: string;
}

export default function MaterialViewer({ link, type, description }: MaterialProps) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 640);
    }
  }, []);

  if (!mounted || !link) return null;

  const normalizedType = type?.toLowerCase();

  switch (normalizedType) {
    case 'image':
      return (
        <div className="w-full my-4">
          <img
            src={link}
            alt={description || 'Material image'}
            className={`w-full ${isMobile ? 'max-w-none' : 'max-w-md'} rounded-lg shadow`}
          />
          {description && <p className="text-sm text-gray-300 mt-2">{description}</p>}
        </div>
      );

    case 'pdf':
      return (
        <div className="w-full my-4">
          <iframe
            src={link}
            title={description || 'PDF material'}
            width="100%"
            height={isMobile ? '600px' : '400px'}
            className="border rounded"
          />
          {description && <p className="text-sm text-gray-300 mt-2">{description}</p>}
        </div>
      );

    default:
      return null;
  }
}
