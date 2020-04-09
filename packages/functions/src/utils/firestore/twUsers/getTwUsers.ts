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
  const requests = ids.map(async (id) => {
    return await collection.doc(id).get();
  });
  const results = await Promise.all(requests);

  return results
    .filter((result) => {
      return result.exists;
    })
    .map((result) => {
      return result.data() as TwUserData;
    });
};

export { Props as GetTwUsersProps, Response as GetTwUsersResponse };
