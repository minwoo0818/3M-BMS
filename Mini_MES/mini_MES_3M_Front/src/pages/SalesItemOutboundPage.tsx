import React, { useEffect, useState } from "react";
import { useCommonStyles } from "../style/useCommonStyles";
import { useProcessStyles } from "../style/useProcessStyles";
import { useSalesHistoryStyles } from "../style/useSalesHistoryStyles";
import type { SalesOutboundListDto } from "../types/SalesItemOutbound";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const SalesItemOutboundPage: React.FC = () => {
  const common = useCommonStyles();
  const process = useProcessStyles();
  const history = useSalesHistoryStyles();

  const [searchType, setSearchType] = useState("전체");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formValues, setFormValues] = useState<{
    [key: string]: { qty: string; date: string };
  }>({});
  const [data, setData] = useState<SalesOutboundListDto[]>([]); // 🔹 백엔드에서 받아올 출고 대상 리스트
  const [totalPages, setTotalPages] = useState(1);

  // 출고 대상 입고 항목 조회 함수: 백엔드의 /order/outbound/list GET 경로 호출
  const fetchInboundList = () => {
    fetch(
      `${API_BASE_URL}/order/outbound/list?page=${currentPage}&limit=10&searchType=${searchType}&searchTerm=${searchKeyword}`
    )
      .then((res) => res.json())
      .then((data) => {
        setData(data.content);
        setTotalPages(data.totalPages);
      })
      .catch((err) => console.error("출고 대상 조회 실패:", err));
  };

  // 컴포넌트 마운트 및 상태 변경 시 데이터 호출
  useEffect(() => {
    fetchInboundList();
  }, [currentPage, searchType, searchKeyword]);

  const handleChange = (id: string, field: "qty" | "date", value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSearch = () => {
    console.log("검색:", searchType, searchKeyword);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  const handleRegister = (inboundId: number) => {
    const idString = String(inboundId);
    const { qty, date } = formValues[inboundId] || {};
    if (!qty || !date) {
      alert("출고 수량과 출고 일자를 입력해주세요.");
      return;
    }

    // 잔여 수량 체크 (프론트엔드 방어 로직)
    const currentItem = data.find((item) => item.inboundId === inboundId);
    const parsedQty = parseInt(qty);

    if (isNaN(parsedQty) || parsedQty <= 0) {
      alert("유효한 출고 수량을 입력해주세요.");
      return;
    }

    // ⭐️ 잔여 수량 초과 등록 방지 로직은 유지 ⭐️
    if (
      currentItem &&
      typeof currentItem.remainingQty === "number" &&
      parsedQty > currentItem.remainingQty
    ) {
      alert(
        `출고 수량(${parsedQty})이 잔여 수량(${currentItem.remainingQty})보다 많습니다.`
      );
      return;
    }

    console.log(
      "POST Body:",
      JSON.stringify({
        inboundId,
        qty: parseInt(qty),
        shippedAt: date,
      })
    );

    fetch(`${API_BASE_URL}/order/outbound/list/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inboundId,
        qty: parseInt(qty),
        shippedAt: date,
      }),
    })
      .then((res) => {
        if (res.ok) {
          alert("출고 등록 완료");
          // 등록 후 리스트 다시 불러오기
          setFormValues((prev) => ({
            ...prev,
            [inboundId]: { qty: "", date: "" },
          }));
          fetch(
            `${API_BASE_URL}/order/outbound/list?page=${currentPage}&limit=10&searchType=${searchType}&searchTerm=${searchKeyword}`
          )
            .then((res) => res.json())
            .then((data) => setData(data.content));
        } else {
          alert("출고 등록 실패");
        }
      })
      .catch((err) => console.error("등록 오류:", err));
  };

  const handleExcelDownload = () => {
    console.log("엑셀 다운로드");
  };

  return (
    <div style={common.container}>
      <h1 style={common.header}>수주품목 - 출고 등록</h1>

      {/* 검색 영역 */}
      <div style={common.searchContainer}>
        <div style={common.searchGroup}>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              style={common.searchSelect}
            >
              <option value="전체">전체</option>
              <option value="partnerName">거래처명</option>
              <option value="itemName">품목명</option>
              <option value="itemCode">품목번호</option>
              <option value="inboundLOTNum">입고번호</option>
              <option value="receivedAt">입고일자</option>
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
            placeholder="거래처명, 품목명, 품목 번호, 입고 번호, 입고 일자 로 검색해주세요."
            style={history.searchInput}
          />
        </div>
        <button style={common.searchButton} onClick={handleSearch}>
          🔍
        </button>
      </div>

      {/* 테이블 영역 */}
      <div style={common.tableContainer}>
        <table style={{ ...common.table, fontSize: "13px" }}>
          <thead>
            <tr>
              <th
                style={{
                  ...common.th(false, false),
                  width: "100px",
                  padding: "10px",
                }}
              >
                입고 번호
              </th>
              <th
                style={{
                  ...common.th(true, false),
                  width: "140px",
                  padding: "10px",
                }}
              >
                거래처명
              </th>
              <th
                style={{
                  ...common.th(false, false),
                  width: "140px",
                  padding: "10px",
                }}
              >
                품목 번호
              </th>
              <th
                style={{
                  ...common.th(false, false),
                  width: "160px",
                  padding: "10px",
                }}
              >
                품목명
              </th>
              <th
                style={{
                  ...common.th(false, false),
                  width: "100px",
                  padding: "10px",
                }}
              >
                입고 일자
              </th>
              <th
                style={{
                  ...common.th(false, false),
                  width: "200px",
                  padding: "10px",
                }}
              >
                입고 수량
              </th>
              <th
                style={{
                  ...common.th(false, false),
                  width: "200px",
                  padding: "10px",
                }}
              >
                남은 수량
              </th>
              <th
                style={{
                  ...common.th(false, false),
                  width: "100px",
                  padding: "10px",
                }}
              >
                분류
              </th>
              <th
                style={{
                  ...common.th(false, false),
                  width: "100px",
                  padding: "10px",
                }}
              >
                출고 수량
              </th>
              <th
                style={{
                  ...common.th(false, false),
                  width: "100px",
                  padding: "10px",
                }}
              >
                출고 일자
              </th>
              <th
                style={{
                  ...common.th(false, true),
                  width: "80px",
                  padding: "10px",
                }}
              ></th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                <td style={{ ...common.td, width: "140px", padding: "8px" }}>
                  {row.inboundLOTNum}
                </td>
                <td style={{ ...common.td, width: "140px", padding: "8px" }}>
                  {row.partnerName}
                </td>
                <td style={{ ...common.td, width: "140px", padding: "8px" }}>
                  {row.itemCode}
                </td>
                <td style={{ ...common.td, width: "160px", padding: "8px" }}>
                  {row.itemName}
                </td>
                <td style={{ ...common.td, width: "140px", padding: "8px" }}>
                  {row.receivedAt}
                </td>
                <td style={{ ...common.td, width: "140px", padding: "8px" }}>
                  {row.qty} EA
                </td>
                <td style={{ ...common.td, width: "140px", padding: "8px" }}>
                  {row.remainingQty} EA
                </td>
                <td style={{ ...common.td, width: "100px", padding: "8px" }}>
                  {row.classification}
                </td>
                <td style={{ ...common.td, width: "100px", padding: "8px" }}>
                  <input
                    type="number"
                    value={formValues[row.inboundId]?.qty || ""}
                    onChange={(e) =>
                      handleChange(String(row.inboundId), "qty", e.target.value)
                    }
                    style={common.input}
                  />
                </td>
                <td style={common.td}>
                  <input
                    type="date"
                    value={formValues[row.inboundId]?.date || ""}
                    onChange={(e) =>
                      handleChange(
                        String(row.inboundId),
                        "date",
                        e.target.value
                      )
                    }
                    style={common.input}
                  />
                </td>

                <td style={{ ...common.td, width: "80px", padding: "8px" }}>
                  <button
                    style={{
                      ...common.actionButton("#3b82f6"),
                      fontSize: "14px",
                      padding: "10px 16px",
                      height: "40px",
                      minWidth: "80px",
                    }}
                    onClick={() => handleRegister(row.inboundId)}
                  >
                    등록
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 엑셀 다운로드 버튼 */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "20px",
        }}
      >
        <button style={history.excelButton} onClick={handleExcelDownload}>
          📥 EXCEL 다운로드
        </button>
      </div>

      {/* 페이징 */}
      <div style={common.paginationContainer}>
        {[1].map((page) => (
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

export default SalesItemOutboundPage;
