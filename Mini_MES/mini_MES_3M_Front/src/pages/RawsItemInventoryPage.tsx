import React, { useState } from 'react';
import { useCommonStyles } from '../style/useCommonStyles';
import { useProcessStyles } from '../style/useProcessStyles';
import { useSalesHistoryStyles } from '../style/useSalesHistoryStyles';

const RawItemInventoryPage: React.FC = () => {
  const common = useCommonStyles();
  const process = useProcessStyles();
  const history = useSalesHistoryStyles();

  const [searchType, setSearchType] = useState('전체');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const data = [
    {
      id: '1',
      supplierName: '코드 하우스',
      itemCode: 'Code-001',
      itemName: '노란색 페인트',
      inventoryqty: '100L',
    },
  ];

  const handleSearch = () => {
    console.log('검색:', searchType, searchKeyword);
  };

  const handleExcelDownload = () => {
    console.log('엑셀 다운로드');
  };

  return (
    <div style={common.container}>
      <h1 style={common.header}>원자재품목 - 재고현황</h1>

      {/* 🔍 검색 영역 */}
      <div style={common.searchContainer}>
        <div style={common.searchGroup}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              style={common.searchSelect}
            >
              <option value="전체">전체</option>
              <option value="partnerName">매입처명</option>
              <option value="itemName">품목명</option>
              <option value="itemCode">품목번호</option>
            </select>
            <span
              style={{
                position: 'absolute',
                right: '10px',
                pointerEvents: 'none',
                fontSize: '12px',
                color: '#6b7280',
              }}
            >
              ▼
            </span>
          </div>

          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="매입처명, 품목명, 품목 번호로 검색해 주세요"
            style={history.searchInput}
          />
        </div>

        {/* 돋보기 검색 버튼 */}
        <button type="submit" style={common.searchButton} onClick={handleSearch}>
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
        </button>
      </div>

      {/* 📋 테이블 영역 */}
      <div style={common.tableContainer}>
        <table style={{ ...common.table, fontSize: '13px' }}>
          <thead>
            <tr>
              <th style={{ ...common.th(true, false), width: '120px', padding: '10px' }}>No.</th>
              <th style={{ ...common.th(false, false), width: '120px', padding: '10px' }}>매입처명</th>
              <th style={{ ...common.th(false, false), width: '140px', padding: '10px' }}>품목번호</th>
              <th style={{ ...common.th(false, false), width: '140px', padding: '10px' }}>품목명</th>
              <th style={{ ...common.th(false, false), width: '90px', padding: '10px' }}>재고량</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                <td style={{ ...common.td, padding: '8px' }}>{row.id}</td>
                <td style={{ ...common.td, padding: '8px' }}>{row.supplierName}</td>
                <td style={{ ...common.td, padding: '8px' }}>{row.itemCode}</td>
                <td style={{ ...common.td, padding: '8px' }}>{row.itemName}</td>
                <td style={{ ...common.td, padding: '8px' }}>{row.inventoryqty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📥 엑셀 다운로드 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button style={history.excelButton} onClick={handleExcelDownload}>
          📥 EXCEL 다운로드
        </button>
      </div>

      {/* 🔢 페이징 */}
      <div style={common.paginationContainer}>
        {[1, 2, 3].map((page) => (
          <button
            key={page}
            style={common.pageButton(currentPage === page)}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RawItemInventoryPage;
