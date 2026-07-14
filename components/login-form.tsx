"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth";
import { GoogleOAuthButton } from "@/components/google-oauth-button";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();

  // React Hook Form 초기화 (Zod 스키마 연동)
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  // 폼 제출 핸들러
  const onSubmit = async (data: LoginFormData) => {
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        // 인증 에러를 사용자 친화적인 메시지로 변환
        if (error.message.includes("Invalid login credentials")) {
          setError("root", {
            message: "이메일 또는 비밀번호가 올바르지 않습니다",
          });
        } else if (error.message.includes("Email not confirmed")) {
          setError("root", {
            message: "이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요",
          });
        } else {
          setError("root", { message: error.message });
        }
        return;
      }

      router.push("/");
    } catch (error: unknown) {
      // 네트워크 에러 등 예외적인 경우 처리
      setError("root", {
        message: error instanceof Error ? error.message : "오류가 발생했습니다",
      });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">로그인</CardTitle>
          <CardDescription>
            계정에 로그인하려면 아래에 이메일을 입력하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {/* 이메일 필드 */}
              <div className="grid gap-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* 비밀번호 필드 */}
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">비밀번호</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    비밀번호를 잊으셨나요?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* 서버 에러 표시 */}
              {errors.root && (
                <p className="text-sm text-red-500">{errors.root.message}</p>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "로그인 중..." : "로그인"}
              </Button>
            </div>

            {/* 구분선 */}
            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card text-muted-foreground px-2">또는</span>
              </div>
            </div>

            {/* Google OAuth 버튼 */}
            <div className="mt-4">
              <GoogleOAuthButton />
            </div>
          </form>

          <div className="mt-4 text-center text-sm">
            계정이 없으신가요?{" "}
            <Link href="/auth/sign-up" className="underline underline-offset-4">
              회원가입
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
