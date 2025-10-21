import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useCommonStyles } from '../style/useCommonStyles';
// import { useProcessStyles } from '../style/useProcessStyles'; // 현재 사용되지 않아 주석 처리
import { useSalesHistoryStyles } from '../style/useSalesHistoryStyles';

import { getEligibleSalesItemsForInbound, registerSalesInbound } from '../api/salesItemInboundApi';
import type { SalesItemInboundEligibleItem } from '../types/SalesItemInboundTypes';
import { Typography } from '@mui/material';

const ITEMS_PER_PAGE = 10; // 페이지당 항목 수

const SalesItemInboundPage: React.FC = () => {
  const common = useCommonStyles();
  // const process = useProcessStyles(); // 현재 사용되지 않아 주석 처리
  const history = useSalesHistoryStyles();

  const [eligibleItems, setEligibleItems] = useState<SalesItemInboundEligibleItem[]>([]); // API에서 불러온 품목 목록
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchField, setSearchField] = useState('전체'); // "전체", "partnerName", "itemName", "itemCode"
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredItemId, setHoveredItemId] = useState<number | null>(null); // 호버된 품목 ID

  // 각 품목별 입고 수량 및 입고 일자 상태 관리
  // { salesItemId: { qty: string, date: string, qtyError: boolean } }
  const [inboundInputs, setInboundInputs] = useState<{ 
    [salesItemId: number]: { qty: string, date: string, qtyError: boolean } 
  }>({});

  // --- API 호출 함수: 입고 가능 품목 목록 조회 ---
  const fetchEligibleItems = useCallback(async (keyword?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getEligibleSalesItemsForInbound(keyword);
      setEligibleItems(data);
      // 입고 입력 상태 초기화 (처음 불러올 때)
      const initialInboundInputs: { [salesItemId: number]: { qty: string, date: string, qtyError: boolean } } = {};
      data.forEach(item => {
        initialInboundInputs[item.salesItemId] = { qty: '', date: '', qtyError: false };
      });
      setInboundInputs(initialInboundInputs);
    } catch (err: any) {
      console.error('입고 가능 품목 목록을 불러오는데 실패했습니다:', err);
      if (err.response && err.response.data && typeof err.response.data === 'object') {
        const errorDetail = Object.values(err.response.data).join(', ');
        setError(`데이터 로드 실패: ${errorDetail}`);
      } else {
        setError('품목 목록을 불러오는 중 오류가 발생했습니다.');
      }
      setEligibleItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 품목 목록 불러오기 (초기 검색어 없이)
  useEffect(() => {
    fetchEligibleItems();
  }, [fetchEligibleItems]);


  // --- 검색 로직 (프론트엔드에서 필터링) ---
  const filteredItems = useMemo(() => {
    const keywordLower = searchKeyword.toLowerCase().trim();
    if (!keywordLower || searchField === '전체') {
      return eligibleItems;
    }

    return eligibleItems.filter(item => {
      if (searchField === 'partnerName') {
        return item.partnerName.toLowerCase().includes(keywordLower);
      }
      if (searchField === 'itemCode') {
        return item.itemCode.toLowerCase().includes(keywordLower);
      }
      if (searchField === 'itemName') {
        return item.itemName.toLowerCase().includes(keywordLower);
      }
      return false; // 해당 searchField가 없을 경우
    });
  }, [eligibleItems, searchField, searchKeyword]);

  // --- 검색 버튼 핸들러 ---
  const handleSearch = () => {
    // 백엔드 API에서 키워드 검색을 지원하는 경우, 여기에서 fetchEligibleItems(searchKeyword) 호출
    // 현재 백엔드 API는 키워드 파라미터가 있지만, 검색 필드에 따라 프론트에서 필터링
    setCurrentPage(1); // 검색 시 페이지 초기화
    // setEligibleItems(eligibleItems); // 이미 필터링된 eligibleItems를 기반으로 filteredItems가 재계산됨
  };

  // --- 각 품목별 입고 수량/일자 변경 핸들러 ---
  const handleInputChange = (salesItemId: number, field: 'qty' | 'date', value: string) => {
    setInboundInputs(prev => ({
      ...prev,
      [salesItemId]: {
        ...prev[salesItemId],
        [field]: value,
        qtyError: field === 'qty' ? (value.trim() === '' || isNaN(Number(value)) || Number(value) <= 0) : prev[salesItemId]?.qtyError // 수량 유효성 검사 추가
      }
    }));
  };


  // --- 입고 등록 버튼 핸들러 ---
  const handleRegister = async (item: SalesItemInboundEligibleItem) => {
    const inputs = inboundInputs[item.salesItemId];
    if (!inputs || inputs.qty.trim() === '' || inputs.date.trim() === '') {
      alert("입고 수량과 입고 일자를 모두 입력해 주세요.");
      if(inputs) {
        setInboundInputs(prev => ({ // 수량이 비어있으면 에러 표시
          ...prev, 
          [item.salesItemId]: { ...prev[item.salesItemId], qtyError: (inputs.qty.trim() === '' || isNaN(Number(inputs.qty)) || Number(inputs.qty) <= 0) }
        }));
      }
      return;
    }

    const qty = Number(inputs.qty);
    if (isNaN(qty) || qty <= 0) {
      alert("유효한 입고 수량(1개 이상)을 입력해 주세요.");
      setInboundInputs(prev => ({ // 에러 표시
        ...prev, 
        [item.salesItemId]: { ...prev[item.salesItemId], qtyError: true }
      }));
      return;
    }

    try {
      const requestData = {
        salesItemId: item.salesItemId,
        qty: qty,
        receivedAt: inputs.date, // YYYY-MM-DD 형식
      };
      const response = await registerSalesInbound(requestData);
      console.log('입고 등록 성공:', response);
      alert(`[${item.itemName}] ${response.qty}개 입고 등록 완료!\nLOT 번호: ${response.inboundLOTNum}`);
      
      // 성공 후 목록 새로고침 및 입력 상태 초기화
      await fetchEligibleItems(); // 전체 목록 다시 불러와서 업데이트
      // setInboundInputs(prev => ({ // 해당 품목 입력 상태만 초기화 (전체 새로고침하면 알아서 됨)
      //   ...prev, 
      //   [item.salesItemId]: { qty: '', date: '', qtyError: false } 
      // }));

    } catch (err: any) {
      console.error('입고 등록 실패:', err);
      if (err.response && err.response.data && typeof err.response.data === 'object') {
        const errorDetail = Object.values(err.response.data).join(', ');
        alert(`입고 등록 실패: ${errorDetail}`);
      } else {
        alert('입고 등록 중 오류가 발생했습니다.');
      }
    }
  };


  // --- 페이징 로직 ---
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  return (
    <div style={common.container}>
      <h1 style={common.header}>수주품목 - 입고 등록</h1>

      {/* 검색 영역 */}
      <div style={common.searchContainer}>
        <div style={common.searchGroup}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              style={common.searchSelect}
            >
              <option value="전체">전체</option>
              <option value="partnerName">거래처명</option>
              <option value="itemName">품목명</option>
              <option value="itemCode">품목번호</option>
            </select>
            <span style={{
              position: 'absolute',
              right: '10px',
              pointerEvents: 'none',
              fontSize: '12px',
              color: '#6b7280'
            }}>▼</span>
          </div>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="거래처명, 품목명, 품목 번호로 검색해 주세요"
            style={history.searchInput}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
          />
        </div>
           {/* 돋보기 검색 버튼 */}
        <button type="button" style={common.searchButton} onClick={handleSearch}> {/* type="button"으로 변경 */}
            {/* 돋보기 SVG 아이콘 */}
            <svg style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </button>
      </div>

      {isLoading && <Typography sx={{ p: 2 }}>입고 가능 품목을 불러오는 중입니다...</Typography>}
      {error && <Typography color="error" sx={{ p: 2 }}>에러: {error}</Typography>}
      {!isLoading && !error && filteredItems.length === 0 && (
        <Typography sx={{ p: 2 }}>조회된 입고 가능 품목이 없습니다.</Typography>
      )}

      {/* 테이블 영역 */}
      {!isLoading && !error && filteredItems.length > 0 && (
        <div style={common.tableContainer}>
          <table style={{ ...common.table, fontSize: '13px' }}>
            <thead>
              <tr>
                <th style={{ ...common.th(true, false), width: '120px', padding: '10px' }}>거래처명</th>
                <th style={{ ...common.th(false, false), width: '120px', padding: '10px' }}>품목 번호</th>
                <th style={{ ...common.th(false, false), width: '140px', padding: '10px' }}>품목명</th>
                <th style={{ ...common.th(false, false), width: '90px', padding: '10px' }}>분류</th>
                <th style={{ ...common.th(false, false), width: '250px', padding: '10px' }}>비고</th>
                <th style={{ ...common.th(false, false), width: '100px', padding: '10px' }}>입고 수량</th>
                <th style={{ ...common.th(false, false), width: '100px', padding: '10px' }}>입고 일자</th>
                <th style={{ ...common.th(false, true), width: '80px', padding: '10px' }}></th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => (
                <tr 
                  key={item.salesItemId}
                  style={{
                      ...common.tableRow,
                      ...(hoveredItemId === item.salesItemId ? common.tdHover : {}),
                  }}
                  onMouseEnter={() => setHoveredItemId(item.salesItemId)}
                  onMouseLeave={() => setHoveredItemId(null)}
                >
                  <td style={{ ...common.td, width: '140px', padding: '8px' }}>{item.partnerName}</td>
                  <td style={{ ...common.td, width: '140px', padding: '8px' }}>{item.itemCode}</td>
                  <td style={{ ...common.td, width: '160px', padding: '8px' }}>{item.itemName}</td>
                  <td style={{ ...common.td, width: '100px', padding: '8px' }}>{item.classification}</td>
                  <td style={{ ...common.td, width: '200px', padding: '8px' }}>{item.remark}</td>
                  <td style={{ ...common.td, width: '100px', padding: '8px' }}>
                    <input
                      type="number" // 숫자만 입력 받도록 type 변경
                      min="1" // 최소 1개 이상
                      style={{
                        ...common.input,
                        width: '100%',
                        fontSize: '13px',
                        padding: '6px 8px',
                        height: '32px',
                        boxSizing: 'border-box',
                        borderColor: inboundInputs[item.salesItemId]?.qtyError ? 'red' : '#d1d5db' // 에러 시 테두리 색상 변경
                      }}
                      value={inboundInputs[item.salesItemId]?.qty || ''}
                      onChange={(e) => handleInputChange(item.salesItemId, 'qty', e.target.value)}
                    />
                  </td>
                  <td style={{ ...common.td, width: '100px', padding: '8px' }}>
                    <input
                      type="date" // 날짜 입력 받도록 type 변경
                      style={{
                        ...common.input,
                        width: '100%',
                        fontSize: '13px',
                        padding: '6px 8px',
                        height: '32px',
                        boxSizing: 'border-box'
                      }}
                      value={inboundInputs[item.salesItemId]?.date || ''}
                      onChange={(e) => handleInputChange(item.salesItemId, 'date', e.target.value)}
                    />
                  </td>
                  <td style={{ ...common.td, width: '80px', padding: '8px' }}>
                    <button 
                      style={{
                        ...common.actionButton('#3b82f6'), // 등록 버튼 파란색
                        width: 'auto', 
                        padding: '6px 10px', 
                        fontSize: '12px'
                      }} 
                      onClick={() => handleRegister(item)}
                    >
                      등록
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 페이징 UI 구현 */}
      {!isLoading && !error && filteredItems.length > 0 && (
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

export default SalesItemInboundPage;