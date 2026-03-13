import Image from 'next/image';
  { 
    id: 1, 
    title: 'Digital Canvas #1', 
    price: 299,
    size: 'Digital Art',
    medium: 'AI & Digital Design',
    description: 'Vibrant digital creation with intricate details',
    available: true,
    image: '/art1.jpg'
  },
  { 
    id: 2, 
    title: 'Digital Canvas #2', 
    price: 349,
    size: 'Digital Art',
    medium: 'AI & Digital Design',
    description: 'Stunning digital artwork with unique composition',
    available: true,
    image: '/art2.jpg'
  },
];

export default function ArtPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl mb-4">Original Paintings</h1>
        <div className="w-16 h-px bg-neutral-400 mx-auto mb-6"></div>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
          Each piece is an original, one-of-a-kind artwork. All paintings are signed and come with a certificate of authenticity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
        {paintings.map((painting) => (
          <div key={painting.id} className="border border-neutral-300 hover:shadow-2xl transition-all duration-300">
            <div className="aspect-[3/4] bg-neutral-100 flex items-center justify-center border-b border-neutral-300 relative overflow-hidden">
              {painting.image ? (
                <Image
                  src={painting.image}
                  alt={painting.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-neutral-400 text-sm uppercase tracking-widest">Image</span>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-2xl mb-3 text-center">{painting.title}</h3>
              <p className="text-sm text-neutral-600 mb-4 text-center italic">{painting.description}</p>
              
              <div className="space-y-2 text-sm mb-6 text-center border-t border-b border-neutral-200 py-4">
                <p className="text-neutral-600">{painting.size}</p>
                <p className="text-neutral-600">{painting.medium}</p>
              </div>

              <div className="text-center">
                <p className="text-3xl mb-4">${painting.price}</p>
                {painting.available ? (
                  <button className="w-full bg-neutral-900 text-white px-6 py-3 hover:bg-black transition uppercase tracking-widest text-sm">
                    Purchase
                  </button>
                ) : (
                  <span className="block text-red-600 uppercase tracking-widest text-sm py-3">Sold</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 md:mt-24 bg-neutral-50 p-6 md:p-12 text-center max-w-3xl mx-auto border border-neutral-300">
        <h2 className="text-3xl mb-4">Commission Work</h2>
        <div className="w-16 h-px bg-neutral-400 mx-auto mb-6"></div>
        <p className="text-neutral-600 mb-8 leading-relaxed">
          Interested in a custom painting? I accept commissions for original artwork. Contact me to discuss your vision and bring your ideas to life.
        </p>
        <a href="mailto:artist@example.com" className="inline-block bg-neutral-900 text-white px-10 py-4 hover:bg-black transition uppercase tracking-widest text-sm">
          Request Commission
        </a>
      </div>
    </div>
  );
}
