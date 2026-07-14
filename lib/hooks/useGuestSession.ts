"use client";

import { useEffect, useState } from "react";

interface UseGuestSessionReturn {
  guestToken: string | null;
  setGuestToken: (token: string) => void;
  clearGuestToken: () => void;
  isHydrated: boolean;
}

const GUEST_TOKEN_KEY = "guest_token";

/**
 * 게스트 세션을 localStorage에서 관리하는 훅
 *
 * SSR 호환성을 위해 useLayoutEffect로 마운트 후에만 localStorage 접근합니다.
 * 반환된 isHydrated 플래그를 사용하여 클라이언트에서만 렌더링할 수 있습니다.
 *
 * @returns 게스트 토큰, 설정/삭제 함수, hydration 상태
 */
export function useGuestSession(): UseGuestSessionReturn {
  const [guestToken, setGuestTokenState] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // SSR 호환성: 클라이언트 마운트 후에만 localStorage 접근
  useEffect(() => {
    try {
      const token = localStorage.getItem(GUEST_TOKEN_KEY);
      setGuestTokenState(token);
    } catch {
      // localStorage 접근 불가 환경 (예: SSR, 특정 브라우저 정책)
      console.warn("localStorage에 접근할 수 없습니다.");
    }
    setIsHydrated(true);
  }, []);

  const setGuestToken = (token: string) => {
    try {
      localStorage.setItem(GUEST_TOKEN_KEY, token);
      setGuestTokenState(token);
    } catch {
      console.warn("localStorage에 토큰을 저장할 수 없습니다.");
    }
  };

  const clearGuestToken = () => {
    try {
      localStorage.removeItem(GUEST_TOKEN_KEY);
      setGuestTokenState(null);
    } catch {
      console.warn("localStorage에서 토큰을 삭제할 수 없습니다.");
    }
  };

  return {
    guestToken,
    setGuestToken,
    clearGuestToken,
    isHydrated,
  };
}
