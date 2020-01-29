import React, { useEffect } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { UserContainer } from '../../../stores/user';
import { RecordsContainer } from '../../../stores/database/records';
import { TokenContainer } from '../../../stores/database/token';
import { My, MyProps } from '.';

interface Props extends RouteComponentProps, Partial<MyProps> {}

const MyInner: React.FC<Props> = ({ history }) => {
  const { isLoading: userIsLoading, signedIn, user, signOut } = UserContainer.useContainer();
  const {
    isLoading: recordsIsLoading,
    isNextLoading,
    items,
    hasItems,
    hasOnlyEmptyItems,
    hasNext,
    setUid: setRecordsUid,
    getNextRecords,
  } = RecordsContainer.useContainer();
  const { isLoading: tokenIsLoading, setUid: setTokenUid, hasToken } = TokenContainer.useContainer();

  useEffect(() => {
    if (!userIsLoading && !signedIn) {
      history.replace('/');
    }
  }, [history, signedIn, userIsLoading]);

  const isLoading = userIsLoading || recordsIsLoading || tokenIsLoading;

  if (user) {
    setRecordsUid(user.uid);
    setTokenUid(user.uid);
  }

  return (
    <My
      {...{
        isLoading,
        isNextLoading,
        items,
        hasItems,
        hasOnlyEmptyItems,
        hasNext,
        hasToken,
        getNextRecords,
        signOut,
      }}
    />
  );
};

const MyContainer: React.FC<Props> = (props) => {
  return (
    <RecordsContainer.Provider>
      <TokenContainer.Provider>
        <MyInner {...props} />
      </TokenContainer.Provider>
    </RecordsContainer.Provider>
  );
};

const MyContainerWithRouter = withRouter(MyContainer);

export { MyContainerWithRouter as MyContainer };
