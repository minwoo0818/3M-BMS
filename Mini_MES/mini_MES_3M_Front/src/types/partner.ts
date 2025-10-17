// src/types/PartnerTypes.ts

// 백엔드의 PartnerRegisterRequestDto (등록 요청/상세 조회 응답)에 매핑될 타입
// "등록 때 등록한 데이터들"이 포함되며, 상세 조회에도 이 타입을 그대로 사용합니다.
export interface PartnerRegistrationData {
  partnerType: string; // 'customer' 또는 'supplier'
  brNum: string; // 사업자등록번호
  name: string; // 업체명
  bossName: string; // 대표명
  bossPhone: string; // 대표전화번호
  representativeName: string; // 담당자명
  representativePhone: string; // 담당자 전화번호
  representativeEmail: string; // 담당자 이메일
  address: string; // 기업 주소 정보
  remark: string; // 비고
}

// 백엔드의 PartnerPartialResponseDto (일부 조회 응답)에 매핑될 타입
// 백엔드에서 partnerId를 포함하고 있음.
export interface PartnerPartialDataDto {
  partnerId: number; // 백엔드의 partnerId를 그대로 사용
  name: string; // 업체명
  brNum: string; // 사업자등록번호
  address: string; // 기업 주소 정보
  representativeName: string; // 담당자명
  representativePhone: string; // 담당자 전화번호
  active: boolean; // 거래상태 (활성 여부)
}

// PartnersList 컴포넌트에서 실제로 사용될 데이터 타입
export interface PartnerListRowData {
  partnerId: number; // 백엔드 ID (partnerId)를 그대로 사용
  name: string; // 업체명
  brNum: string;
  address: string;
  representativeName: string;
  representativePhone: string;
  active: boolean;
  type: 'customer' | 'supplier'; // API 호출 시 사용되는 타입 (탭 상태와 연관됨)
}

// 검색 필드 타입 정의
export type SearchField = "total" | "name" | "representativeName";

export interface PartnerUpdateStatusRequestDto {
  active: boolean; // 변경할 거래 상태 (true 또는 false)
}