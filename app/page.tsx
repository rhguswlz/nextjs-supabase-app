import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 네비게이션 */}
      <nav className="flex h-16 items-center justify-between border-b px-6">
        <span className="text-lg font-bold">GatherEase</span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button asChild variant="outline" size="sm">
            <Link href="/auth/login">로그인</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard">시작하기</Link>
          </Button>
        </div>
      </nav>

      <main className="flex flex-1 flex-col">
        {/* 히어로 섹션 */}
        <section className="flex flex-col items-center gap-6 px-4 py-20 text-center md:py-32">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
            모임 날짜,
            <br />
            <span className="text-primary">쉽게 정해요</span>
          </h1>
          <p className="text-muted-foreground max-w-xl text-lg">
            GatherEase는 여러 사람이 가능한 날짜를 입력하면 최적의 모임 날짜를
            한눈에 보여주는 서비스입니다.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/dashboard">무료로 시작하기</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/join/abc12345">데모 체험하기</Link>
            </Button>
          </div>
        </section>

        {/* 사용 흐름 3단계 */}
        <section className="bg-muted/40 px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-10 text-center text-2xl font-bold">
              3단계로 완성되는 모임 날짜
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  step: "1",
                  icon: "📝",
                  title: "이벤트 생성",
                  desc: "모임 이름, 후보 날짜, 마감일을 입력해요",
                },
                {
                  step: "2",
                  icon: "🔗",
                  title: "링크 공유",
                  desc: "참여자에게 초대 링크를 보내세요",
                },
                {
                  step: "3",
                  icon: "📅",
                  title: "날짜 확정",
                  desc: "히트맵으로 최적의 날짜를 한눈에 확인해요",
                },
              ].map(({ step, icon, title, desc }) => (
                <div
                  key={step}
                  className="flex flex-col items-center gap-3 text-center"
                >
                  <div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold">
                    {step}
                  </div>
                  <div className="text-3xl">{icon}</div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-muted-foreground text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 기능 소개 카드 */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-10 text-center text-2xl font-bold">주요 기능</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="text-3xl">🔗</div>
                  <CardTitle>간편한 초대 링크</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    가입 없이 링크 하나로 참여 가능. 간편하게 가용 날짜를 제출할
                    수 있습니다.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="text-3xl">🗓️</div>
                  <CardTitle>히트맵 시각화</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    날짜별 참여 가능 인원을 색상 강도로 시각화해 최적 날짜를
                    바로 확인할 수 있습니다.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="text-3xl">⚡</div>
                  <CardTitle>빠른 응답 집계</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    참여자가 날짜를 제출하는 즉시 집계 결과를 확인할 수
                    있습니다.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA 배너 */}
        <section className="bg-primary text-primary-foreground px-4 py-16">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
            <h2 className="text-2xl font-bold">지금 바로 시작해보세요</h2>
            <p className="text-primary-foreground/80">
              무료로 이용 가능합니다.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link href="/dashboard">모임 만들기</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="text-muted-foreground border-t px-6 py-8 text-center text-sm">
        <p>© 2026 GatherEase. 모든 권리 보유.</p>
      </footer>
    </div>
  );
}
