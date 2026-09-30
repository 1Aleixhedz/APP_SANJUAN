import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function appUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/perfil";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Sincroniza email en el perfil (el rol admin se asigna vía admin_emails en SQL).
      if (user?.id && user.email) {
        await supabase
          .from("profiles")
          .update({ email: user.email })
          .eq("user_id", user.id);
      }

      const base = appUrl() || origin;
      return NextResponse.redirect(
        `${base}${next.startsWith("/") ? next : "/perfil"}`,
      );
    }
  }

  return NextResponse.redirect(`${appUrl()}/login?error=auth`);
}
