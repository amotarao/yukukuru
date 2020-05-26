/**
 * ログを出力する
 * @param functionName 関数名
 * @param subName 関数名の補助名
 * @param details 詳細
 */
export const log = (functionName: string, subName: string, details: object): void => {
  const data = {
    functionName,
    subName,
    details,
  };

  console.log(JSON.stringify(data));
};

/**
 * エラーログを出力する
 * @param functionName 関数名
 * @param subName 関数名の補助名
 * @param details 詳細
 */
export const errorLog = (functionName: string, subName: string, details: object): void => {
  const data = {
    functionName,
    subName,
    details,
  };

  console.error(JSON.stringify(data));
};
