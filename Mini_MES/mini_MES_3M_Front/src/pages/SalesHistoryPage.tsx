import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSalesHistoryStyles } from '../style/useSalesHistoryStyles';
import { useCommonStyles } from '../style/useCommonStyles';
import { Typography, Box, Button, TextField, Stack, Select, MenuItem, InputLabel, FormControl } from '@mui/material'; // Modal 관련 컴포넌트 제거
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parseISO, isValid } from 'date-fns'; // isValid import 추가

import { getSalesInboundHistory, updateSalesInboundHistory, cancelSalesInboundHistory } from '../api/salesItemInboundApi'; // getSalesInboundDetail 제거
import type { SalesInboundHistoryItem, SalesInboundUpdateRequest } from '../types/SalesItemInboundTypes'; // SalesInboundDetail 제거

// ==========================================================
// 1. 타입 정의
// ==========================================================
export type HistoryType = 'INBOUND' | 'OUTBOUND';

interface SearchOption {
  key: string;
  label: string;
}

// ==========================================================
// 2. 상수 정의
// ==========================================================
const ITEMS_PER_PAGE = 10;

// 입고 검색 옵션 목록
const INBOUND_SEARCH_OPTIONS: SearchOption[] = [
  { key: 'all', label: '전체' },
  { key: 'customerName', label: '거래처명' },
  { key: 'itemName', label: '품목명' },
  { key: 'itemCode', label: '품목번호' },
  { key: 'inboundLOTNum', label: '입고번호' },
  { key: 'receivedAt', label: '입고일자' },
];

const OUTBOUND_SEARCH_OPTIONS: SearchOption[] = [];


// ==========================================================
// 3. 컴포넌트 시작 (SalesHistoryQueryPage 컴포넌트로 명칭 변경)
// ==========================================================
export default function SalesHistoryQueryPage() {
  const { type: urlType } = useParams<{ type: string }>();
  const navigate = useNavigate();
  
  const currentHistoryType: HistoryType = 
    urlType?.toUpperCase() === 'OUTBOUND' ? 'OUTBOUND' : 'INBOUND';

  // ----------------------------------------------------
  // 상태 관리
  // ----------------------------------------------------
  const [inboundHistory, setInboundHistory] = useState<SalesInboundHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchKey, setSearchKey] = useState<string>('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);

  // --- 인라인 편집 관련 상태 ---
  const [editingInboundId, setEditingInboundId] = useState<number | null>(null); // 현재 편집 중인 입고 ID
  const [editingData, setEditingData] = useState<SalesInboundUpdateRequest | null>(null); // 편집 중인 데이터 (수량, 일자)
  const [editingErrors, setEditingErrors] = useState<{ qty?: string, receivedAt?: string, general?: string }>({}); // 인라인 편집 시 에러 메시지


  // --- 스타일 정의 ---
  const styles = {
    ...useCommonStyles(),
    ...useSalesHistoryStyles()
  };

  // --- 동적 설정 계산 (URL type에 의존) ---
  const { title, placeholder, searchOptions } = useMemo(() => {
    if (currentHistoryType === 'INBOUND') {
      return {
        title: '수주품목 입고 이력조회',
        placeholder: '거래처명, 품목명, 품목번호, 입고번호, 입고일자로 검색해주세요',
        searchOptions: INBOUND_SEARCH_OPTIONS,
      };
    } else {
      return {
        title: '수주품목 출고 이력조회 (구현 예정)',
        placeholder: '출고 이력 검색은 구현 예정입니다.',
        searchOptions: OUTBOUND_SEARCH_OPTIONS,
      };
    }
  }, [currentHistoryType]); 

  // ----------------------------------------------------
  // API 호출 함수
  // ----------------------------------------------------

  const fetchInboundHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSalesInboundHistory(searchTerm); 
      
      const filteredData = data.filter(item => {
        const lowerSearchTerm = searchTerm.toLowerCase().trim();
        if (!lowerSearchTerm || searchKey === 'all') return true;

        switch(searchKey) {
          case 'customerName': return item.customerName.toLowerCase().includes(lowerSearchTerm);
          case 'itemName': return item.itemName.toLowerCase().includes(lowerSearchTerm);
          case 'itemCode': return item.itemCode.toLowerCase().includes(lowerSearchTerm);
          case 'inboundLOTNum': return item.inboundLOTNum.toLowerCase().includes(lowerSearchTerm);
          case 'receivedAt': return item.receivedAt.toLowerCase().includes(lowerSearchTerm); 
          default: return true; 
        }
      });
      
      setInboundHistory(filteredData);
    } catch (err: any) {
      console.error('입고 이력을 불러오는데 실패했습니다:', err);
      setError('입고 이력을 불러오는 중 오류가 발생했습니다.');
      setInboundHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchKey, searchTerm]);


  useEffect(() => {
    if (currentHistoryType === 'OUTBOUND') {
      setIsLoading(false);
      setError('출고 이력조회는 구현 예정입니다.');
      setInboundHistory([]);
      return;
    }

    setSearchTerm('');
    setSearchKey('all');
    setCurrentPage(1);
    fetchInboundHistory();
  }, [currentHistoryType, fetchInboundHistory]);


  // ----------------------------------------------------
  // 검색 로직
  // ----------------------------------------------------
  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); 
    fetchInboundHistory();
  }, [fetchInboundHistory]);


  // ----------------------------------------------------
  // 인라인 편집 관련 로직
  // ----------------------------------------------------

  // 수정 버튼 클릭 시 인라인 편집 모드로 진입
  const handleEditClick = useCallback((item: SalesInboundHistoryItem) => {
    setEditingInboundId(item.inboundId);
    setEditingData({
      qty: item.qty,
      receivedAt: item.receivedAt,
    });
    setEditingErrors({}); // 에러 초기화
  }, []);

  // 인라인 입력 필드 변경 핸들러
  const handleInlineInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingData(prev => prev ? { ...prev, [name]: name === 'qty' ? Number(value) : value } : null);
    setEditingErrors(prev => ({ ...prev, [name]: undefined, general: undefined })); // 해당 필드 에러 초기화
  }, []);

  // 인라인 날짜 선택 변경 핸들러
  const handleInlineDateChange = useCallback((date: Date | null) => {
    if (date && isValid(date)) { // 유효한 날짜인지 확인
      setEditingData(prev => prev ? { ...prev, receivedAt: format(date, 'yyyy-MM-dd') } : null);
    } else {
      setEditingData(prev => prev ? { ...prev, receivedAt: '' } : null); // 날짜 선택이 취소되거나 유효하지 않으면 빈 문자열
    }
    setEditingErrors(prev => ({ ...prev, receivedAt: undefined, general: undefined }));
  }, []);

  // 저장 버튼 클릭 시 API 호출 및 상태 업데이트
  const handleSaveClick = async (inboundId: number) => {
    if (!editingData) return;

    // 클라이언트 측 유효성 검사
    const newErrors: { qty?: string, receivedAt?: string, general?: string } = {};
    if (isNaN(editingData.qty) || editingData.qty <= 0) {
      newErrors.qty = "입고 수량은 1개 이상이어야 합니다.";
    }
    if (!editingData.receivedAt || !isValid(parseISO(editingData.receivedAt))) {
      newErrors.receivedAt = "유효한 입고 일자를 선택해주세요.";
    }

    if (Object.keys(newErrors).length > 0) {
      setEditingErrors(newErrors);
      return;
    }
    setEditingErrors({}); // 에러 초기화

    try {
      await updateSalesInboundHistory(inboundId, editingData);
      alert('입고 이력이 성공적으로 수정되었습니다.');
      setEditingInboundId(null); // 편집 모드 종료
      setEditingData(null); // 편집 데이터 초기화
      fetchInboundHistory(); // 목록 새로고침
    } catch (err: any) {
      console.error('입고 이력 수정 실패:', err);
      if (err.response && err.response.data) {
        setEditingErrors({ general: err.response.data.message || '입고 이력 수정 중 오류가 발생했습니다.' });
      } else {
        setEditingErrors({ general: '입고 이력 수정 중 네트워크 오류가 발생했습니다.' });
      }
    }
  };

  // 취소 버튼 클릭 시 편집 모드 종료
  const handleCancelEditClick = useCallback(() => {
    setEditingInboundId(null);
    setEditingData(null);
    setEditingErrors({}); // 에러 초기화
  }, []);


  // --- 삭제(취소) 로직 ---
  const handleDelete = async (inboundId: number) => {
    if (!window.confirm("정말로 해당 입고 이력을 취소(삭제)하시겠습니까?\n취소된 입고 이력은 복구할 수 없습니다.")) {
      return;
    }

    try {
      await cancelSalesInboundHistory(inboundId);
      alert('입고 이력이 성공적으로 취소(삭제)되었습니다.');
      fetchInboundHistory(); // 목록 새로고침
    } catch (err: any) {
      console.error('입고 이력 취소 실패:', err);
      if (err.response && err.response.data && typeof err.response.data === 'object') {
        alert(`입고 이력 취소 실패: ${Object.values(err.response.data).join(', ')}`);
      } else {
        alert('입고 이력 취소 중 오류가 발생했습니다.');
      }
    }
  };

  // ----------------------------------------------------
  // 페이징 로직
  // ----------------------------------------------------
  const totalPages = Math.ceil(inboundHistory.length / ITEMS_PER_PAGE);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return inboundHistory.slice(startIndex, endIndex);
  }, [inboundHistory, currentPage]);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  // ----------------------------------------------------
  // 렌더링
  // ----------------------------------------------------
  return (
    <div style={styles.container}>
      {/* 타이틀 */}
      <h1 style={styles.header}>{title}</h1>

      {/* 검색 영역 */}
      <form onSubmit={handleSearchSubmit} style={styles.searchContainer}>
        <div style={styles.searchGroup}>
          <select
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            style={styles.searchSelect}
          >
            {searchOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            style={styles.searchInput}
          />
        </div>
        <button type="submit" style={styles.searchButton}>
          <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </button>
      </form>

      {/* 로딩/에러/데이터 없음 메시지 */}
      {isLoading && <Typography sx={{ p: 2 }}>데이터를 불러오는 중입니다...</Typography>}
      {error && <Typography color="error" sx={{ p: 2 }}>에러: {error}</Typography>}
      {!isLoading && !error && currentHistoryType === 'INBOUND' && inboundHistory.length === 0 && (
        <Typography sx={{ p: 2 }}>조회된 입고 이력이 없습니다.</Typography>
      )}
       {!isLoading && !error && currentHistoryType === 'OUTBOUND' && (
        <Typography sx={{ p: 2 }}>출고 이력조회는 구현 예정입니다.</Typography>
      )}


      {/* 테이블 영역 (INBOUND 타입일 때만) */}
      {!isLoading && !error && currentHistoryType === 'INBOUND' && inboundHistory.length > 0 && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={{ ...styles.th(true, false), width: '5%' }}>No.</th>
                <th style={{ ...styles.th(false, false), width: '10%' }}>거래처명</th>
                <th style={{ ...styles.th(false, false), width: '10%' }}>품목명</th>
                <th style={{ ...styles.th(false, false), width: '10%' }}>품목번호</th>
                <th style={{ ...styles.th(false, false), width: '10%' }}>분류</th>
                <th style={{ ...styles.th(false, false), width: '15%' }}>입고번호(LOT)</th>
                <th style={{ ...styles.th(false, false), width: '10%' }}>입고수량</th>
                <th style={{ ...styles.th(false, false), width: '10%' }}>입고일자</th>
                <th style={{ ...styles.th(false, false), width: '10%' }}>등록일자</th>
                <th style={{ ...styles.th(false, false), width: '5%' }}>취소여부</th>
                <th style={{ ...styles.th(false, true), width: '15%' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => {
                const isEditing = editingInboundId === item.inboundId; // 현재 행이 편집 모드인지 여부
                return (
                  <tr 
                    key={item.inboundId}
                    style={{
                      ...styles.tableRow,
                      ...(hoveredRowId === item.inboundId ? styles.tdHover : {}),
                      backgroundColor: item.isCancelled ? '#fcdede' : isEditing ? '#e8f5e9' : 'inherit' // 취소되거나 편집 중인 항목 배경색
                    }}
                    onMouseEnter={() => setHoveredRowId(item.inboundId)}
                    onMouseLeave={() => setHoveredRowId(null)}
                  >
                    <td style={styles.td}>{ (currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                    <td style={styles.td}>{item.customerName}</td>
                    <td style={styles.td}>{item.itemName}</td>
                    <td style={styles.td}>{item.itemCode}</td>
                    <td style={styles.td}>{item.classification}</td>
                    <td style={{
                       ...styles.td, 
                       width: '15%',
                       fontWeight: '500',
                       color: '#2563eb',
                       textDecoration: 'underline',
                       cursor: 'pointer'
                      }} 
                      onClick={() => navigate(`/ProcessRegister/${item.inboundId}`)}
                    >{item.inboundLOTNum}</td>

                    {/* 입고 수량 - 인라인 편집 */}
                    <td style={styles.td}>
                      {isEditing && editingData ? (
                        <TextField
                          type="number"
                          name="qty"
                          value={editingData.qty}
                          onChange={handleInlineInputChange}
                          size="small"
                          error={!!editingErrors.qty}
                          helperText={editingErrors.qty}
                          inputProps={{ min: 1 }}
                          sx={{ '& .MuiInputBase-input': { p: '6px 8px', fontSize: '13px' }, '& .MuiInputLabel-root': { top: '-5px' } }}
                        />
                      ) : (
                        item.qty
                      )}
                    </td>

                    {/* 입고 일자 - 인라인 편집 */}
                    <td style={styles.td}>
                      {isEditing && editingData ? (
                        <DatePicker
                          selected={editingData.receivedAt ? parseISO(editingData.receivedAt) : null}
                          onChange={handleInlineDateChange}
                          dateFormat="yyyy-MM-dd"
                          customInput={<TextField 
                                          size="small" 
                                          sx={{ '& .MuiInputBase-input': { p: '6px 8px', fontSize: '13px' }, '& .MuiInputLabel-root': { top: '-5px' } }}
                                          error={!!editingErrors.receivedAt}
                                          helperText={editingErrors.receivedAt}
                                        />}
                          wrapperClassName="date-picker-wrapper" // css 오버라이드를 위한 클래스명
                        />
                      ) : (
                        item.receivedAt
                      )}
                    </td>

                    <td style={styles.td}>{format(parseISO(item.createdAt), 'yyyy-MM-dd HH:mm')}</td>
                    <td style={styles.td}>{item.isCancelled ? 'Y' : 'N'}</td>
                    <td style={styles.td}>
                      <Stack direction="row" spacing={1} justifyContent="center">
                        {isEditing ? (
                          <>
                            <Button 
                              variant="contained" 
                              color="success" // 저장 버튼은 초록색
                              size="small" 
                              onClick={() => handleSaveClick(item.inboundId)}
                              sx={{ fontSize: '0.7rem' }}
                            >
                              저장
                            </Button>
                            <Button 
                              variant="outlined" 
                              size="small" 
                              onClick={handleCancelEditClick}
                              sx={{ fontSize: '0.7rem' }}
                            >
                              취소
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              variant="contained" 
                              color="primary" 
                              size="small" 
                              onClick={() => handleEditClick(item)}
                              disabled={item.isCancelled}
                              sx={{ fontSize: '0.7rem' }}
                            >
                              수정
                            </Button>
                            <Button 
                              variant="contained" 
                              color="error" 
                              size="small" 
                              onClick={() => handleDelete(item.inboundId)}
                              disabled={item.isCancelled}
                              sx={{ fontSize: '0.7rem' }}
                            >
                              삭제
                            </Button>
                          </>
                        )}
                      </Stack>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {editingErrors.general && ( // 일반 API 에러 메시지 표시 (테이블 하단 등)
              <Typography color="error" variant="body2" sx={{ mt: 2 }}>{editingErrors.general}</Typography>
          )}
        </div>
      )}

      {/* 페이징 UI */}
      {!isLoading && !error && currentHistoryType === 'INBOUND' && inboundHistory.length > 0 && (
        <div style={styles.paginationContainer}>
          <button 
            style={styles.pageButton(false)} 
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
                style={styles.pageButton(page === currentPage)}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          <button 
            style={styles.pageButton(false)}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}