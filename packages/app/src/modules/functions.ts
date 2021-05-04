import { TokenData } from '@yukukuru/types';
import { functions } from '../modules/firebase';

/**
 * Twitter の Token を更新
 * @param token トークン
 */
export const updateToken = async (token: TokenData): Promise<boolean> => {
  const updateToken = functions.httpsCallable('updateToken');
  const { data } = (await updateToken(token)) as { data: boolean };
  return data;
};
