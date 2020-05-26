import { admin } from '../../modules/firebase';
import { setUserToNotActive } from '../../utils/firestore/users';

export const onDeleteUserHandler = async ({ uid }: admin.auth.UserRecord) => {
  await setUserToNotActive(uid);
};
