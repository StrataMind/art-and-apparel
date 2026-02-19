import Link from 'next/link';

const artworks = [
  { id: 1, title: 'Sunset Dreams', image: '/art/1.jpg', type: 'Painting' },
  { id: 2, title: 'Ocean Waves', image: '/art/2.jpg', type: 'Painting' },
  { id: 3, title: 'Mountain View', image: '/art/3.jpg', type: 'Painting' },
  { id: 4, title: 'Abstract Mind', image: '/art/4.jpg', type: 'T-Shirt Design' },
  { id: 5, title: 'City Lights', image: '/art/5.jpg', type: 'T-Shirt Design' },
  { id: 6, title: 'Nature Flow', image: '/art/6.jpg', type: 'T-Shirt Design' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-neutral-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-serif mb-4">Art & Apparel</h1>
          <p className="text-xl text-neutral-600 mb-8">
            Original paintings and custom t-shirt designs
          </p>
          <a
            href="#donate"
            className="inline-block bg-black text-white px-8 py-3 hover:bg-neutral-800"
          >
            Support My Work
          </a>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif text-center mb-12">Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {artworks.map((art) => (
              <div key={art.id} className="bg-white border border-neutral-200">
                <div className="aspect-square bg-neutral-200 flex items-center justify-center">
                  <span className="text-neutral-400">Image Placeholder</span>
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-1">{art.title}</h3>
                  <p className="text-sm text-neutral-600">{art.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Donation */}
      <section id="donate" className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-3xl font-serif mb-6">Support My Art</h2>
          <p className="text-lg text-neutral-600 mb-8">
            If you enjoy my work, consider supporting me with a donation. Your support helps me create more art!
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[5, 10, 25, 50].map((amount) => (
              <button
                key={amount}
                className="border-2 border-neutral-300 py-4 hover:border-black hover:bg-black hover:text-white transition"
              >
                ${amount}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <input
              type="number"
              placeholder="Custom amount"
              className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none mb-4"
            />
            <button className="w-full bg-black text-white py-3 hover:bg-neutral-800">
              Donate Now
            </button>
          </div>

          <p className="text-sm text-neutral-500">
            Secure payment powered by Stripe
          </p>
        </div>
      </section>

      {/* About */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-3xl font-serif mb-6">About</h2>
          <p className="text-lg text-neutral-600 leading-relaxed">
            I&apos;m an artist creating original paintings and t-shirt designs. 
            Each piece is crafted with passion and attention to detail. 
            Thank you for visiting my gallery!
          </p>
        </div>
      </section>
    </div>
  );
}
