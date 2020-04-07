import { admin } from '../../modules/firebase';
import { initializeUser } from '../../utils/firestore/users';

type Data = Parameters<typeof initializeUser>[1];

export default async (user: admin.auth.UserRecord): void => {
  const { photoURL, displayName, uid } = user;
  const data: Data = {
    displayName: displayName || '',
    photoUrl: photoURL || '',
  };
  await initializeUser(uid, data);
};
