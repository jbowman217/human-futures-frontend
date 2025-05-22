'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabaseClient'

export default function RemixSupportLogPage() {
  const [entries, setEntries] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase
        .from('remix_support_summary')
        .select('*')
        .order('date', { ascending: false })
      if (!error) setEntries(data)
    }
    loadData()
  }, [])

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📊 AI Remix Support Usage</h1>
      <table className="w-full table-auto border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Mission ID</th>
            <th className="p-2 border">Action</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Total</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr key={i} className="border-t">
              <td className="p-2 border">{entry.mission_id}</td>
              <td className="p-2 border">{entry.action}</td>
              <td className="p-2 border">{new Date(entry.date).toLocaleDateString()}</td>
              <td className="p-2 border text-right">{entry.total_requests}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
