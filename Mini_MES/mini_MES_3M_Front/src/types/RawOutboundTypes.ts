export interface RawOutboundEligibleItem {
  rawsItemId: number;
  inventoryId: number;
  supplierName: string;
  itemCode: string;
  itemName: string;
  spec: string;
  manufacturer: string;
  currentStock: number;
  unit?: string;
}

export interface RawOutboundRegisterRequest {
  rawsItemId: number;
  qty: number;
  outboundDate: string; // 이전 답변에서 shippedAt으로 변경했었지만, 프론트에서 outboundDate로 사용하는 것이 자연스러우니 맞춰서 사용 (백엔드 DTO도 outboundDate로 요청함)
}

export interface RawOutboundResponse {
  rawOutboundId: number;
  rawOutboundNum: string; // 이 필드는 백엔드에서 rawOutboundMOUTNum으로 정의됨. DTO 이름 맞추기 (rawOutboundNum)
  rawsItemId: number;
  rawsItemName: string;
  qty: number;
  outboundDate: string; // 백엔드 DTO에서 shippedAt으로 정의됨. 프론트엔드에서 일관성을 위해 outboundDate 사용
  createdAt: string;
}

export type RawOutboundSearchOptionKey = "all" | "supplierName" | "itemName" | "itemCode";
export interface RawOutboundSearchOption {
  key: RawOutboundSearchOptionKey;
  label: string;
}