//원자재 품목 - 입고등록

import React, { useState } from "react";
import { useCommonStyles } from "../style/useCommonStyles";
import { useProcessStyles } from "../style/useProcessStyles";
import { useSalesHistoryStyles } from "../style/useSalesHistoryStyles";
import { type RawItemInboundRequest } from "../types/RawItemInbound";
import axios from "axios";

const API_BASE_URL = "/api/raw/inbound/register";

const RawItemInboundPage: React.FC = () => {
  const common = useCommonStyles();
  const process = useProcessStyles();
  const history = useSalesHistoryStyles();

  const [searchType, setSearchType] = useState("전체");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState<
    Record<
      number,
      {
        qty: string;
        inb_date: string;
        mfg_date: string;
      }
    >
  >({});

  const data = [
    {
      supplierName: "코드하우스",
      item_id: 1,
      itemName: "핀걸이스프링",
      rawItemUnit: "88kg",
      manufacturer: "창원대학교",
      qty: "",
      inb_date: "",
      mfg_date: "",
    },
  ];

  const handleSearch = () => {
    console.log("검색:", searchType, searchKeyword);
  };

  const handleRegister = (item_id: number) => {
    const { qty, inb_date, mfg_date } = formData[item_id] || {};
    const payload: RawItemInboundRequest = {
      item_id,
      qty: Number(qty),
      inb_date,
      mfg_date,
    };
    axios.post(API_BASE_URL, payload);

    console.log("등록:", item_id);
  };

  const handleExcelDownload = () => {
    console.log("엑셀 다운로드");
  };

  return (
    <div style={common.container}>
      <h1 style={common.header}>원자재 품목 - 입고 등록</h1>

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
              <option value="partnerName">매입처명</option>
              <option value="itemName">품목명</option>
              <option value="itemCode">품목번호</option>
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
            placeholder="매입처명, 품목명, 품목 번호로 검색해 주세요"
            style={history.searchInput}
          />
        </div>

        {/* 돋보기 버튼 */}
        <button
          type="submit"
          style={common.searchButton}
          onClick={handleSearch}
        >
          <svg
            style={{ width: "20px", height: "20px" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            // xmlns="http://www.w3.org/2000/svg"
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

      {/* 테이블 영역 */}
      <div style={common.tableContainer}>
        <table style={{ ...common.table, fontSize: "13px" }}>
          <thead>
            <tr>
              <th
                style={{
                  ...common.th(true, false),
                  width: "120px",
                  padding: "10px",
                }}
              >
                매입처명
              </th>
              <th
                style={{
                  ...common.th(false, false),
                  width: "120px",
                  padding: "10px",
                }}
              >
                품목 번호
              </th>
              <th
                style={{
                  ...common.th(false, false),
                  width: "140px",
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
                원자재 규격(양/단위)
              </th>
              <th
                style={{
                  ...common.th(false, false),
                  width: "200px",
                  padding: "10px",
                }}
              >
                제조사
              </th>
              <th
                style={{
                  ...common.th(false, false),
                  width: "100px",
                  padding: "10px",
                }}
              >
                입고 수량
              </th>
              <th
                style={{
                  ...common.th(false, false),
                  width: "120px",
                  padding: "10px",
                }}
              >
                입고 일자
              </th>
              <th
                style={{
                  ...common.th(false, false),
                  width: "120px",
                  padding: "10px",
                }}
              >
                제조 일자
              </th>
              <th
                style={{
                  ...common.th(false, true),
                  width: "80px",
                  padding: "10px",
                }}
              >
                등록
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                <td style={{ ...common.td, width: "140px", padding: "8px" }}>
                  {row.supplierName}
                </td>
                <td style={{ ...common.td, width: "140px", padding: "8px" }}>
                  {row.item_id}
                </td>
                <td style={{ ...common.td, width: "160px", padding: "8px" }}>
                  {row.itemName}
                </td>
                <td style={{ ...common.td, width: "70px", padding: "8px" }}>
                  {row.rawItemUnit}
                </td>
                <td style={{ ...common.td, width: "140px", padding: "8px" }}>
                  {row.manufacturer}
                </td>

                {/* 입고 수량 */}
                <td style={{ ...common.td, width: "100px", padding: "8px" }}>
                  <input
                    type="text"
                    value={formData[row.item_id]?.qty || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [row.item_id]: {
                          ...prev[row.item_id],
                          inboundqty: e.target.value,
                        },
                      }))
                    }
                    style={{
                      ...common.input,
                      width: "100%",
                      fontSize: "13px",
                      padding: "6px 8px",
                      height: "32px",
                      boxSizing: "border-box",
                    }}
                  />
                </td>

                {/* 입고 일자 */}
                <td style={{ ...common.td, width: "120px", padding: "8px" }}>
                  <input
                    type="date"
                    value={formData[row.item_id]?.inb_date || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [row.item_id]: {
                          ...prev[row.item_id],
                          inboundDate: e.target.value,
                        },
                      }))
                    }
                    style={{
                      ...common.input,
                      width: "100%",
                      fontSize: "13px",
                      padding: "6px 8px",
                      height: "32px",
                      boxSizing: "border-box",
                    }}
                  />
                </td>

                {/* 제조 일자 */}
                <td style={{ ...common.td, width: "120px", padding: "8px" }}>
                  <input
                    type="date"
                    value={formData[row.item_id]?.mfg_date || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [row.item_id]: {
                          ...prev[row.item_id],
                          mfg_date: e.target.value,
                        },
                      }))
                    }
                    style={{
                      ...common.input,
                      width: "100%",
                      fontSize: "13px",
                      padding: "6px 8px",
                      height: "32px",
                      boxSizing: "border-box",
                    }}
                  />
                </td>

                {/* 등록 버튼 */}
                <td
                  style={{
                    ...common.td,
                    width: "80px",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  <button
                    style={{
                      ...common.actionButton("#3b82f6"),
                      fontSize: "13px",
                      padding: "6px 10px",
                      height: "34px",
                      minWidth: "70px",
                    }}
                    onClick={() => handleRegister(row.item_id)}
                  >
                    등록
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 엑셀 다운로드 */}
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

export default RawItemInboundPage;
