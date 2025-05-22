'use client'

export const visuals = [
  {
    id: 'ttamipe',
    title: 'Ten Times As Many: Image + Pattern Equation',
    src: '/assets/visuals/ttamipe.png',
    description: 'Visual model showing the meaning of “10 times as many.”'
  },
  {
    id: 'tentimeschart',
    title: 'Ten Times Chart',
    src: '/assets/visuals/tentimeschart.png',
    description: 'Examples of values scaled by 10 in real-world scenarios.'
  },
  {
    id: 'keyinsightsttam',
    title: 'Key Insights: Ten Times As Many',
    src: '/assets/visuals/keyinsightsttam.png',
    description: 'Summarizes major takeaways from the “10 times as many” pattern.'
  },
  {
    id: 'findingthepattern',
    title: 'Finding the Pattern',
    src: '/assets/visuals/findingthepattern.png',
    description: 'Table that highlights the pattern of adding a zero when multiplying by 10.'
  },
  {
    id: 'placevaluechart',
    title: 'Place Value Chart',
    src: '/assets/visuals/placevaluechart.png',
    description: 'Visual layout of place value by powers of ten.'
  }
]

export default function VisualLibrary() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {visuals.map((v) => (
        <figure
          key={v.id}
          className="border rounded-xl bg-white p-4 shadow-md transition hover:shadow-lg"
        >
          <img
            src={v.src}
            alt={v.title}
            className="rounded-md mb-3 w-full max-w-full object-contain"
          />
          <figcaption>
            <h3 className="text-base font-bold mb-1">{v.title}</h3>
            <p className="text-sm text-gray-600">{v.description}</p>
          </figcaption>
        </figure>
      ))}
    </section>
  )
}
