import { UserData } from '@yukukuru/types';
import { usersCollection } from '.';

/**
 * ユーザーの active を true にする
 */
export async function setUserToActive(id: string): Promise<void> {
  const data: Pick<UserData, 'active'> = { active: true };
  await usersCollection.doc(id).update(data);
}

/**
 * ユーザーの active を false にする
 */
export async function setUserToNotActive(id: string): Promise<void> {
  const data: Pick<UserData, 'active'> = { active: false };
  await usersCollection.doc(id).update(data);
}
