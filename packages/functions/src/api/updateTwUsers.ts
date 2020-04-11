import { updateUserLastUpdatedTwUsers } from '../utils/firestore/users/updateUserLastUpdatedTwUsers';
import { tmpGetTargetsToUpdateTwUsers } from '../utils/firestore/users/tmpGetTargetsToUpdateTwUsers';
import { setTwUsers } from '../utils/firestore/twUsers/setTwUsers';
import { getLastWatch } from '../utils/firestore/users/watches/getLastWatch';
import { getUsersLookup } from '../utils/twitter/getUsersLookup';

export default async (): Promise<void> => {
  const now = new Date();
  const targets = await tmpGetTargetsToUpdateTwUsers();
  const usersId: string[] = [];

  const requests = targets.map(async (doc) => {
    const watch = await getLastWatch(doc.id);
    if (watch === null) {
      return '';
    }
    // API 制限ギリギリまで
    if (usersId.length + watch.followers.length > 30000) {
      return '';
    }
    usersId.push(...watch.followers);
    return doc.id;
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
