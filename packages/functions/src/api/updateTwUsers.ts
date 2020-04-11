import { WatchData } from '@yukukuru/types';
import { firestore } from '../modules/firebase';
import { updateUserLastUpdatedTwUsers } from '../utils/firestore/users/updateUserLastUpdatedTwUsers';
import { setTwUsers } from '../utils/firestore/twUsers/setTwUsers';
import { getUsersLookup } from '../utils/twitter/getUsersLookup';

export default async () => {
  const now = new Date();
  const time1week = new Date();
  time1week.setDate(now.getDate() - 7);

  const querySnapshot = await firestore
    .collection('users')
    .where('active', '==', true)
    .where('invalid', '==', false)
    .where('newUser', '==', false)
    .where('lastUpdatedTwUsers', '<', time1week)
    .orderBy('lastUpdatedTwUsers')
    .limit(50)
    .get();

  const usersId: string[] = [];
  const requests = querySnapshot.docs.map(async (snapshot) => {
    const watch = await snapshot.ref.collection('watches').orderBy('getEndDate').limit(1).get();
    if (watch.size !== 1) {
      return '';
    }

    const { followers } = watch.docs[0].data() as WatchData;
    // API 制限ギリギリまで
    if (usersId.length + followers.length > 30000) {
      return '';
    }
    usersId.push(...followers);
    return snapshot.id;
  });
  const willUpdatedUsers = (await Promise.all(requests)).filter((e) => e !== '');

  const result = await getUsersLookup(null, { usersId });

  result.errors.forEach((error) => {
    console.error(error);
  });

  if (result.users.length) {
    await setTwUsers(result.users);
  }

  const setDocsRequest = willUpdatedUsers.map((userId) => {
    return updateUserLastUpdatedTwUsers(userId, now);
  });
  await Promise.all(setDocsRequest);

  console.log(usersId.length, result.users.length, willUpdatedUsers);
};
