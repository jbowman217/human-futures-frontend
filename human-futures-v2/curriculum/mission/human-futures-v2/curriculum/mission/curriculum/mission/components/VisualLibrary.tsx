'use client';
import dynamic from 'next/dynamic';
import visualsMap from '../../visuals.json';

type VisualKey = keyof typeof visualsMap;

export default function VisualRenderer({ visualKey }: { visualKey: string }) {
  const visual = visualsMap[visualKey];

  if (!visual) {
    return <div className="text-red-600">⚠️ Visual not found: <code>{visualKey}</code></div>;
  }

  // Render image-based visuals
  if (visual.type === 'image') {
    return (
      <img
        src={visual.src}
        alt={visual.alt || 'visual'}
        className="max-w-full mx-auto my-4 border border-gray-200 rounded"
      />
    );
  }

  // Render dynamic TSX components
  if (visual.type === 'component') {
    const Component = dynamic(() => import(`./visuals/${visual.component}`), {
      ssr: false,
      loading: () => <div className="text-gray-500">Loading interactive visual...</div>,
    });

    return <Component />;
  }

  return <div className="text-red-500">Unknown visual type: {visual.type}</div>;
}
