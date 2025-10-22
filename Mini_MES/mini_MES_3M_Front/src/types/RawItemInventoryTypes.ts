// 백엔드의 RawItemInventoryResponseDto와 매핑되는 타입
export interface RawItemInventoryItem {
  inventoryId: number; // 재고 고유 ID
  rawsItemId: number; // 원자재 품목 ID
  supplierName: string; // 매입처명
  itemCode: string; // 품목 번호
  itemName: string; // 품목명
  spec: string; // 원자재 규격
  manufacturer: string; // 제조사 (RawsItem의 제조사)
  currentQty: number; // 현재 재고량
  unit?: string; // 단위 (RawsItem의 unit 필드가 있다면 사용)
}

// 검색 옵션 타입
export type RawItemInventorySearchOptionKey = "all" | "supplierName" | "itemName" | "itemCode";
export interface RawItemInventorySearchOption {
  key: RawItemInventorySearchOptionKey;
  label: string;
}