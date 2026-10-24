import type { ReactNode } from 'react';
import { AppHeader } from './header';

type AppLayoutProps = {
  children: ReactNode;
  sidebar: ReactNode;
};

export function AppLayout({ children, sidebar }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <AppHeader />
      <main className="grid min-h-[calc(100vh-4rem)] grid-cols-1 gap-8 p-4 sm:p-8 lg:grid-cols-[320px_1fr]">
        <aside>{sidebar}</aside>
        <div>{children}</div>
      </main>
    </div>
  );
}
