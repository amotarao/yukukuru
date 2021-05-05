import { AuthOnCreateHandler } from '../../types/functions';
import { auth } from '../../modules/firebase';

export const onCreateUserHandler: AuthOnCreateHandler = async (user) => {
  console.log(`⚙️ Initializing user document for [${user.uid}]`);
  await auth.deleteUser(user.uid);
  console.error(`❗️[Error]: Failed to initialize user for [${user.uid}]: Stopping to create new user.`);
};
