// ====================================================================
// 출고 이력 목록 조회 응답 (SalesHistoryOutboundDto와 매핑)
// ====================================================================
export interface SalesOutboundHistoryItem {
  outboundId: number; // 출고 고유 ID
  salesItemId: number; // 수주 품목 ID
  partnerName: string; // 거래처명
  itemCode: string; // 품목 번호
  itemName: string; // 품목명
  classification: string; // 분류
  outboundOUTNum: string; // 출고 번호
  qty: number; // 출고 수량
  shippedAt: string; // 출고 일자 (YYYY-MM-DD 형식)
  isCancelled: boolean; // 출고 취소 여부
  createdAt: string; // 출고 등록일시
}

// ====================================================================
// 출고 이력 수정 요청 (SalesInboundUpdateRequestDto와 매핑)
// ====================================================================
export interface SalesOutboundUpdateRequest {
  qty: number; // 수정할 출고 수량
  shippedAt: string; // 수정할 출고 일자 (YYYY-MM-DD 형식)
}
