import React, { useEffect } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { UserContainer } from '../../../stores/user';
import { My, MyProps } from './';

interface Props extends RouteComponentProps, Partial<MyProps> {}

const MyInner: React.FC<Props> = ({ history }) => {
  const { isLoading: userIsLoading, signedIn, signOut } = UserContainer.useContainer();

  useEffect(() => {
    if (!userIsLoading && !signedIn) {
      history.replace('/');
    }
  }, [history, signedIn, userIsLoading]);

  const isLoading = userIsLoading;

  return (
    <My
      {...{
        isLoading,
        signOut,
      }}
    />
  );
};

const MyContainer: React.FC<Props> = (props) => {
  return <MyInner {...props} />;
};

const MyContainerWithRouter = withRouter(MyContainer);

export { MyContainerWithRouter as MyContainer };
