import { FirestoreIdData, UserData, QueueTypeCheckIntegrityData } from '@yukukuru/types';
import { firestore } from '../modules/firebase';
import { addQueuesTypeCheckIntegrity } from '../utils/firestore/queues/addQueuesTypeCheckIntegrity';
import { getGroupFromTime } from '../utils/group';

/**
 * 整合性チェックのキューを作成
 *
 * 12分ごとに 1グループずつ実行
 * 1日に 120回実行
 * ユーザーごとに 1日1回 整合性をチェック
 */
export default async (): Promise<void> => {
  const now = new Date(Math.floor(new Date().getTime() / (60 * 1000)) * 60 * 1000);
  const group = getGroupFromTime(12, now);

  // 1日前
  const yesterday = new Date(now.getTime() - 23 * 60 * 60 * 1000);

  const users = firestore
    .collection('users')
    .where('active', '==', true)
    .where('lastUpdatedCheckIntegrity', '<', yesterday)
    .where('group', '==', group)
    .get();

  const usersSnap = await users;

  const docs: FirestoreIdData<UserData>[] = usersSnap.docs.map((doc) => {
    return {
      id: doc.id,
      data: doc.data() as UserData,
    };
  });
  console.log({ ids: docs.map((doc) => doc.id).join(','), count: docs.length });

  const items: QueueTypeCheckIntegrityData['data'][] = docs.map((doc) => ({
    uid: doc.id,
  }));
  await addQueuesTypeCheckIntegrity(items);
};
