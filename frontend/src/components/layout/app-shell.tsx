'use client';

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowLeftRight,
  Beaker,
  CheckCircle2,
  Compass,
  Crosshair,
  Goal,
  Home,
  Menu,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navigationItems = [
  { label: "Dashboard", to: "/dashboard", icon: Home, description: "Command center" },
  { label: "Simulator", to: "/simulator", icon: Activity, description: "Time machine" },
  { label: "Goals", to: "/goals", icon: Goal, description: "Milestone engine" },
  { label: "Reverse", to: "/reverse", icon: ArrowLeftRight, description: "Backward pathfinder" },
  { label: "Experiments", to: "/experiments", icon: Beaker, description: "Scenario lab" },
  { label: "Radar", to: "/radar", icon: Crosshair, description: "Liquidity telemetry" },
] as const;

interface AppShellProps {
  children: ReactNode;
}

function BrandMark() {
  return (
    <Link href="/dashboard" className="group flex items-center gap-3" aria-label="Money Lens - Financial Future Simulator">
      <div className="relative flex size-10 items-center justify-center rounded-xl border border-primary/40 bg-gradient-to-br from-primary/20 via-[#101B2D] to-transparent p-2 text-primary shadow-glow transition-transform duration-300 group-hover:scale-105">
        <Compass className="size-5 animate-[spin_12s_linear_infinite]" aria-hidden="true" />
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/30" />
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="font-display text-base font-bold tracking-tight text-foreground">Money Lens</span>
          <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[0.65rem] font-semibold text-primary">v1.0</span>
        </div>
        <span className="block text-[0.7rem] text-muted-foreground">Financial Future Simulator</span>
      </div>
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-[#07101D] text-sidebar-foreground">
      <div className="border-b border-border/80 p-5">
        <BrandMark />
      </div>

      <div className="px-4 py-3">
        <p className="data-label">Simulations & Telemetry</p>
      </div>

      <nav className="flex-1 space-y-1 px-3" aria-label="Primary navigation">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.to;
          return (
            <Link
              key={item.to}
              href={item.to}
              onClick={onNavigate}
              className={cn(
                "group flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "border border-primary/40 bg-[#101B2D] text-primary shadow-glow"
                  : "text-muted-foreground hover:border-border hover:bg-[#0B1422] hover:text-foreground",
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("size-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} aria-hidden="true" />
                <span>{item.label}</span>
              </div>
              <span className="text-[0.7rem] text-muted-subtle opacity-0 transition-opacity group-hover:opacity-100">{item.description}</span>
            </Link>
          );
        })}
      </nav>

      {/* Financial Health Mini Card */}
      <div className="border-t border-border/80 p-4">
        <div className="rounded-xl border border-border/70 bg-[#0B1422]/90 p-3.5 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <ShieldCheck className="size-3.5 text-success" />
              Financial Health
            </span>
            <span className="text-[0.7rem] font-medium text-success">Strong (84%)</span>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#101B2D]">
            <div className="h-full w-[84%] rounded-full bg-gradient-to-r from-primary to-success" />
          </div>
          <p className="mt-2 text-[0.68rem] text-muted-foreground">Buffer covers ~1.6 mo. of expenses</p>
        </div>
      </div>
    </div>
  );
}

function TopHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="border-border bg-[#0B1422]" aria-label="Open navigation">
                <Menu className="size-4" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-border bg-[#07101D] p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <BrandMark />
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="flex items-center gap-2 rounded-full border border-border bg-[#0B1422]/80 px-3 py-1 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-success animate-pulse" />
            <span>Simulation Engine Live</span>
            <span className="text-border">•</span>
            <span className="text-primary font-medium">INR (₹)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border/70 bg-[#0B1422] px-3 py-1.5 text-xs">
            <CheckCircle2 className="size-3.5 text-primary" />
            <span className="text-muted-foreground">User:</span>
            <span className="font-semibold text-foreground">Ranvir</span>
          </div>

          <Button asChild size="sm" className="bg-gradient-to-r from-primary to-secondary font-semibold text-[#050B14] hover:opacity-95 shadow-glow">
            <Link href="/simulator">
              <Sparkles className="size-3.5" />
              Simulate Decision
            </Link>
          </Button>

          <div className="flex size-8 items-center justify-center rounded-full border border-border bg-[#101B2D] text-muted-foreground">
            <User className="size-4" />
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileBottomNav() {
  const pathname = usePathname();
  const compactItems = navigationItems.slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[#07101D]/95 px-2 py-2 backdrop-blur-lg lg:hidden" aria-label="Mobile navigation">
      <div className="grid grid-cols-5 gap-1">
        {compactItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.to;
          return (
            <Link
              key={item.to}
              href={item.to}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md px-1 py-1.5 text-[0.68rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive ? "bg-[#101B2D] text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-white bg-page-grid pb-20 lg:pb-0">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-border/80 shadow-nav lg:block">
        <SidebarContent />
      </aside>
      <div className="lg:pl-72">
        <TopHeader />
        <main>{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  );
}

