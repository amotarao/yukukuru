import { TwUserData } from '@yukukuru/types';
import { firestore } from '../../firebase';
import { TwitterUserInterface } from '../../twitter';
import { bulkWriterErrorHandler } from '../error';

const collection = firestore.collection('twUsers');

const setTwUsersParallel = async (users: TwitterUserInterface[], max = 100, count = 0): Promise<void> => {
  const bulkWriter = firestore.bulkWriter();
  bulkWriter.onWriteError(bulkWriterErrorHandler);

  users.slice(0, max).forEach(({ id_str, screen_name, name, profile_image_url_https }) => {
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

  const nextUsers = users.slice(max);
  if (nextUsers.length) {
    return setTwUsersParallel(nextUsers, max, ++count);
  }
};

export const setTwUsers = async (users: TwitterUserInterface[]): Promise<void> => {
  await setTwUsersParallel(users, 100);
};

export const getTwUsers = async (users: string[]): Promise<TwUserData[]> => {
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
