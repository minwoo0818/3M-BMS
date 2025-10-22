//원자재 품목 - 입고등록

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useCommonStyles } from "../style/useCommonStyles";
// import { useProcessStyles } from "../style/useProcessStyles"; // 현재 사용되지 않아 주석 처리
import { useSalesHistoryStyles } from "../style/useSalesHistoryStyles"; // 기존 프론트에서 사용
import { Typography, Box, Button, TextField, Select, MenuItem, Stack } from "@mui/material"; // Material UI 컴포넌트
import DatePicker from "react-datepicker"; // DatePicker import
import "react-datepicker/dist/react-datepicker.css"; // DatePicker CSS
import { format, parseISO } from 'date-fns'; // 날짜 포맷팅

import { getEligibleRawsItemsForInbound, registerRawInbound } from '../api/rawItemInboundApi'; // API 함수 import
import type { RawItemInboundEligibleItem, RawInboundRegisterRequest, RawItemInboundSearchOption, RawItemInboundSearchOptionKey } from '../types/RawItemInboundTypes'; // 타입 import


const ITEMS_PER_PAGE = 5; // 페이지당 항목 수

// 검색 옵션 목록
const RAW_ITEM_INBOUND_SEARCH_OPTIONS: RawItemInboundSearchOption[] = [
  { key: 'all', label: '전체' },
  { key: 'supplierName', label: '매입처명' },
  { key: 'itemName', label: '품목명' },
  { key: 'itemCode', label: '품목번호' },
  { key: 'manufacturer', label: '제조사' },
];


const RawItemInboundPage: React.FC = () => {
  const common = useCommonStyles();
  // const process = useProcessStyles(); // 현재 사용되지 않아 주석 처리
  const history = useSalesHistoryStyles(); // 기존 프론트에서 사용

  const [eligibleItems, setEligibleItems] = useState<RawItemInboundEligibleItem[]>([]); // API에서 불러온 실제 원자재 품목 데이터
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchType, setSearchType] = useState<RawItemInboundSearchOptionKey>('all'); // 검색 유형 (SearchOptionKey로 변경)
  const [searchKeyword, setSearchKeyword] = useState(""); // 검색어 (실제로 검색에 사용될 키워드)
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null); // 호버된 row ID

  // 각 품목별 입고 수량, 입고 일자, 제조 일자 상태 관리
  // { rawsItemId: { qty: string, inboundDate: string, manufacturingDate: string, errors: {qty?:string, inboundDate?:string, manufacturingDate?:string} } }
  const [inboundInputs, setInboundInputs] = useState<{
  [rawsItemId: number]: {
    qty: string;
    inboundDate: string;
    manufacturingDate: string;
    errors: { [key: string]: string | undefined }; // string 또는 undefined 허용
  };
}>({});

  // --- API 호출 함수: 입고 등록 가능 원자재 품목 목록 조회 ---
  const fetchEligibleRawsItems = useCallback(async (keyword?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getEligibleRawsItemsForInbound(keyword);
      setEligibleItems(data);
      // 입고 입력 상태 초기화 또는 기존 데이터 유지
      const initialInboundInputs: { [rawsItemId: number]: { qty: string, inboundDate: string, manufacturingDate: string, errors: { [key: string]: string } } } = {};
      data.forEach(item => {
        initialInboundInputs[item.rawsItemId] = { 
          qty: '', 
          inboundDate: format(new Date(), 'yyyy-MM-dd'), // 입고 일자 오늘 날짜로 기본값
          manufacturingDate: '',
          errors: {},
        };
      });
      setInboundInputs(initialInboundInputs);
    } catch (err: any) {
      console.error('원자재 품목 목록을 불러오는데 실패했습니다:', err);
      if (err.response && err.response.data && typeof err.response.data === 'object') {
        const errorDetail = Object.values(err.response.data).join(', ');
        setError(`데이터 로드 실패: ${errorDetail}`);
      } else {
        setError('원자재 품목 목록을 불러오는 중 오류가 발생했습니다.');
      }
      setEligibleItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 품목 목록 불러오기 (초기 검색어 없이)
  useEffect(() => {
    fetchEligibleRawsItems();
  }, [fetchEligibleRawsItems]);


  // --- 검색 로직 (프론트엔드에서 필터링) ---
  const filteredAndSearchedItems = useMemo(() => {
    const keywordLower = searchKeyword.toLowerCase().trim();
    if (!keywordLower || searchType === 'all') {
      return eligibleItems;
    }

    return eligibleItems.filter(item => {
      switch(searchType) {
        case 'supplierName': return item.supplierName.toLowerCase().includes(keywordLower);
        case 'itemCode': return item.itemCode.toLowerCase().includes(keywordLower);
        case 'itemName': return item.itemName.toLowerCase().includes(keywordLower);
        case 'manufacturer': return item.manufacturer.toLowerCase().includes(keywordLower);
        default: return false; // 해당 searchType이 없을 경우
      }
    });
  }, [eligibleItems, searchType, searchKeyword]);


  // --- 검색 버튼 핸들러 ---
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // 기본 폼 제출 방지
    setCurrentPage(1); // 검색 시 페이지 초기화
    // 백엔드 API가 키워드 검색을 지원하므로, 여기서 fetchEligibleRawsItems(searchKeyword) 호출
    fetchEligibleRawsItems(searchKeyword);
  };


  // --- 각 품목별 입고 수량, 입고 일자, 제조 일자 변경 핸들러 ---
  const handleInputChange = (rawsItemId: number, field: 'qty' | 'inboundDate' | 'manufacturingDate', value: string) => {
    setInboundInputs(prev => ({
      ...prev,
      [rawsItemId]: {
        ...prev[rawsItemId],
        [field]: value,
        errors: { // 입력 시 에러 메시지 초기화
          ...prev[rawsItemId]?.errors,
          [field]: undefined
        }
      }
    }));
  };

  const handleDateChange = (rawsItemId: number, field: 'inboundDate' | 'manufacturingDate', date: Date | null) => {
    const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
    setInboundInputs(prev => ({
      ...prev,
      [rawsItemId]: {
        ...prev[rawsItemId],
        [field]: formattedDate,
        errors: { // 입력 시 에러 메시지 초기화
          ...prev[rawsItemId]?.errors,
          [field]: undefined
        }
      }
    }));
  };

  // --- 입고 등록 버튼 핸들러 ---
  const handleRegister = async (item: RawItemInboundEligibleItem) => {
    const inputs = inboundInputs[item.rawsItemId];
    const newErrors: { [key: string]: string } = {};

    if (!inputs || inputs.qty.trim() === '') {
      newErrors.qty = "입고 수량을 입력해 주세요.";
    } else {
      const qtyNum = Number(inputs.qty);
      if (isNaN(qtyNum) || qtyNum <= 0) {
        newErrors.qty = "유효한 입고 수량(1개 이상)을 입력해 주세요.";
      }
    }

    if (!inputs || inputs.inboundDate.trim() === '') {
      newErrors.inboundDate = "입고 일자를 선택해 주세요.";
    }

    if (!inputs || inputs.manufacturingDate.trim() === '') {
      newErrors.manufacturingDate = "제조 일자를 선택해 주세요.";
    }

    // 에러가 있으면 업데이트하고 함수 종료
    if (Object.keys(newErrors).length > 0) {
      setInboundInputs(prev => ({
        ...prev,
        [item.rawsItemId]: {
          ...(prev[item.rawsItemId] || { qty: '', inboundDate: '', manufacturingDate: '', errors: {} }), // inputs이 없으면 기본값
          errors: newErrors
        }
      }));
      alert("필수 입력 항목을 확인해 주세요.");
      return;
    }

    try {
      const requestData: RawInboundRegisterRequest = {
        rawsItemId: item.rawsItemId,
        qty: Number(inputs.qty),
        inboundDate: inputs.inboundDate, // YYYY-MM-DD 형식
        manufacturingDate: inputs.manufacturingDate, // YYYY-MM-DD 형식
      };
      const response = await registerRawInbound(requestData);
      console.log('입고 등록 성공:', response);
      alert(`[${response.rawsItemName}] ${response.qty}개 입고 등록 완료!\n입고 번호: ${response.rawInboundNum}`);
      
      // 성공 후 목록 새로고침 및 입력 상태 초기화
      await fetchEligibleRawsItems(); 

    } catch (err: any) {
      console.error('원자재 입고 등록 실패:', err);
      if (err.response && err.response.data && typeof err.response.data === 'object') {
        const errorDetail = Object.values(err.response.data).join(', ');
        alert(`원자재 입고 등록 실패: ${errorDetail}`);
      } else {
        alert('원자재 입고 등록 중 오류가 발생했습니다.');
      }
    }
  };


  // --- 페이징 로직 ---
  const totalPages = Math.ceil(filteredAndSearchedItems.length / ITEMS_PER_PAGE);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAndSearchedItems.slice(startIndex, endIndex);
  }, [filteredAndSearchedItems, currentPage]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  return (
    <div style={common.container}>
      <h1 style={common.header}>원자재 품목 - 입고 등록</h1>

      {/* 검색 영역 */}
      <Box component="form" onSubmit={handleSearch} sx={common.searchContainer}>
        <div style={common.searchGroup}>
          <Select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as RawItemInboundSearchOptionKey)} // 타입 명시
            sx={{ width: 150, mr: 1 }}
            size="small"
            displayEmpty
          >
            {RAW_ITEM_INBOUND_SEARCH_OPTIONS.map(option => (
                <MenuItem key={option.key} value={option.key}>
                    {option.label}
                </MenuItem>
            ))}
          </Select>
          <TextField
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="매입처명, 품목명, 품목 번호, 제조사로 검색해 주세요"
            sx={{ flexGrow: 1 }}
            size="small"
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(e); }}
          />
        </div>

        {/* 돋보기 버튼 */}
        <Button
          type="submit"
          variant="contained"
          sx={{ ml: 1, py: '8px', px: '12px' }} // 높이 조정을 위해 패딩 조정
        >
          <svg
            style={{ width: "20px", height: "20px" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </Button>
      </Box>

      {/* 로딩/에러/데이터 없음 메시지 */}
      {isLoading && <Typography sx={{ p: 2 }}>입고 가능 원자재 품목을 불러오는 중입니다...</Typography>}
      {error && <Typography color="error" sx={{ p: 2 }}>에러: {error}</Typography>}
      {!isLoading && !error && filteredAndSearchedItems.length === 0 && (
        <Typography sx={{ p: 2 }}>조회된 원자재 품목이 없습니다.</Typography>
      )}


      {/* 테이블 영역 */}
      {!isLoading && !error && filteredAndSearchedItems.length > 0 && (
        <div style={common.tableContainer}>
          <table style={{ ...common.table, fontSize: "13px" }}>
            <thead>
              <tr>
                <th
                  style={{
                    ...common.th(true, false),
                    width: "15%",
                    padding: "10px",
                  }}
                >
                  매입처명
                </th>
                <th
                  style={{
                    ...common.th(false, false),
                    width: "10%",
                    padding: "10px",
                  }}
                >
                  품목 번호
                </th>
                <th
                  style={{
                    ...common.th(false, false),
                    width: "20%",
                    padding: "10px",
                  }}
                >
                  품목명
                </th>
                <th
                  style={{
                    ...common.th(false, false),
                    width: "10%",
                    padding: "10px",
                  }}
                >
                  원자재 규격
                </th>
                <th
                  style={{
                    ...common.th(false, false),
                    width: "10%",
                    padding: "10px",
                  }}
                >
                  제조사
                </th>
                <th
                  style={{
                    ...common.th(false, false),
                    width: "10%",
                    padding: "10px",
                  }}
                >
                  입고 수량
                </th>
                <th
                  style={{
                    ...common.th(false, false),
                    width: "10%",
                    padding: "10px",
                  }}
                >
                  입고 일자
                </th>
                <th
                  style={{
                    ...common.th(false, false),
                    width: "10%",
                    padding: "10px",
                  }}
                >
                  제조 일자
                </th>
                <th
                  style={{
                    ...common.th(false, true),
                    width: "5%",
                    padding: "10px",
                  }}
                >
                  등록
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <tr
                  key={item.rawsItemId}
                  style={{
                    ...common.tableRow,
                    ...(hoveredRowId === item.rawsItemId ? common.tdHover : {}),
                  }}
                  onMouseEnter={() => setHoveredRowId(item.rawsItemId)}
                  onMouseLeave={() => setHoveredRowId(null)}
                >
                  <td style={{ ...common.td, padding: '8px' }}>{item.supplierName}</td>
                  <td style={{ ...common.td, padding: '8px' }}>{item.itemCode}</td>
                  <td style={{ ...common.td, padding: '8px' }}>{item.itemName}</td>
                  <td style={{ ...common.td, padding: '8px' }}>{item.spec}</td>
                  <td style={{ ...common.td, padding: '8px' }}>{item.manufacturer}</td>
                  <td style={{ ...common.td, padding: '8px' }}>
                    <TextField
                      type="number"
                      size="small"
                      inputProps={{ min: 1 }}
                      value={inboundInputs[item.rawsItemId]?.qty || ''}
                      onChange={(e) => handleInputChange(item.rawsItemId, 'qty', e.target.value)}
                      error={!!inboundInputs[item.rawsItemId]?.errors?.qty}
                      helperText={inboundInputs[item.rawsItemId]?.errors?.qty}
                      sx={{ '& .MuiInputBase-input': { p: '6px 8px', fontSize: '13px' }, minWidth: '70px' }}
                    />
                  </td>
                  <td style={{ ...common.td, padding: '8px' }}>
                    <DatePicker
                      selected={inboundInputs[item.rawsItemId]?.inboundDate ? parseISO(inboundInputs[item.rawsItemId].inboundDate) : null}
                      onChange={(date) => handleDateChange(item.rawsItemId, 'inboundDate', date)}
                      dateFormat="yyyy-MM-dd"
                      customInput={
                        <TextField
                          size="small"
                          fullWidth
                          error={!!inboundInputs[item.rawsItemId]?.errors?.inboundDate}
                          helperText={inboundInputs[item.rawsItemId]?.errors?.inboundDate}
                          sx={{ '& .MuiInputBase-input': { p: '6px 8px', fontSize: '13px' } }}
                        />
                      }
                      wrapperClassName="date-picker-wrapper"
                    />
                  </td>
                  <td style={{ ...common.td, padding: '8px' }}>
                    <DatePicker
                      selected={inboundInputs[item.rawsItemId]?.manufacturingDate ? parseISO(inboundInputs[item.rawsItemId].manufacturingDate) : null}
                      onChange={(date) => handleDateChange(item.rawsItemId, 'manufacturingDate', date)}
                      dateFormat="yyyy-MM-dd"
                      customInput={
                        <TextField
                          size="small"
                          fullWidth
                          error={!!inboundInputs[item.rawsItemId]?.errors?.manufacturingDate}
                          helperText={inboundInputs[item.rawsItemId]?.errors?.manufacturingDate}
                          sx={{ '& .MuiInputBase-input': { p: '6px 8px', fontSize: '13px' } }}
                        />
                      }
                      wrapperClassName="date-picker-wrapper"
                    />
                  </td>
                  <td style={{ ...common.td, padding: '8px' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleRegister(item)}
                      sx={{ fontSize: '0.7rem' }}
                    >
                      등록
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 엑셀 다운로드 (아직 미구현) */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "20px",
        }}
      >
        <button style={history.excelButton} onClick={() => alert('엑셀 다운로드 기능 구현 예정')}>
          📥 EXCEL 다운로드
        </button>
      </div>

      {/* 페이징 UI */}
      {!isLoading && !error && filteredAndSearchedItems.length > 0 && (
        <div style={common.paginationContainer}>
          <button 
            style={common.pageButton(false)} 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            이전
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => {
              const maxPagesToShow = 5;
              if (totalPages <= maxPagesToShow) return true;
              if (currentPage <= Math.ceil(maxPagesToShow / 2)) {
                return page <= maxPagesToShow; 
              }
              if (currentPage > totalPages - Math.floor(maxPagesToShow / 2)) {
                return page > totalPages - maxPagesToShow; 
              }
              return page >= currentPage - Math.floor(maxPagesToShow / 2) && page <= currentPage + Math.floor(maxPagesToShow / 2); 
            })
            .map((page) => (
              <button
                key={page} 
                style={common.pageButton(page === currentPage)}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          <button 
            style={common.pageButton(false)}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};

export default RawItemInboundPage;