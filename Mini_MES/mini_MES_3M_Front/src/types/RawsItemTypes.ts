// 백엔드의 RawsItemRegisterRequestDto와 매핑되는 타입 (원자재 등록 요청용)
export interface RawsItemRegistrationData {
  itemCode: string;
  itemName: string;
  classification: string;
  color: string;
  spec: string; // 엔티티 수정에 따라 unit -> spec 변경
  manufacturer: string;
  remark: string;
  supplierId: number; // 매입처의 partnerId
}

// 백엔드의 RawsItemPartialResponseDto와 매핑되는 타입 (목록 조회용)
export interface RawsItemPartialData {
  rawsItemId: number;
  itemCode: string;
  itemName: string;
  classification: string;
  supplierName: string; // 매입처명 (Partner의 name)
  manufacturer: string;
  active: boolean;
}

// 백엔드의 RawsItemDetailResponseDto와 매핑되는 타입 (상세 조회 및 수정 요청/응답용)
export interface RawsItemDetailData {
  rawsItemId: number; // 원자재 품목 고유 ID (PK)
  itemCode: string;
  itemName: string;
  classification: string;
  color: string;
  spec: string; // 엔티티 수정에 따라 unit -> spec 변경
  manufacturer: string;
  remark: string;
  supplierId: number; // 매입처의 partnerId
  supplierName: string; // 매입처명
  active: boolean;
}

// 백엔드의 RawsItemUpdateRequestDto와 매핑되는 타입 (원자재 수정 요청용 - rawsItemId 제외)
export type RawsItemUpdateData = Omit<RawsItemDetailData, 'rawsItemId' | 'supplierName'>;

// 백엔드의 RawsItemUpdateStatusRequestDto와 매핑되는 타입 (상태 업데이트 요청용)
export interface RawsItemUpdateStatusRequest {
  active: boolean;
}