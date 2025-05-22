'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import ReactMarkdown from 'react-markdown';

export default function MissionPage() {
  const { id } = useParams();
  const [mission, setMission] = useState<any>(null);

  useEffect(() => {
    const fetchMission = async () => {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('id', id)
        .single();
      if (!error) setMission(data);
    };
    fetchMission();
  }, [id]);

  if (!mission) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{mission.title}</h1>
      <ReactMarkdown>{mission.content?.markdown}</ReactMarkdown>
    </div>
  );
}
