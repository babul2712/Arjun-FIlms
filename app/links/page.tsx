import React from 'react';
import PublicBioLinksView from '@/components/public/PublicBioLinksView';
import { getPublicBioProfile } from '@/app/actions';

export const revalidate = 0; // Dynamic rendering

export const metadata = {
  title: 'Arjun Films & Photography | Official Bio Links & Showcase',
  description:
    'Connect with Arjun Films & Photography across Instagram, YouTube, Facebook, WhatsApp, and explore luxury wedding cinematography portfolios and booking options.',
};

export default async function PublicLinksPage() {
  const profile = await getPublicBioProfile('arjunfilms');

  return (
    <main className="min-h-screen w-full bg-[#090a0d]">
      <PublicBioLinksView profile={profile} />
    </main>
  );
}
