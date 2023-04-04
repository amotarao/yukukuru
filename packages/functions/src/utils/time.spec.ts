import { getDiffMinutes } from './time';

describe('getDiffMinutes', () => {
  test('同じ時刻同士では差が0', () => {
    expect(getDiffMinutes(new Date('2020-01-01 00:00:00'), new Date('2020-01-01 00:00:00'))).toBe(0);
  });
  test('同じ時刻同士で秒が違っても差が0', () => {
    expect(getDiffMinutes(new Date('2020-01-01 00:00:00'), new Date('2020-01-01 00:00:10'))).toBe(0);
  });
  test('3分間の計算', () => {
    expect(getDiffMinutes(new Date('2020-01-01 00:03:00'), new Date('2020-01-01 00:00:00'))).toBe(3);
  });
  test('3分間(秒つき)の計算', () => {
    expect(getDiffMinutes(new Date('2020-01-01 00:03:00'), new Date('2020-01-01 00:00:10'))).toBe(3);
  });
  test('2分間(秒つき)の計算', () => {
    expect(getDiffMinutes(new Date('2020-01-01 00:02:50'), new Date('2020-01-01 00:00:10'))).toBe(2);
  });
});
