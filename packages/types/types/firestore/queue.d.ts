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

export type QueueData = QueueTypeGetFollowersData;
export type QueueType = QueueData['type'];
