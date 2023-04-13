import { FieldValue } from 'firebase-admin/firestore';
import { usersCollection } from '.';

export const addLinkedUserIds = async (id: string, targetId: string): Promise<void> => {
  await usersCollection.doc(id).update({
    linkedUserIds: FieldValue.arrayUnion(targetId),
  });
};
