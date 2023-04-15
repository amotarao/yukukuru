import { User } from '@yukukuru/types';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { usersCollectionRef } from '.';

export const getUserByTwitterScreenName = async (screenName: string): Promise<{ id: string; data: User } | null> => {
  const querySnapshot = await usersCollectionRef.where('twitter.screenName', '==', screenName).limit(1).get();
  const doc = querySnapshot.docs[0] as QueryDocumentSnapshot<User> | undefined;
  if (!doc) return null;
  return { id: doc.id, data: doc.data() };
};
