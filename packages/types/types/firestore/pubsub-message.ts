import { FirestoreDateLike, Timestamp } from '../firestore';

export interface GetFollowersMessage {
  /** キュータイプ */
  type: 'getFollowers';

  data: {
    /** Firebase UID */
    uid: string;

    /** カーソル */
    nextCursor: string;
  };
}

export interface CheckIntegrityMessage {
  /** キュータイプ */
  type: 'checkIntegrity';

  data: {
    /** Firebase UID */
    uid: string;
  };
}

export interface UpdateTwUsersMessage {
  /** キュータイプ */
  type: 'updateTwUsers';

  data: {
    /** Firebase UID */
    uid: string;
  };
}

export interface ConvertRecordsMessage<T extends FirestoreDateLike = Timestamp> {
  /** キュータイプ */
  type: 'convertRecords';

  data: {
    /** Firebase UID */
    uid: string;
  };
}

export type Message = GetFollowersMessage | CheckIntegrityMessage | UpdateTwUsersMessage | ConvertRecordsMessage;

export type QueueType = Message['type'];
