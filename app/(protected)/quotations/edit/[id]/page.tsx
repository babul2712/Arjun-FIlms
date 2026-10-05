import React from 'react';
import QuotationForm from '../../components/QuotationForm';
import { getQuotationById } from '@/app/actions';
import { notFound } from 'next/navigation';

export default async function EditQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  let quotation;
  try {
    quotation = await getQuotationById(resolvedParams.id);
  } catch (error) {
    console.error('Error fetching quotation:', error);
  }

  if (!quotation) {
    return notFound();
  }

  return <QuotationForm initialData={quotation} quotationId={resolvedParams.id} />;
}
