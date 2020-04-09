/* eslint-disable @typescript-eslint/camelcase */
import { TwUserData } from '@yukukuru/types';
import * as chunk from 'lodash/chunk';
import { firestore } from '../../../modules/firebase';
import { TwitterUserInterface } from '../../twitter';

const collection = firestore.collection('twUsers');

/** Twitter ユーザーデータ リスト */
type Props = TwitterUserInterface[];

type Response = void;

const setTwUsersSingle = async (users: Props): Promise<Response> => {
  const batch = firestore.batch();

  users.forEach((data) => {
    const ref = collection.doc(id_str);
    const data: TwUserData = {
      id: data.id_str,
      screenName: data.screen_name,
      name: data.name,
      photoUrl: data.profile_image_url_https,
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
