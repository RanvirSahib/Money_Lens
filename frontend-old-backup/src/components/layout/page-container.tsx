import type { ReactNode } from "react";

interface PageContainerProps {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  action?: ReactNode;
}

export function PageContainer({ eyebrow, title, description, children, action }: PageContainerProps) {
  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            {eyebrow ? <p className="data-label mb-2">{eyebrow}</p> : null}
            <h1 className="font-display text-3xl font-semibold text-foreground md:text-4xl">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground md:text-base">{description}</p>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
        {children}
      </div>
    </main>
  );
}
