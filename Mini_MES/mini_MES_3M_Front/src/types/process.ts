// 테이블에 표시될 공정 항목의 타입
export interface ProcessItem {
  no: number;
  processCode: string;
  processName: string;
  processContent: string;
  processTime: number; // minutes
};

// 검색 옵션 타입
export type SearchOption = '전체' | '공정코드' | '공정명';