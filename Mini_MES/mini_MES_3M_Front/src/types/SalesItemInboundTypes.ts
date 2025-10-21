// 백엔드의 SalesItemInboundListResponseDto와 매핑되는 타입 (수주대상품목 목록 조회 응답용)
export interface SalesItemInboundEligibleItem {
  salesItemId: number; // 수주 품목 ID (PK)
  partnerId: number; // 거래처 ID
  partnerName: string; // 거래처명
  itemCode: string; // 품목 번호
  itemName: string; // 품목명
  classification: string; // 분류
  remark: string; // 비고
}

// 백엔드의 SalesInboundRegisterRequestDto와 매핑되는 타입 (입고 등록 요청용)
export interface SalesInboundRegisterRequest {
  salesItemId: number; // 입고 대상 SalesItem의 ID
  qty: number; // 입고 수량
  receivedAt: string; // 입고 일자 (ISO 8601 YYYY-MM-DD 형식)
}

// 백엔드의 SalesInboundResponseDto와 매핑되는 타입 (입고 등록 완료 후 응답용)
export interface SalesInboundResponse {
  inboundId: number;
  salesItemId: number;
  salesItemName: string;
  qty: number;
  receivedAt: string; // 입고 일자
  inboundLOTNum: string; // LOT 번호
  createdAt: string; // 등록일시 (ISO 8601 형식)
}