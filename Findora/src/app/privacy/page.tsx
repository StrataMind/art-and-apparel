export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-5xl mb-4 text-center">Privacy Policy</h1>
      <div className="w-16 h-px mx-auto mb-12" style={{ backgroundColor: '#8b7355' }}></div>
      
      <div className="space-y-8 text-neutral-700 leading-relaxed">
        <p className="text-sm text-neutral-600">Last updated: February 20, 2025</p>

        <section>
          <h2 className="text-2xl mb-4">Introduction</h2>
          <p>
            Welcome to Art & Apparel. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you about how we handle your personal data when you visit our website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl mb-4">Information We Collect</h2>
          <p className="mb-3">When you sign in with Google, we collect:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your name</li>
            <li>Your email address</li>
            <li>Your profile picture (if available)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl mb-4">How We Use Your Information</h2>
          <p className="mb-3">We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide access to our website</li>
            <li>Process donations</li>
            <li>Send updates about new artwork (if you subscribe)</li>
            <li>Improve our services</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl mb-4">Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information. 
            Your data is stored securely and we do not share it with third parties except as necessary to provide our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl mb-4">Cookies</h2>
          <p>
            We use essential cookies to maintain your session when you sign in. 
            These cookies are necessary for the website to function properly.
          </p>
        </section>

        <section>
          <h2 className="text-2xl mb-4">Your Rights</h2>
          <p className="mb-3">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent at any time</li>
            <li>Object to processing of your data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl mb-4">Third-Party Services</h2>
          <p>
            We use Google OAuth for authentication. Please review Google&apos;s Privacy Policy to understand 
            how they handle your data.
          </p>
        </section>

        <section>
          <h2 className="text-2xl mb-4">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at: 
            <a href="mailto:artist@example.com" className="underline ml-1">artist@example.com</a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl mb-4">Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any changes by 
            posting the new policy on this page with an updated date.
          </p>
        </section>
      </div>
    </div>
  );
}
