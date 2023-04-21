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

export type LinkAccountRequestErrorCode = 'not-found' | 'rejected';

export type LinkAccountRequest =
  | {
      // 招待直後
      // from の操作
      step: 'create';
      errorCode: null;
      canView: [string];
      from: RequestUser;
      to: RequestUserUnknown;
    }
  | {
      // 招待先の情報を取得完了
      step: 'created';
      errorCode: null;
      canView: [string, string];
      from: RequestUser;
      to: RequestUser;
    }
  | {
      // キャンセル直後
      // from の操作
      step: 'cancel';
      errorCode: null;
      canView: [string] | [string, string];
      from: RequestUser;
      to: RequestUser | RequestUserUnknown;
    }
  | {
      // キャンセル処理完了
      step: 'canceled';
      errorCode: null;
      canView: [string] | [string, string];
      from: RequestUser;
      to: RequestUser | RequestUserUnknown;
    }
  | {
      // 承認直後
      // to の操作
      step: 'approve';
      errorCode: null;
      canView: [string, string];
      from: RequestUser;
      to: RequestUser;
    }
  | {
      // 承認処理完了
      step: 'approved';
      errorCode: null;
      canView: [string, string];
      from: RequestUser;
      to: RequestUser;
    }
  | {
      // 拒否直後
      // to の操作
      step: 'reject';
      errorCode: null;
      canView: [string, string];
      from: RequestUser;
      to: RequestUser;
    }
  | {
      // エラー発生
      step: 'error';
      errorCode: LinkAccountRequestErrorCode;
      canView: [string] | [string, string];
      from: RequestUser;
      to: RequestUser | RequestUserUnknown;
    };
