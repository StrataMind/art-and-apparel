'use client';

import Image from 'next/image';

const merchandise = [
  {
    id: 1,
    title: 'Digital Canvas #1',
    price: 299,
    image: '/art1.jpg',
    available: true,
    description: 'Original digital artwork - high resolution print available',
  },
  {
    id: 2,
    title: 'Digital Canvas #2',
    price: 349,
    image: '/art2.jpg',
    available: true,
    description: 'Stunning digital creation - perfect for collectors',
  },
];

export default function MerchandisePage() {
  const handleAddToCart = (item: any) => {
    alert(`Added "${item.title}" to cart!`);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl mb-4">Shop Our Collection</h1>
        <div className="w-16 h-px bg-neutral-400 mx-auto mb-6"></div>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
          Purchase original artwork directly from the artist. Digital prints and limited editions available.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto mb-16">
        {merchandise.map((item) => (
          <div key={item.id} className="border border-neutral-300 hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="relative aspect-[4/5] bg-neutral-100">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-8">
              <h3 className="text-2xl mb-2">{item.title}</h3>
              <p className="text-sm text-neutral-600 mb-6">{item.description}</p>
              
              <div className="mb-6 pb-6 border-b border-neutral-200">
                <p className="text-4xl font-light">${item.price}</p>
              </div>

              {item.available ? (
                <div className="space-y-3">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full bg-neutral-900 text-white px-6 py-4 hover:bg-black transition uppercase tracking-widest text-sm font-medium"
                  >
                    Add to Cart
                  </button>
                  <button className="w-full border-2 border-neutral-300 px-6 py-4 hover:border-neutral-900 transition uppercase tracking-widest text-sm">
                    View Details
                  </button>
                </div>
              ) : (
                <span className="block text-red-600 uppercase tracking-widest text-sm py-4 text-center font-medium">
                  Out of Stock
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-neutral-50 p-10 md:p-16 border border-neutral-300 max-w-2xl mx-auto text-center">
        <h2 className="text-3xl mb-6">Limited Editions & Custom Orders</h2>
        <div className="w-16 h-px bg-neutral-400 mx-auto mb-6"></div>
        <p className="text-neutral-600 mb-8 leading-relaxed">
          Interested in a custom print size or exclusive limited edition? Contact us to discuss your specific needs.
        </p>
        <a 
          href="mailto:artist@example.com"
          className="inline-block bg-neutral-900 text-white px-10 py-4 hover:bg-black transition uppercase tracking-widest text-sm"
        >
          Get in Touch
        </a>
      </div>
    </div>
  );
}
