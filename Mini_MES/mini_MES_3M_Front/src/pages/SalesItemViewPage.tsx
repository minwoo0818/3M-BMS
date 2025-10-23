import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useCommonStyles } from "../style/useCommonStyles";
import { useSalesHistoryStyles } from "../style/useSalesHistoryStyles";
import { useNavigate } from "react-router-dom";
// 아래 두 API는 외부 파일이므로 임의로 타입과 함수명을 추정합니다.
import { fetchSalesItems, updateSalesItemActive } from "../api/salesItemApi"; 
import type { SalesItem } from "../api/salesItemApi";

interface ItemData extends SalesItem {
  ACTIVE: "Y" | "N";
  price: string;
  coatingMethod: string;
  remark: string;
}

const SalesItemViewPage: React.FC = () => {
  const navigate = useNavigate();
  const common = useCommonStyles();
  const history = useSalesHistoryStyles();

  const [data, setData] = useState<ItemData[]>([]);
  const [searchType, setSearchType] = useState("전체");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // -------------------------------
  // 1. 데이터 fetch (수정된 부분)
  // -------------------------------
  useEffect(() => {
    const getData = async () => {
      try {
        const items = await fetchSalesItems();
        
        // ⭐ 수정된 부분: items가 배열이 아닐 경우 빈 배열로 대체하여 .map() 오류 방지
        const safeItems = Array.isArray(items) ? items : []; 

        const mapped: ItemData[] = safeItems.map((item) => ({
          ...item,
          ACTIVE: item.active ? "Y" : "N",
          // price가 number 타입이라고 가정하고, null/undefined 체크를 추가합니다.
          price: item.price ? `${item.price.toLocaleString()}원` : "0원",
          coatingMethod: item.coatingMethod || "",
          remark: item.remark || "",
        }));
        setData(mapped);
      } catch (err) {
        // API 통신 자체에서 오류가 발생했을 경우
        console.error("데이터 조회 실패:", err);
        setData([]); // 실패 시 데이터를 빈 배열로 초기화하여 렌더링 오류 방지
      }
    };
    getData();
  }, []);

  // -------------------------------
  // 2. 검색 기능
  // -------------------------------
  const handleSearch = useCallback(() => {
    setSearchTerm(searchKeyword);
    setCurrentPage(1);
  }, [searchKeyword]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const filteredData = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();
    if (!keyword && searchType === "전체") return data;

    return data.filter((item) => {
      const partnerName = item.partnerName || ""; 
      const itemName = item.itemName || "";
      const itemCode = item.itemCode || "";
      const isMatch = (value: string) => value.toLowerCase().includes(keyword);

      switch (searchType) {
        case "partnerName":
          return isMatch(partnerName);
        case "itemName":
          return isMatch(itemName);
        case "itemCode":
          return isMatch(itemCode);
        case "ACTIVE_Y":
          return item.ACTIVE === "Y";
        case "ACTIVE_N":
          return item.ACTIVE === "N";
        default:
          return (
            isMatch(item.partnerName) ||
            isMatch(item.itemName) ||
            isMatch(item.itemCode)
          );
      }
    });
  }, [data, searchType, searchTerm]);

  // -------------------------------
  // 3. 거래 상태 토글
  // -------------------------------
  const handleToggleStatus = async (salesItemId: number) => {
    const target = data.find((item) => item.salesItemId === salesItemId);
    if (!target) return;

    const newStatus = target.ACTIVE === "Y" ? false : true;

    try {
      await updateSalesItemActive(salesItemId, newStatus);

      setData((prev) =>
        prev.map((item) =>
          item.salesItemId === salesItemId
            ? { ...item, ACTIVE: newStatus ? "Y" : "N" }
            : item
        )
      );
    } catch (err) {
      console.error("거래 상태 변경 실패:", err);
    }
  };

  const handleExcelDownload = () => {
    console.log("엑셀 다운로드");
  };

  const handleItemClick = (salesItemId: number) => {
    navigate(`/sales/item/detail/${salesItemId}`);
  };
  // -------------------------------
  // 4. 렌더링
  // -------------------------------
  return (
    <div style={common.container}>
      <h1 style={common.header}>수주품목관리 - 조회</h1>

      {/* 검색 영역 */}
      <div style={common.searchContainer}>
        <div style={common.searchGroup}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              style={common.searchSelect}
            >
              <option value="전체">전체</option>
              <option value="partnerName">거래처명</option>
              <option value="itemName">품목명</option>
              <option value="itemCode">품목번호</option>
              <option value="ACTIVE_Y">거래중(Y)</option>
              <option value="ACTIVE_N">거래중지(N)</option>
            </select>
            <span
              style={{
                position: "absolute",
                right: "10px",
                pointerEvents: "none",
                fontSize: "12px",
                color: "#6b7280",
              }}
            >
              ▼
            </span>
          </div>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="거래처명, 품목명, 품목 번호로 검색해 주세요"
            style={history.searchInput}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
        <button type="submit" style={common.searchButton} onClick={handleSearch}>
          🔍
        </button>
      </div>

      {/* 테이블 영역 */}
      <div style={common.tableContainer}>
        <table style={{ ...common.table, fontSize: "13px" }}>
          <thead>
            <tr>
              <th style={{ ...common.th(true, false), width: "30px" }}>No.</th>
              <th style={{ ...common.th(true, false), width: "120px" }}>거래처명</th>
              <th style={{ ...common.th(false, false), width: "120px" }}>품목 번호</th>
              <th style={{ ...common.th(false, false), width: "140px" }}>품목명</th>
              <th style={{ ...common.th(false, false), width: "90px" }}>분류</th>
              <th style={{ ...common.th(true, false), width: "120px" }}>단가(개 당)</th>
              <th style={{ ...common.th(true, false), width: "120px" }}>도장방식</th>
              <th style={{ ...common.th(false, false), width: "250px" }}>비고</th>
              <th style={{ ...common.th(false, false), width: "250px" }}>거래현황</th>
            </tr>
          </thead>
          <tbody>
            {/* filteredData는 useMemo에서 data를 기반으로 하므로, data가 빈 배열이면 안전합니다. */}
            {filteredData.map((row, index) => (
              <tr key={row.salesItemId ?? `row-${index}`}>
                <td style={{ ...common.td }}>{index + 1}</td>
                <td style={{ ...common.td }}>{row.partnerName}</td>
                <td style={{ ...common.td }}>{row.itemCode}</td>
                <td
                  style={{
                    ...common.td,
                    cursor: "pointer",
                    color: "#2563eb",
                    fontWeight: "bold",
                    textDecoration: "underline",
                  }}
                  onClick={() => handleItemClick(row.salesItemId)}
                >
                  {row.itemName}
                </td>
                <td style={{ ...common.td }}>{row.classification}</td>
                <td style={{ ...common.td }}>{row.price}</td>
                <td style={{ ...common.td }}>{row.coatingMethod}</td>
                <td style={{ ...common.td }}>{row.remark}</td>
                <td style={{ ...common.td, textAlign: "center" }}>
                  {row.ACTIVE === "Y" ? (
                    <button
                      style={{
                        ...common.actionButton("#ef4444"),
                        backgroundColor: "white",
                        color: "#ef4444",
                        border: "1px solid #ef4444",
                        fontSize: "13px",
                        padding: "6px 10px",
                        height: "32px",
                        minWidth: "90px",
                      }}
                      onClick={() => handleToggleStatus(row.salesItemId)}
                    >
                      거래종료
                    </button>
                  ) : (
                    <button
                      style={{
                        ...common.actionButton("#22c55e"),
                        backgroundColor: "white",
                        color: "#22c55e",
                        border: "1px solid #22c55e",
                        fontSize: "13px",
                        padding: "6px 10px",
                        height: "32px",
                        minWidth: "90px",
                      }}
                      onClick={() => handleToggleStatus(row.salesItemId)}
                    >
                      거래재개
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 엑셀 다운로드 & 페이지네이션 */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
        <button style={history.excelButton} onClick={handleExcelDownload}>
          📥 EXCEL 다운로드
        </button>
      </div>

      <div style={common.paginationContainer}>
        {[1, 2, 3].map((page) => (
          <button
            key={`page-${page}`}
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

export default SalesItemViewPage;