import { Token } from '@yukukuru/types';
import { CollectionReference, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { firestore } from '../../firebase';
import { getTwitterIdFromAccessToken } from '../../twitter-id-access-token';
import { bulkWriterErrorHandler } from '../error';

const collectionId = 'tokens';
export const tokensCollectionRef = firestore.collection(collectionId) as CollectionReference<Token>;

export const checkExistsToken = async (id: string): Promise<boolean> => {
  const snapshot = await tokensCollectionRef.doc(id).get();
  return snapshot.exists;
};

export const getToken = async (id: string): Promise<Token | null> => {
  const snapshot = await tokensCollectionRef.doc(id).get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data();
  if (!data) {
    return null;
  }

  const { twitterAccessToken = null, twitterAccessTokenSecret = null } = data;
  if (!twitterAccessToken || !twitterAccessTokenSecret) {
    return null;
  }
  return { twitterAccessToken, twitterAccessTokenSecret };
};

export const getTokens = async (): Promise<({ id: string } & Token)[]> => {
  const snapshot = await tokensCollectionRef.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const deleteToken = async (id: string, skipCheckExists = false): Promise<void> => {
  if (!skipCheckExists) {
    const exists = await checkExistsToken(id);
    if (!exists) return;
  }

  await tokensCollectionRef.doc(id).delete();
};

export const deleteTokens = async (ids: string[]): Promise<void> => {
  if (ids.length === 0) return;

  const bulkWriter = firestore.bulkWriter();
  bulkWriter.onWriteError(bulkWriterErrorHandler);
  ids.forEach((id) => {
    bulkWriter.delete(tokensCollectionRef.doc(id));
  });
  await bulkWriter.close();
};

export const getTokensByAccessToken = async (accessToken: string): Promise<QueryDocumentSnapshot<Token>[]> => {
  const twitterId = getTwitterIdFromAccessToken(accessToken);
  const snapshot = await tokensCollectionRef
    .where('twitterAccessToken', '>=', `${twitterId}-`) // - charCode 45
    .where('twitterAccessToken', '<', `${twitterId}.`) // . charCode 46
    .get();
  return snapshot.docs as QueryDocumentSnapshot<Token>[];
};
