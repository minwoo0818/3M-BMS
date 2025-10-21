// src/api/partnersApi.ts
import axios from 'axios';
import type { PartnerRegistrationData, PartnerPartialDataDto, PartnerListRowData, PartnerUpdateStatusRequestDto, PartnerDetailFormData, PartnerUpdateData, PartnerDetailResponse, PartnerDetailUpdateRequest } from '../types/partner'; // PartnerDetailData는 이제 필요 없어요!

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const registerPartner = async (partnerData: PartnerRegistrationData): Promise<PartnerRegistrationData> => {
  const response = await api.post<PartnerRegistrationData>('/partners', partnerData);
  return response.data;
};

export const getPartnersPartial = async (queryPartnerType: 'customer' | 'supplier'): Promise<PartnerListRowData[]> => {
  const response = await api.get<PartnerPartialDataDto[]>('/partners', {
    params: { partnerType: queryPartnerType },
  });

  const transformedData: PartnerListRowData[] = response.data.map((item: PartnerPartialDataDto) => ({
    partnerId: item.partnerId,
    name: item.name,
    brNum: item.brNum,
    address: item.address,
    representativeName: item.representativeName,
    representativePhone: item.representativePhone,
    active: item.active,
    type: queryPartnerType,
  }));

  return transformedData;
};

/**
 * 특정 ID의 거래처 상세 정보를 조회합니다.
 * @param partnerId 조회할 거래처의 고유 ID
 * @returns PartnerDetailResponse 형식의 상세 거래처 정보
 */
export const getPartnerDetails = async (partnerId: number): Promise<PartnerDetailResponse> => { // 반환 타입 변경!
  const response = await api.get<PartnerDetailResponse>(`/partners/${partnerId}/detail`);
  return response.data;
};

export const updatePartnerStatus = async (partnerId: number, newStatus: boolean): Promise<PartnerPartialDataDto> => {
  const requestBody: PartnerUpdateStatusRequestDto = { active: newStatus };
  const response = await api.patch<PartnerPartialDataDto>(`/partners/${partnerId}/status`, requestBody);
  return response.data;
};

/**
 * 특정 ID의 거래처 상세 정보를 업데이트합니다.
 * @param partnerId 업데이트할 거래처의 고유 ID
 * @param partnerData 업데이트할 거래처의 데이터 (PartnerDetailUpdateRequest 형식: partnerId 제외)
 * @returns 업데이트된 거래처의 상세 정보 (PartnerDetailResponse 형식)
 */
export const updatePartner = async (partnerId: number, partnerData: PartnerDetailUpdateRequest): Promise<PartnerDetailResponse> => { // 요청/반환 타입 변경!
  const response = await api.put<PartnerDetailResponse>(`/partners/${partnerId}`, partnerData);
  return response.data;
};

/**
 * 특정 타입의 파트너 목록(부분 정보)을 조회합니다.
 * 'customer' 또는 'supplier'를 파라미터로 넘겨 필터링합니다.
 * @param partnerType 조회할 파트너의 유형 ('customer' 또는 'supplier')
 * @returns PartnerListRowData 배열
 */
export const getPartnersList = async (partnerType: 'customer' | 'supplier'): Promise<PartnerListRowData[]> => {
  const response = await api.get<PartnerListRowData[]>('/partners', { // /partners 엔드포인트는 partnerType 쿼리 파라미터를 받음
    params: { partnerType },
  });
  return response.data;
};