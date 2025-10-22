import axios from 'axios';
import type { RawItemInventoryItem } from '../types/RawItemInventoryTypes';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 원자재 재고 현황 목록을 조회합니다.
 * @param keyword 검색어 (매입처명, 품목 번호, 품목명으로 검색)
 * @returns RawItemInventoryItem 배열
 */
export const getRawItemInventoryStatus = async (keyword?: string): Promise<RawItemInventoryItem[]> => {
  const response = await api.get<RawItemInventoryItem[]>('/inventory/raw-items', {
    params: { keyword: keyword || '' },
  });
  return response.data;
};