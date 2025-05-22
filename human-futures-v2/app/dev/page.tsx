import VisualRenderer from '@/components/VisualLibrary';

export default function TaskPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Visual Preview</h1>
      <VisualRenderer visualKey="beyond-the-mean-task1" />
    </div>
  );
}
