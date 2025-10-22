// 백엔드의 RawItemInboundEligibleItemDto와 매핑되는 타입 (원자재 품목 목록 조회 응답용)
export interface RawItemInboundEligibleItem {
  rawsItemId: number; // 원자재 품목 ID (PK)
  supplierId: number; // 매입처 ID
  supplierName: string; // 매입처명
  itemCode: string; // 품목 번호
  itemName: string; // 품목명
  spec: string; // 원자재 규격(양/단위)
  manufacturer: string; // 제조사
  remark: string; // 원자재 품목의 비고
  color: string; // 원자재 품목의 색상
}

// 백엔드의 RawInboundRegisterRequestDto와 매핑되는 타입 (입고 등록 요청용)
export interface RawInboundRegisterRequest {
  rawsItemId: number; // 입고 대상 RawsItem의 ID
  qty: number; // 입고 수량
  inboundDate: string; // 입고 일자 (YYYY-MM-DD 형식)
  manufacturingDate: string; // 제조 일자 (YYYY-MM-DD 형식)
}

// 백엔드의 RawInboundResponseDto와 매핑되는 타입 (입고 등록 완료 후 응답용)
export interface RawInboundResponse {
  rawInboundId: number;
  rawInboundNum: string; // 자동 부여된 입고 번호
  rawsItemId: number;
  rawsItemName: string;
  qty: number;
  inboundDate: string;
  manufacturingDate: string;
  createdAt: string; // 등록일시 (ISO 8601 형식)
}

// 검색 옵션 타입
export type RawItemInboundSearchOptionKey = "all" | "supplierName" | "itemName" | "itemCode" | "manufacturer";
export interface RawItemInboundSearchOption {
  key: RawItemInboundSearchOptionKey;
  label: string;
}