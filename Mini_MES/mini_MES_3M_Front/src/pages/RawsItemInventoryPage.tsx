import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useCommonStyles } from '../style/useCommonStyles';
// import { useProcessStyles } from '../style/useProcessStyles'; // 사용되지 않아 주석 처리
import { useSalesHistoryStyles } from '../style/useSalesHistoryStyles'; // 엑셀 다운로드 버튼 스타일용

import { getRawItemInventoryStatus } from '../api/inventoryApi'; // 재고 조회 API 임포트
import type { RawItemInventoryItem, RawItemInventorySearchOption, RawItemInventorySearchOptionKey } from '../types/RawItemInventoryTypes'; // 타입 임포트
import { Box, Button, MenuItem, Select, TextField, Typography } from '@mui/material';

const ITEMS_PER_PAGE = 10; // 페이지당 항목 수

// 검색 옵션 목록
const INVENTORY_SEARCH_OPTIONS: RawItemInventorySearchOption[] = [
  { key: 'all', label: '전체' },
  { key: 'supplierName', label: '매입처명' },
  { key: 'itemName', label: '품목명' },
  { key: 'itemCode', label: '품목번호' },
];

const RawItemInventoryPage: React.FC = () => {
  const common = useCommonStyles();
  // const process = useProcessStyles(); // 사용되지 않아 주석 처리
  const history = useSalesHistoryStyles(); // 엑셀 다운로드 버튼 스타일용

  const [inventoryItems, setInventoryItems] = useState<RawItemInventoryItem[]>([]); // 실제 재고 데이터
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 검색 상태
  const [searchType, setSearchType] = useState<RawItemInventorySearchOptionKey>('all');
  const [searchKeyword, setSearchKeyword] = useState(''); // 입력 필드 검색어
  const [activeSearchTerm, setActiveSearchTerm] = useState(''); // 실제 적용될 검색어 (검색 버튼/Enter 시 업데이트)

  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null); // 행 호버 상태

  // --- API 호출 함수: 재고 현황 목록 조회 ---
  const fetchInventoryStatus = useCallback(async (keyword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRawItemInventoryStatus(keyword); // 키워드를 인자로 받음
      setInventoryItems(data);
    } catch (err: any) {
      console.error('원자재 재고 현황을 불러오는데 실패했습니다:', err);
      if (err.response && err.response.data && typeof err.response.data === 'object') {
        const errorDetail = Object.values(err.response.data).join(', ');
        setError(`데이터 로드 실패: ${errorDetail}`);
      } else {
        setError('원자재 재고 현황을 불러오는 중 오류가 발생했습니다.');
      }
      setInventoryItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []); // 의존성 배열에서 searchType 제거 (백엔드가 단일 키워드로 여러 필드 검색)


  // 초기 로드 및 activeSearchTerm 변경 시 데이터 호출
  useEffect(() => {
    fetchInventoryStatus(activeSearchTerm);
  }, [activeSearchTerm, fetchInventoryStatus]); // activeSearchTerm이 변경될 때만 다시 불러오기


  // --- 검색 버튼 핸들러 ---
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // 기본 폼 제출 방지
    setCurrentPage(1); // 검색 시 페이지 초기화
    setActiveSearchTerm(searchKeyword); // 입력된 검색어를 실제 검색어로 적용
  };

  // --- 검색 타입 변경 핸들러 ---
  const handleSearchTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchType(e.target.value as RawItemInventorySearchOptionKey);
    // 검색 타입 변경 시 activeSearchTerm에 영향을 주지 않고, 검색 시 프론트에서 필터링하거나
    // 다음 검색 시 새로운 타입으로 검색 (현재 백엔드는 단일 키워드 검색이므로 프론트 필터링 필요)
  }, []);


  // --- 필터링된 데이터 (프론트엔드에서 검색 타입에 따라 추가 필터링) ---
  const filteredAndSearchedItems = useMemo(() => {
    const keywordLower = activeSearchTerm.toLowerCase().trim(); // 실제 적용된 검색어 사용

    if (!keywordLower || searchType === 'all') {
      return inventoryItems; // 검색어가 없거나 '전체' 검색이면 모든 데이터 반환
    }

    return inventoryItems.filter(item => {
      switch(searchType) {
        case 'supplierName': return item.supplierName.toLowerCase().includes(keywordLower);
        case 'itemCode': return item.itemCode.toLowerCase().includes(keywordLower);
        case 'itemName': return item.itemName.toLowerCase().includes(keywordLower);
        default: return false; // 해당 searchType이 없을 경우
      }
    });
  }, [inventoryItems, searchType, activeSearchTerm]); // activeSearchTerm을 의존성에 추가


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
      <h1 style={common.header}>원자재품목 - 재고현황</h1>

      {/* 🔍 검색 영역 */}
      <Box component="form" onSubmit={handleSearch} sx={common.searchContainer}>
        <div style={common.searchGroup}>
          <Select
            value={searchType}
            onChange={handleSearchTypeChange}
            sx={{ width: 150, mr: 1 }}
            size="small"
            displayEmpty
          >
            {INVENTORY_SEARCH_OPTIONS.map((option) => (
              <MenuItem key={option.key} value={option.key}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          <TextField
            type="text"
            value={searchKeyword} // 입력 필드는 searchKeyword에 바인딩
            onChange={(e) => setSearchKeyword(e.target.value)} // searchKeyword 업데이트
            placeholder="매입처명, 품목명, 품목 번호로 검색해 주세요"
            sx={{ flexGrow: 1 }}
            size="small"
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(e); }}
          />
        </div>

        {/* 돋보기 검색 버튼 */}
        <Button type="submit" variant="contained" sx={{ ml: 1, py: '8px', px: '12px' }}>
          <svg
            style={{ width: '20px', height: '20px' }}
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
      {isLoading && <Typography sx={{ p: 2 }}>재고 현황을 불러오는 중입니다...</Typography>}
      {error && <Typography color="error" sx={{ p: 2 }}>에러: {error}</Typography>}
      {!isLoading && !error && inventoryItems.length === 0 && (
        <Typography sx={{ p: 2 }}>조회된 재고 품목이 없습니다.</Typography>
      )}

      {/* 📋 테이블 영역 */}
      {!isLoading && !error && filteredAndSearchedItems.length > 0 && (
        <div style={common.tableContainer}>
          <table style={{ ...common.table, fontSize: '13px' }}>
            <thead>
              <tr>
                <th style={{ ...common.th(true, false), width: '5%', padding: '10px' }}>No.</th>
                <th style={{ ...common.th(false, false), width: '20%', padding: '10px' }}>매입처명</th>
                <th style={{ ...common.th(false, false), width: '15%', padding: '10px' }}>품목번호</th>
                <th style={{ ...common.th(false, false), width: '30%', padding: '10px' }}>품목명</th>
                <th style={{ ...common.th(false, true), width: '30%', padding: '10px' }}>재고량</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((row, idx) => (
                <tr
                  key={row.inventoryId} // 고유 ID 사용
                  style={{
                    ...common.tableRow,
                    ...(hoveredRowId === row.inventoryId ? common.tdHover : {}),
                  }}
                  onMouseEnter={() => setHoveredRowId(row.inventoryId)}
                  onMouseLeave={() => setHoveredRowId(null)}
                >
                  <td style={{ ...common.td, padding: '8px' }}>{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                  <td style={{ ...common.td, padding: '8px' }}>{row.supplierName}</td>
                  <td style={{ ...common.td, padding: '8px' }}>{row.itemCode}</td>
                  <td style={{ ...common.td, padding: '8px' }}>{row.itemName}</td>
                  <td style={{ ...common.td, padding: '8px' }}>{`${row.currentQty} ${row.unit ? row.unit : ''}`}</td> {/* 단위가 있다면 표시 */}
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

export default RawItemInventoryPage;