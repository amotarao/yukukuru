/* eslint-disable @typescript-eslint/camelcase */
import { TwUserData } from '@yukukuru/types';
import chunk from 'lodash/chunk';
import { firestore } from '../../../modules/firebase';
import { TwitterUserData } from '../../twitter';

const collection = firestore.collection('twUsers');

/** Twitter ユーザーデータ リスト */
type Props = TwitterUserData[];

type Response = void;

const setTwUsersSingle = async (users: Props): Promise<Response> => {
  const batch = firestore.batch();

  users.forEach((userData) => {
    const ref = collection.doc(userData.id_str);
    const data: TwUserData = {
      id: userData.id_str,
      screenName: userData.screen_name,
      name: userData.name,
      photoUrl: userData.profile_image_url_https,
    };
    batch.set(ref, data, { merge: true });
  });

  await batch.commit();
};

/**
 * twUsers を追加・更新
 */
export const setTwUsers = async (users: Props): Promise<Response> => {
  const chunks = chunk(users, 500);
  const requests = chunks.map((users) => setTwUsersSingle(users));
  await Promise.all(requests);
};

export { Props as SetTwUsersProps, Response as SetTwUsersResponse };
