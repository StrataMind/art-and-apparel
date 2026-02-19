import './globals.css';
import Header from '@/components/header';
import Providers from '@/components/providers';

export const metadata = {
  title: 'Art & Apparel Store',
  description: 'Original paintings and custom t-shirts',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>
          <Header />
          <main>{children}</main>
          <footer className="border-t border-neutral-200 mt-20">
            <div className="container mx-auto px-4 py-8 text-center text-neutral-600">
              <p>&copy; {new Date().getFullYear()} Art & Apparel. All rights reserved.</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
