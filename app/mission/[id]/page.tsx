'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/app/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import MaterialViewer from '@/app/components/MaterialViewer';

export default function MissionPage() {
  const rawParams = useParams();
  const id = typeof rawParams.id === 'string' ? rawParams.id : Object.values(rawParams)[0];

  const [mission, setMission] = useState<any>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [studentData, setStudentData] = useState({ name: '', zip: '', thoughts: {} });

  const pages = [
    { type: 'welcome' },
    { type: 'context' },
    { type: 'task1' },
    { type: 'task2' },
    { type: 'task3' },
    { type: 'reflection' },
    { type: 'remix' },
    { type: 'completion' }
  ];

  useEffect(() => {
    async function loadMission() {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) console.error('Supabase fetch error:', error);
      if (data) setMission(data);
    }

    loadMission();
  }, [id]);

  function handleInputChange(field: string, value: string) {
    setStudentData((prev) => ({ ...prev, [field]: value }));
  }

  async function saveThought(key: string, value: string) {
    if (!value.trim()) return;

    const payload = {
      mission_id: id,
      user_id: studentData.name?.trim() || 'anonymous',
      zip_code: studentData.zip?.trim() || '',
      page_type: key,
      content: value.trim(),
      created_at: new Date().toISOString()
    };

    console.log("🧠 Attempting to save student thought:", payload);

    const { error } = await supabase.from('student_feedback').insert([payload]);

    if (error) {
      console.error("❌ Supabase insert error:", error.message);
    } else {
      console.log("✅ Thought saved successfully.");
    }
  }

  function nextPage() {
    if (pageIndex < pages.length - 1) {
      setPageIndex(pageIndex + 1);
    }
  }

  function prevPage() {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
    }
  }

  function renderTask(taskNum: number) {
    const task = mission?.tasks?.[taskNum];
    if (!task) return null;

    return (
      <div className="text-white space-y-6">
        <h2 className="text-2xl font-bold text-center uppercase">Mission Task {taskNum + 1}</h2>
        <p className="text-md text-center max-w-xl mx-auto">{task?.task_text}</p>

        {task?.materials?.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Materials</h3>
            {task.materials.map((mat: any, i: number) => (
              <div key={i} className="max-w-xl mx-auto">
                <MaterialViewer material={mat} />
              </div>
            ))}
          </div>
        )}

        {task?.hint && (
          <div className="bg-purple-900 text-purple-100 p-4 rounded max-w-xl mx-auto">
            <h3 className="font-bold mb-2">Hint</h3>
            <p>{task.hint}</p>
          </div>
        )}

        <div className="max-w-xl mx-auto">
          <textarea
            className="w-full h-[120px] p-3 bg-gray-800 text-white text-sm rounded resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="Your workspace..."
            onBlur={(e) => saveThought(`Task${taskNum + 1}-Response`, e.target.value)}
          />
        </div>
      </div>
    );
  }

  function renderPage() {
    const page = pages[pageIndex];

    switch (page.type) {
      case 'welcome':
        return (
          <div className="text-white space-y-4 text-center">
            <h1 className="text-3xl font-extrabold uppercase">Welcome to Human Futures</h1>
            <input
              type="text"
              placeholder="Your Name"
              className="w-full p-3 bg-gray-800 text-white text-sm rounded"
              value={studentData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
            <input
              type="text"
              placeholder="Your Zip Code"
              className="w-full p-3 bg-gray-800 text-white text-sm rounded"
              value={studentData.zip}
              onChange={(e) => handleInputChange('zip', e.target.value)}
            />
            <button
              onClick={nextPage}
              disabled={!studentData.name || !studentData.zip}
              className="w-full py-3 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-500"
            >
              Enter Mission
            </button>
          </div>
        );

      case 'context':
        return (
          <div className="text-white space-y-4">
            <h2 className="text-2xl font-bold text-center">{mission?.title}</h2>
            <p className="text-sm text-center text-gray-300 max-w-2xl mx-auto">{mission?.short_background_context}</p>
            <textarea
              className="w-full h-[100px] p-3 bg-gray-800 text-white text-sm rounded"
              placeholder="What ideas or thoughts come to mind?"
              onBlur={(e) => saveThought('Prethinking-Ideas', e.target.value)}
            />
            <textarea
              className="w-full h-[100px] p-3 bg-gray-800 text-white text-sm rounded"
              placeholder="What questions are you starting with?"
              onBlur={(e) => saveThought('Prethinking-Questions', e.target.value)}
            />
          </div>
        );

      case 'task1': return renderTask(0);
      case 'task2': return renderTask(1);
      case 'task3': return renderTask(2);

      case 'reflection':
        return (
          <div className="text-white space-y-4">
            <h2 className="text-xl font-bold text-center">Reflection</h2>
            <textarea
              className="w-full h-[120px] p-3 bg-gray-800 text-white text-sm rounded"
              placeholder="What did you learn or realize?"
              onBlur={(e) => saveThought('Reflection', e.target.value)}
            />
          </div>
        );

      case 'remix':
        return (
          <div className="text-white space-y-4">
            <h2 className="text-xl font-bold text-center">Remix</h2>
            <textarea
              className="w-full h-[120px] p-3 bg-gray-800 text-white text-sm rounded"
              placeholder="Remix it!"
              onBlur={(e) => saveThought('Remix', e.target.value)}
            />
          </div>
        );

      case 'completion':
        return (
          <div className="text-white text-center space-y-4">
            <h1 className="text-3xl font-bold text-green-400">Mission Complete!</h1>
            <p>You're part of a growing movement to build the future.</p>
            <button
              onClick={() => window.location.href = '/'}
              className="py-2 px-6 bg-green-500 text-black font-bold rounded hover:bg-green-600"
            >
              Return to Home
            </button>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-black p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl bg-gray-900 p-6 rounded-2xl shadow-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={pageIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center mt-6">
          <button onClick={prevPage} className="text-xl text-white hover:text-yellow-400">
            <FaArrowLeft />
          </button>
          <span className="text-sm text-gray-400">Page {pageIndex + 1} of {pages.length}</span>
          <button onClick={nextPage} className="text-xl text-white hover:text-yellow-400">
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
