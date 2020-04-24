import { FirestoreDateLike, Timestamp } from '../firestore';

export interface QueueTypeGetFollowersData {
  /** キュータイプ */
  type: 'getFollowers';

  data: {
    /** Firebase UID */
    uid: string;

    /** カーソル */
    nextCursor: string;
  };
}

export interface QueueTypeCheckIntegrityData {
  /** キュータイプ */
  type: 'checkIntegrity';

  data: {
    /** Firebase UID */
    uid: string;
  };
}

export interface QueueTypeUpdateTwUsersData {
  /** キュータイプ */
  type: 'updateTwUsers';

  data: {
    /** Firebase UID */
    uid: string;
  };
}

export interface QueueTypeConvertRecordsData<T extends FirestoreDateLike = Timestamp> {
  /** キュータイプ */
  type: 'convertRecords';

  data: {
    /** Firebase UID */
    uid: string;

    /** いつの日のデータから見るか */
    cursor: T;
  };
}

export type QueueData =
  | QueueTypeGetFollowersData
  | QueueTypeCheckIntegrityData
  | QueueTypeUpdateTwUsersData
  | QueueTypeConvertRecordsData;

export type QueueType = QueueData['type'];
