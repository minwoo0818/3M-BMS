import axios from "axios";
import type { AxiosResponse } from "axios";

// ✅ 반드시 export 붙여서 다른 파일에서 가져올 수 있도록 함
export interface SalesItem {
  id: number;
  partnerName: string;
  itemName: string;
  itemCode: string;
  price?: string;
  coating_method?: string;
  remark?: string;
  ACTIVE?: "Y" | "N";
}

export interface SalesItemRegisterData {
  partnerId: number | null;
  itemName: string;
  itemCode: string;
  price: number;
  color: string;
  classification: string;
  coatingMethod: string;
  remark: string;
  operationIds: number[];
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({ baseURL: API_BASE_URL });

// 1. 등록
export const registerSalesItem = async (formData: FormData): Promise<SalesItem> => {
  const response: AxiosResponse<SalesItem> = await api.post("/sales-items", formData);
  return response.data;
};

// 2. 목록 조회
export const fetchSalesItems = async (): Promise<SalesItem[]> => {
  const response = await api.get("/sales-items");
  return response.data;
};

//  거래 현황
export const updateSalesItemActive = async (itemId: number, active: boolean) => {
  const response = await api.put(`/sales-items/${itemId}/active`, { active });
  return response.data;
};

// 3. 상세 조회
export const fetchSalesItemDetail = async (id: number | string): Promise<SalesItem> => {
  const response = await api.get(`/sales-items/${id}`);
  return response.data;
};
