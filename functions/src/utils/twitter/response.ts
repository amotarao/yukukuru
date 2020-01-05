import { TwitterErrorResponse } from './error';

export interface TwitterResponse<T> {
  response: T;
  errors: TwitterErrorResponse[];
}
