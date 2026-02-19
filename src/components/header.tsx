'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-serif hover:opacity-80">
          Art & Apparel
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {session ? (
            <>
              <span>Hi, {session.user?.name}</span>
              <button onClick={() => signOut()} className="hover:underline">
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/auth/signin" className="hover:underline">Sign In</Link>
          )}
        </div>
      </div>
    </header>
  );
}
