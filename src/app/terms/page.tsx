export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-5xl mb-4 text-center">Terms of Service</h1>
      <div className="w-16 h-px mx-auto mb-12" style={{ backgroundColor: '#8b7355' }}></div>
      
      <div className="space-y-8 text-neutral-700 leading-relaxed">
        <p className="text-sm text-neutral-600">Last updated: February 20, 2025</p>

        <section>
          <h2 className="text-2xl mb-4">Agreement to Terms</h2>
          <p>
            By accessing or using Art & Apparel, you agree to be bound by these Terms of Service. 
            If you disagree with any part of these terms, you may not access the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl mb-4">Use of Service</h2>
          <p className="mb-3">You agree to use our service only for lawful purposes. You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Transmit harmful or malicious code</li>
            <li>Attempt to gain unauthorized access</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl mb-4">Artwork and Intellectual Property</h2>
          <p>
            All artwork displayed on this website is the intellectual property of the artist. 
            Unauthorized reproduction, distribution, or use of any artwork is strictly prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-2xl mb-4">Purchases</h2>
          <p className="mb-3">When purchasing artwork:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>All sales are final unless the artwork is damaged during shipping</li>
            <li>Prices are in USD and subject to change</li>
            <li>Shipping costs are additional</li>
            <li>Delivery times are estimates and not guaranteed</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl mb-4">Donations</h2>
          <p>
            Donations are voluntary and non-refundable. By making a donation, you acknowledge that 
            you are not purchasing any goods or services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl mb-4">User Accounts</h2>
          <p>
            When you sign in with Google, you are responsible for maintaining the security of your account. 
            You agree to accept responsibility for all activities that occur under your account.
          </p>
        </section>

        <section>
          <h2 className="text-2xl mb-4">Limitation of Liability</h2>
          <p>
            Art & Apparel shall not be liable for any indirect, incidental, special, consequential, 
            or punitive damages resulting from your use of or inability to use the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl mb-4">Disclaimer</h2>
          <p>
            The service is provided &quot;as is&quot; without warranties of any kind, either express or implied. 
            We do not warrant that the service will be uninterrupted or error-free.
          </p>
        </section>

        <section>
          <h2 className="text-2xl mb-4">Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of any 
            material changes by posting the new terms on this page with an updated date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl mb-4">Governing Law</h2>
          <p>
            These terms shall be governed by and construed in accordance with applicable laws, 
            without regard to conflict of law provisions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl mb-4">Contact Information</h2>
          <p>
            For questions about these Terms of Service, please contact us at: 
            <a href="mailto:artist@example.com" className="underline ml-1">artist@example.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
