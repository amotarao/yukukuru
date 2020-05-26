import { initializeUser } from '../utils/firestore/users';
import { AuthOnCreateHandler } from '../types/functions';

type Data = Parameters<typeof initializeUser>[1];

export const onCreateUserHandler: AuthOnCreateHandler = async (user) => {
  const { photoURL, displayName, uid } = user;
  const data: Data = {
    displayName: displayName || '',
    photoUrl: photoURL || '',
  };
  await initializeUser(uid, data);
};
