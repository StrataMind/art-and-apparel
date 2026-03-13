export default function MerchandisePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-5xl mb-4">Merchandise</h1>
        <div className="w-16 h-px bg-neutral-400 mx-auto mb-12"></div>
        
        <div className="bg-neutral-50 p-16 mb-12 border border-neutral-300">
          <div className="w-32 h-32 mx-auto mb-8 border-2 border-neutral-300 flex items-center justify-center">
            <span className="text-6xl text-neutral-400">+</span>
          </div>
          <h2 className="text-3xl mb-6">Coming Soon</h2>
          <p className="text-lg text-neutral-600 leading-relaxed">
            T-shirts, prints, and other merchandise featuring original artwork will be available soon.
          </p>
        </div>

        <div className="bg-white border border-neutral-300 p-10 mb-12">
          <h3 className="text-2xl mb-6">What&apos;s Coming</h3>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="border-l-2 border-neutral-300 pl-6">
              <h4 className="font-medium mb-2 uppercase tracking-wide text-sm">Prints</h4>
              <p className="text-neutral-600 text-sm">Art prints in various sizes</p>
            </div>
            <div className="border-l-2 border-neutral-300 pl-6">
              <h4 className="font-medium mb-2 uppercase tracking-wide text-sm">Apparel</h4>
              <p className="text-neutral-600 text-sm">T-shirts, hoodies, sweatshirts</p>
            </div>
            <div className="border-l-2 border-neutral-300 pl-6">
              <h4 className="font-medium mb-2 uppercase tracking-wide text-sm">Accessories</h4>
              <p className="text-neutral-600 text-sm">Stickers, postcards, tote bags</p>
            </div>
            <div className="border-l-2 border-neutral-300 pl-6">
              <h4 className="font-medium mb-2 uppercase tracking-wide text-sm">Limited Editions</h4>
              <p className="text-neutral-600 text-sm">Exclusive numbered items</p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-50 p-10 border border-neutral-300">
          <h3 className="text-2xl mb-4">Be Notified</h3>
          <p className="text-neutral-600 mb-6">
            Enter your email to receive updates when merchandise launches
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 border-2 border-neutral-300 focus:border-neutral-900 focus:outline-none"
            />
            <button className="bg-neutral-900 text-white px-8 py-3 hover:bg-black transition uppercase tracking-widest text-sm whitespace-nowrap">
              Notify Me
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
