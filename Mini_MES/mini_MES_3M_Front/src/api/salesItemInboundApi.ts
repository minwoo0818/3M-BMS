import axios from 'axios';
import type { SalesItemInboundEligibleItem, SalesInboundRegisterRequest, SalesInboundResponse } from '../types/SalesItemInboundTypes';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 입고 등록 가능한 수주 품목 목록을 조회합니다.
 * @param keyword 검색어 (거래처명, 품목 번호, 품목명으로 검색)
 * @returns SalesItemInboundEligibleItem 배열
 */
export const getEligibleSalesItemsForInbound = async (keyword?: string): Promise<SalesItemInboundEligibleItem[]> => {
  const response = await api.get<SalesItemInboundEligibleItem[]>('/sales-inbound/eligible-items', {
    params: { keyword: keyword || '' },
  });
  return response.data;
};

/**
 * 수주 품목 입고를 등록합니다.
 * @param requestData 입고 등록 요청 데이터 (SalesInboundRegisterRequest 형식)
 * @returns 등록된 입고 정보 (SalesInboundResponse 형식)
 */
export const registerSalesInbound = async (requestData: SalesInboundRegisterRequest): Promise<SalesInboundResponse> => {
  const response = await api.post<SalesInboundResponse>('/sales-inbound', requestData);
  return response.data;
};