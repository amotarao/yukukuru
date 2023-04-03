import { UserData } from '@yukukuru/types';
import * as dayjs from 'dayjs';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { getUserDocsByGroups } from '../../modules/firestore/users';
import { getGroupFromTime } from '../../modules/group';
import { publishMessages } from '../../modules/pubsub/publish';
import { Message, topicName } from './_pubsub';

/**
 * 整合性チェック 定期実行
 * 整合性チェックのキューを作成
 */
export const publish = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const now = dayjs(context.timestamp);

    const groups = [
      getGroupFromTime(1, now.toDate()),
      getGroupFromTime(1, now.add(5, 'minutes').toDate()),
      getGroupFromTime(1, now.add(10, 'minutes').toDate()),
    ];
    const docs = await getUserDocsByGroups(groups);
    const targetDocs = docs.filter(filterExecutable(now.toDate()));

    const messages: Message[] = targetDocs.map((doc) => ({
      uid: doc.id,
      followersCount: doc.data().twitter.followersCount,
      publishedAt: now.toDate(),
    }));
    await publishMessages(topicName, messages);

    console.log(`✔️ Completed publish ${messages.length} message.`);
  });

/** 実行可能かどうかを確認 */
const filterExecutable =
  (now: Date) =>
  (snapshot: QueryDocumentSnapshot<UserData>): boolean => {
    const { active, deletedAuth, lastUpdatedCheckIntegrity } = snapshot.data();

    // 無効または削除済みユーザーの場合は実行しない
    if (!active || deletedAuth) {
      return false;
    }

    const minutes = dayjs(now).diff(dayjs(lastUpdatedCheckIntegrity.toDate()), 'minutes');

    // 20分経過していれば実行
    if (minutes < 10 - 1) {
      return false;
    }
    return true;
  };
