import { firestore } from '../../../../modules/firebase';
import { DateLike } from '../../types';

export type RecordType = 'yuku' | 'kuru';

export interface Record {
  type: RecordType;
  twId: string;
  durationStart: DateLike;
  durationEnd: DateLike;
}

/**
 * レコードを追加
 * @param uid ユーザーID (Firebase UID)
 * @param data データ
 */
export async function addRecord(uid: string, data: Record): Promise<void> {
  const doc = firestore
    .collection('users')
    .doc(uid)
    .collection('records')
    .doc();
  await doc.set(data);
}
