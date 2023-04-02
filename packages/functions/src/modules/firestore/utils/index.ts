import { DocumentSnapshot } from 'firebase-admin/firestore';
import { Change } from 'firebase-functions/v1';

export const getWriteType = (change: Change<DocumentSnapshot>): 'create' | 'delete' | 'update' | 'unknown' => {
  const { before, after } = change;

  if (!before.exists && after.exists) {
    return 'create';
  }
  if (before.exists && !after.exists) {
    return 'delete';
  }
  if (before.exists && after.exists) {
    return 'update';
  }
  return 'unknown';
};
