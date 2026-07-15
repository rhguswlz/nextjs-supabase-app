import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "언제 만나요";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 48,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: "bold",
        flexDirection: "column",
        gap: 24,
        padding: 40,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: "900",
          letterSpacing: "-2px",
        }}
      >
        언제 만나요
      </div>
      <div
        style={{
          fontSize: 32,
          opacity: 0.9,
          fontWeight: "400",
        }}
      >
        모임 날짜를 쉽게 정하는 서비스
      </div>
      <div
        style={{
          fontSize: 24,
          opacity: 0.7,
          marginTop: 16,
        }}
      >
        언제 만나요와 함께 편하게 일정을 조율하세요
      </div>
    </div>,
    {
      ...size,
    },
  );
}
