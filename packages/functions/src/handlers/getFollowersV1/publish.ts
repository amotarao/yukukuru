import { UserData } from '@yukukuru/types';
import * as dayjs from 'dayjs';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { getSharedTokensForGetFollowersV2 } from '../../modules/firestore/sharedToken';
import { getUserDocsByGroups } from '../../modules/firestore/users';
import { getGroupFromTime } from '../../modules/group';
import { publishMessages } from '../../modules/pubsub';
import { Message, topicName } from './_pubsub';

/**
 * フォロワー取得 定期実行
 *
 * 毎分実行
 * グループ毎に 5分おきに実行
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

    // 対象ユーザーの取得
    const groups = [
      getGroupFromTime(1, now.toDate()),
      getGroupFromTime(1, now.add(5, 'minutes').toDate()),
      getGroupFromTime(1, now.add(10, 'minutes').toDate()),
    ];
    const docs = await getUserDocsByGroups(groups);
    const targetDocs = docs.filter(filterExecutable);
    const sharedTokens = await getSharedTokensForGetFollowersV2(now.toDate(), targetDocs.length);

    // publish データ作成・送信
    const messages: Message[] = targetDocs
      .map((doc, i) => {
        const sharedToken = sharedTokens.at(i);
        if (!sharedToken) {
          console.log(`❗️ No shared token available for [${doc.id}]`);
          return null;
        }
        const message: Message = {
          uid: doc.id,
          twitterId: doc.data().twitter.id,
          nextCursor: doc.data()._getFollowersV1Status.nextCursor,
          sharedToken: {
            id: sharedToken.id,
            accessToken: sharedToken.data.accessToken,
            accessTokenSecret: sharedToken.data.accessTokenSecret,
          },
          publishedAt: now.toDate(),
        };
        return message;
      })
      .filter((message): message is Message => message !== null);
    await publishMessages(topicName, messages.slice(0, 300));

    console.log(`✔️ Completed publish ${messages.length} message.`);
  });

/** 実行可能かどうかを確認 */
const filterExecutable = (snapshot: QueryDocumentSnapshot<UserData>): boolean => {
  const { _getFollowersV1Status } = snapshot.data();

  // 1回きりの実行
  if (_getFollowersV1Status.lastUpdated.toDate().getTime() === new Date(0).getTime()) {
    return true;
  }
  return false;
};
