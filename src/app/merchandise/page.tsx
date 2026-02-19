export default function MerchandisePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-serif mb-6">Merchandise</h1>
        
        <div className="bg-neutral-100 p-12 mb-8">
          <svg className="w-24 h-24 mx-auto mb-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <h2 className="text-2xl font-medium mb-4">Coming Soon</h2>
          <p className="text-lg text-neutral-600">
            T-shirts, prints, and other merchandise featuring my artwork will be available soon.
          </p>
        </div>

        <div className="space-y-4 text-left bg-white border border-neutral-200 p-6">
          <h3 className="font-medium text-lg">What&apos;s Coming:</h3>
          <ul className="space-y-2 text-neutral-600">
            <li>• Art prints in various sizes</li>
            <li>• T-shirts with original designs</li>
            <li>• Hoodies and sweatshirts</li>
            <li>• Stickers and postcards</li>
            <li>• Limited edition items</li>
          </ul>
        </div>

        <div className="mt-8">
          <p className="text-neutral-600 mb-4">
            Want to be notified when merchandise launches?
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border border-neutral-300 focus:border-black focus:outline-none"
            />
            <button className="bg-black text-white px-6 py-2 hover:bg-neutral-800">
              Notify Me
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
