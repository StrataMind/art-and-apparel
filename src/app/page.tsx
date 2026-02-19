import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-neutral-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-serif mb-4">Art & Apparel</h1>
          <p className="text-xl text-neutral-600 mb-8">
            Original paintings and custom designs
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/art" className="bg-black text-white px-8 py-3 hover:bg-neutral-800">
              View Paintings
            </Link>
            <Link href="/merchandise" className="border-2 border-black px-8 py-3 hover:bg-black hover:text-white transition">
              Merchandise
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Sections */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Art Section */}
            <Link href="/art" className="group">
              <div className="border border-neutral-200 overflow-hidden hover:shadow-lg transition">
                <div className="aspect-[4/3] bg-neutral-200 flex items-center justify-center">
                  <span className="text-neutral-400">Original Paintings</span>
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-serif mb-2 group-hover:underline">Original Art</h2>
                  <p className="text-neutral-600 mb-4">
                    One-of-a-kind paintings available for purchase. Each piece is signed and comes with authenticity.
                  </p>
                  <span className="text-sm font-medium">Browse Collection →</span>
                </div>
              </div>
            </Link>

            {/* Merchandise Section */}
            <Link href="/merchandise" className="group">
              <div className="border border-neutral-200 overflow-hidden hover:shadow-lg transition">
                <div className="aspect-[4/3] bg-neutral-200 flex items-center justify-center">
                  <span className="text-neutral-400">Merchandise</span>
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-serif mb-2 group-hover:underline">Merchandise</h2>
                  <p className="text-neutral-600 mb-4">
                    T-shirts, prints, and more featuring original designs. Coming soon!
                  </p>
                  <span className="text-sm font-medium">Learn More →</span>
                </div>
              </div>
            </Link>
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
            I&apos;m an artist creating original paintings and designs. 
            Each piece is crafted with passion and attention to detail. 
            Thank you for visiting my gallery!
          </p>
        </div>
      </section>
    </div>
  );
}
