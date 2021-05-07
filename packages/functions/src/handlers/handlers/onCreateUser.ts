import { initializeUser } from '../../modules/firestore/users/initialize';
import { AuthOnCreateHandler } from '../../types/functions';

type Data = Parameters<typeof initializeUser>[1];

export const onCreateUserHandler: AuthOnCreateHandler = async (user) => {
  console.log(`⚙️ Initializing user document for [${user.uid}]`);
  const { photoURL, displayName, uid } = user;
  const data: Data = {
    displayName: displayName || '',
    photoUrl: photoURL || '',
  };
  await initializeUser(uid, data);

  await auth.deleteUser(user.uid);
  console.error(`❗️[Error]: Failed to initialize user for [${user.uid}]: Stopping to create new user.`);
};
