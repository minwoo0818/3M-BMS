import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCommonStyles } from "../style/useCommonStyles";

import { getAllRawsItems, updateRawsItemStatus } from '../apis/rawsItemsApi'; // API 함수 import!
import type { RawsItemPartialData } from '../types/RawsItemTypes'; // RawsItemPartialData 타입 import!
import { Box, Typography, Button } from "@mui/material"; // MUI 컴포넌트 추가

// ====================================================================
// 컴포넌트 본체
// ====================================================================
const ITEMS_PER_PAGE = 5; // 페이지당 항목 수

const RawItemList = () => {
  const styles = useCommonStyles();
  const navigate = useNavigate();

  const [rawItems, setRawItems] = useState<RawsItemPartialData[]>([]); // API에서 가져올 실제 원자재 데이터
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState<string | null>(null); // 에러 상태
  const [searchField, setSearchField] = useState("total");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeFilterStatus, setActiveFilterStatus] = useState<"Y" | "N">("Y"); // 거래상태 필터링을 위한 상태
  const [filteredAndSearchedItems, setFilteredAndSearchedItems] = useState<RawsItemPartialData[]>([]); // 필터링된/검색된 아이템
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null); // 호버된 row ID

  // --- API 호출 함수 (원자재 목록 불러오기) ---
  const fetchRawsItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllRawsItems(); // 모든 원자재 목록 가져오기
      setRawItems(data);
    } catch (err: any) {
      console.error('원자재 목록을 불러오는데 실패했습니다:', err);
      if (err.response && err.response.data && typeof err.response.data === 'object') {
        const errorDetail = Object.values(err.response.data).join(', ');
        setError(`데이터 로드 실패: ${errorDetail}`);
      } else {
        setError('원자재 데이터를 불러오는 중 오류가 발생했습니다.');
      }
      setRawItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 원자재 목록 불러오기
  useEffect(() => {
    fetchRawsItems();
  }, [fetchRawsItems]);


  // --- 거래상태 토글 기능 (백엔드 API 연동) ---
  const handleToggleStatus = useCallback(async (rawsItemId: number) => {
    // 현재 원자재 목록에서 해당 아이템의 현재 active 상태를 찾기
    const itemToUpdate = rawItems.find(item => item.rawsItemId === rawsItemId);
    if (!itemToUpdate) {
        console.error('업데이트할 원자재를 찾을 수 없습니다. ID:', rawsItemId);
        alert('원자재 정보를 찾을 수 없습니다.');
        return;
    }
    const currentStatus = itemToUpdate.active; // 현재 상태

    try {
        // 백엔드 API 호출하여 상태 업데이트
        const updatedBackendItem = await updateRawsItemStatus(rawsItemId, !currentStatus);

        // 백엔드에서 받은 최신 정보로 프론트엔드 상태 업데이트
        setRawItems((prev) =>
            prev.map((item) => (item.rawsItemId === rawsItemId ? { ...item, active: updatedBackendItem.active } : item))
        );
        alert(`원자재 "${updatedBackendItem.itemName}"의 상태가 ${updatedBackendItem.active ? "거래 중" : "거래 중지"}로 변경되었습니다.`);
    } catch (err: any) {
        console.error('원자재 상태 업데이트 실패:', err);
        if (err.response && err.response.data && typeof err.response.data === 'object') {
            const errorDetail = Object.values(err.response.data).join(', ');
            alert(`상태 변경 실패: ${errorDetail}`);
        } else {
            alert("원자재 상태 변경 중 오류가 발생했습니다.");
        }
    }
  }, [rawItems]);


  // --- 검색 및 필터링 로직 (프론트엔드) ---
  const applySearchAndFilter = useCallback(() => {
    const keyword = searchKeyword.toLowerCase().trim();

    const filtered = rawItems.filter((item) => {
      // 1. 거래상태 필터링 (최우선)
      if (searchField === "active") {
        const isActive = activeFilterStatus === "Y";
        return item.active === isActive;
      }

      // 2. 검색어 필터링 (searchField가 "active"가 아니고, 키워드가 있을 때)
      if (!keyword) return true; // 키워드가 없으면 모든 아이템 반환

      if (searchField === "total") {
        return (
          item.itemName.toLowerCase().includes(keyword) ||
          item.itemCode.toLowerCase().includes(keyword) ||
          item.supplierName.toLowerCase().includes(keyword) // supplierName 사용
        );
      }
      if (searchField === "itemName")
        return item.itemName.toLowerCase().includes(keyword);
      if (searchField === "itemCode")
        return item.itemCode.toLowerCase().includes(keyword);
      if (searchField === "supplierName") // supplierName 사용
        return item.supplierName.toLowerCase().includes(keyword);
      
      return true; // 기본값
    });

    setFilteredAndSearchedItems(filtered);
    setCurrentPage(1); // 검색/필터 변경 시 페이지 초기화
  }, [rawItems, searchKeyword, searchField, activeFilterStatus]);

  // rawItems 데이터가 변경되거나 검색/필터 조건이 변경될 때마다 필터링 재실행
  useEffect(() => {
      applySearchAndFilter();
  }, [rawItems, applySearchAndFilter]);


  // --- 검색 버튼 클릭 핸들러 ---
  const handleSearch = () => {
    applySearchAndFilter(); // 검색 버튼 클릭 시 필터링 로직 적용
  };

  // --- 검색 필드 변경 핸들러 ---
  const handleSearchFieldChange = (newField: string) => {
    setSearchField(newField);
    if (newField === "active") {
      // "active" 필드 선택 시 검색어 입력 필드 초기화 및 기본값 설정
      setSearchKeyword(""); 
      setActiveFilterStatus("Y"); 
    } else {
      // 다른 필드 선택 시 검색어 초기화
      setSearchKeyword("");
    }
    setCurrentPage(1); // 검색 필드 변경 시 페이지 초기화
  };

  // --- ⭐️ 거래상태 필드 렌더링 함수 ---
  const renderActiveFilterInput = () => {
    if (searchField === "active") {
      return (
        <select
          style={{ ...styles.input, width: "100%", border: "none" }}
          value={activeFilterStatus}
          onChange={(e) => setActiveFilterStatus(e.target.value as "Y" | "N")}
        >
          <option value="Y">거래 중</option> {/* active가 true */}
          <option value="N">거래 중지</option> {/* active가 false */}
        </select>
      );
    }
    return (
      <input
        type="text"
        style={{ ...styles.input, width: "100%", border: "none" }}
        placeholder="검색어를 입력해주세요."
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
      />
    );
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


  // --- 테이블 렌더링 함수 ---
  const renderTableBody = () => {
    if (isLoading) {
      return (
        <tr key="loading">
          <td colSpan={7} style={styles.td}>데이터를 불러오는 중입니다...</td>
        </tr>
      );
    }
    if (error) {
      return (
        <tr key="error">
          <td colSpan={7} style={styles.td}>{error}</td>
        </tr>
      );
    }
    if (currentItems.length === 0) {
      return (
        <tr key="no-data">
          <td colSpan={7} style={styles.td}>조회된 원자재 품목이 없습니다.</td>
        </tr>
      );
    }

    return currentItems.map((item, index) => {
        const isHovered = hoveredRowId === item.rawsItemId;
        return (
            <tr 
                key={item.rawsItemId} // 고유 ID 사용
                style={{...styles.tableRow, ...(isHovered ? styles.tdHover : {})}}
                onMouseEnter={() => setHoveredRowId(item.rawsItemId)}
                onMouseLeave={() => setHoveredRowId(null)}
            >
                <td style={{ ...styles.td, width: '5%', ...styles.tdCenter }}>
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                </td>
                
                {/* 품목명 (상세 보기 링크 역할) */}
                <td style={{ ...styles.td, width: '15%', ...styles.tdCenter }}>
                    <button
                        style={{
                            background: 'none',
                            border: 'none',
                            textDecoration: 'underline',
                            fontSize: '1em',
                            color: '#3b82f6',
                            cursor: 'pointer',
                            padding: 0,
                            lineHeight: 1.5,
                        }}
                        onClick={() => navigate(`/raw/item/detail/${item.rawsItemId}`)} // 상세 페이지로 이동
                    >
                        {item.itemName}
                    </button>
                </td>
                
                <td style={{ ...styles.td, width: '15%', ...styles.tdCenter }}>{item.itemCode}</td>
                <td style={{ ...styles.td, width: '15%', ...styles.tdCenter }}>{item.classification}</td>
                <td style={{ ...styles.td, width: '15%', ...styles.tdCenter }}>{item.supplierName}</td> {/* supplierName 사용 */}
                <td style={{ ...styles.td, width: '15%', ...styles.tdCenter }}>{item.manufacturer}</td>
                
                {/* 거래상태 (토글 버튼) */}
                <td style={{ ...styles.td, width: '15%', ...styles.tdCenter }}>
                    <button
                        style={styles.actionButton(item.active ? '#ed6c02' : '#2e7d32')} 
                        onClick={() => handleToggleStatus(item.rawsItemId)}
                    >
                        {item.active ? "거래종료" : "거래재개"}
                    </button>
                </td>
            </tr>
        );
    });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>원자재 관리 - 조회</h1>

      {/* 검색 영역 */}
      <div style={styles.searchContainer}>
        <div style={styles.searchGroup}>
          <select
            style={styles.searchSelect}
            value={searchField}
            onChange={(e) => handleSearchFieldChange(e.target.value)}
          >
            <option value="total">전체</option>
            <option value="supplierName">매입처</option> {/* supplierName으로 변경 */}
            <option value="itemCode">품목번호</option>
            <option value="itemName">품목명</option>
            <option value="active">거래상태</option>
          </select>
          {renderActiveFilterInput()} {/* ⭐️ 검색 필드에 따라 다른 입력 렌더링 */}
        </div>
        <button type="button" style={styles.searchButton} onClick={handleSearch} aria-label="검색">
            <svg style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </button>
        <button type="button" onClick={() => navigate('/raw/item/register')} style={{ ...styles.searchButton, background: '#007bff', marginLeft: '10px', borderRadius: '8px', width: 'auto', height: 'auto', padding: '8px 16px', fontSize: '14px' }}>
          원자재 신규 등록
        </button>
      </div>

      {/* 총 조회 건수 */}
      <p style={{fontSize: '14px', color: '#4b5563', fontWeight: '500', marginBottom: '8px'}}>
        총 <span style={{color: '#3b82f6', fontWeight: 'bold'}}>{filteredAndSearchedItems.length.toLocaleString()}</span>건 조회됨
      </p>

      {/* 4. 데이터 테이블 */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={{ ...styles.th(true, false), width: '5%' }}>번호</th>
              <th style={{ ...styles.th(false, false), width: '15%' }}>품목명</th>
              <th style={{ ...styles.th(false, false), width: '15%' }}>품목번호</th>
              <th style={{ ...styles.th(false, false), width: '15%' }}>분류</th>
              <th style={{ ...styles.th(false, false), width: '15%' }}>매입처</th>
              <th style={{ ...styles.th(false, false), width: '15%' }}>제조사</th>
              <th style={{ ...styles.th(false, true), width: '20%' }}>거래상태</th> {/* 너비 조정 */}
            </tr>
          </thead>
          <tbody>
            {renderTableBody()}
          </tbody>
        </table>
      </div>

      {/* 5. 페이징 UI 구현 */}
      <div style={styles.paginationContainer}>
        <button 
          style={styles.pageButton(false)}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          이전
        </button>

        {/* 페이지 번호 렌더링 */}
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
    </div>
  );
};

export default RawItemList;