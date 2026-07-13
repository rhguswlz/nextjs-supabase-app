import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                회원가입이 완료되었습니다!
              </CardTitle>
              <CardDescription>이메일을 확인하세요</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-muted-foreground text-sm">
                회원가입이 완료되었습니다. 로그인하기 전에 이메일에서 계정
                확인을 해주세요.
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/login">로그인하러 가기</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
