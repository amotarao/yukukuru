import { UserData } from '@yukukuru/types';
import * as dayjs from 'dayjs';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { getSharedTokensForGetFollowersIds } from '../../modules/firestore/sharedToken';
import { getUserDocsByGroups } from '../../modules/firestore/users';
import { getGroupFromTime } from '../../modules/group';
import { publishMessages } from '../../modules/pubsub/publish';
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
    // 実行するかどうかは run で確認
    const groups = [
      getGroupFromTime(1, now.toDate()),
      getGroupFromTime(1, now.add(5, 'minutes').toDate()),
      getGroupFromTime(1, now.add(10, 'minutes').toDate()),
    ];
    const docs = await getUserDocsByGroups(groups);
    const targetDocs = docs.filter(filterExecutable(now.toDate()));
    const sharedTokens = await getSharedTokensForGetFollowersIds(now.toDate(), targetDocs.length);

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
          nextCursor: doc.data().nextCursor || null,
          getFollowersNextToken: doc.data().getFollowersNextToken || null,
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
    await publishMessages(topicName, messages);

    console.log(`✔️ Completed publish ${messages.length} message.`);
  });

/** 実行可能かどうかを確認 */
const filterExecutable =
  (now: Date) =>
  (snapshot: QueryDocumentSnapshot<UserData>): boolean => {
    const { role, active, deletedAuth, nextCursor, getFollowersNextToken, lastUpdated } = snapshot.data();

    // 無効または削除済みユーザーの場合は実行しない
    if (!active || deletedAuth) {
      return false;
    }

    // 取得途中のユーザーはいつでも許可
    if (nextCursor !== '-1' || getFollowersNextToken !== null) {
      return true;
    }

    const minutes = dayjs(now).diff(dayjs(lastUpdated.toDate()), 'minutes');

    // サポーターの場合、前回の実行から 5分経過していれば実行
    if (role === 'supporter') {
      if (minutes < 5 - 1) {
        return false;
      }
      return true;
    }

    // 前回の実行から6時間以上の間隔をあける
    if (minutes < 60 * 6 - 1) {
      return false;
    }

    // 前回の実行から72時間以上経っていたら無条件に実行する
    if (minutes > 60 * 72 - 1) {
      return true;
    }

    // ６~72時間であれば、毎回2%確率で実行
    if (Math.random() * 100 <= 2) {
      return true;
    }

    return false;
  };
