import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCommonStyles } from "../style/useCommonStyles";
// 💡 useCommonStyles.ts 또는 .tsx 파일 필요 (수정 없음)

// ====================================================================
// 1. 데이터 구조 및 더미 데이터 (PartnerData, RawItem 등 정의는 동일)
// ====================================================================

interface PartnerData {
  id: number;
  partnerName: string;
  type: "customer" | "supplier";
}

const dummyPartners: PartnerData[] = [
  { id: 3, partnerName: "노루표", type: "supplier" },
  { id: 4, partnerName: "KCC", type: "supplier" },
];

interface RawItem {
  id: number;
  partnerId: number;
  itemName: string;
  itemCode: string;
  classification: string;
  color: string;
  unit: string;
  manufacturer: string;
  remark: string;
  active: boolean;
}

const dummyRawItems: RawItem[] = [
  {
    id: 1,
    partnerId: 3,
    itemName: "노루페인트",
    itemCode: "NORU-DEF10",
    classification: "페인트",
    color: "빨강",
    unit: "10kg",
    manufacturer: "노루",
    remark: "주력 품목",
    active: true,
  },
  {
    id: 2,
    partnerId: 4,
    itemName: "KCC 경화제",
    itemCode: "KCC-HARD20",
    classification: "경화제",
    color: "투명",
    unit: "20kg",
    manufacturer: "KCC",
    remark: "단가 협의 필요",
    active: false,
  },
];

// ====================================================================
// 2. 컴포넌트 본체
// ====================================================================

const RawItemList = () => {
  const styles = useCommonStyles();
  const navigate = useNavigate();

  const [searchField, setSearchField] = useState("total");
  const [searchKeyword, setSearchKeyword] = useState("");
  // ⭐️ 거래상태 필터링을 위한 새로운 상태: 'Y' (true), 'N' (false)
  const [activeFilterStatus, setActiveFilterStatus] = useState<"Y" | "N">("Y");
  const [items, setItems] = useState<RawItem[]>(dummyRawItems);

  // RawItem 데이터에 거래처명(매입처)을 매핑합니다.
  const getItemsWithPartnerName = (rawItems: RawItem[]) => {
    return rawItems.map((item) => {
      const partner = dummyPartners.find((p) => p.id === item.partnerId);
      const partnerName = partner ? partner.partnerName : "정보 없음";
      return {
        ...item,
        partnerName: partnerName, // 매핑된 거래처명(매입처) 추가
      };
    });
  };

  const displayItems = getItemsWithPartnerName(items);

  const handleToggleStatus = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      )
    );
  };

  // ⭐️ 검색 필드 변경 핸들러
  const handleSearchFieldChange = (newField: string) => {
    setSearchField(newField);

    // 'active' 선택 시 검색어 입력 필드 초기화
    if (newField === "active") {
      setSearchKeyword("");
      setActiveFilterStatus("Y"); // 기본값으로 'Y' 선택 (거래종료)
    } else {
      setSearchKeyword(""); // 다른 필드 선택 시 검색어 초기화
    }
  };

  const filteredItems = displayItems.filter((item) => {
    // 1. 거래상태 필터링이 활성화된 경우
    if (searchField === "active") {
      const isActive = activeFilterStatus === "Y";
      return item.active === isActive;
    }

    const keyword = searchKeyword.toLowerCase();
    if (!keyword && searchField !== "active") return true;

    if (searchField === "total") {
      return (
        item.itemName.toLowerCase().includes(keyword) ||
        item.itemCode.toLowerCase().includes(keyword) ||
        item.partnerName.toLowerCase().includes(keyword)
      );
    }

    if (searchField === "itemName")
      return item.itemName.toLowerCase().includes(keyword);
    if (searchField === "itemCode")
      return item.itemCode.toLowerCase().includes(keyword);
    if (searchField === "partnerName")
      return item.partnerName.toLowerCase().includes(keyword);

    if (searchField === "active") {
      const statusText = item.active ? "거래종료" : "거래재개";
      return statusText.includes(keyword);
    }
    return true;
  });

  const handleSearch = () => {
    console.log(`검색 필드: ${searchField}, 키워드: ${searchKeyword}`);
  };

  // ⭐️ 거래상태 필드 렌더링 함수
  const renderActiveFilterInput = () => {
    if (searchField === "active") {
      return (
        <select
          style={{ ...styles.input, width: "100%", border: "none" }}
          value={activeFilterStatus}
          onChange={(e) => setActiveFilterStatus(e.target.value as "Y" | "N")}
        >
          <option value="Y">Y (거래종료)</option>
          <option value="N">N (거래재개)</option>
        </select>
      );
    }

    // 일반 검색어 입력 필드
    return (
      <input
        type="text"
        style={{ ...styles.input, width: "100%", border: "none" }}
        placeholder="검색어를 입력해주세요."
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
      />
    );
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
            <option value="partnerName">매입처</option>
            <option value="itemCode">품목번호</option>
            <option value="itemName">품목명</option>
            <option value="active">거래상태</option>
          </select>

          {/* ⭐️ 조건부 렌더링: active 필드에 따라 드롭다운 또는 입력창 표시 */}
          {renderActiveFilterInput()}
        </div>
        <button style={styles.searchButton} onClick={handleSearch}>
          🔍
        </button>
      </div>
      {/* <input
            type="text"
            style={{ ...styles.input, width: "100%", border: "none" }}
            placeholder="매입처, 품목번호, 품목명으로 검색해주세요."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
        </div>
        <button style={styles.searchButton} onClick={handleSearch}>
          🔍
        </button>
      </div> */}

      {/* 테이블 영역 */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead style={styles.tableHeaderRow}>
            <tr>
              {/* ⭐️ No. 칼럼 추가 (가장 처음) */}
              <th style={styles.th(true, false)}>No.</th>
              <th style={styles.th(false, false)}>매입처</th>
              <th style={styles.th(false, false)}>품목번호</th>
              <th style={styles.th(false, false)}>품목명</th>
              <th style={styles.th(false, false)}>분류</th>
              <th style={styles.th(false, false)}>색상</th>
              <th style={styles.th(false, false)}>규격</th>
              <th style={styles.th(false, false)}>제조사</th>
              <th style={styles.th(false, false)}>비고</th>
              <th style={styles.th(false, true)}>거래상태</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(
              (
                item,
                index // index 사용
              ) => (
                <tr key={item.id} style={styles.tableRow}>
                  {/* ⭐️ No. 렌더링 (index + 1) */}
                  <td style={styles.td}>{index + 1}</td>

                  {/* 2번째 TD: 매입처 */}
                  <td style={styles.td}>{item.partnerName}</td>

                  {/* 3번째 TD: 품목명 (클릭 시 상세 페이지 이동) */}
                  <td style={styles.td}>{item.itemCode}</td>

                  {/* 4번째 TD: 품목명 (클릭 시 상세 페이지 이동) */}
                  <td
                    style={{
                      ...styles.td,
                      cursor: "pointer",
                      color: "#3b82f6",
                      fontWeight: 600,
                    }}
                    onClick={() => navigate(`/raw/item/list/${item.id}`)}
                  >
                    {item.itemName}
                  </td>

                  <td style={styles.td}>{item.classification}</td>
                  <td style={styles.td}>{item.color}</td>
                  <td style={styles.td}>{item.unit}</td>
                  <td style={styles.td}>{item.manufacturer}</td>
                  <td style={styles.td}>{item.remark}</td>
                  <td style={styles.td}>
                    <button
                      style={styles.actionButton(
                        item.active ? "#ef4444" : "#10b981"
                      )}
                      onClick={() => handleToggleStatus(item.id)}
                    >
                      {item.active ? "거래종료" : "거래재개"}
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RawItemList;
