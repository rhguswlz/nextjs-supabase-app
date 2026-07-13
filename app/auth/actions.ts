"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signUp(email: string, password: string) {
  const supabase = await createClient();

  // Supabase Auth에 사용자 등록
  // 프로필은 trigger가 자동으로 생성합니다
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/protected`,
    },
  });

  if (authError) {
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error("사용자 생성 실패");
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
