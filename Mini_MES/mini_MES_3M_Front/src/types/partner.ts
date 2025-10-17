// 백엔드의 PartnerRegisterRequestDto (등록 요청)에 매핑될 타입
export interface PartnerRegistrationData {
  partnerType: string;
  brNum: string;
  name: string;
  bossName: string;
  bossPhone: string;
  representativeName: string;
  representativePhone: string;
  representativeEmail: string;
  address: string;
  remark: string;
}

// 백엔드의 PartnerPartialResponseDto (일부 조회 응답)에 매핑될 타입
export interface PartnerPartialDataDto {
  partnerId: number;
  name: string;
  brNum: string;
  address: string;
  representativeName: string;
  representativePhone: string;
  active: boolean;
}

// PartnersList 컴포넌트에서 실제로 사용될 데이터 타입
export interface PartnerListRowData {
  partnerId: number;
  name: string;
  brNum: string;
  address: string;
  representativeName: string;
  representativePhone: string;
  active: boolean;
  type: 'customer' | 'supplier';
}

// 검색 필드 타입 정의
export type SearchField = "total" | "name" | "representativeName";

// 백엔드의 PartnerUpdateStatusRequestDto.java와 매핑되는 타입
export interface PartnerUpdateStatusRequestDto {
  active: boolean;
}

// =====================================================================
// 백엔드의 PartnerDetailResponseDto와 매핑되는 타입 (조회용/응답용)
// 상세 조회 페이지에서 보여줄 모든 정보를 포함합니다. (partnerId와 active 포함)
// =====================================================================
export interface PartnerDetailResponse {
  partnerId: number; // 거래처의 고유 ID
  partnerType: string; // 업체유형 (customer | supplier)
  brNum: string; // 사업자등록번호
  name: string; // 업체명
  bossName: string; // 대표명
  bossPhone: string; // 대표전화번호
  representativeName: string; // 담당자명
  representativePhone: string; // 담당자 전화번호
  representativeEmail: string; // 담당자 이메일
  address: string; // 기업 주소 정보
  remark: string; // 비고
  active: boolean; // 거래 상태
}

// =====================================================================
// 백엔드의 PartnerDetailUpdateRequestDto와 매핑되는 타입 (수정 요청용)
// 상세 정보 업데이트 시 요청 바디로 보낼 데이터를 포함합니다. (partnerId 제외!)
// =====================================================================
export interface PartnerDetailUpdateRequest {
  partnerType: string;
  brNum: string;
  name: string;
  bossName: string;
  bossPhone: string;
  representativeName: string;
  representativePhone: string;
  representativeEmail: string;
  address: string;
  remark: string;
  active: boolean; // active 상태는 수정 요청 시 포함!
}