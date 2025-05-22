'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import fs from 'fs';
import path from 'path';

export default function MissionDevPage() {
  const rawParams = useParams();
  const lessonId = typeof rawParams.id === 'string' ? rawParams.id : Object.values(rawParams)[0];

  const [lesson, setLesson] = useState<any>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [studentData, setStudentData] = useState({ name: '', zip: '', thoughts: {} });

  useEffect(() => {
    async function fetchLesson() {
      try {
        const res = await fetch(`/assets/missions/grade4/module1/${lessonId}/lesson.json`);
        const data = await res.json();
        setLesson(data);
      } catch (err) {
        console.error('Failed to load lesson.json', err);
      }
    }

    fetchLesson();
  }, [lessonId]);

  const pages = lesson?.page_flow || [];

  function handleInputChange(field: string, value: string) {
    setStudentData((prev) => ({ ...prev, [field]: value }));
  }

  function nextPage() {
    if (pageIndex < pages.length - 1) setPageIndex(pageIndex + 1);
  }

  function prevPage() {
    if (pageIndex > 0) setPageIndex(pageIndex - 1);
  }

  function renderPage() {
    const page = pages[pageIndex];

    switch (page?.type) {
      case 'welcome':
        return (
          <div className="text-white text-center space-y-4">
            <h1 className="text-3xl font-bold">Welcome to {lesson?.title || 'Human Futures'}</h1>
            <input
              className="w-full p-3 bg-gray-800 text-white rounded"
              placeholder="Your Name"
              value={studentData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
            <input
              className="w-full p-3 bg-gray-800 text-white rounded"
              placeholder="Zip Code"
              value={studentData.zip}
              onChange={(e) => handleInputChange('zip', e.target.value)}
            />
            <button
              onClick={nextPage}
              disabled={!studentData.name || !studentData.zip}
              className="py-2 px-4 bg-yellow-500 text-black rounded"
            >
              Start
            </button>
          </div>
        );

      case 'context':
        return (
          <div className="text-white space-y-4">
            <h2 className="text-2xl font-bold">{lesson?.title}</h2>
            <p className="text-sm text-gray-300">{lesson?.short_background_context}</p>
            <textarea
              placeholder="What ideas or questions are you starting with?"
              className="w-full h-28 p-3 bg-gray-800 text-white rounded"
              onBlur={(e) =>
                console.log('💭 Prethinking:', e.target.value)
              }
            />
          </div>
        );

      case 'task':
        return (
          <div className="text-white space-y-6">
            <h2 className="text-2xl font-bold text-center">Task</h2>
            <p className="text-md max-w-xl mx-auto">{page?.prompt}</p>
            {page?.hint && (
              <div className="bg-purple-900 text-purple-100 p-4 rounded max-w-xl mx-auto">
                <strong>Hint:</strong> {page.hint}
              </div>
            )}
            <textarea
              className="w-full h-32 p-3 bg-gray-800 text-white rounded"
              placeholder="Work space..."
              onBlur={(e) =>
                console.log(`📝 Task Response:`, e.target.value)
              }
            />
          </div>
        );

      case 'reflection':
        return (
          <div className="text-white">
            <h2 className="text-xl font-bold text-center">Reflection</h2>
            <textarea
              className="w-full h-32 p-3 bg-gray-800 text-white rounded"
              placeholder="What did you learn?"
              onBlur={(e) =>
                console.log('🪞 Reflection:', e.target.value)
              }
            />
          </div>
        );

      case 'remix':
        return (
          <div className="text-white">
            <h2 className="text-xl font-bold text-center">Remix This Challenge</h2>
            <textarea
              className="w-full h-32 p-3 bg-gray-800 text-white rounded"
              placeholder="How would you remix this task?"
              onBlur={(e) =>
                console.log('🎨 Remix:', e.target.value)
              }
            />
          </div>
        );

      case 'completion':
        return (
          <div className="text-center text-green-400 text-xl font-bold">
            ✅ Mission Complete!
          </div>
        );

      default:
        return <p className="text-white">Unknown page type: {page?.type}</p>;
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
          <span className="text-sm text-gray-400">
            Page {pageIndex + 1} of {pages.length}
          </span>
          <button onClick={nextPage} className="text-xl text-white hover:text-yellow-400">
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
