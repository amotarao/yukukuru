import { admin } from '../../modules/firebase';
import { setUserToNotActive } from '../../utils/firestore/users';

export default async ({ uid }: admin.auth.UserRecord): void => {
  await setUserToNotActive(uid);
};
