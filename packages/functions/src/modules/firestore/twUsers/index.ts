import { TwUserData } from '@yukukuru/types';
import { TwitterUserInterface } from '../../../utils/twitter';
import { firestore } from '../../firebase';
import { bulkWriterErrorHandler } from '../error';

export const setTwUsers = async (users: TwitterUserInterface[]): Promise<void> => {
  const bulkWriter = firestore.bulkWriter();
  bulkWriter.onWriteError(bulkWriterErrorHandler);

  const collection = firestore.collection('twUsers');

  users.forEach(({ id_str, screen_name, name, profile_image_url_https }) => {
    const ref = collection.doc(id_str);
    const data: TwUserData = {
      id: id_str,
      screenName: screen_name,
      name,
      photoUrl: profile_image_url_https,
    };
    bulkWriter.set(ref, data, { merge: true });
  });

  await bulkWriter.close();
};

export const getTwUsers = async (users: string[]): Promise<TwUserData[]> => {
  const collection = firestore.collection('twUsers');
  const requests = users.map(async (user) => {
    const snapshot = await collection.doc(user).get();
    return snapshot;
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
