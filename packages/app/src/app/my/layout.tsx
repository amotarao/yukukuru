import { AuthDispatcherPage } from './AuthDispatcherPage';

export default function MyLayout({ children }: { children?: React.ReactNode }) {
  return <AuthDispatcherPage>{children}</AuthDispatcherPage>;
}
