'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/app/lib/supabaseClient';

const MVP_MISSION_IDS = [
  '9ed6a6a2-2f0c-4c49-859b-4ae87e8741e4',
  '17df3646-3365-4eff-aa0e-40d826afeceb',
  '57586f9a-f79b-481f-a580-69f687aabb52',
  'e7fa05ff-9a55-4286-b8e2-701f2ba50b81',
  '182b2688-0a78-4dc5-9981-35d57f0b7d68',
  'b095cf38-127c-4251-a3bb-2b8a1ac230ba',
  'e21ac366-08b1-42ad-91e7-d91cae65772b',
  'fef1716d-2eec-427d-ac7f-2b692d8b92f7',
  '36cadbf4-7292-4c42-b4f7-fd1898f06cc3',
];

export default function HomePage() {
  const [missions, setMissions] = useState<any[]>([]);

  useEffect(() => {
    async function loadMissions() {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .in('id', MVP_MISSION_IDS);

      if (error) {
        console.error('❌ Supabase error:', error);
      } else {
        setMissions(data || []); // ✅ All 9 missions now
      }
    }

    loadMissions();
  }, []);

  const colorThemes = [
    'bg-blue-600',
    'bg-green-600',
    'bg-purple-600',
    'bg-orange-600',
    'bg-teal-600',
    'bg-pink-600',
    'bg-red-600',
  ];

  return (
<main className="p-6 max-w-7xl mx-auto mb-0 pb-0">
<h1 className="text-5xl font-extrabold text-center text-white tracking-wide mb-12">
        HUMAN FUTURES
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {missions.map((mission, index) => {
          const color = colorThemes[index % colorThemes.length];
          return (
            <Link key={mission.id} href={`/mission/${mission.id}`}>
              <div
                className={`flex flex-col rounded-2xl shadow-xl hover:shadow-2xl 
                  p-4 sm:p-6 
                  min-h-[440px] 
                  w-full sm:max-w-[420px] 
                  text-white hover:scale-[1.01] transition duration-300 
                  ${color}`}
              >
                <div className="space-y-4 flex-1">
                  <h2 className="font-bold text-[clamp(1.25rem,2vw,1.5rem)] leading-snug line-clamp-3">
                    {mission.title}
                  </h2>
                  <p className="text-[clamp(1rem,1.4vw,1.125rem)] leading-normal line-clamp-3">
                    {mission.driving_question?.trim()}
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-base leading-snug">
                    {(mission.tasks || []).map((task: any, i: number) => (
                      <li key={i} className="line-clamp-2">{task.task_text}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto pt-4 flex items-center justify-end text-sm font-medium">
                  <span className="text-white opacity-70 hover:opacity-100 transition">
                    Start Mission
                  </span>
                  <ArrowRight size={18} className="ml-2" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
