import { AuthDispatcherPage } from './AuthDispatcherPage';
import { AuthProvider } from './AuthProvider';

export default function MyLayout({ children }: { children?: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthDispatcherPage>{children}</AuthDispatcherPage>
    </AuthProvider>
  );
}
