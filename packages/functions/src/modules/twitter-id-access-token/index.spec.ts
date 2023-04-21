import { getTwitterIdFromAccessToken } from '.';

describe('getTwitterIdFromAccessToken', () => {
  test('AccessToken から TwitterId 取得', () => {
    expect(getTwitterIdFromAccessToken('12345678-pLZuVcyzKBapcj82fPXzzLCscE4YjtRCFFyMCSxm')).toBe('12345678');
  });
});
