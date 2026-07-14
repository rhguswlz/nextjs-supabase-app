import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = await createClient();

  // 인증 확인
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user?.email) {
    redirect("/auth/login");
  }

  // Admin 권한 확인 (profiles.is_admin)
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.sub!)
    .single();

  console.log("[Admin Layout] User ID:", user.sub);
  console.log("[Admin Layout] Profile Data:", profileData);
  console.log("[Admin Layout] Profile Error:", profileError);
  console.log("[Admin Layout] Is Admin:", profileData?.is_admin);

  if (!profileData?.is_admin) {
    console.log("[Admin Layout] Redirecting to /dashboard - not admin");
    redirect("/dashboard");
  }

  // 사용자 정보 조회
  const { data: userData } = await supabase.auth.getUser();

  return (
    <div className="bg-background flex h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader title="" user={userData.user} />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
