// src/api/partnersApi.ts
import axios from 'axios';
import type { PartnerRegistrationData, PartnerPartialDataDto, PartnerListRowData, PartnerUpdateStatusRequestDto } from '../types/partner'; // PartnerDetailData는 이제 필요 없어요!

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
 * 백엔드 PartnerRegisterRequestDto (즉 PartnerRegistrationData)를 직접 반환합니다.
 * @param partnerId 조회할 거래처의 고유 ID
 * @returns PartnerRegistrationData 형식의 상세 거래처 정보
 */
export const getPartnerDetails = async (partnerId: number): Promise<PartnerRegistrationData> => {
  // 백엔드의 /partners/{partnerId}/detail 엔드포인트는 PartnerRegisterRequestDto (PartnerRegistrationData와 동일)를 반환함!
  const response = await api.get<PartnerRegistrationData>(`/partners/${partnerId}`);
  return response.data; // 백엔드에서 주는 데이터를 그대로 반환
};

export const updatePartnerStatus = async (partnerId: number, newStatus: boolean): Promise<PartnerPartialDataDto> => {
  const requestBody: PartnerUpdateStatusRequestDto = { active: newStatus };
  const response = await api.patch<PartnerPartialDataDto>(`/partners/${partnerId}/status`, requestBody);
  return response.data;
};