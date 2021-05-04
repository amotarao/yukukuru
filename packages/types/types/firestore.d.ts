import { FieldValue, Timestamp } from '@firebase/firestore-types';
export * from './firestore/token';
export * from './firestore/twUser';
export * from './firestore/user';
export * from './firestore/user/record';
export * from './firestore/user/watch';
export * from './firestore/pubsub-message';

export interface FirestoreIdData<T> {
  /** Firestore ドキュメント ID */
  id: string;

  /** データ */
  data: T;
}

export type FirestoreDateLike = Date | Timestamp | FieldValue;

export { Timestamp };
