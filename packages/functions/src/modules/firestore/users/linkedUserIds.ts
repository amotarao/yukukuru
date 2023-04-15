import { FieldValue } from 'firebase-admin/firestore';
import { usersCollectionRef } from '.';

export const addLinkedUserIds = async (id: string, targetId: string): Promise<void> => {
  await usersCollectionRef.doc(id).update({
    linkedUserIds: FieldValue.arrayUnion(targetId),
  });
};
