import { storage } from '../../modules/firebase';
import { saveOptions } from './options';

/**
 * ストレージに指定ユーザーのフォロワーリストを保存
 * followers/{userId}/{queueId}/{name}.json を作成し、保存する
 *
 * @param userId ユーザーID (Firebase UID)
 * @param queueId キューID
 * @param name ファイル名、複数回フォロワーリストを取得する際の識別に利用する
 * @param followers フォロワー一覧の配列
 */
export async function saveFollowers(userId: string, queueId: string, name: string, followers: string[]): Promise<void> {
  const file = storage.file(`followers/${userId}/${queueId}/${name}.json`);
  const text = JSON.stringify(followers);
  await file.save(text, saveOptions);
}

/**
 * ストレージから指定ユーザーのフォロワーリストを取得
 * followers/{userId}/{queueId}/ 以下のすべてのjsonから、リストを抽出して返す
 *
 * @param userId ユーザーID (Firebase UID)
 * @param queueId キューID
 * @returns フォロワーIDリスト
 */
export async function getFollowers(userId: string, queueId: string): Promise<string[]> {
  const [files] = await storage.getFiles({
    prefix: `followers/${userId}/${queueId}/`,
  });

  const results = await Promise.all(
    files.map(async (file) => {
      const [buffer] = await file.download();
      return JSON.parse(buffer.toString()) as string[];
    })
  );
  const ids = results.reduce((a, b) => {
    return [...a, ...b];
  });
  return ids;
}
