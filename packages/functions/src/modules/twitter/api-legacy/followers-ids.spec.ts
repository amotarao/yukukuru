import { getClient } from '../client';
import { getFollowersIdsSingleLegacy } from './followers-ids';

describe('getFollowersIdsSingleLegacy', () => {
  const client = getClient({
    appKey: process.env.TWITTER_CONSUMER_KEY,
    appSecret: process.env.TWITTER_CONSUMER_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN_KEY,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });

  test('should return an array of user ids', async () => {
    const response = await getFollowersIdsSingleLegacy(client, { userId: '99008565' });
    if ('error' in response) {
      console.error(response.error);
      return;
    }
    console.log(response);
    expect(Array.isArray(response.ids)).toBe(true);
  });
});
