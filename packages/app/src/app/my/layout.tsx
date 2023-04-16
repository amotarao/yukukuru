import { AuthProvider } from '../../lib/auth/AuthProvider';
import { AuthDispatcherPage } from './AuthDispatcherPage';

export default function MyLayout({ children }: { children?: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthDispatcherPage>{children}</AuthDispatcherPage>
    </AuthProvider>
  );
}
