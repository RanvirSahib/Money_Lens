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
import { logoutUser } from "@/lib/api-client";

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
  const [userEmail, setUserEmail] = useState("user@monexa.com");
  const [userName, setUserName] = useState("User");
  const [userInitials, setUserInitials] = useState("MX");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("monexa_user") || localStorage.getItem("moneylens_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.email) setUserEmail(parsed.email);
          if (parsed.name) {
            setUserName(parsed.name);
            const initials = parsed.name
              .split(" ")
              .filter(Boolean)
              .map((n: string) => n[0].toUpperCase())
              .slice(0, 2)
              .join("");
            setUserInitials(initials || "MX");
          }
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
    logoutUser();
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
        <Link to="/dashboard" className="flex items-center gap-2.5 px-2 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <span className="text-[13px] font-bold">M</span>
          </span>
          <span className="font-display text-xl tracking-tight">Monexa</span>
        </Link>

        <nav className="mt-8 flex flex-col gap-1.5">
          {nav.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              activeOptions={{ exact: item.to === "/dashboard" }}
              className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground hover:translate-x-1 active:scale-[0.98]"
              activeProps={{
                className: "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs",
              }}
            >
              <item.icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.75} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-full flex items-center gap-2.5 rounded-xl border border-primary/30 bg-primary-soft/80 p-3 text-xs font-medium text-foreground hover:bg-primary-soft hover:shadow-xs hover:border-primary/50 transition-all duration-200 cursor-pointer text-left active:scale-[0.98] group"
          >
            <div className="p-1 rounded-md bg-primary/10 text-primary transition-transform duration-200 group-hover:rotate-12">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">AI Assistant</p>
              <p className="text-[10px] text-muted-foreground">Ask anything or update goals</p>
            </div>
          </button>

          <div className="rounded-xl border border-border bg-surface-muted/80 p-3 transition-colors duration-200 hover:border-border-strong">
            <div className="flex items-center justify-between">
              <div className="overflow-hidden pr-2">
                <p className="truncate text-xs font-medium text-foreground">{userEmail}</p>
                <p className="text-[11px] text-subtle-foreground flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-positive inline-block animate-pulse" />
                  <span>Cloud Data Active</span>
                </p>
              </div>
              <button
                onClick={handleLogout}
                title="Log out"
                aria-label="Log out"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-risk-soft hover:text-risk transition-all duration-200 cursor-pointer active:scale-90"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur-md transition-all duration-200">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-6">
            <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2.5 rounded-xl border border-border bg-surface px-3.5 py-2 transition-all duration-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:shadow-xs">
              <Search className="h-4 w-4 text-subtle-foreground shrink-0 transition-colors" strokeWidth={1.75} />
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
              className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary-soft px-3.5 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 cursor-pointer active:scale-[0.96] shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-inherit transition-transform duration-200 group-hover:rotate-12" />
              <span className="hidden sm:inline">Ask Monexa</span>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-full p-1 transition-all duration-200 hover:bg-secondary hover:scale-105 active:scale-95 cursor-pointer outline-none"
                  aria-label="User menu"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-accent-foreground border border-primary/20">
                    {userInitials}
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block transition-transform duration-200" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-surface border-border shadow-md animate-scale-in">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none text-foreground">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2 cursor-pointer transition-colors">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-risk focus:bg-risk-soft focus:text-risk cursor-pointer transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 pb-24 pt-8 animate-page-enter">{children}</main>
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

