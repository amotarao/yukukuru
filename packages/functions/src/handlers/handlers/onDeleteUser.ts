import { AuthOnDeleteHandler } from '../../types/functions';
import { setUserToNotActive } from '../../utils/firestore/users';

export const onDeleteUserHandler: AuthOnDeleteHandler = async ({ uid }) => {
  await setUserToNotActive(uid);
};
