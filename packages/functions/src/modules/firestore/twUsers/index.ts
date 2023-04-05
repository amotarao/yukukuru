import { FirestoreDateLike, TwUser } from '@yukukuru/types';
import * as admin from 'firebase-admin';
import { CollectionReference } from 'firebase-admin/firestore';
import { firestore } from '../../firebase';
import { convertTwitterUserToTwUser } from '../../twitter-user-converter';
import { TwitterUser } from '../../twitter/types';
import { bulkWriterErrorHandler } from '../error';

const collection = firestore.collection('twUsers') as CollectionReference<TwUser<FirestoreDateLike>>;

/**
 * twUser ドキュメントを並列で保存
 *
 * @param users 保存するユーザー情報
 * @param max 1回で保存する最大ドキュメント数
 * @param count 実行回数
 */
const setTwUsersParallel = async (users: TwitterUser[], max = 100, count = 0): Promise<void> => {
  const currentUsers = users.slice(0, max);
  console.log(`⏳ Starting set ${currentUsers.length} twUsers documents ${count} times.`);

  const bulkWriter = firestore.bulkWriter();
  bulkWriter.onWriteError(bulkWriterErrorHandler);

  currentUsers.forEach((user) => {
    const ref = collection.doc(user.id);
    const data: TwUser<FirestoreDateLike> = {
      ...convertTwitterUserToTwUser(user),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    };
    bulkWriter.set(ref, data, { merge: true });
  });

  await bulkWriter.close();

  console.log(`⏳ Completed to set ${currentUsers.length} twUsers documents ${count} times.`);

  const nextUsers = users.slice(max);
  if (nextUsers.length) {
    return setTwUsersParallel(nextUsers, max, ++count);
  }
};

/**
 * twUser ドキュメントを保存
 *
 * @param users 保存するユーザー情報
 */
export const setTwUsers = async (users: TwitterUser[]): Promise<void> => {
  await setTwUsersParallel(users, 400);
};

/**
 * twUser ドキュメントを取得
 *
 * @param ids 取得するユーザーIDリスト
 */
export const getTwUsersByIds = async (ids: string[]): Promise<TwUser[]> => {
  if (ids.length === 0) return [];
  const snapshots = await firestore.getAll(...ids.map((id) => collection.doc(id)));
  return snapshots.filter((snapshot) => snapshot.exists).map((result) => result.data() as TwUser);
};

/**
 * 指定した twUser ドキュメントを取得
 *
 * @param id 取得するユーザーID
 */
export const getTwUser = async (id: string): Promise<TwUser | null> => {
  const snapshot = await collection.doc(id).get();

  if (!snapshot.exists) {
    return null;
  }

  return snapshot.data() as TwUser;
};

export const getOldTwUsers = async (before: Date, limit: number): Promise<TwUser[]> => {
  const snapshots = await collection.where('lastUpdated', '<', before).orderBy('lastUpdated').limit(limit).get();
  return snapshots.docs.map((doc) => doc.data() as TwUser);
};

export const deleteTwUsers = async (ids: string[]): Promise<void> => {
  const bulkWriter = firestore.bulkWriter();
  bulkWriter.onWriteError(bulkWriterErrorHandler);

  ids.forEach((id) => {
    const ref = collection.doc(id);
    bulkWriter.delete(ref);
  });

  await bulkWriter.close();
};
