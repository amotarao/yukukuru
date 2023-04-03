import { FirestoreDateLike, TwUserData } from '@yukukuru/types';
import * as admin from 'firebase-admin';
import { CollectionReference } from 'firebase-admin/firestore';
import { firestore } from '../../firebase';
import { TwitterUser } from '../../twitter';
import { convertTwitterUserToTwUser } from '../../twitter-user-converter';
import { bulkWriterErrorHandler } from '../error';

const collection = firestore.collection('twUsers') as CollectionReference<TwUserData<FirestoreDateLike>>;

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
    const data: TwUserData<FirestoreDateLike> = {
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
export const getTwUsers = async (ids: string[]): Promise<TwUserData[]> => {
  const requests = ids.map(async (id) => {
    const snapshot = await collection.doc(id).get();
    return snapshot;
  });

  const results = await Promise.all(requests);

  return results.filter((result) => result.exists).map((result) => result.data() as TwUserData);
};

/**
 * 指定した twUser ドキュメントを取得
 *
 * @param id 取得するユーザーID
 */
export const getTwUser = async (id: string): Promise<TwUserData | null> => {
  const snapshot = await collection.doc(id).get();

  if (!snapshot.exists) {
    return null;
  }

  return snapshot.data() as TwUserData;
};
