// src/api/rawsItemsApi.ts (새로 생성!)
import axios from 'axios';
import type { RawsItemRegistrationData, RawsItemPartialData, RawsItemDetailData, RawsItemUpdateData, RawsItemUpdateStatusRequest, RawsItemDetail, RawsItemUpdateRequest } from '../types/RawsItemTypes';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 새로운 원자재 품목을 등록합니다.
 * @param rawsItemData 등록할 원자재 데이터
 * @returns 등록된 원자재의 상세 정보 (RawsItemDetailData 형식)
 */
export const registerRawsItem = async (rawsItemData: RawsItemRegistrationData): Promise<RawsItemDetailData> => {
  const response = await api.post<RawsItemDetailData>('/raws-items', rawsItemData);
  return response.data;
};

/**
 * 모든 원자재 품목의 간략한 목록을 조회합니다.
 * @returns RawsItemPartialData 배열
 */
export const getAllRawsItems = async (): Promise<RawsItemPartialData[]> => {
  const response = await api.get<RawsItemPartialData[]>('/raws-items');
  return response.data;
};

/**
 * 특정 원자재 품목의 상세 정보를 조회합니다.
 * @param rawsItemId 조회할 원자재 품목의 ID
 * @returns RawsItemDetail 형식의 상세 정보
 */
export const getRawsItemById = async (rawsItemId: number): Promise<RawsItemDetail> => { // 함수명 변경!
  const response = await api.get<RawsItemDetail>(`/raws-items/${rawsItemId}`);
  return response.data;
};

/**
 * 특정 원자재 품목의 정보를 수정합니다.
 * @param rawsItemId 수정할 원자재 품목의 ID
 * @param requestData 수정 요청 데이터 (RawsItemUpdateRequest 형식)
 * @returns 수정된 원자재 품목 상세 정보 (RawsItemDetail 형식)
 */
export const updateRawsItem = async (rawsItemId: number, requestData: RawsItemUpdateRequest): Promise<RawsItemDetail> => {
  const response = await api.put<RawsItemDetail>(`/raws-items/${rawsItemId}`, requestData);
  return response.data;
};


/**
 * 특정 ID의 원자재 품목 활성 상태 (active)를 업데이트합니다.
 * @param rawsItemId 업데이트할 원자재 품목의 고유 ID
 * @param newStatus 변경할 활성 상태 (true 또는 false)
 * @returns 업데이트된 원자재의 부분 정보 (RawsItemPartialData 형식)
 */
export const updateRawsItemStatus = async (rawsItemId: number, newStatus: boolean): Promise<RawsItemPartialData> => {
  const requestBody: RawsItemUpdateStatusRequest = { active: newStatus };
  const response = await api.patch<RawsItemPartialData>(`/raws-items/${rawsItemId}/status`, requestBody);
  return response.data;
};