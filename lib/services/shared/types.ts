/**
 * 서비스 레이어 공유 타입 정의
 *
 * 모든 서비스에서 공통으로 사용하는 타입을 정의합니다.
 */

/**
 * 서비스 함수의 표준 응답 타입
 *
 * 성공 시: { success: true, data: T }
 * 실패 시: { success: false, error: string }
 */
export type ServiceResult<T> =
  { success: true; data: T } | { success: false; error: string };

/**
 * 페이지네이션 파라미터
 *
 * limit: 한 페이지에 가져올 최대 항목 수 (기본값: 10)
 * offset: 건너뛸 항목 수 (기본값: 0)
 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

/**
 * 페이지네이션 결과 타입
 *
 * data: 조회된 항목 목록
 * count: 전체 항목 수 (페이지네이션 계산용)
 * limit: 적용된 limit 값
 * offset: 적용된 offset 값
 */
export interface PaginationResult<T> {
  data: T[];
  count: number;
  limit: number;
  offset: number;
}
