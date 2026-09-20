import { useState, useEffect, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutGrid,
  PieChart,
  Radar,
  Sparkles,
  Target,
  Wallet,
  Search,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { LovableChatDrawer } from "./lovable-chat-drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { label: "Overview", icon: LayoutGrid, to: "/dashboard" },
  { label: "Spending", icon: PieChart, to: "/spending" },
  { label: "Accounts", icon: Wallet, to: "/accounts" },
  { label: "Goals", icon: Target, to: "/goals" },
  { label: "Simulations", icon: Radar, to: "/simulations" },
  { label: "Insights", icon: Sparkles, to: "/insights" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchPrompt, setSearchPrompt] = useState("");
  const [userEmail, setUserEmail] = useState("user@moneylens.com");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("moneylens_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.email) setUserEmail(parsed.email);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("moneylens_user");
    }
    await navigate({ to: "/login" });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchPrompt.trim()) {
      setIsChatOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-sidebar px-4 py-6 lg:flex">
        <Link to="/dashboard" className="flex items-center gap-2 px-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-[13px] font-semibold">M</span>
          </span>
          <span className="font-display text-xl">Money Lens</span>
        </Link>

        <nav className="mt-10 flex flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              activeOptions={{ exact: item.to === "/dashboard" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{
                className: "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
              }}
            >
              <item.icon className="h-4 w-4" strokeWidth={1.75} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-full flex items-center gap-2.5 rounded-xl border border-primary/30 bg-primary-soft p-3 text-xs font-medium text-foreground hover:bg-primary-soft/80 transition-colors cursor-pointer text-left"
          >
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="font-semibold">AI Assistant</p>
              <p className="text-[10px] text-muted-foreground">Ask anything or update goals</p>
            </div>
          </button>

          <div className="rounded-xl border border-border bg-surface-muted p-3">
            <div className="flex items-center justify-between">
              <div className="overflow-hidden pr-2">
                <p className="truncate text-xs font-medium text-foreground">{userEmail}</p>
                <p className="text-[11px] text-subtle-foreground">PostgreSQL RDS Active</p>
              </div>
              <button
                onClick={handleLogout}
                title="Log out"
                aria-label="Log out"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-risk-soft hover:text-risk transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur-sm">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-6">
            <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
              <Search className="h-4 w-4 text-subtle-foreground" strokeWidth={1.75} />
              <input
                value={searchPrompt}
                onChange={(e) => setSearchPrompt(e.target.value)}
                placeholder="Ask anything — “Can I afford a ₹5 lakh car?”"
                className="w-full bg-transparent text-sm outline-none placeholder:text-subtle-foreground"
              />
            </form>

            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Ask Lens</span>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-full p-1 transition-colors hover:bg-secondary cursor-pointer outline-none"
                  aria-label="User menu"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-xs font-medium text-accent-foreground">
                    ML
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-surface border-border shadow-md">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Money Lens Account</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/accounts" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Profile & Calibration</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/goals" className="flex items-center gap-2 cursor-pointer">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span>Goals & Sinking Funds</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-risk focus:bg-risk-soft focus:text-risk cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 pb-24 pt-10">{children}</main>
      </div>

      <LovableChatDrawer
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setSearchPrompt("");
        }}
        initialPrompt={searchPrompt}
      />
    </div>
  );
}

