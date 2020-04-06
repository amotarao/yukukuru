import { functions } from '../modules/firebase';
import { TokenDataInterface } from '../stores/database/token';

/**
 * Twitter の Token を更新
 * @param token トークン類
 */
export async function updateToken(token: TokenDataInterface): Promise<boolean> {
  const updateToken = functions.httpsCallable('updateToken');
  const { data } = (await updateToken(token)) as { data: boolean };
  return data;
}
