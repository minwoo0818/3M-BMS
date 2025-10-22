import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useCommonStyles } from '../style/useCommonStyles';
// import { useProcessStyles } from '../style/useProcessStyles'; // 사용되지 않아 주석 처리
import { useSalesHistoryStyles } from '../style/useSalesHistoryStyles'; // 엑셀 다운로드 버튼 스타일용
import { Typography, Box, Button, TextField, Select, MenuItem, Stack } from '@mui/material'; // Material UI 컴포넌트
import DatePicker from 'react-datepicker'; // DatePicker import
import 'react-datepicker/dist/react-datepicker.css'; // DatePicker CSS
import { format, parseISO } from 'date-fns'; // 날짜 포맷팅

import { getEligibleRawsItemsForOutbound, registerRawOutbound } from '../api/rawOutboundApi'; // 출고 API 임포트
import type { RawOutboundEligibleItem, RawOutboundRegisterRequest, RawOutboundSearchOption, RawOutboundSearchOptionKey } from '../types/RawOutboundTypes'; // 타입 임포트

const ITEMS_PER_PAGE = 5; // 페이지당 항목 수

// 검색 옵션 목록
const RAW_OUTBOUND_SEARCH_OPTIONS: RawOutboundSearchOption[] = [
  { key: 'all', label: '전체' },
  { key: 'supplierName', label: '매입처명' },
  { key: 'itemCode', label: '품목번호' },
  { key: 'itemName', label: '품목명' },
];

const RawItemOutboundPage: React.FC = () => {
  const common = useCommonStyles();
  // const process = useProcessStyles(); // 사용되지 않아 주석 처리
  const history = useSalesHistoryStyles(); // 엑셀 다운로드 버튼 스타일용

  const [eligibleItems, setEligibleItems] = useState<RawOutboundEligibleItem[]>([]); // API에서 불러온 출고 가능 품목 데이터
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 검색 상태
  const [searchType, setSearchType] = useState<RawOutboundSearchOptionKey>('all');
  const [searchKeyword, setSearchKeyword] = useState(''); // 입력 필드 검색어
  const [activeSearchTerm, setActiveSearchTerm] = useState(''); // 실제 적용될 검색어 (검색 버튼/Enter 시 업데이트)

  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null); // 행 호버 상태

  // 각 품목별 출고 수량, 출고 일자 상태 관리
  // { rawsItemId: { qty: string, outboundDate: string, errors: {qty?:string, outboundDate?:string} } }
  const [outboundInputs, setOutboundInputs] = useState<{ 
    [rawsItemId: number]: { qty: string, outboundDate: string, errors: { [key: string]: string } } 
  }>({});

  // --- API 호출 함수: 출고 가능 원자재 품목 목록 조회 ---
  const fetchEligibleRawsItemsForOutbound = useCallback(async (keyword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getEligibleRawsItemsForOutbound(keyword);
      setEligibleItems(data);

      // 출고 입력 상태 초기화 (또는 기존 데이터 유지)
      const initialOutboundInputs: { [rawsItemId: number]: { qty: string, outboundDate: string, errors: { [key: string]: string } } } = {};
      data.forEach(item => {
        initialOutboundInputs[item.rawsItemId] = { 
          qty: '', 
          outboundDate: format(new Date(), 'yyyy-MM-dd'), // 출고 일자 오늘 날짜로 기본값
          errors: {},
        };
      });
      setOutboundInputs(initialOutboundInputs);
    } catch (err: any) {
      console.error('출고 가능 원자재 품목 목록을 불러오는데 실패했습니다:', err);
      if (err.response && err.response.data && typeof err.response.data === 'object') {
        const errorDetail = Object.values(err.response.data).join(', ');
        setError(`데이터 로드 실패: ${errorDetail}`);
      } else {
        setError('출고 가능 원자재 품목 목록을 불러오는 중 오류가 발생했습니다.');
      }
      setEligibleItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 초기 로드 및 activeSearchTerm 변경 시 데이터 호출
  useEffect(() => {
    fetchEligibleRawsItemsForOutbound(activeSearchTerm);
  }, [activeSearchTerm, fetchEligibleRawsItemsForOutbound]); // activeSearchTerm이 변경될 때만 다시 불러오기


  // --- 검색 로직 (프론트엔드에서 필터링) ---
  const filteredAndSearchedItems = useMemo(() => {
    const keywordLower = activeSearchTerm.toLowerCase().trim();

    if (!keywordLower || searchType === 'all') {
      return eligibleItems;
    }

    return eligibleItems.filter(item => {
      switch(searchType) {
        case 'supplierName': return item.supplierName.toLowerCase().includes(keywordLower);
        case 'itemCode': return item.itemCode.toLowerCase().includes(keywordLower);
        case 'itemName': return item.itemName.toLowerCase().includes(keywordLower);
        default: return false;
      }
    });
  }, [eligibleItems, searchType, activeSearchTerm]);


  // --- 검색 버튼 핸들러 ---
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setActiveSearchTerm(searchKeyword); // 입력된 검색어를 실제 검색어로 적용
  };

  // --- 각 품목별 출고 수량, 출고 일자 변경 핸들러 ---
  const handleInputChange = (rawsItemId: number, field: 'qty' | 'outboundDate', value: string) => {
    setOutboundInputs(prev => ({
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

  const handleDateChange = (rawsItemId: number, field: 'outboundDate', date: Date | null) => {
    const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
    setOutboundInputs(prev => ({
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

  // --- 출고 등록 버튼 핸들러 ---
  const handleRegister = async (item: RawOutboundEligibleItem) => {
    const inputs = outboundInputs[item.rawsItemId];
    const newErrors: { [key: string]: string } = {};

    if (!inputs || inputs.qty.trim() === '') {
      newErrors.qty = "출고 수량을 입력해 주세요.";
    } else {
      const qtyNum = Number(inputs.qty);
      if (isNaN(qtyNum) || qtyNum <= 0) {
        newErrors.qty = "유효한 출고 수량(1개 이상)을 입력해 주세요.";
      } else if (qtyNum > item.currentStock) { // 재고보다 많이 출고하는지 검사
        newErrors.qty = `현재 재고(${item.currentStock})보다 많이 출고할 수 없습니다.`;
      }
    }

    if (!inputs || inputs.outboundDate.trim() === '') {
      newErrors.outboundDate = "출고 일자를 선택해 주세요.";
    }

    // 에러가 있으면 업데이트하고 함수 종료
    if (Object.keys(newErrors).length > 0) {
      setOutboundInputs(prev => ({
        ...prev,
        [item.rawsItemId]: {
          ...(prev[item.rawsItemId] || { qty: '', outboundDate: '', errors: {} }),
          errors: newErrors
        }
      }));
      alert("필수 입력 항목을 확인해 주세요.");
      return;
    }

    try {
      const requestData: RawOutboundRegisterRequest = {
        rawsItemId: item.rawsItemId,
        qty: Number(inputs.qty),
        outboundDate: inputs.outboundDate, // YYYY-MM-DD 형식
      };
      const response = await registerRawOutbound(requestData);
      console.log('출고 등록 성공:', response);
      alert(`[${response.rawsItemName}] ${response.qty}개 출고 등록 완료!\n출고 번호: ${response.rawOutboundNum}`);
      
      // 성공 후 목록 새로고침 및 입력 상태 초기화
      await fetchEligibleRawsItemsForOutbound(activeSearchTerm); 

    } catch (err: any) {
      console.error('원자재 출고 등록 실패:', err);
      if (err.response && err.response.data && typeof err.response.data === 'object') {
        const errorDetail = Object.values(err.response.data).join(', ');
        alert(`원자재 출고 등록 실패: ${errorDetail}`);
      } else {
        alert('원자재 출고 등록 중 오류가 발생했습니다.');
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

  const handleExcelDownload = () => {
    alert('엑셀 다운로드 기능은 구현 예정입니다.');
    console.log('엑셀 다운로드');
  };

  return (
    <div style={common.container}>
      {/* <h1>수주품목 - 출고 등록</h1> */}
      <h1 style={common.header}>원자재 품목 - 출고 등록</h1> {/* 헤더 수정 */}

      {/* 검색 영역 */}
      <Box component="form" onSubmit={handleSearch} sx={common.searchContainer}>
        <div style={common.searchGroup}>
          <Select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as RawOutboundSearchOptionKey)}
            sx={{ width: 150, mr: 1 }}
            size="small"
            displayEmpty
          >
            {RAW_OUTBOUND_SEARCH_OPTIONS.map(option => (
                <MenuItem key={option.key} value={option.key}>
                    {option.label}
                </MenuItem>
            ))}
          </Select>
          <TextField
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="매입처명, 품목명, 품목 번호로 검색해 주세요"
            sx={{ flexGrow: 1 }}
            size="small"
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(e); }}
          />
        </div>

        {/* 돋보기 버튼 */}
        <Button
          type="submit"
          variant="contained"
          sx={{ ml: 1, py: '8px', px: '12px' }}
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
      {isLoading && <Typography sx={{ p: 2 }}>출고 가능 원자재 품목을 불러오는 중입니다...</Typography>}
      {error && <Typography color="error" sx={{ p: 2 }}>에러: {error}</Typography>}
      {!isLoading && !error && filteredAndSearchedItems.length === 0 && (
        <Typography sx={{ p: 2 }}>조회된 출고 가능 원자재 품목이 없습니다.</Typography>
      )}


      {/* 테이블 영역 */}
      {!isLoading && !error && filteredAndSearchedItems.length > 0 && (
        <div style={common.tableContainer}>
          <table style={{ ...common.table, fontSize: '13px' }}>
            <thead>
              <tr>
                <th style={{ ...common.th(true, false), width: '15%', padding: '10px' }}>매입처명</th>
                <th style={{ ...common.th(false, false), width: '10%', padding: '10px' }}>품목 번호</th>
                <th style={{ ...common.th(false, false), width: '20%', padding: '10px' }}>품목명</th>
                <th style={{ ...common.th(false, false), width: '10%', padding: '10px' }}>원자재 규격</th>
                <th style={{ ...common.th(false, false), width: '10%', padding: '10px' }}>제조사</th>
                <th style={{ ...common.th(false, false), width: '10%', padding: '10px' }}>재고량</th>
                <th style={{ ...common.th(false, false), width: '10%', padding: '10px' }}>출고 수량</th>
                <th style={{ ...common.th(false, false), width: '10%', padding: '10px' }}>출고 일자</th>
                <th style={{ ...common.th(false, true), width: '5%', padding: '10px' }}>등록</th>
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
                  <td style={{ ...common.td, padding: '8px' }}>{item.currentStock} {item.unit}</td> {/* 재고량과 단위 */}
                  <td style={{ ...common.td, padding: '8px' }}>
                    <TextField
                      type="number"
                      size="small"
                      inputProps={{ min: 1, max: item.currentStock }} // 최대 출고 수량을 재고량으로 제한
                      value={outboundInputs[item.rawsItemId]?.qty || ''}
                      onChange={(e) => handleInputChange(item.rawsItemId, 'qty', e.target.value)}
                      error={!!outboundInputs[item.rawsItemId]?.errors?.qty}
                      helperText={outboundInputs[item.rawsItemId]?.errors?.qty}
                      sx={{ '& .MuiInputBase-input': { p: '6px 8px', fontSize: '13px' }, minWidth: '70px' }}
                    />
                  </td>
                  <td style={{ ...common.td, padding: '8px' }}>
                    <DatePicker
                      selected={outboundInputs[item.rawsItemId]?.outboundDate ? parseISO(outboundInputs[item.rawsItemId].outboundDate) : null}
                      onChange={(date) => handleDateChange(item.rawsItemId, 'outboundDate', date)}
                      dateFormat="yyyy-MM-dd"
                      customInput={
                        <TextField
                          size="small"
                          fullWidth
                          error={!!outboundInputs[item.rawsItemId]?.errors?.outboundDate}
                          helperText={outboundInputs[item.rawsItemId]?.errors?.outboundDate}
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

      {/* 📥 엑셀 다운로드 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button style={history.excelButton} onClick={handleExcelDownload}>
          📥 EXCEL 다운로드
        </button>
      </div>

      {/* 🔢 페이징 */}
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

export default RawItemOutboundPage;