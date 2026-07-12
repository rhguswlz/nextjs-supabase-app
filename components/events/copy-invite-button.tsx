"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  token: string;
}

export function CopyInviteButton({ token }: Props) {
  const handleCopy = async () => {
    try {
      const url = `${window.location.origin}/join/${token}`;
      await navigator.clipboard.writeText(url);
      toast.success("초대 링크가 복사되었습니다!");
    } catch {
      toast.error("복사에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleCopy}
      className="w-full"
      aria-label="초대 링크 클립보드에 복사"
    >
      🔗 초대 링크 복사
    </Button>
  );
}
