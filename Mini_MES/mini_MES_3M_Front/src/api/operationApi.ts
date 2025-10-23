import axios from 'axios';
import type { OperationRequestDto, OperationStatus } from '../types/process';
import type { OperationResponseDto } from './salesItemApi';


// 1. 공정 등록
export const createOperation = async (operationData: OperationRequestDto) => {
  const response = await axios.post('/info/routing', operationData);
  return response.data;
};

// 2. 공정 수정 (이름, 코드, 설명 등)
export const updateOperation = async (id: number, updatedData: Partial<OperationRequestDto>) => {
  const response = await axios.put(`/info/routing/${id}`, updatedData);
  return response.data;
};

// 3. 공정 상태 변경
export const updateOperationStatus = async (id: number, status: OperationStatus) => {
  const response = await axios.patch(`/info/routing/status/${id}`, { status });
  return response.data;
};

// 4. 공정 순서 변경
export const updateOperationOrder = async (
  orderList: { id: number; order: number }[]
) => {
  const response = await axios.patch('/info/routing/order', orderList);
  return response.data;
};

// 5. 공정 시작 처리
export const startOperation = async (id: number) => {
  const response = await axios.patch(`/info/routing/start/${id}`);
  return response.data;
};

// 6. 공정 전체 조회 (페이지 없이 전체 리스트)
export const fetchOperations = async (): Promise<OperationResponseDto[]> => {
  const response = await axios.get('/info/routing'); // GET /operations
  return response.data; // ✅ 반드시 배열이어야 함
};
