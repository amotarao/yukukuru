import { FirestoreDateLike, Record } from '@yukukuru/types';
import { CollectionReference } from 'firebase-admin/firestore';
import { firestore } from '../../firebase';

export const getRecordsCollection = (uid: string) =>
  firestore.collection('users').doc(uid).collection('records') as CollectionReference<Record<FirestoreDateLike>>;
