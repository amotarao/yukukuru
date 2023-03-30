import { describe, expect, test } from '@jest/globals';
import { getClient } from './../client';
import { getFollowersIdsSingle } from './ids';

describe('twitterFollowersIds', () => {
  const client = getClient({
    appKey: process.env.TWITTER_CONSUMER_KEY,
    appSecret: process.env.TWITTER_CONSUMER_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN_KEY,
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });

  test('should return an array of user ids', async () => {
    const response = await getFollowersIdsSingle(client, { userId: '1136398555' });
    if ('error' in response) {
      console.error(response.error);
      return;
    }
    console.log(response.response);
    expect(Array.isArray(response.response.ids)).toBe(true);
  });
});
