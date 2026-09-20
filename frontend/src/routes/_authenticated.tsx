import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) return;
    } catch {
      // ignore error and check local fallback
    }

    const localUser =
      typeof window !== "undefined"
        ? localStorage.getItem("monexa_user") || localStorage.getItem("moneylens_user")
        : null;
    if (!localUser) {
      throw redirect({ to: "/login", search: { next: location.href } });
    }

  },
  component: () => <Outlet />,
});