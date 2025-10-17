// 백엔드의 PartnerRegisterRequestDto (등록 요청/상세 조회 응답)에 매핑될 타입
// "등록 때 등록한 데이터들"이 포함
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
export interface PartnerPartialData {
  name: string; // 업체명
  brNum: string; // 사업자등록번호
  address: string; // 기업 주소 정보
  representativeName: string; // 담당자명
  representativePhone: string; // 담당자 전화번호
  active: boolean; // 거래상태 (활성 여부)
}