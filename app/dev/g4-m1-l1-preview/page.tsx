'use client'

import { useState } from 'react'
import { visuals } from '../../components/VisualLibrary'

// Ensure these IDs exactly match your visuals array
const lessonVisuals = [
  'tentimeschart',            // Matches visuals array
  'placevaluechart',
  'keyinsightsttam'
]

const pages = [
  {
    type: 'objective',
    content: '🎯 Objective: Understand that multiplication can express how much bigger one quantity is compared to another.'
  },
  {
    type: 'spark',
    content: '💭 Spark: Have you ever been told you have “10 times the energy” of someone else? What does that really mean? Write your own comparison: “____ is 10 times more than ____.”'
  },
  {
    type: 'sprint',
    content: `⚡ Math Sprint:
3 × 10 = ___
90 ÷ 10 = ___
700 ÷ 10 = ___
8 × 10 = ___
60 ÷ 10 = ___`
  },
  {
    type: 'application',
    content: `📐 Application Problem:
Ben’s garden is 9m long and 6m wide.
How much fencing will he need?
How much grass will cover the area?`
  },
  {
    type: 'reference',
    content: `📂 Student Reference Available:
- Place Value Chart
- Chip Model Example
- “Why This Works” Explanation
Click the 📊 button to view them anytime.`
  },
  {
    type: 'core',
    content: `🔢 Core Concept Step:
Model with disks: 10 ones → 1 ten, 10 tens → 1 hundred.
Write equations: 10 × 3 hundreds = 30 hundreds = 3 thousands.`
  },
  {
    type: 'problem',
    content: `📝 Core Problem:
Draw place value disks for 3 hundreds and 2 tens.
What is 10× that number?
Write the equation and explain it.`
  },
  {
    type: 'reflection',
    content: `🔁 Reflection:
What patterns do you notice when multiplying by 10?
How would you explain this to a 3rd grader?`
  },
  {
    type: 'completion',
    content: '✅ Mission Complete! You just scaled numbers using multiplication and place value. Submit your thinking or remix challenge.'
  }
]

export default function LessonG4M1L1Preview() {
  const [page, setPage] = useState(0)
  const current = pages[page]

  // Filter visuals based on IDs defined above
  const visualRefs = visuals.filter(v => lessonVisuals.includes(v.id))

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="border bg-white rounded p-6 shadow-md">
        <h2 className="capitalize text-xl font-semibold text-indigo-700 mb-2">{current.type}</h2>
        <p className="whitespace-pre-wrap text-gray-800">{current.content}</p>
      </div>

      <div className="flex justify-between pt-2">
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          ◀ Back
        </button>
        <button
          onClick={() => setPage(p => Math.min(pages.length - 1, p + 1))}
          disabled={page === pages.length - 1}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          Next ▶
        </button>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold text-gray-700 mb-3">📊 Visual References</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {visualRefs.map(v => (
            <div key={v.id} className="border rounded-lg bg-gray-50 p-4 shadow-sm">
              <p className="font-medium text-indigo-800 mb-2">{v.title}</p>
              <img src={v.src} alt={v.title} className="w-full rounded-md" />
              <p className="text-sm text-gray-600 mt-2">{v.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
