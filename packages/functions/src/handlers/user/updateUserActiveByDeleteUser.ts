import { setUserDeletedAuth } from '../../modules/firestore/users/deletedAuth';
import { existsUserDocument } from '../../modules/firestore/users/exists';
import { AuthOnDeleteHandler } from '../../types/functions';

export const updateUserActiveByDeleteUserHandler: AuthOnDeleteHandler = async ({ uid }) => {
  const exists = await existsUserDocument(uid);
  if (exists) {
    await setUserDeletedAuth(uid);
  }
};
