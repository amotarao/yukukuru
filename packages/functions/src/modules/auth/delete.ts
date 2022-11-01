import { auth } from '../firebase';

export const deleteAuth = async (uid: string): Promise<void> => {
  await auth.deleteUser(uid);
};
