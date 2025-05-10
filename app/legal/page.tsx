// app/legal/page.tsx
import { promises as fs } from 'fs';
import path from 'path';

export default async function LegalPage() {
  const terms = await fs.readFile(path.join(process.cwd(), 'terms.md'), 'utf8');
  const privacy = await fs.readFile(path.join(process.cwd(), 'privacy.md'), 'utf8');

  return (
    <div className="min-h-screen bg-black text-white p-8 max-w-4xl mx-auto space-y-12">
      <section>
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <pre className="whitespace-pre-wrap text-sm text-gray-200 bg-gray-900 p-4 rounded-lg">
          {terms}
        </pre>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-4">Privacy Policy</h2>
        <pre className="whitespace-pre-wrap text-sm text-gray-200 bg-gray-900 p-4 rounded-lg">
          {privacy}
        </pre>
      </section>
    </div>
  );
}
