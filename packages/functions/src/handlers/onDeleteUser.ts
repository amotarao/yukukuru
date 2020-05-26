import { setUserToNotActive } from '../utils/firestore/users';
import { AuthOnDeleteHandler } from '../types/functions';

export const onDeleteUserHandler: AuthOnDeleteHandler = async ({ uid }) => {
  await setUserToNotActive(uid);
};
