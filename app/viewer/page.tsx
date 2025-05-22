import { supabase } from '@/app/lib/supabaseClient'

export default async function ViewerPage() {
  // Get unique page_types for the filter dropdown
  const { data: pageTypesData, error: pageTypesError } = await supabase
    .from('curated_thought_archive')
    .select('page_type', { count: 'exact', head: false })
    .neq('page_type', null)

  const uniquePageTypes = Array.from(new Set(pageTypesData?.map(item => item.page_type) ?? []))

  // For simplicity, show the latest 100 thoughts regardless of page_type
  const { data, error } = await supabase
    .from('curated_thought_archive')
    .select('mission_id, user_id, content, page_type, tags, feedback, level, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error || pageTypesError) {
    console.error('❌ Supabase fetch error:', error || pageTypesError)
    return <p className="p-4 text-red-600">Failed to load curated thoughts.</p>
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">🧠 Curated Thought Archive</h1>

      {/* Static filter UI — functional filtering can be added later */}
      <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-700">Filter by Page Type</label>
        <select className="border border-gray-300 rounded px-3 py-2">
          {uniquePageTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">* Filter not yet wired in</p>
      </div>

      <div className="grid gap-4">
        {data?.map((entry, index) => (
          <div key={`${entry.mission_id}-${entry.user_id}-${index}`} className="border p-4 rounded-md shadow-sm bg-white">
            <p className="text-sm text-gray-500 mb-2">
              <strong>{entry.page_type}</strong> — {new Date(entry.created_at).toLocaleString()}
            </p>
            <p className="text-gray-800 whitespace-pre-wrap">{entry.content}</p>

            {entry.tags && (
              <p className="mt-1 text-xs text-gray-500">Tags: {entry.tags}</p>
            )}
            {entry.feedback && (
              <p className="mt-1 text-xs text-gray-500 italic">Feedback: {entry.feedback}</p>
            )}
            {entry.level && (
              <p className="mt-1 text-xs text-gray-500">Level: {entry.level}</p>
            )}
            <p className="mt-2 text-xs text-gray-400">Mission: {entry.mission_id}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
