import { FirestoreDateLike, UserData } from '@yukukuru/types';
import { usersCollection } from '.';

/**
 * フォロワー取得処理の状態を保存
 *
 * @param userId ユーザーID
 * @param watchId 保存した watch ID
 * @param ended 取得が終了している (カーソルが 0 か -1) かどうか
 * @param nextCursor 次のカーソル
 * @param date 現在の日時
 * @deprecated 廃止予定の Twitter API v1.1 ベースの関数
 */
export const setUserResultLegacy = async (
  userId: string,
  watchId: string,
  ended: boolean,
  nextCursor: string,
  date: Date
): Promise<void> => {
  const ref = usersCollection.doc(userId);

  if (ended) {
    const data: Pick<
      UserData<FirestoreDateLike>,
      'nextCursor' | 'currentWatchesId' | 'pausedGetFollower' | 'lastUpdated'
    > = {
      nextCursor: '-1',
      currentWatchesId: '',
      pausedGetFollower: false,
      lastUpdated: date,
    };
    await ref.update(data);
  } else {
    const data: Pick<UserData<FirestoreDateLike>, 'nextCursor' | 'currentWatchesId' | 'pausedGetFollower'> = {
      nextCursor: nextCursor,
      currentWatchesId: watchId,
      pausedGetFollower: true,
    };
    await ref.update(data);
  }
};

/**
 * フォロワー取得処理の状態を保存
 */
export const setUserGetFollowersV2Status = async (
  userId: string,
  nextToken: string | null,
  ended: boolean,
  date: Date
): Promise<void> => {
  await usersCollection.doc(userId).update(
    ended
      ? {
          '_getFollowersV2Status.lastRun': date,
          '_getFollowersV2Status.nextToken': nextToken,
        }
      : {
          '_getFollowersV2Status.nextToken': nextToken,
        }
  );
};

export const updateUserLastUpdatedTwUsers = async (userId: string, date: Date): Promise<void> => {
  const ref = usersCollection.doc(userId);
  const data: Pick<UserData<FirestoreDateLike>, 'lastUpdatedTwUsers'> = {
    lastUpdatedTwUsers: date,
  };
  await ref.update(data);
};

export const setUesrTwitter = async (userId: string, twitter: UserData['twitter']): Promise<void> => {
  await usersCollection.doc(userId).update({
    twitter,
  });
};

export const updateUserCheckIntegrity = async (uid: string, date: Date): Promise<void> => {
  const ref = usersCollection.doc(uid);
  const data: Pick<UserData<FirestoreDateLike>, 'lastUpdatedCheckIntegrity'> = {
    lastUpdatedCheckIntegrity: date,
  };
  await ref.update(data);
};
