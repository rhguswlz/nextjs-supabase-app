import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function Page() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const isLoggedIn = !!userData.user;

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                회원가입이 완료되었습니다!
              </CardTitle>
              <CardDescription>
                {isLoggedIn ? "로그인되었습니다" : "이메일을 확인하세요"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-muted-foreground text-sm">
                {isLoggedIn
                  ? "회원가입과 로그인이 완료되었습니다. 지금 바로 모임을 만들 수 있습니다!"
                  : "회원가입이 완료되었습니다. 이메일에서 계정 확인 후 로그인해주세요."}
              </p>
              <Button asChild className="w-full">
                <Link href={isLoggedIn ? "/dashboard" : "/auth/login"}>
                  {isLoggedIn ? "대시보드로 이동" : "로그인하러 가기"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
