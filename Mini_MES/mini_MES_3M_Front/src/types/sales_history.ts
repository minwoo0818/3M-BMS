// HistoryType: 현재 페이지가 입고 조회인지, 출고 조회인지 구분
export type HistoryType = 'INBOUND' | 'OUTBOUND';

// BaseHistoryItem: 입고/출고 공통 데이터 필드
export type BaseHistoryItem = {
  no: number;
  customerName: string; // 거래처명
  itemCode: string; // 품목번호
  itemName: string; // 품목명
  date: string; // 입고일자 또는 출고일자 (YYYY-MM-DD)
  classification: string; // 분류
};

// InboundItem: 입고 전용 데이터 필드
export type InboundItem = BaseHistoryItem & {
  inboundNo: string; // 입고번호
  quantity: number; // 입고 수량
  coating: string; // 도장
};

// OutboundItem: 출고 전용 데이터 필드
export type OutboundItem = BaseHistoryItem & {
  outboundNo: string; // 출고 번호
  quantity: number; // 출고 수량
};

// HistoryItem: 입고 또는 출고 항목
export type HistoryItem = InboundItem | OutboundItem;

// SearchOption: 검색 조건 필드
export type SearchOption = {
  key: string; // 데이터 필드 매칭용
  label: string; // 사용자 표시용
};

// 입고 검색 옵션 목록
export const INBOUND_SEARCH_OPTIONS: SearchOption[] = [
  { key: '전체', label: '전체' },
  { key: 'customerName', label: '거래처명' },
  { key: 'itemName', label: '품목명' },
  { key: 'itemCode', label: '품목번호' },
  { key: 'inboundNo', label: '입고번호' },
  { key: 'date', label: '입고일자' },
];

// 출고 검색 옵션 목록
export const OUTBOUND_SEARCH_OPTIONS: SearchOption[] = [
  { key: '전체', label: '전체' },
  { key: 'customerName', label: '거래처명' },
  { key: 'itemName', label: '품목명' },
  { key: 'itemCode', label: '품목번호' },
  { key: 'outboundNo', label: '출고번호' },
  { key: 'date', label: '출고일자' },
];
