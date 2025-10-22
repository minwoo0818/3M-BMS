import axios from 'axios';
import type { RawOutboundEligibleItem, RawOutboundRegisterRequest, RawOutboundResponse } from '../types/RawOutboundTypes';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getEligibleRawsItemsForOutbound = async (keyword?: string): Promise<RawOutboundEligibleItem[]> => {
  const response = await api.get<RawOutboundEligibleItem[]>('/raw-outbound/eligible-items', {
    params: { keyword: keyword || '' },
  });
  return response.data;
};

export const registerRawOutbound = async (requestData: RawOutboundRegisterRequest): Promise<RawOutboundResponse> => {
  const response = await api.post<RawOutboundResponse>('/raw-outbound', requestData);
  return response.data;
};