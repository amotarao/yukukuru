import { UserData } from '@yukukuru/types';
import { usersCollection } from '.';

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

export const setCheckIntegrityV2Status = async (userId: string, date: Date): Promise<void> => {
  await usersCollection.doc(userId).update({
    '_checkIntegrityV2Status.lastRun': date,
  });
};

export const setUesrTwitter = async (userId: string, twitter: UserData['twitter']): Promise<void> => {
  await usersCollection.doc(userId).update({
    twitter,
  });
};

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
    await ref.update({
      '_getFollowersV1Status.nextCursor': '-1',
      '_getFollowersV1Status.currentWatchesId': '',
      '_getFollowersV1Status.pausedGetFollower': false,
      '_getFollowersV1Status.lastUpdated': date,
    });
  } else {
    await ref.update({
      '_getFollowersV1Status.nextCursor': nextCursor,
      '_getFollowersV1Status.currentWatchesId': watchId,
      '_getFollowersV1Status.pausedGetFollower': true,
    });
  }
};
