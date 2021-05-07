import { existsUserDoc, setUserToNotActive } from '../../modules/firestore/users';
import { AuthOnDeleteHandler } from '../../types/functions';

export const onDeleteUserHandler: AuthOnDeleteHandler = async ({ uid }) => {
  const exists = await existsUserDoc(uid);
  if (exists) {
    await setUserToNotActive(uid);
  }
};
