import axios from "axios";
import type { AxiosResponse } from "axios";

// =================================================================
// 💡 타입 정의 (추가 및 수정)
// =================================================================

// 공정/작업 상세 조회 시 사용될 타입 (OperationResponseDto와 유사하지만 명확히 구분)
export interface OperationDto {
  operationId: number;
  code: string;
  name: string;
  description: string;
  standardTime: number;
}

export interface SalesItem {
  salesItemId: number;
  partnerId: number | null;
  partnerName: string;
  itemName: string;
  itemCode: string;
  price: number;
  coatingMethod: string | null;
  remark: string;
  active: boolean | null;
}

export interface OperationResponseDto {
  operationId: number;
  code: string;
  name: string;
  description: string;
  standardTime: number;
}

export interface PageableResponse<T> {
  content: T[];
  pageable: any;
  totalPages: number;
  totalElements: number;
}

export interface PartnerSelectResponseDto {
  partnerId: number;
  partnerName: string;
}

// ✅ 상세 조회 DTO (요청에 맞게 공정 정보 포함)
export interface SalesItemDetailViewDto {
  salesItemId: number;
  partnerId: number | null;
  // 💡 등록 시 고정되는 값이며, 상세 조회 시 표시됩니다.
  partnerName: string; 
  itemName: string;
  itemCode: string;
  price: number;
  color: string;
  classification: string;
  coatingMethod?: string | null;
  remark: string;
  active: boolean | null;
  // 💡 상세 페이지에서 공정/작업 정보 표시를 위한 필드
  operations: OperationDto[]; 
}

// ✅ 등록 요청 DTO (업체명 고정 로직은 백엔드에서 partnerId를 통해 처리)
export interface SalesItemRegisterData {
  partnerId: number; // 💡 업체명 고정을 위해 ID 필수
  itemName: string;
  itemCode: string;
  price: number;
  color: string;
  classification: string;
  coatingMethod: string;
  remark: string;
  operationIds: number[]; // 연결할 공정 ID 목록
}

// =================================================================
// 🌐 API 설정
// =================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const api = axios.create({ baseURL: API_BASE_URL });

// =================================================================
// ⚙️ API 함수 (수정 및 보완)
// =================================================================

export const registerSalesItem = async (
  data: SalesItemRegisterData,
  file?: File
): Promise<SalesItem> => {
  const formData = new FormData();
  formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
  if (file) formData.append("file", file);
formData.forEach((value, key) => {
  if (value instanceof Blob) {
    value.text().then((text) => {
      console.log(`${key}:`, text);
    });
  } else {
    console.log(`${key}:`, value);
  }
});

  const response: AxiosResponse<SalesItem> = await api.post(
    "/sales-items",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};

// ✅ 모든 공정/작업(Operation) 조회 (GET /info/routing)
export const fetchAllOperations = async (): Promise<OperationResponseDto[]> => {
  const response = await api.get("/info/routing");
  // 백엔드 응답 형태에 따라 content 배열이 있을 수 있어 로직 유지
  const data = Array.isArray(response.data)
    ? response.data
    : response.data.content;

  return data;
};

// ✅ 목록 조회 (GET /sales-items)
export const fetchSalesItems = async (): Promise<SalesItem[]> => {
  const response: AxiosResponse<PageableResponse<SalesItem>> = await api.get("/sales-items");
  return response.data.content;
};

// ✅ 활성/비활성 상태 변경 (PUT /sales-items/{id}/active)
export const updateSalesItemActive = async (
  itemId: number,
  active: boolean
): Promise<void> => {
  await api.put(`/sales-items/${itemId}/active`, { active });
};

// ✅ 상세 조회 (GET /sales-items/{id})
// 💡 반환 타입을 상세 정보를 모두 포함하는 SalesItemDetailViewDto로 변경
export const fetchSalesItemDetail = async (
  id: number | string
): Promise<SalesItemDetailViewDto> => {
  // 백엔드에서 공정 정보(operations)를 포함하여 반환해야 함
  const response: AxiosResponse<SalesItemDetailViewDto> = await api.get(`/sales-items/${id}`);
  return response.data;
};

// 등록용
export const fetchActivePartners = async (): Promise<PartnerSelectResponseDto[]> => {
  const response = await api.get("/sales-items/partners/active");
  return response.data;
};

// 상세조회용
export const fetchAllPartners = async (): Promise<PartnerSelectResponseDto[]> => {
  const response = await api.get("/sales-items/partners/all");
  return response.data;
};

