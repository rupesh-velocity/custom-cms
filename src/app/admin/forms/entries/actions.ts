'use server';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function handleBulkAction(activeFormId: number, statusFilter: string, formData: FormData) {
  const action = formData.get('action');
  const ids = formData.getAll('submissionIds').map(id => parseInt(String(id), 10));
  
  if (ids.length === 0 || !action) return;
  
  if (action === 'Trash') {
    await prisma.formSubmission.updateMany({ where: { id: { in: ids } }, data: { status: 'Trash' } });
  } else if (action === 'Spam') {
    await prisma.formSubmission.updateMany({ where: { id: { in: ids } }, data: { status: 'Spam' } });
  } else if (action === 'Restore') {
    await prisma.formSubmission.updateMany({ where: { id: { in: ids } }, data: { status: 'Active' } });
  } else if (action === 'Delete') {
    await prisma.formSubmission.deleteMany({ where: { id: { in: ids } } });
  }
  
  redirect(`/admin/forms/entries?form_id=${activeFormId}&status=${statusFilter}`);
}
