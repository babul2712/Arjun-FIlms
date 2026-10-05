import React from 'react';
import PublicBioLinksView from '@/components/public/PublicBioLinksView';
import { getPublicBioProfile } from '@/app/actions';

export const revalidate = 0;

export const metadata = {
  title: 'Arjun Films & Photography | Bio Links & Connect',
  description:
    'Official social media hub, wedding showreels, and booking contacts for Arjun Films & Photography.',
};

export default async function PublicBioPage() {
  const profile = await getPublicBioProfile('arjunfilms');

  return (
    <main className="min-h-screen w-full bg-[#090a0d]">
      <PublicBioLinksView profile={profile} />
    </main>
  );
}
