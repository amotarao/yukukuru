const groups = [
  ['a', 'b', 'c', 'd'],
  ['e', 'f', 'g', 'h'],
  ['i', 'j', 'k', 'l'],
  ['m', 'n', 'o', 'p'],
  ['q', 'r', 's', 't'],
  ['u', 'v', 'w', 'x'],
  ['y', 'z', 'A', 'B'],
  ['C', 'D', 'E', 'F'],
  ['G', 'H', 'I', 'J'],
  ['K', 'L', 'M', 'N'],
  ['O', 'P', 'Q', 'R'],
  ['S', 'T', 'U', 'V'],
  ['W', 'X', 'Y', 'Z'],
  ['0', '1', '2', '3', '4'],
  ['5', '6', '7', '8', '9'],
];

/**
 * ID からグループ番号を返す
 * 0-14 の 15種類の番号
 */
export const getGroupIndex = (id: string): number => {
  const char = id.slice(0, 1);
  const index = groups.findIndex((group) => group.includes(char));
  return Math.min(Math.max(index, 0), 14);
};
