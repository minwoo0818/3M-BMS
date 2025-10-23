import axios from "axios";
import type {
  SalesOutboundHistoryItem,
  SalesOutboundUpdateRequest,
} from "../types/SalesItemOutboundHistoryTypes";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * 출고 이력 목록을 조회합니다.
 * @param keyword 검색어 (거래처명, 품목 번호, 품목명, 출고번호, 출고일자 검색)
 * @returns SalesInboundHistoryItem 배열
 */
export const getSalesoutboundHistory = async (
  keyword?: string
): Promise<SalesOutboundHistoryItem[]> => {
  const response = await api.get<SalesOutboundHistoryItem[]>(
    "/order/history/outbound",
    {
      params: { keyword: keyword || "" },
    }
  );
  return response.data;
};

/**
 * 특정 출고 이력의 정보를 수정합니다.
 * @param outboundId 수정할 입고 이력의 고유 ID
 * @param requestData 수정 요청 데이터 (SalesOutboundUpdateRequest 형식)
 * @returns 수정된 입고 이력 상세 정보 (SalesOutboundDetail 형식)
 */
export const updateSalesOutboundHistory = async (
  outboundId: number,
  requestData: SalesOutboundUpdateRequest
): Promise<SalesOutboundUpdateRequest> => {
  const response = await api.put<SalesOutboundUpdateRequest>(
    `/order/history/outbound/${outboundId}`,
    requestData
  );
  return response.data;
};

/**
 * 특정 출고 이력을 취소(삭제)합니다.
 * @param outboundId 취소할 입고 이력의 고유 ID
 */
export const cancelSalesOutboundHistory = async (
  outboundId: number
): Promise<void> => {
  await api.patch(`/order/history/outbound/${outboundId}/cancel`);
};
