// 입고 등록 요청 DTO
export interface RawItemInboundRequest {
  item_id: number; // 품목 ID (FK)
  qty: number; // 입고 수량
  inb_date: string; // 입고일자 (ISO 형식)
  mfg_date: string; // 제조일자 (ISO 형식)
}
