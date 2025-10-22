// 출고 대상 입고 항목 조회용 DTO
export interface SalesOutboundListDto {
  inboundId: number;
  inboundLOTNum: string;
  partnerName: string;
  itemCode: string;
  itemName: string;
  receivedAt: string; // ISO 날짜 문자열
  qty: number;
  classification: string; // 품목 분류
}

// 출고 등록 요청 DTO
export interface SalesOutboundRegDto {
  inboundId: number;
  qty: number;
  shippedAt: string; // ISO 날짜 문자열 (예: "2025-10-21T00:00:00+09:00")
}
