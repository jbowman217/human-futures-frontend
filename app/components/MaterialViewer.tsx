'use client';

import React from 'react';

interface MaterialProps {
  material: {
    type: string;
    link: string;
    description?: string;
  };
}

export default function MaterialViewer({ material }: MaterialProps) {
  if (!material?.link || !material?.type) {
    return (
      <div className="text-red-400 text-sm">⚠️ Invalid material entry.</div>
    );
  }

  const { type, link, description } = material;
  const fileType = type.toLowerCase();

  return (
    <div className="mb-6 w-full flex flex-col items-center text-white">
      {description && (
        <p className="text-sm mb-2 text-center font-medium opacity-80">{description}</p>
      )}

      {fileType === 'pdf' && (
        <iframe
          src={link}
          className="w-full max-w-[700px] h-[500px] rounded-lg shadow-lg"
          title="PDF Material"
        />
      )}

      {['image', 'png', 'jpg', 'jpeg', 'svg'].includes(fileType) && (
        <img
          src={link}
          alt={description || 'Material image'}
          className="w-full max-w-[600px] rounded-xl shadow-md object-contain"
        />
      )}

      {['video', 'mp4'].includes(fileType) && (
        <video controls className="w-full max-w-[700px] rounded-lg shadow-lg">
          <source src={link} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {['md', 'markdown'].includes(fileType) && (
        <iframe
          src={link}
          title="Markdown Viewer"
          className="w-full max-w-[700px] h-[400px] rounded bg-white text-black"
        />
      )}

      {['xlsx', 'docx', 'csv'].includes(fileType) && (
        <div className="text-center">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-300 underline text-sm"
          >
            📄 Open {fileType.toUpperCase()} File
          </a>
        </div>
      )}

      {![
        'pdf', 'image', 'png', 'jpg', 'jpeg', 'svg',
        'video', 'mp4', 'md', 'markdown', 'xlsx', 'docx', 'csv'
      ].includes(fileType) && (
        <div className="text-yellow-300 text-sm text-center mt-2">
          ⚠️ Unsupported file type: <strong>{fileType}</strong>
        </div>
      )}
    </div>
  );
}
