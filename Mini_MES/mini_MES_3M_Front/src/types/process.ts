// 테이블에 표시될 공정 항목의 타입
export type ProcessItem = {
  no: number;
  code: string;
  name: string;
  description: string;
  standardTime: number; // minutes
  operationId: number;
};

// 검색 옵션 타입
export type SearchOption = "전체" | "공정코드" | "공정명";
