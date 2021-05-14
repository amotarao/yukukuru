import { CheckIntegrityMessage } from '@yukukuru/types';
import { firestore } from '../modules/firebase';
import { getGroupFromTime } from '../modules/group';
import { publishMessages } from '../modules/pubsub/publish';
import { PubSubOnRunHandler } from '../types/functions';
import { log } from '../utils/log';

/**
 * 整合性チェックのキューを作成
 *
 * 12分ごとに 1グループずつ実行
 * 1日に 120回実行
 * ユーザーごとに 1日1回 整合性をチェック
 */
export const publishCheckIntegrityHandler: PubSubOnRunHandler = async (context) => {
  const now = new Date(context.timestamp);
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

  const ids: string[] = usersSnap.docs.map((doc) => doc.id);
  log('checkIntegrity', '', { ids, count: ids.length });

  const items: CheckIntegrityMessage['data'][] = ids.map((id) => ({ uid: id, publishedAt: now }));
  await publishMessages('checkIntegrity', items);

  console.log(`✔️ Completed publish ${items.length} message.`);
};
