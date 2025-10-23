import axios from "axios";
import type { AxiosResponse } from "axios";
import type { PartnerSelectResponseDto, SalesItemDetailViewDto, SalesItemRegisterData } from "../types/SalesItemDetail";

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

// =================================================================
// 🌐 API 설정
// =================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const api = axios.create({ baseURL: API_BASE_URL });

// =================================================================
// ⚙️ API 함수 (수정 및 보완) 개 이상 필요 없음
// =================================================================

// export const registerSalesItem = async (
//   data: SalesItemRegisterData,
//   file?: File
// ): Promise<SalesItem> => {
//   const formData = new FormData();
//   formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
//   if (file) formData.append("file", file);
// formData.forEach((value, key) => {
//   if (value instanceof Blob) {
//     value.text().then((text) => {
//       console.log(`${key}:`, text);
//     });
//   } else {
//     console.log(`${key}:`, value);
//   }
// });

//   const response: AxiosResponse<SalesItem> = await api.post(
//     "/sales-items",
//     formData,
//     {
//       headers: { "Content-Type": "multipart/form-data" },
//     }
//   );
//   return response.data;
// };

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
// export const fetchSalesItemDetail = async (
//   id: number | string
// ): Promise<SalesItemDetailViewDto> => {
//   // 백엔드에서 공정 정보(operations)를 포함하여 반환해야 함
//   const response: AxiosResponse<SalesItemDetailViewDto> = await api.get(`/sales-items/${id}`);
//   return response.data;
// };

// 등록용
// export const fetchActivePartners = async (): Promise<PartnerSelectResponseDto[]> => {
//   const response = await api.get("/sales-items/partners/active");
//   return response.data;
// };

// 상세조회용
export const fetchAllPartners = async (): Promise<PartnerSelectResponseDto[]> => {
  const response = await api.get("/sales-items/partners/all");
  return response.data;
};

/**
 * 1. 상세 조회 API (404 에러 해결: 경로 수정)
 */
export const fetchSalesItemDetail = async (itemId: string): Promise<SalesItemDetailViewDto> => {
    // 💡 URL 수정: /api/sales/items/{itemId}  =>  /api/sales-items/{itemId}
    const res = await api.get<SalesItemDetailViewDto>(`/sales-items/${itemId}`);
    return res.data;
};

/**
 * 2. 활성 거래처 목록 조회 API (405 에러 발생 가능성 있음)
 */
// export const loadActivePartners = async (): Promise<PartnerSelectResponseDto[]> => {
//     // URL: /api/sales-items/partners/active
//     const res = await api.get<PartnerSelectResponseDto[]>(`/sales-items/partners/active`);
//     return res.data;
// };

/**
 * 3. 품목 수정 API
 */
// export const updateSalesItem = async (itemId: string, payload: SalesItemRegisterData, file?: File): Promise<any> => {
//     const formData = new FormData();
    
//     // DTO 필드를 개별적으로 전송하는 로직 (백엔드와 통일된 방식)
//     Object.entries(payload).forEach(([key, value]) => {
//         if (Array.isArray(value)) {
//             // 배열은 JSON.stringify 처리
//             formData.append(key, JSON.stringify(value));
//         } else if (value !== null && value !== undefined) {
//             // 숫자, 문자열 등은 String으로 변환하여 추가
//             formData.append(key, String(value));
//         }
//     });

//     if (file) formData.append("file", file);

//     // PUT 요청: /api/sales-items/{itemId}
//     await api.put(`/sales-items/${itemId}`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//     });
// };

/** 3. 품목 수정 API (등록과 동일하게 @ModelAttribute 방식을 위해 개별 필드 전송) */
export const updateSalesItem = async (itemId: string, payload: SalesItemRegisterData, file?: File | null): Promise<any> => {
    const formData = new FormData();
    
    // 💡 DTO 필드를 개별적으로 FormData에 추가하여 @ModelAttribute 바인딩을 지원
    Object.entries(payload).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            // operationIds와 같은 배열은 백엔드에서 @ModelAttribute로 받으려면 
            // JSON 문자열로 보내거나, 필드명[index]=값 형태로 보내야 합니다.
            // 여기서는 백엔드가 JSON 문자열도 받을 수 있다고 가정하고 JSON.stringify를 사용합니다.
            formData.append(key, JSON.stringify(value));
        } else if (value !== null && value !== undefined) {
            formData.append(key, String(value));
        }
    });

    // 💡 파일이 있다면 "file"이라는 이름으로 FormData에 추가
    if (file) {
        formData.append("file", file);
    }
    
    // PUT 요청: /api/sales-items/{itemId}
    await api.put(`/sales-items/${itemId}`, formData); 
};