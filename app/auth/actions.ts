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
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/protected`,
    },
  });

  if (authError) {
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error("사용자 생성 실패");
  }

  // profiles 테이블에 full_name 저장
  // 먼저 profile이 존재하는지 확인
  const { data: existing, error: checkError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", authData.user.id)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    // PGRST116: not found (정상 에러)
    throw new Error(`프로필 확인 실패: ${checkError.message}`);
  }

  if (existing) {
    // profile 존재 → update
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ full_name: fullname })
      .eq("id", authData.user.id);

    if (updateError) {
      throw new Error(`프로필 저장 실패: ${updateError.message}`);
    }
  } else {
    // profile 미존재 → insert
    const { error: insertError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      full_name: fullname,
      email: email,
    });

    if (insertError) {
      throw new Error(`프로필 저장 실패: ${insertError.message}`);
    }
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
