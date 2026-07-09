import { redirect } from 'next/navigation';

export default async function FormSubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/forms/entries?form_id=${id}`);
}
