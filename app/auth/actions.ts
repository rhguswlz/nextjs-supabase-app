"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUp(
  fullname: string,
  email: string,
  password: string,
) {
  const supabase = await createClient();

  // Supabase Auth에 사용자 등록
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullname },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/protected`,
    },
  });

  if (authError) {
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error("사용자 생성 실패");
  }

  // profiles 테이블에 full_name 저장 (upsert)
  try {
    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert({
        id: authData.user.id,
        email: authData.user.email || "",
        full_name: fullname,
      })
      .eq("id", authData.user.id);

    if (upsertError) {
      console.error("[signUp] 프로필 full_name upsert 실패:", upsertError);
    } else {
      console.log("[signUp] 프로필 full_name upsert 성공:", {
        userId: authData.user.id,
        email: authData.user.email,
        fullName: fullname,
      });
    }
  } catch (error) {
    console.error("[signUp] 프로필 upsert 예외:", error);
  }

  return { success: true, user: authData.user };
}

export async function signOut() {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(`로그아웃 실패: ${error.message}`);
    }

    // 로그아웃 성공 후 홈페이지로 리다이렉트
    redirect("/");
  } catch (error) {
    // redirect는 throw를 사용하므로 catch에서 무시
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    // 실제 에러만 처리
    console.error("로그아웃 중 에러:", error);
    throw error;
  }
}
