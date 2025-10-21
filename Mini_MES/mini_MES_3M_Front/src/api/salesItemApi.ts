import axios from "axios";
import type { SalesItemFormData } from "../types/SalesItem";

const API_URL = "http://localhost:8080/api/sales-items";

// 1️⃣ 등록
export const createSalesItem = async (data: SalesItemFormData) => {
  return await axios.post(API_URL, data);
};

// 6️⃣ 공정명으로 공정 목록 조회
export const getOperationsByKeyword = async (keyword: string) => {
  return await axios.get(`http://localhost:8080/api/operations`, {
    params: { keyword },
  });
};

// 2️⃣ 수정
export const updateSalesItem = async (id: number, data: SalesItemFormData) => {
  return await axios.put(`${API_URL}/${id}`, data);
};

// 3️⃣ 목록 조회
export const getSalesItems = async (keyword = "", page = 0, size = 10) => {
  return await axios.get(API_URL, { params: { keyword, page, size } });
};

// 4️⃣ 상세조회
export const getSalesItemDetail = async (id: number) => {
  return await axios.get(`${API_URL}/${id}`);
};

// 5️⃣ 거래상태 토글
export const toggleTradeStatus = async (id: number) => {
  return await axios.put(`${API_URL}/${id}/toggle`);
};
