import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-neutral-50 py-32">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-6xl mb-6 tracking-wide">Art & Apparel</h1>
          <div className="w-24 h-px bg-neutral-400 mx-auto mb-6"></div>
          <p className="text-xl text-neutral-600 mb-12 leading-relaxed">
            Original paintings and custom designs, crafted with passion and attention to detail
          </p>
          <div className="flex gap-6 justify-center">
            <Link href="/art" className="bg-neutral-900 text-white px-10 py-4 hover:bg-black transition uppercase tracking-widest text-sm">
              View Collection
            </Link>
            <Link href="#donate" className="border-2 border-neutral-900 px-10 py-4 hover:bg-neutral-900 hover:text-white transition uppercase tracking-widest text-sm">
              Support Artist
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Sections */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4">Explore</h2>
            <div className="w-16 h-px bg-neutral-400 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Art Section */}
            <Link href="/art" className="group">
              <div className="border border-neutral-300 overflow-hidden hover:shadow-2xl transition-all duration-300">
                <div className="aspect-[4/3] bg-neutral-100 flex items-center justify-center border-b border-neutral-300">
                  <span className="text-neutral-400 text-sm uppercase tracking-widest">Original Paintings</span>
                </div>
                <div className="p-8 text-center">
                  <h3 className="text-2xl mb-4 group-hover:opacity-70 transition">Original Art</h3>
                  <p className="text-neutral-600 mb-6 leading-relaxed">
                    One-of-a-kind paintings available for purchase. Each piece is signed and comes with certificate of authenticity.
                  </p>
                  <span className="text-sm uppercase tracking-widest border-b border-neutral-900 pb-1">View Collection</span>
                </div>
              </div>
            </Link>

            {/* Merchandise Section */}
            <Link href="/merchandise" className="group">
              <div className="border border-neutral-300 overflow-hidden hover:shadow-2xl transition-all duration-300">
                <div className="aspect-[4/3] bg-neutral-100 flex items-center justify-center border-b border-neutral-300">
                  <span className="text-neutral-400 text-sm uppercase tracking-widest">Merchandise</span>
                </div>
                <div className="p-8 text-center">
                  <h3 className="text-2xl mb-4 group-hover:opacity-70 transition">Merchandise</h3>
                  <p className="text-neutral-600 mb-6 leading-relaxed">
                    T-shirts, prints, and more featuring original designs. Launching soon.
                  </p>
                  <span className="text-sm uppercase tracking-widest border-b border-neutral-900 pb-1">Learn More</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Donation */}
      <section id="donate" className="py-24 bg-neutral-50">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-4xl mb-4">Support My Art</h2>
          <div className="w-16 h-px bg-neutral-400 mx-auto mb-8"></div>
          <p className="text-lg text-neutral-600 mb-12 leading-relaxed">
            Your support helps me continue creating. Every contribution is deeply appreciated.
          </p>
          
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[5, 10, 25, 50].map((amount) => (
              <button
                key={amount}
                className="border-2 border-neutral-300 py-6 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white transition-all"
              >
                <span className="text-2xl">${amount}</span>
              </button>
            ))}
          </div>

          <div className="mb-8">
            <input
              type="number"
              placeholder="Custom amount"
              className="w-full px-6 py-4 border-2 border-neutral-300 focus:border-neutral-900 focus:outline-none mb-4 text-center"
            />
            <button className="w-full bg-neutral-900 text-white py-4 hover:bg-black transition uppercase tracking-widest">
              Donate Now
            </button>
          </div>

          <p className="text-sm text-neutral-500 uppercase tracking-wide">
            Secure payment powered by Stripe
          </p>
        </div>
      </section>

      {/* About */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-4xl mb-4">About the Artist</h2>
          <div className="w-16 h-px bg-neutral-400 mx-auto mb-8"></div>
          <p className="text-lg text-neutral-600 leading-relaxed">
            I&apos;m an artist dedicated to creating original paintings and designs. 
            Each piece is crafted with passion, attention to detail, and a deep love for the creative process. 
            Thank you for visiting my gallery and supporting my work.
          </p>
        </div>
      </section>
    </div>
  );
}
