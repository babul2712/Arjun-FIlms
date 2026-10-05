import React from 'react';
import QuotationForm from '../components/QuotationForm';

export default async function CreateQuotationPage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const resolvedParams = await searchParams;
  return <QuotationForm projectId={resolvedParams.projectId} />;
}
