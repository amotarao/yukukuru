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

export type QueueData = QueueTypeGetFollowersData | QueueTypeCheckIntegrityData;

export type QueueType = QueueData['type'];
