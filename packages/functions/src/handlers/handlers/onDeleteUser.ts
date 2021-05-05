import { AuthOnDeleteHandler } from '../../types/functions';
import { existsUserDoc, setUserToNotActive } from '../../utils/firestore/users';

export const onDeleteUserHandler: AuthOnDeleteHandler = async ({ uid }) => {
  const exists = await existsUserDoc(uid);
  if (exists) {
    await setUserToNotActive(uid);
  }
};
