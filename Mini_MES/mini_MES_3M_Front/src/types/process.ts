// 테이블에 표시될 공정 항목의 타입
export interface ProcessItem {
  no: number;
  code: string;
  name: string;
  description: string;
  standardTime: number; // minutes
  operationId: number;
};

// 검색 옵션 타입
export type SearchOption = "전체" | "공정코드" | "공정명";

// src/types/operation.ts

export type OperationStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ERROR';

export interface OperationRequestDto {
  code: string;
  name: string;
  description: string;
  standardTime: number;
  status: OperationStatus;
}

export interface OperationResponseDto {
  operationId: number;
  code: string;
  name: string;
  description: string;
  standardTime: number;
  status: OperationStatus;
  order: number;
  startTime: string | null;
}
export interface PaginatedOperationResponse {
  content: OperationResponseDto[];
  pageable?: any;
  last?: boolean;
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
  sort?: any;
  first?: boolean;
  numberOfElements?: number;
  empty?: boolean;
}
