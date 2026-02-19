const paintings = [
  { 
    id: 1, 
    title: 'Sunset Dreams', 
    price: 250,
    size: '24" x 36"',
    medium: 'Oil on Canvas',
    description: 'A vibrant sunset over rolling hills',
    available: true
  },
  { 
    id: 2, 
    title: 'Ocean Waves', 
    price: 300,
    size: '30" x 40"',
    medium: 'Acrylic on Canvas',
    description: 'Powerful waves crashing on the shore',
    available: true
  },
  { 
    id: 3, 
    title: 'Mountain View', 
    price: 350,
    size: '36" x 48"',
    medium: 'Oil on Canvas',
    description: 'Majestic mountain landscape',
    available: true
  },
  { 
    id: 4, 
    title: 'Abstract Mind', 
    price: 200,
    size: '20" x 30"',
    medium: 'Mixed Media',
    description: 'Abstract expression of thoughts',
    available: false
  },
  { 
    id: 5, 
    title: 'City Lights', 
    price: 275,
    size: '24" x 36"',
    medium: 'Acrylic on Canvas',
    description: 'Urban nightscape with vibrant lights',
    available: true
  },
  { 
    id: 6, 
    title: 'Nature Flow', 
    price: 225,
    size: '20" x 30"',
    medium: 'Watercolor',
    description: 'Flowing natural forms and colors',
    available: true
  },
];

export default function ArtPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-4xl font-serif mb-4">Original Paintings</h1>
        <p className="text-lg text-neutral-600">
          Each piece is an original, one-of-a-kind artwork. All paintings are signed and come with a certificate of authenticity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {paintings.map((painting) => (
          <div key={painting.id} className="border border-neutral-200">
            <div className="aspect-[3/4] bg-neutral-200 flex items-center justify-center">
              <span className="text-neutral-400">Image Placeholder</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-medium mb-2">{painting.title}</h3>
              <p className="text-sm text-neutral-600 mb-3">{painting.description}</p>
              
              <div className="space-y-1 text-sm mb-4">
                <p><span className="font-medium">Size:</span> {painting.size}</p>
                <p><span className="font-medium">Medium:</span> {painting.medium}</p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold">${painting.price}</span>
                {painting.available ? (
                  <button className="bg-black text-white px-6 py-2 hover:bg-neutral-800">
                    Purchase
                  </button>
                ) : (
                  <span className="text-red-600 font-medium">Sold</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-neutral-50 p-8 text-center">
        <h2 className="text-2xl font-serif mb-4">Commission Work</h2>
        <p className="text-neutral-600 mb-6">
          Interested in a custom painting? Contact me to discuss your vision.
        </p>
        <a href="mailto:artist@example.com" className="inline-block bg-black text-white px-8 py-3 hover:bg-neutral-800">
          Request Commission
        </a>
      </div>
    </div>
  );
}
