import React, { useEffect } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { UserContainer } from '../../../stores/user';
import { RecordsContainer } from '../../../stores/database/records';
import { My, MyProps } from './';

interface Props extends RouteComponentProps, Partial<MyProps> {}

const MyInner: React.FC<Props> = ({ history }) => {
  const { isLoading: userIsLoading, signedIn, user, signOut } = UserContainer.useContainer();
  const { isLoading: recordsIsLoading, setUid, items } = RecordsContainer.useContainer();

  useEffect(() => {
    if (!userIsLoading && !signedIn) {
      history.replace('/');
    }
  }, [history, signedIn, userIsLoading]);

  const isLoading = userIsLoading || recordsIsLoading;

  if (user) {
    setUid(user.uid);
  }

  return (
    <My
      {...{
        isLoading,
        signOut,
        items,
      }}
    />
  );
};

const MyContainer: React.FC<Props> = (props) => {
  return (
    <RecordsContainer.Provider>
      <MyInner {...props} />
    </RecordsContainer.Provider>
  );
};

const MyContainerWithRouter = withRouter(MyContainer);

export { MyContainerWithRouter as MyContainer };
