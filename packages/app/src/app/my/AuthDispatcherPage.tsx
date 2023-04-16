'use client';

import { LoadingCircle } from '../../components/atoms/LoadingCircle';
import { useAuth } from '../../lib/auth/hooks';
import { LoginPage } from './LoginPage';

export type AuthDispatcherPageProps = {
  children: React.ReactNode;
};

export const AuthDispatcherPage: React.FC<AuthDispatcherPageProps> = ({ children }) => {
  const { isLoading, signingIn, signedIn } = useAuth();
  return isLoading || signingIn ? <LoadingCircle /> : !signedIn ? <LoginPage /> : <>{children}</>;
};
