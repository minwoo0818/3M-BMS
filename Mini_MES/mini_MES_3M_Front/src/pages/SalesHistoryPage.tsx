import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSalesHistoryStyles } from "../style/useSalesHistoryStyles";
import { useCommonStyles } from "../style/useCommonStyles";
import { Typography, Button, TextField, Stack } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO, isValid } from "date-fns";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  getSalesInboundHistory,
  updateSalesInboundHistory,
  cancelSalesInboundHistory,
} from "../api/salesItemInboundApi";
import type {
  SalesInboundHistoryItem,
  SalesInboundUpdateRequest,
} from "../types/SalesItemInboundTypes";
import {
  cancelSalesOutboundHistory,
  getSalesoutboundHistory,
  updateSalesOutboundHistory,
} from "../api/salesItemOutboundHistoryApi";
import type {
  SalesOutboundHistoryItem,
  SalesOutboundUpdateRequest,
} from "../types/SalesItemOutboundHistoryTypes";

// ==========================================================
// 1. 타입 정의
// ==========================================================
export type HistoryType = "INBOUND" | "OUTBOUND";

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
  { key: "all", label: "전체" },
  { key: "customerName", label: "거래처명" },
  { key: "itemName", label: "품목명" },
  { key: "itemCode", label: "품목번호" },
  { key: "inboundLOTNum", label: "입고번호" },
  { key: "receivedAt", label: "입고일자" },
];

const OUTBOUND_SEARCH_OPTIONS: SearchOption[] = [
  { key: "all", label: "전체" },
  { key: "partnerName", label: "거래처명" },
  { key: "itemName", label: "품목명" },
  { key: "itemCode", label: "품목번호" },
  { key: "outboundOUTNum", label: "출고번호" },
  { key: "shippedAt", label: "출고일자" },
];

// ==========================================================
// 3. 컴포넌트 시작
// ==========================================================
export default function SalesHistoryQueryPage() {
  const { type: urlType } = useParams<{ type: string }>();
  const navigate = useNavigate();

  const currentHistoryType: HistoryType =
    urlType?.toUpperCase() === "OUTBOUND" ? "OUTBOUND" : "INBOUND";

  // ----------------------------------------------------
  // 상태 관리
  // ----------------------------------------------------
  const [inboundHistory, setInboundHistory] = useState<
    SalesInboundHistoryItem[]
  >([]);
  const [outboundHistory, setOutboundHistory] = useState<
    SalesOutboundHistoryItem[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 검색어 상태를 두 개로 분리: 입력 필드용(searchInputValue), 실제 검색 적용용(activeSearchTerm)
  const [searchInputValue, setSearchInputValue] = useState(""); // 사용자가 입력 중인 검색어
  const [activeSearchTerm, setActiveSearchTerm] = useState(""); // 현재 적용된 검색어 (API 호출용)
  const [searchKey, setSearchKey] = useState<string>("all"); // 검색 기준
  const [outboundSearchKey, setOutboundSearchKey] = useState<string>("all"); // 검색 기준
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);

  const [editingInboundId, setEditingInboundId] = useState<number | null>(null);
  const [editingOutboundId, setEditingOutboundId] = useState<number | null>(
    null
  );
  const [editingData, setEditingData] =
    useState<SalesInboundUpdateRequest | null>(null);

  const [editingData2, setEditingData2] =
    useState<SalesOutboundUpdateRequest | null>(null);

  const [editingErrors, setEditingErrors] = useState<{
    qty?: string;
    receivedAt?: string;
    general?: string;
  }>({});

  const [editingErrors2, setEditingErrors2] = useState<{
    qty?: string;
    shippedAt?: string;
    general?: string;
  }>({});

  // --- 스타일 정의 ---
  const styles = {
    ...useCommonStyles(),
    ...useSalesHistoryStyles(),
  };

  // --- 동적 설정 계산 (URL type에 의존) ---
  const { title, placeholder, searchOptions } = useMemo(() => {
    if (currentHistoryType === "INBOUND") {
      return {
        title: "수주품목 입고 이력조회",
        placeholder:
          "거래처명, 품목명, 품목번호, 입고번호, 입고일자로 검색해주세요",
        searchOptions: INBOUND_SEARCH_OPTIONS,
      };
    } else {
      return {
        title: "수주품목 출고 이력조회",
        placeholder:
          "거래처명, 품목명, 품목번호, 출고번호, 출고일자로 검색해주세요",
        searchOptions: OUTBOUND_SEARCH_OPTIONS,
      };
    }
  }, [currentHistoryType]);

  // ----------------------------------------------------
  // API 호출 함수
  // ----------------------------------------------------

  // 입고 이력 목록 불러오기 (activeSearchTerm에 따라 호출)
  const fetchInboundHistory = useCallback(
    async (keyword: string) => {
      // 키워드를 인자로 받도록 수정
      setIsLoading(true);
      setError(null);
      try {
        const data = await getSalesInboundHistory(keyword); // activeSearchTerm 대신 keyword 인자를 사용

        const filteredData = data.filter((item) => {
          const lowerSearchTerm = keyword.toLowerCase().trim(); // 인자로 받은 keyword를 사용
          if (!lowerSearchTerm || searchKey === "all") return true;

          switch (searchKey) {
            case "inboundLOTNum":
              return item.inboundLOTNum.toLowerCase().includes(lowerSearchTerm);
            case "customerName":
              return item.customerName.toLowerCase().includes(lowerSearchTerm);
            case "itemCode":
              return item.itemCode.toLowerCase().includes(lowerSearchTerm);
            case "itemName":
              return item.itemName.toLowerCase().includes(lowerSearchTerm);
            case "coatingMethod":
              return item.coatingMethod.toLowerCase().includes(lowerSearchTerm);
            case "classification":
              return item.classification
                .toLowerCase()
                .includes(lowerSearchTerm);
            case "qty":
              return String(item.qty).toLowerCase().includes(lowerSearchTerm);
            case "receivedAt":
              return item.receivedAt.toLowerCase().includes(lowerSearchTerm);
            default:
              return true;
          }
        });

        setInboundHistory(filteredData);
      } catch (err: any) {
        console.error("입고 이력을 불러오는데 실패했습니다:", err);
        setError("입고 이력을 불러오는 중 오류가 발생했습니다.");
        setInboundHistory([]);
      } finally {
        setIsLoading(false);
      }
    },
    [searchKey]
  ); // searchKey만 의존성 배열에, searchTerm은 이제 인자로 받으므로 제외

  const handleCreateWorkOrder = useCallback(
    (inboundId: number) => {
      navigate(`/work-order/${inboundId}`);
      // 또는 `/work-order/create/${inboundId}` ← 실제 라우터에 맞게 조정
    },
    [navigate]
  );

  // 출고 이력 목록 불러오기 (activeSearchTerm에 따라 호출)
  const fetchOutboundHistory = useCallback(
    async (keyword: string) => {
      // 키워드를 인자로 받도록 수정
      setIsLoading(true);
      setError(null);
      try {
        const data = await getSalesoutboundHistory(keyword); // activeSearchTerm 대신 keyword 인자를 사용

        const filteredData = data.filter((item) => {
          const lowerSearchTerm = keyword.toLowerCase().trim(); // 인자로 받은 keyword를 사용
          if (!lowerSearchTerm || outboundSearchKey === "all") return true;

          switch (outboundSearchKey) {
            case "outboundOUTNum":
              return item.outboundOUTNum
                .toLowerCase()
                .includes(lowerSearchTerm);
            case "partnerName":
              return item.partnerName.toLowerCase().includes(lowerSearchTerm);
            case "itemCode":
              return item.itemCode.toLowerCase().includes(lowerSearchTerm);
            case "itemName":
              return item.itemName.toLowerCase().includes(lowerSearchTerm);
            case "qty":
              return String(item.qty).toLowerCase().includes(lowerSearchTerm);
            case "shippedAt":
              return String(item.shippedAt)
                .toLowerCase()
                .includes(lowerSearchTerm);
            case "classification":
              return item.classification
                .toLowerCase()
                .includes(lowerSearchTerm);
            default:
              return true;
          }
        });

        setOutboundHistory(filteredData);
      } catch (err: any) {
        console.error("출고 이력을 불러오는데 실패했습니다:", err);
        setError("출고 이력을 불러오는 중 오류가 발생했습니다.");
        setOutboundHistory([]);
      } finally {
        setIsLoading(false);
      }
    },
    [outboundSearchKey]
  );

  // currentHistoryType 변경 또는 컴포넌트 마운트 시 초기화 및 데이터 불러오기
  useEffect(() => {
    // if (currentHistoryType === "OUTBOUND") {
    //   setIsLoading(false);
    //   setError("출고 이력조회는 구현 예정입니다.");
    //   setInboundHistory([]);
    //   return;
    // }

    setSearchInputValue(""); // 입력 필드 초기화
    setActiveSearchTerm(""); // 실제 검색어 초기화
    setSearchKey("all");
    setOutboundSearchKey("all");
    setCurrentPage(1);
    // 현재 탭 타입(INBOUND / OUTBOUND)에 맞는 초기 데이터만 불러오기
    if (currentHistoryType === "INBOUND") {
      fetchInboundHistory("");
    } else if (currentHistoryType === "OUTBOUND") {
      fetchOutboundHistory("");
    }
  }, [currentHistoryType, fetchInboundHistory, fetchOutboundHistory]);

  // activeSearchTerm이 변경될 때만 API 호출 (실제 검색 트리거)
  useEffect(() => {
    if (!activeSearchTerm && currentPage === 1) return; // 초기화 시 중복 호출 방지

    // currentHistoryType이 'INBOUND'일 때만 activeSearchTerm 변경에 따라 fetch
    if (currentHistoryType === "INBOUND") {
      fetchInboundHistory(activeSearchTerm);
    } else if (currentHistoryType === "OUTBOUND") {
      fetchOutboundHistory(activeSearchTerm);
    }
  }, [
    activeSearchTerm,
    currentHistoryType,
    currentPage,
    fetchInboundHistory,
    fetchOutboundHistory,
  ]); // activeSearchTerm이 변경될 때만 다시 불러오기

  // ----------------------------------------------------
  // 검색 로직 (검색 버튼 클릭 또는 Enter)
  // ----------------------------------------------------
  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault(); // 기본 폼 제출 동작 방지
      setCurrentPage(1); // 검색 시 페이지 초기화
      setActiveSearchTerm(searchInputValue); // 입력된 검색어를 실제 검색어로 적용
    },
    [searchInputValue]
  );

  // ----------------------------------------------------
  //  인라인 편집 관련 로직
  // ----------------------------------------------------

  const handleEditClick = useCallback((item: SalesInboundHistoryItem) => {
    if (item.isCancelled) return; // 취소된 항목은 수정 불가

    setEditingInboundId(item.inboundId);
    setEditingData({
      qty: item.qty,
      receivedAt: item.receivedAt,
    });
    setEditingErrors({});
  }, []);

  const handleOutboundEditClick = useCallback(
    (item: SalesOutboundHistoryItem) => {
      if (item.isCancelled) return; // 취소된 항목은 수정 불가

      setEditingOutboundId(item.outboundId);
      setEditingData2({
        qty: item.qty,
        shippedAt: item.shippedAt,
      });
      setEditingErrors2({});
    },
    []
  );

  const handleInlineInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setEditingData((prev) =>
        prev
          ? { ...prev, [name]: name === "qty" ? Number(value) : value }
          : null
      );
      setEditingErrors((prev) => ({
        ...prev,
        [name]: undefined,
        general: undefined,
      }));
    },
    []
  );

  const handleInlineInputChange2 = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setEditingData2((prev) =>
        prev
          ? { ...prev, [name]: name === "qty" ? Number(value) : value }
          : null
      );
      setEditingErrors2((prev) => ({
        ...prev,
        [name]: undefined,
        general: undefined,
      }));
    },
    []
  );

  const handleInlineDateChange = useCallback((date: Date | null) => {
    if (date && isValid(date)) {
      setEditingData((prev) =>
        prev ? { ...prev, receivedAt: format(date, "yyyy-MM-dd") } : null
      );
    } else {
      setEditingData((prev) => (prev ? { ...prev, receivedAt: "" } : null));
    }
    setEditingErrors((prev) => ({
      ...prev,
      receivedAt: undefined,
      general: undefined,
    }));
  }, []);

  const handleInlineDateChange2 = useCallback((date: Date | null) => {
    if (date && isValid(date)) {
      setEditingData2((prev) =>
        prev ? { ...prev, shippedAt: format(date, "yyyy-MM-dd") } : null
      );
    } else {
      setEditingData2((prev) => (prev ? { ...prev, shippedAt: "" } : null));
    }
    setEditingErrors2((prev) => ({
      ...prev,
      shippedAt: undefined,
      general: undefined,
    }));
  }, []);

  const handleSaveClick = async (inboundId: number) => {
    if (!editingData) return;

    const newErrors: { qty?: string; receivedAt?: string; general?: string } =
      {};
    if (isNaN(editingData.qty) || editingData.qty <= 0) {
      // editedInboundData 대신 editingData 사용
      newErrors.qty = "입고 수량은 1개 이상이어야 합니다.";
    }
    if (!editingData.receivedAt || !isValid(parseISO(editingData.receivedAt))) {
      newErrors.receivedAt = "유효한 입고 일자를 선택해주세요.";
    }

    if (Object.keys(newErrors).length > 0) {
      setEditingErrors(newErrors);
      return;
    }
    setEditingErrors({});

    try {
      await updateSalesInboundHistory(inboundId, editingData);
      alert("입고 이력이 성공적으로 수정되었습니다.");
      setEditingInboundId(null);
      setEditingData(null);
      // 수정 후에는 현재 적용된 검색어로 목록을 다시 불러옴
      fetchInboundHistory(activeSearchTerm);
    } catch (err: any) {
      console.error("입고 이력 수정 실패:", err);
      if (err.response && err.response.data) {
        setEditingErrors({
          general:
            err.response.data.message ||
            "입고 이력 수정 중 오류가 발생했습니다.",
        });
      } else {
        setEditingErrors({
          general: "입고 이력 수정 중 네트워크 오류가 발생했습니다.",
        });
      }
    }
  };

  const handleSaveClick2 = async (outboundId: number) => {
    if (!editingData2) return;

    const newErrors: { qty?: string; shippedAt?: string; general?: string } =
      {};
    if (isNaN(editingData2.qty) || editingData2.qty <= 0) {
      // editedInboundData 대신 editingData 사용
      newErrors.qty = "출고 수량은 1개 이상이어야 합니다.";
    }
    if (!editingData2.shippedAt || !isValid(parseISO(editingData2.shippedAt))) {
      newErrors.shippedAt = "유효한 출고 일자를 선택해주세요.";
    }

    if (Object.keys(newErrors).length > 0) {
      setEditingErrors2(newErrors);
      return;
    }
    setEditingErrors2({});

    try {
      await updateSalesOutboundHistory(outboundId, editingData2);
      alert("출고 이력이 성공적으로 수정되었습니다.");
      setEditingOutboundId(null);
      setEditingData2(null);
      // 수정 후에는 현재 적용된 검색어로 목록을 다시 불러옴
      fetchOutboundHistory(activeSearchTerm);
    } catch (err: any) {
      console.error("출고 이력 수정 실패:", err);
      if (err.response && err.response.data) {
        setEditingErrors2({
          general:
            err.response.data.message ||
            "출고 이력 수정 중 오류가 발생했습니다.",
        });
      } else {
        setEditingErrors2({
          general: "출고 이력 수정 중 네트워크 오류가 발생했습니다.",
        });
      }
    }
  };

  const handleCancelEditClick = useCallback(() => {
    setEditingInboundId(null);
    setEditingOutboundId(null);
    setEditingData(null);
    setEditingData2(null);
    setEditingErrors({});
    setEditingErrors2({});
  }, []);

  // --- 삭제(취소) 로직 ---
  const handleDelete = async (inboundId: number) => {
    if (
      !window.confirm(
        "정말로 해당 입고 이력을 취소(삭제)하시겠습니까?\n취소된 입고 이력은 복구할 수 없습니다."
      )
    ) {
      return;
    }

    try {
      await cancelSalesInboundHistory(inboundId);
      alert("입고 이력이 성공적으로 취소(삭제)되었습니다.");
      // 삭제 후에는 현재 적용된 검색어로 목록을 다시 불러옴
      fetchInboundHistory(activeSearchTerm);
    } catch (err: any) {
      console.error("입고 이력 취소 실패:", err);
      if (
        err.response &&
        err.response.data &&
        typeof err.response.data === "object"
      ) {
        alert(
          `입고 이력 취소 실패: ${Object.values(err.response.data).join(", ")}`
        );
      } else {
        alert("입고 이력 취소 중 오류가 발생했습니다.");
      }
    }
  };

  // --- 출고이력 삭제(취소) 로직 ---
  const handleOutboundDelete = async (outboundId: number) => {
    if (
      !window.confirm(
        "정말로 해당 출고 이력을 취소(삭제)하시겠습니까?\n취소된 출고 이력은 복구할 수 없습니다."
      )
    ) {
      return;
    }

    try {
      await cancelSalesOutboundHistory(outboundId);
      alert("출고 이력이 성공적으로 취소(삭제)되었습니다.");
      // 삭제 후에는 현재 적용된 검색어로 목록을 다시 불러옴
      fetchOutboundHistory(activeSearchTerm);
    } catch (err: any) {
      console.error("출고 이력 취소 실패:", err);
      if (
        err.response &&
        err.response.data &&
        typeof err.response.data === "object"
      ) {
        alert(
          `출고 이력 취소 실패: ${Object.values(err.response.data).join(", ")}`
        );
      } else {
        alert("출고 이력 취소 중 오류가 발생했습니다.");
      }
    }
  };

  const handleExcelDownload = async () => {
    try {
      const res = await axios.get(`/order/history/outbound`);
      const outboundData = res.data?.content || res.data;

      if (!Array.isArray(outboundData) || outboundData.length === 0) {
        alert("다운로드할 데이터가 없습니다.");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(outboundData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "출고 이력 목록");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });

      saveAs(blob, "출고 이력 목록.xlsx");
    } catch (err) {
      console.error("엑셀 다운로드 오류:", err);
      alert("엑셀 다운로드 중 오류가 발생했습니다.");
    }
  };

  // useEffect(() => {
  //   axios
  //     .get(`/order/history/outbound`)
  //     .then((res) => {
  //       const result = res.data?.content || res.data;
  //       setOutboundHistory(Array.isArray(result) ? result : []); // ✅ 수정
  //     })
  //     .catch((err) => {
  //       console.error("데이터 조회 실패:", err);
  //       setOutboundHistory([]); // ✅ fallback
  //     });
  // }, []);

  // const handleExcelDownload2 = async () => {
  //   try {
  //     const res = await axios.get(`/order/history/outbound`);
  //     const outboundData = res.data?.content || res.data;

  //     if (!Array.isArray(outboundData) || outboundData.length === 0) {
  //       alert("다운로드할 데이터가 없습니다.");
  //       return;
  //     }

  //     const worksheet = XLSX.utils.json_to_sheet(outboundData);
  //     const workbook = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(workbook, worksheet, "출고 이력 목록");

  //     const excelBuffer = XLSX.write(workbook, {
  //       bookType: "xlsx",
  //       type: "array",
  //     });

  //     const blob = new Blob([excelBuffer], {
  //       type: "application/octet-stream",
  //     });

  //     saveAs(blob, "출고 이력 목록.xlsx");
  //   } catch (err) {
  //     console.error("엑셀 다운로드 오류:", err);
  //     alert("엑셀 다운로드 중 오류가 발생했습니다.");
  //   }
  // };

  // ----------------------------------------------------
  // 페이징 로직
  // ----------------------------------------------------
  const totalPages = Math.ceil(inboundHistory.length / ITEMS_PER_PAGE);
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return inboundHistory.slice(startIndex, endIndex);
  }, [inboundHistory, currentPage]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const totalPages2 = Math.ceil(outboundHistory.length / ITEMS_PER_PAGE);
  const currentItems2 = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return outboundHistory.slice(startIndex, endIndex);
  }, [outboundHistory, currentPage]);

  const handlePageChange2 = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages2) {
        setCurrentPage(page);
      }
    },
    [totalPages2]
  );

  // ----------------------------------------------------
  // 렌더링
  // ----------------------------------------------------
  return (
    <div style={styles.container}>
      <h1 style={styles.header}>{title}</h1>

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
            value={searchInputValue} // searchInputValue를 사용
            onChange={(e) => setSearchInputValue(e.target.value)} // searchInputValue만 업데이트
            placeholder={placeholder}
            style={styles.searchInput}
          />
        </div>
        <button type="submit" style={styles.searchButton}>
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
        </button>
      </form>

      {isLoading && (
        <Typography sx={{ p: 2 }}>데이터를 불러오는 중입니다...</Typography>
      )}
      {error && (
        <Typography color="error" sx={{ p: 2 }}>
          에러: {error}
        </Typography>
      )}
      {!isLoading &&
        !error &&
        currentHistoryType === "INBOUND" &&
        inboundHistory.length === 0 && (
          <Typography sx={{ p: 2 }}>조회된 입고 이력이 없습니다.</Typography>
        )}
      {!isLoading &&
        !error &&
        currentHistoryType === "OUTBOUND" &&
        outboundHistory.length === 0 && (
          <Typography sx={{ p: 2 }}>조회된 출고 이력이 없습니다.</Typography>
        )}

      {/* 테이블 영역 (INBOUND 타입일 때만) */}
      {!isLoading &&
        !error &&
        currentHistoryType === "INBOUND" &&
        inboundHistory.length > 0 && (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={{ ...styles.th(true, false), width: "5%" }}>
                    No.
                  </th>
                  <th style={{ ...styles.th(false, false), width: "15%" }}>
                    입고번호(LOT)
                  </th>
                  <th style={{ ...styles.th(false, false), width: "10%" }}>
                    거래처명
                  </th>
                  <th style={{ ...styles.th(false, false), width: "10%" }}>
                    품목번호
                  </th>
                  <th style={{ ...styles.th(false, false), width: "10%" }}>
                    품목명
                  </th>
                  <th style={{ ...styles.th(false, false), width: "10%" }}>
                    도장방식
                  </th>
                  <th style={{ ...styles.th(false, false), width: "10%" }}>
                    분류
                  </th>
                  <th style={{ ...styles.th(false, false), width: "10%" }}>
                    입고수량
                  </th>
                  <th style={{ ...styles.th(false, false), width: "10%" }}>
                    입고일자
                  </th>
                  {/* <th style={{ ...styles.th(false, false), width: "10%" }}>
                    등록일자
                  </th>
                  <th style={{ ...styles.th(false, false), width: "5%" }}>
                    취소여부
                  </th> */}
                  <th style={{ ...styles.th(false, true), width: "15%" }}>
                    관리
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => {
                  const isEditing = editingInboundId === item.inboundId;
                  return (
                    <tr
                      key={item.inboundId}
                      style={{
                        ...styles.tableRow,
                        ...(hoveredRowId === item.inboundId
                          ? styles.tdHover
                          : {}),
                        backgroundColor: item.isCancelled
                          ? "#fcdede"
                          : isEditing
                          ? "#e8f5e9"
                          : "inherit",
                      }}
                      onMouseEnter={() => setHoveredRowId(item.inboundId)}
                      onMouseLeave={() => setHoveredRowId(null)}
                    >
                      <td style={styles.td}>
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td
                        style={{
                          ...styles.td,
                          width: "15%",
                          fontWeight: "500",
                          color: "#2563eb",
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          navigate(`/ProcessRegister/${item.inboundId}`)
                        }
                      >
                        {item.inboundLOTNum}
                      </td>
                      <td style={styles.td}>{item.customerName}</td>
                      <td style={styles.td}>{item.itemCode}</td>
                      <td style={styles.td}>{item.itemName}</td>
                      <td style={styles.td}>{item.coatingMethod}</td>
                      <td style={styles.td}>{item.classification}</td>

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
                            sx={{
                              "& .MuiInputBase-input": {
                                p: "6px 8px",
                                fontSize: "13px",
                              },
                              "& .MuiInputLabel-root": { top: "-5px" },
                            }}
                          />
                        ) : (
                          item.qty
                        )}
                      </td>

                      {/* 입고 일자 - 인라인 편집 */}
                      <td style={styles.td}>
                        {isEditing && editingData ? (
                          <DatePicker
                            selected={
                              editingData.receivedAt
                                ? parseISO(editingData.receivedAt)
                                : null
                            }
                            onChange={handleInlineDateChange}
                            dateFormat="yyyy-MM-dd"
                            customInput={
                              <TextField
                                size="small"
                                sx={{
                                  "& .MuiInputBase-input": {
                                    p: "6px 8px",
                                    fontSize: "13px",
                                  },
                                  "& .MuiInputLabel-root": { top: "-5px" },
                                }}
                                error={!!editingErrors.receivedAt}
                                helperText={editingErrors.receivedAt}
                              />
                            }
                            wrapperClassName="date-picker-wrapper"
                          />
                        ) : (
                          item.receivedAt
                        )}
                      </td>

                      {/* <td style={styles.td}>
                        {format(parseISO(item.createdAt), "yyyy-MM-dd HH:mm")}
                      </td> */}

                      {/* <td style={styles.td}>{item.isCancelled ? "Y" : "N"}</td> */}

                      <td style={styles.td}>
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                        >
                          {isEditing ? (
                            <>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() => handleSaveClick(item.inboundId)}
                                sx={{ fontSize: "0.7rem" }}
                              >
                                저장
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={handleCancelEditClick}
                                sx={{ fontSize: "0.7rem" }}
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
                                disabled={
                                  item.isCancelled || item.isOutboundProcessed
                                }
                                sx={{ fontSize: "0.7rem" }}
                              >
                                수정
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                size="small"
                                onClick={() => handleDelete(item.inboundId)}
                                disabled={
                                  item.isCancelled || item.isOutboundProcessed
                                }
                                sx={{ fontSize: "0.7rem" }}
                              >
                                삭제
                              </Button>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() =>
                                  handleCreateWorkOrder(item.inboundId)
                                }
                                disabled={item.isCancelled}
                                sx={{ fontSize: "0.7rem" }}
                              >
                                작업지시서
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
            {editingErrors.general && (
              <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                {editingErrors.general}
              </Typography>
            )}
          </div>
        )}

      {/* 테이블 영역 (OUTBOUND 타입일 때만) */}
      {!isLoading &&
        !error &&
        currentHistoryType === "OUTBOUND" &&
        outboundHistory.length > 0 && (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={{ ...styles.th(true, false), width: "5%" }}>
                    No.
                  </th>
                  <th style={{ ...styles.th(false, false), width: "10%" }}>
                    출고번호
                  </th>
                  <th style={{ ...styles.th(false, false), width: "10%" }}>
                    거래처명
                  </th>
                  <th style={{ ...styles.th(false, false), width: "10%" }}>
                    품목번호
                  </th>
                  <th style={{ ...styles.th(false, false), width: "10%" }}>
                    품목명
                  </th>

                  <th style={{ ...styles.th(false, false), width: "10%" }}>
                    분류
                  </th>
                  <th style={{ ...styles.th(false, false), width: "10%" }}>
                    출고수량
                  </th>
                  <th style={{ ...styles.th(false, false), width: "10%" }}>
                    출고일자
                  </th>

                  {/* <th style={{ ...styles.th(false, false), width: "10%" }}>
                    등록일자
                  </th>
                  <th style={{ ...styles.th(false, false), width: "5%" }}>
                    취소여부
                  </th> */}
                  <th style={{ ...styles.th(false, true), width: "15%" }}>
                    관리
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems2.map((item, index) => {
                  const isEditing = editingOutboundId === item.outboundId;
                  return (
                    <tr
                      key={item.outboundId}
                      style={{
                        ...styles.tableRow,
                        ...(hoveredRowId === item.outboundId
                          ? styles.tdHover
                          : {}),
                        backgroundColor: item.isCancelled
                          ? "#fcdede"
                          : isEditing
                          ? "#e8f5e9"
                          : "inherit",
                      }}
                      onMouseEnter={() => setHoveredRowId(item.outboundId)}
                      onMouseLeave={() => setHoveredRowId(null)}
                    >
                      <td style={styles.td}>
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td style={styles.td}>{item.outboundOUTNum}</td>
                      <td style={styles.td}>{item.partnerName}</td>
                      <td style={styles.td}>{item.itemCode}</td>
                      <td style={styles.td}>{item.itemName}</td>
                      <td style={styles.td}>{item.classification}</td>

                      {/* 출고 수량 - 인라인 편집 */}
                      <td style={styles.td}>
                        {isEditing && editingData2 ? (
                          <TextField
                            type="number"
                            name="qty"
                            value={editingData2.qty}
                            onChange={handleInlineInputChange2}
                            size="small"
                            error={!!editingErrors2.qty}
                            helperText={editingErrors2.qty}
                            inputProps={{ min: 1 }}
                            sx={{
                              "& .MuiInputBase-input": {
                                p: "6px 8px",
                                fontSize: "13px",
                              },
                              "& .MuiInputLabel-root": { top: "-5px" },
                            }}
                          />
                        ) : (
                          item.qty
                        )}
                      </td>

                      {/* 출고 일자 - 인라인 편집 */}
                      <td style={styles.td}>
                        {isEditing && editingData2 ? (
                          <DatePicker
                            selected={
                              editingData2.shippedAt
                                ? parseISO(editingData2.shippedAt)
                                : null
                            }
                            onChange={handleInlineDateChange2}
                            dateFormat="yyyy-MM-dd"
                            customInput={
                              <TextField
                                size="small"
                                sx={{
                                  "& .MuiInputBase-input": {
                                    p: "6px 8px",
                                    fontSize: "13px",
                                  },
                                  "& .MuiInputLabel-root": { top: "-5px" },
                                }}
                                error={!!editingErrors2.shippedAt}
                                helperText={editingErrors2.shippedAt}
                              />
                            }
                            wrapperClassName="date-picker-wrapper"
                          />
                        ) : (
                          item.shippedAt
                        )}
                      </td>

                      {/* <td style={styles.td}>
                        {format(parseISO(item.createdAt), "yyyy-MM-dd HH:mm")}
                      </td> */}

                      {/* <td style={styles.td}>{item.isCancelled ? "Y" : "N"}</td> */}

                      <td style={styles.td}>
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                        >
                          {isEditing ? (
                            <>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() =>
                                  handleSaveClick2(item.outboundId)
                                }
                                sx={{ fontSize: "0.7rem" }}
                              >
                                저장
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={handleCancelEditClick}
                                sx={{ fontSize: "0.7rem" }}
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
                                onClick={() => handleOutboundEditClick(item)}
                                disabled={item.isCancelled}
                                sx={{ fontSize: "0.7rem" }}
                              >
                                수정
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                size="small"
                                onClick={() =>
                                  handleOutboundDelete(item.outboundId)
                                }
                                disabled={item.isCancelled}
                                sx={{ fontSize: "0.7rem" }}
                              >
                                삭제
                              </Button>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() =>
                                  handleOutboundDelete(item.outboundId)
                                }
                                disabled={item.isCancelled}
                                sx={{ fontSize: "0.7rem" }}
                              >
                                출하증
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
            {editingErrors.general && (
              <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                {editingErrors.general}
              </Typography>
            )}
          </div>
        )}

      {/* 엑셀 다운로드 버튼 */}
      {/* <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "20px",
        }}
      >
        <button onClick={handleExcelDownload}>📥 EXCEL 다운로드</button>
      </div> */}

      {/* 입고이력 페이징 UI */}
      {!isLoading &&
        !error &&
        currentHistoryType === "INBOUND" &&
        inboundHistory.length > 0 && (
          <div style={styles.paginationContainer}>
            <button
              style={styles.pageButton(false)}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                const maxPagesToShow = 5;
                if (totalPages <= maxPagesToShow) return true;
                if (currentPage <= Math.ceil(maxPagesToShow / 2)) {
                  return page <= maxPagesToShow;
                }
                if (currentPage > totalPages - Math.floor(maxPagesToShow / 2)) {
                  return page > totalPages - maxPagesToShow;
                }
                return (
                  page >= currentPage - Math.floor(maxPagesToShow / 2) &&
                  page <= currentPage + Math.floor(maxPagesToShow / 2)
                );
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

      {/* 출고이력 페이징 UI */}
      {!isLoading &&
        !error &&
        currentHistoryType === "OUTBOUND" &&
        outboundHistory.length > 0 && (
          <div style={styles.paginationContainer}>
            <button
              style={styles.pageButton(false)}
              onClick={() => handlePageChange2(currentPage - 1)}
              disabled={currentPage === 1}
            >
              이전
            </button>
            {Array.from({ length: totalPages2 }, (_, i) => i + 1)
              .filter((page) => {
                const maxPagesToShow = 5;
                if (totalPages2 <= maxPagesToShow) return true;
                if (currentPage <= Math.ceil(maxPagesToShow / 2)) {
                  return page <= maxPagesToShow;
                }
                if (
                  currentPage >
                  totalPages2 - Math.floor(maxPagesToShow / 2)
                ) {
                  return page > totalPages2 - maxPagesToShow;
                }
                return (
                  page >= currentPage - Math.floor(maxPagesToShow / 2) &&
                  page <= currentPage + Math.floor(maxPagesToShow / 2)
                );
              })
              .map((page) => (
                <button
                  key={page}
                  style={styles.pageButton(page === currentPage)}
                  onClick={() => handlePageChange2(page)}
                >
                  {page}
                </button>
              ))}
            <button
              style={styles.pageButton(false)}
              onClick={() => handlePageChange2(currentPage + 1)}
              disabled={currentPage === totalPages2 || totalPages2 === 0}
            >
              다음
            </button>
          </div>
        )}
    </div>
  );
}
