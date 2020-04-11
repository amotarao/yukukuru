import { admin } from '../../modules/firebase';
import { setUserToNotActive } from '../../utils/firestore/users/setUserToNotActive';

export default async ({ uid }: admin.auth.UserRecord) => {
  await setUserToNotActive(uid);
};
