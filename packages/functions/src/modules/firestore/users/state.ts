import { FirestoreDateLike, UserData } from '@yukukuru/types';
import { firestore } from '../../firebase';

const collection = firestore.collection('users');

/**
 * フォロワー取得処理の状態を保存
 *
 * @param userId ユーザーID
 * @param watchId 保存した watch ID
 * @param ended 取得が終了している (カーソルが 0 か -1) かどうか
 * @param nextCursor 次のカーソル
 * @param date 現在の日時
 */
export const setUserResultLegacy = async (
  userId: string,
  watchId: string,
  ended: boolean,
  nextCursor: UserData['nextCursor'],
  date: Date
): Promise<void> => {
  const ref = collection.doc(userId);

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
      nextCursor,
      currentWatchesId: watchId,
      pausedGetFollower: true,
    };
    await ref.update(data);
  }
};

/**
 * フォロワー取得処理の状態を保存
 *
 * @param userId ユーザーID
 * @param watchId 保存した watch ID
 * @param ended 取得が終了している (カーソルが 0 か -1) かどうか
 * @param nextToken 次のカーソル
 * @param date 現在の日時
 */
export const setUserResult = async (
  userId: string,
  watchId: string,
  ended: boolean,
  nextToken: UserData['getFollowersNextToken'],
  date: Date
): Promise<void> => {
  const ref = collection.doc(userId);

  if (ended) {
    const data: Pick<
      UserData<FirestoreDateLike>,
      'getFollowersNextToken' | 'currentWatchesId' | 'pausedGetFollower' | 'lastUpdated'
    > = {
      getFollowersNextToken: null,
      currentWatchesId: '',
      pausedGetFollower: false,
      lastUpdated: date,
    };
    await ref.update(data);
  } else {
    const data: Pick<
      UserData<FirestoreDateLike>,
      'getFollowersNextToken' | 'currentWatchesId' | 'pausedGetFollower'
    > = {
      getFollowersNextToken: nextToken,
      currentWatchesId: watchId,
      pausedGetFollower: true,
    };
    await ref.update(data);
  }
};

export const updateUserLastUpdatedTwUsers = async (userId: string, date: Date): Promise<void> => {
  const ref = collection.doc(userId);
  const data: Pick<UserData<FirestoreDateLike>, 'lastUpdatedTwUsers'> = {
    lastUpdatedTwUsers: date,
  };
  await ref.update(data);
};

export const updateUserTwitterInfo = async (
  userId: string,
  twitter: UserData['twitter'],
  date: Date
): Promise<void> => {
  const ref = collection.doc(userId);
  const data: Pick<UserData<FirestoreDateLike>, 'lastUpdatedUserTwitterInfo' | 'twitter'> = {
    lastUpdatedUserTwitterInfo: date,
    twitter,
  };
  await ref.update(data);
};

export const updateUserCheckIntegrity = async (uid: string, date: Date): Promise<void> => {
  const ref = collection.doc(uid);
  const data: Pick<UserData<FirestoreDateLike>, 'lastUpdatedCheckIntegrity'> = {
    lastUpdatedCheckIntegrity: date,
  };
  await ref.update(data);
};
