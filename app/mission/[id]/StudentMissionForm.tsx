'use client';

import { useState } from 'react';
import { submitStudentThoughts, submitStudentResponse } from '@/app/lib/supabase';

export function StudentMissionForm({ missionId }: { missionId: string }) {
  const [userId] = useState(() => crypto.randomUUID());
  const [thoughts, setThoughts] = useState('');
  const [questions, setQuestions] = useState('');
  const [solution, setSolution] = useState('');
  const [reflection, setReflection] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Submit core content
      const ok1 = await submitStudentThoughts(missionId, userId, thoughts, questions);
      const ok2 = await submitStudentResponse(missionId, userId, solution, reflection);

      // Trigger OpenAI feedback in parallel
      if (thoughts) {
        fetch('/api/ai/analyzeThought', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mission_id: missionId,
            user_id: userId,
            content: thoughts,
            page_type: 'prethinking'
          })
        });
      }

      if (reflection) {
        fetch('/api/ai/analyzeThought', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mission_id: missionId,
            user_id: userId,
            content: reflection,
            page_type: 'reflection'
          })
        });
      }

      if (ok1 && ok2) {
        setSubmitted(true);
      } else {
        alert("❌ Something went wrong. Try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("❌ Submission failed. Please check your answers and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-4 mt-8 text-green-600 border border-green-300 bg-green-100 rounded">
        ✅ Thanks for submitting! Your thinking has been saved.
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-6 border-t pt-8">
      <h2 className="text-2xl font-bold text-gray-800">🧠 Your Thinking</h2>

      <div>
        <label htmlFor="thoughts" className="block font-medium">1. What initial thoughts or ideas come to mind?</label>
        <textarea
          id="thoughts"
          value={thoughts}
          onChange={(e) => setThoughts(e.target.value)}
          className="w-full mt-1 p-2 border border-gray-300 rounded"
          rows={3}
          required
        />
      </div>

      <div>
        <label htmlFor="questions" className="block font-medium">2. What questions do you have as you approach this?</label>
        <textarea
          id="questions"
          value={questions}
          onChange={(e) => setQuestions(e.target.value)}
          className="w-full mt-1 p-2 border border-gray-300 rounded"
          rows={3}
          required
        />
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mt-8">💡 Your Solution</h2>

      <div>
        <label htmlFor="solution" className="block font-medium">3. Write your solution or approach:</label>
        <textarea
          id="solution"
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
          className="w-full mt-1 p-2 border border-gray-300 rounded"
          rows={4}
          required
        />
      </div>

      <div>
        <label htmlFor="reflection" className="block font-medium">4. Reflect: What did you learn or realize?</label>
        <textarea
          id="reflection"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          className="w-full mt-1 p-2 border border-gray-300 rounded"
          rows={3}
          required
        />
      </div>

      <button
        onClick={handleSubmit}
        className={`mt-6 px-6 py-3 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={loading}
      >
        {loading ? 'Submitting...' : '🚀 Submit Your Work'}
      </button>
    </div>
  );
}
