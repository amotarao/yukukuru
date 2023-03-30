import { getClient } from './../client';
import { getFollowers, getFollowersSingle } from './followers';

describe('getFollowers', () => {
  const client = getClient({
    appKey: process.env.TWITTER_CONSUMER_KEY,
    appSecret: process.env.TWITTER_CONSUMER_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN_KEY,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });

  test('should return an array of user ids', async () => {
    const response = await getFollowersSingle(client, { userId: '99008565' });
    if ('error' in response) {
      console.error(response.error);
      return;
    }
    console.log(response.response);
    expect(Array.isArray(response.response.users)).toBe(true);
  });

  test('should return an array of user ids', async () => {
    const response = await getFollowers(client, { userId: '99008565', maxResults: 2000 });
    if ('error' in response) {
      console.error(response.error);
      return;
    }
    console.log(response.response);
    expect(Array.isArray(response.response.users)).toBe(true);
  });
});
