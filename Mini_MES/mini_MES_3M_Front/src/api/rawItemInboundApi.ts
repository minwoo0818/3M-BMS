import axios from 'axios';
import type { RawItemInboundEligibleItem, RawInboundRegisterRequest, RawInboundResponse } from '../types/RawItemInboundTypes';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 입고 등록 가능한 원자재 품목 목록을 조회합니다.
 * @param keyword 검색어 (매입처명, 품목 번호, 품목명, 제조사로 검색)
 * @returns RawItemInboundEligibleItem 배열
 */
export const getEligibleRawsItemsForInbound = async (keyword?: string): Promise<RawItemInboundEligibleItem[]> => {
  const response = await api.get<RawItemInboundEligibleItem[]>('/raw-inbound/eligible-items', {
    params: { keyword: keyword || '' },
  });
  return response.data;
};

/**
 * 원자재 품목 입고를 등록합니다.
 * @param requestData 입고 등록 요청 데이터 (RawInboundRegisterRequest 형식)
 * @returns 등록된 입고 정보 (RawInboundResponse 형식)
 */
export const registerRawInbound = async (requestData: RawInboundRegisterRequest): Promise<RawInboundResponse> => {
  const response = await api.post<RawInboundResponse>('/raw-inbound', requestData);
  return response.data;
};