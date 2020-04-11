import { TwUserData } from '@yukukuru/types';
import { firestore } from '../../../modules/firebase';

const collection = firestore.collection('twUsers');

/** Twitter UID リスト */
type Props = string[];

type Response = TwUserData[];

/**
 * twUsers を取得
 * 存在するデータのみを抽出して返す
 */
export const getTwUsers = async (ids: Props): Promise<Response> => {
  const refs = ids.map((id) => collection.doc(id));
  const fieldMask: (keyof TwUserData)[] = ['id', 'screenName', 'name', 'photoUrl'];
  const options: FirebaseFirestore.ReadOptions = { fieldMask };
  const docs = await firestore.getAll(...refs, options);
  return docs.filter((doc) => doc.exists).map((doc) => doc.data() as TwUserData);
};

export { Props as GetTwUsersProps, Response as GetTwUsersResponse };
