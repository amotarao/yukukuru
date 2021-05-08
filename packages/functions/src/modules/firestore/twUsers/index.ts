import { FirestoreDateLike, TwUserData } from '@yukukuru/types';
import * as admin from 'firebase-admin';
import { firestore } from '../../firebase';
import { TwitterUserInterface } from '../../twitter';
import { bulkWriterErrorHandler } from '../error';

const collection = firestore.collection('twUsers');

/**
 * twUser ドキュメントを並列で保存
 *
 * @param users 保存するユーザー情報
 * @param max 1回で保存する最大ドキュメント数
 * @param count 実行回数
 */
const setTwUsersParallel = async (users: TwitterUserInterface[], max = 100, count = 0): Promise<void> => {
  const currentUsers = users.slice(0, max);
  console.log(`⏳ Starting set ${currentUsers.length} twUsers documents ${count} times.`);

  const bulkWriter = firestore.bulkWriter();
  bulkWriter.onWriteError(bulkWriterErrorHandler);

  currentUsers.forEach(({ id_str, screen_name, name, profile_image_url_https }) => {
    const ref = collection.doc(id_str);
    const data: TwUserData<FirestoreDateLike> = {
      id: id_str,
      screenName: screen_name,
      name,
      photoUrl: profile_image_url_https,
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
export const setTwUsers = async (users: TwitterUserInterface[]): Promise<void> => {
  await setTwUsersParallel(users, 100);
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

  return results
    .filter((result) => {
      return result.exists;
    })
    .map((result) => {
      return result.data() as TwUserData;
    });
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
