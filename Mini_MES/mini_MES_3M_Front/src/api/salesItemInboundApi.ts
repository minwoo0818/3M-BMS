import axios from 'axios';
import type { SalesItemInboundEligibleItem, SalesInboundRegisterRequest, SalesInboundResponse, SalesInboundHistoryItem, SalesInboundDetail, SalesInboundUpdateRequest } from '../types/SalesItemInboundTypes';

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

/**
 * 입고 이력 목록을 조회합니다.
 * @param keyword 검색어 (거래처명, 품목 번호, 품목명, 입고번호, 입고일자 검색)
 * @returns SalesInboundHistoryItem 배열
 */
export const getSalesInboundHistory = async (keyword?: string): Promise<SalesInboundHistoryItem[]> => {
  const response = await api.get<SalesInboundHistoryItem[]>('/sales-inbound/history', {
    params: { keyword: keyword || '' },
  });
  return response.data;
};

/**
 * 특정 입고 이력의 상세 정보를 조회합니다.
 * @param inboundId 입고 이력의 고유 ID
 * @returns SalesInboundDetail 형식의 상세 정보
 */
export const getSalesInboundDetail = async (inboundId: number): Promise<SalesInboundDetail> => {
  const response = await api.get<SalesInboundDetail>(`/sales-inbound/history/${inboundId}/detail`);
  return response.data;
};

/**
 * 특정 입고 이력의 정보를 수정합니다.
 * @param inboundId 수정할 입고 이력의 고유 ID
 * @param requestData 수정 요청 데이터 (SalesInboundUpdateRequest 형식)
 * @returns 수정된 입고 이력 상세 정보 (SalesInboundDetail 형식)
 */
export const updateSalesInboundHistory = async (inboundId: number, requestData: SalesInboundUpdateRequest): Promise<SalesInboundDetail> => {
  const response = await api.put<SalesInboundDetail>(`/sales-inbound/history/${inboundId}`, requestData);
  return response.data;
};

/**
 * 특정 입고 이력을 취소(삭제)합니다. (isCancelled 플래그 변경)
 * @param inboundId 취소할 입고 이력의 고유 ID
 */
export const cancelSalesInboundHistory = async (inboundId: number): Promise<void> => {
  await api.patch(`/sales-inbound/history/${inboundId}/cancel`);
};