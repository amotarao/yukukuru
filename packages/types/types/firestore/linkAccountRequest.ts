import { UserTwitter } from './user.d';

type RequestUser = {
  uid: string;
  screenName: string;
  twitter: UserTwitter;
};

type RequestUserUnknown = {
  uid: null;
  screenName: string;
  twitter: null;
};

export type LinkAccountRequest =
  | {
      // 招待直後
      step: 'create';
      error: null;
      canView: [string];
      from: RequestUser;
      to: RequestUserUnknown;
    }
  | {
      // 招待先の情報を取得完了
      step: 'created';
      error: null;
      canView: [string, string];
      from: RequestUser;
      to: RequestUser;
    }
  | {
      // 承認直後
      step: 'approve';
      error: null;
      canView: [string, string];
      from: RequestUser;
      to: RequestUser;
    }
  | {
      // 承認処理完了
      step: 'approved';
      error: null;
      canView: [string, string];
      from: RequestUser;
      to: RequestUser;
    }
  | {
      // 拒否直後
      step: 'reject';
      error: null;
      canView: [string, string];
      from: RequestUser;
      to: RequestUser;
    }
  | {
      // 拒否処理完了
      step: 'rejected';
      error: null;
      canView: [string];
      from: RequestUser;
      to: RequestUser;
    }
  | {
      // エラー発生
      step: 'error';
      error: string;
      canView: [string] | [string, string];
      from: RequestUser;
      to: RequestUser | RequestUserUnknown;
    };
