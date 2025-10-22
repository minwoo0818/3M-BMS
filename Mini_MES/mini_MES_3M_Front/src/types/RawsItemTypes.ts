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

// 원자재 상세 조회 응답 (백엔드 RawsItemResponseDto에 매핑)
export interface RawsItemDetail {
  rawsItemId: number;         // 원자재 품목 고유 ID (PK)
  itemCode: string;         // 품목번호 (수정 가능)
  itemName: string;         // 품목명 (수정 가능)
  classification: string;   // 분류 (수정 가능)
  color: string;            // 색상 (수정 가능)
  spec: string;             // 원자재 규격 (양/단위) (수정 가능)
  manufacturer: string;     // 제조사 (수정 가능)
  remark: string;           // 비고 (수정 가능)
  
  // 조회용 (매입처명) 및 수정 시 필요한 정보
  supplierId: number;       // 매입처 ID (수정 시 필요)
  supplierName: string;     // 매입처명 (조회용, 수정 불가)
  active: boolean;          // 활성화 여부 (수정 가능)
  createdAt: string;        // 등록일 (ISO string)
  updatedAt: string;        // 수정일 (ISO string)
}

// 원자재 수정 요청 (백엔드 RawsItemUpdateRequestDto에 매핑)
export interface RawsItemUpdateRequest {
  itemCode: string;         // 품목번호
  itemName: string;
  classification: string;
  color: string;
  spec: string;             // 원자재 규격
  manufacturer: string;
  remark: string;
  supplierId: number;       // 매입처 ID
  active: boolean;          // 활성화 여부
}

// 원자재 목록 조회용 (간략화된 정보) - 변경 없음
export interface RawsItemListItem {
  rawsItemId: number;
  supplierName: string;
  itemCode: string;
  itemName: string;
  classification: string;
  manufacturer: string;
  active: boolean;
}

// 매입처 선택 드롭다운용 타입
export interface SupplierOption {
  partnerId: number;
  partnerName: string;
}