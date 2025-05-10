// app/legal/page.tsx
import { promises as fs } from 'fs';
import path from 'path';

export default async function LegalPage() {
  const termsPath = path.join(process.cwd(), 'terms.md');
  const privacyPath = path.join(process.cwd(), 'privacy.md');

  const [terms, privacy] = await Promise.all([
    fs.readFile(termsPath, 'utf8'),
    fs.readFile(privacyPath, 'utf8'),
  ]);

  return (
    <main className="min-h-screen bg-black text-white p-8 max-w-4xl mx-auto space-y-12">
      <section>
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <pre className="whitespace-pre-wrap text-sm text-gray-300 bg-gray-800 p-4 rounded-lg">
          {terms}
        </pre>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-4">Privacy Policy</h2>
        <pre className="whitespace-pre-wrap text-sm text-gray-300 bg-gray-800 p-4 rounded-lg">
          {privacy}
        </pre>
      </section>
    </main>
  );
}
