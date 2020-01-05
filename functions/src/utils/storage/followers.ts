import { storage } from '../../modules/firebase';
import { saveOptions } from './options';

/**
 * フォロワー一覧を保存
 * @param storagePath ストレージのパス 拡張子を除く
 * @param followers フォロワー一覧の配列
 */
export async function saveFollowers(storagePath: string, followers: string[]): Promise<void> {
  const file = storage.file(`followers/${storagePath}.json`);
  const text = JSON.stringify(followers);
  await file.save(text, saveOptions);
}
