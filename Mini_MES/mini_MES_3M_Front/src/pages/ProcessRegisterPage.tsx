import React, { useState, useCallback, useEffect } from "react";

import type { ProcessItem, SearchOption } from "../types/process";

import { useCommonStyles } from "../style/useCommonStyles";

import { useProcessStyles } from "../style/useProcessStyles";

import axios from "axios";

// ==========================================================

// 2. 상수 및 더미 데이터

// ==========================================================

// 데이터를 충분히 늘려서 페이징 테스트 용이하게 함 (총 35개)

// const DUMMY_PROCESS_DATA: ProcessItem[] = Array.from(

//   { length: 35 },

//   (_, i) => ({

//     no: i + 1,

//     code: `PC-${10 + i}`,

//     name: `공정명 ${i + 1}`,

//     processContent: `공정 내용 ${i + 1}: 품질 검사 기준`,

//     processTime: 20 + (i % 10),

//   })

// );

const API_BASE_URL = "/api/info/routing";

const ITEMS_PER_PAGE = 10;

// ==========================================================

// 4. 컴포넌트 시작

// ==========================================================

const ProcessRegisterPage: React.FC = () => {
  // ----------------------------------------------------

  // State & Styles

  // ----------------------------------------------------

  const styles = {
    ...useCommonStyles(),

    ...useProcessStyles(),
  };

  // 공정 등록 아코디언 상태 (기본 펼침)

  const [isRegisterOpen, setIsRegisterOpen] = useState(true);

  // 공정 등록 폼 상태

  const [newProcess, setNewProcess] = useState({
    code: "",

    name: "",

    processContent: "",

    processTime: "",
  });

  // 중복 확인 관련 상태 추가

  const [isCodeChecked, setIsCodeChecked] = useState(false); // 중복 확인 버튼을 눌렀는지 여부

  const [isCodeAvailable, setIsCodeAvailable] = useState(false); // 코드가 사용 가능한지 여부

  // 검색/조회 상태

  const [searchType, setSearchType] = useState<SearchOption>("전체");

  const [searchTerm, setSearchTerm] = useState("");

  const [fullData, setFullData] = useState<ProcessItem[]>([]); // 검색 결과 전체 데이터

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  //수정

  const [editingRowId, setEditingRowId] = useState<number | null>(null);

  const [rowEdits, setRowEdits] = useState<
    Record<number, Partial<ProcessItem>>
  >({});

  // 페이징 상태

  const [currentPage, setCurrentPage] = useState(1);

  const [hoveredRow, setHoveredRow] = useState<number | null>(null); // 행 호버 상태

  //   const itemsPerPage = ITEMS_PER_PAGE; // 페이지 당 항목 수: 10개

  const [totalPages, setTotalPages] = useState(1);

  // API 통신 로직 (최소 수정)

  const fetchProcesses = useCallback(async () => {
    setLoading(true);

    setError(null);

    const pageIndex = currentPage; // Spring Page는 0-base

    const params = {
      page: pageIndex,

      limit: ITEMS_PER_PAGE,

      searchType:
        searchType === "공정코드"
          ? "code"
          : searchType === "공정명"
          ? "name"
          : undefined,

      searchTerm: searchTerm || undefined,
    };

    // NOTE: searchType은 백엔드 API 스펙에 맞게 'code', 'name' 등으로 변환 필요

    try {
      const response = await axios.get(API_BASE_URL, { params });

      // API 응답 구조: PageImpl

      const data = response.data;

      // API 응답 필드와 ProcessItem 필드를 매핑하여 저장

      setFullData(data.content || []);

      setTotalPages(data.totalPages);

      setCurrentPage(data.number + 1); // 0-base를 1-base로 변환
    } catch (err) {
      console.error("공정 목록 조회 실패:", err);

      // setError("공정 목록을 불러오는 데 실패했습니다. 서버 상태를 확인하세요.");

      setFullData([]);

      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchType, searchTerm]);

  // 컴포넌트 로딩 및 검색/페이지 변경 시 데이터 호출

  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  // ----------------------------------------------------

  // Handlers

  // ----------------------------------------------------

  // 공정 등록 아코디언 토글

  const handleToggleRegister = useCallback(() => {
    setIsRegisterOpen((prev) => !prev);
  }, []);

  // 공정 등록 입력 변경

  const handleProcessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // 공정 시간은 숫자만 받도록 처리

    if (name === "processTime" && value !== "" && !/^\d+$/.test(value)) return;

    setNewProcess((prev) => ({ ...prev, [name]: value }));
  };

  // 공정 코드 중복 확인

  const handleDuplicateCheck = useCallback(async () => {
    // 1. 입력 유효성 검사

    if (!newProcess.code.trim()) {
      alert("공정 코드를 입력해주세요.");

      return;
    }

    // 2. 상태 초기화 및 로딩 시작

    setIsCodeChecked(false); // 중복 확인을 눌렀음을 나타냄

    setIsCodeAvailable(false); // 기본적으로 사용 불가능으로 설정

    setLoading(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/check-code`, {
        params: { code: newProcess.code },
      });

      console.log("백엔드 응답:", response.data); // true or false

      const isDuplicate = response.data; // true = 중복

      const isCodeUsable = !isDuplicate; // false = 사용 가능

      if (isCodeUsable) {
        alert(`✅ [${newProcess.code}]는 사용 가능한 코드입니다.`);

        setIsCodeAvailable(true);
      } else {
        alert(`❌ [${newProcess.code}]는 이미 존재하는 코드입니다.`);

        setIsCodeAvailable(false);
      }
    } catch (err) {
      console.error("공정 코드 중복 확인 실패:", err);

      alert("중복 확인 중 오류가 발생했습니다. 서버 상태를 확인하세요.");

      setIsCodeAvailable(false);
    } finally {
      setIsCodeChecked(true); // 중복 확인을 완료했음을 기록

      setLoading(false);
    }
  }, [newProcess.code]); // newProcess.code가 변경될 때마다 함수 재생성

  //   const handleDuplicateCheck = useCallback(() => {

  //     if (!newProcess.code) return console.error("공정 코드를 입력해주세요.");

  //     // 실제 API 호출 로직...

  //     const isDuplicate = DUMMY_PROCESS_DATA.some(

  //       (item) => item.code === newProcess.code

  //     );

  //     // Custom Modal 대신 console.log 사용

  //     if (isDuplicate) {

  //       console.error(`[${newProcess.code}]는 이미 존재하는 코드입니다.`);

  //     } else {

  //       console.log(`[${newProcess.code}]는 사용 가능한 코드입니다.`);

  //     }

  //   }, [newProcess.code]);

  // 공정 등록 처리

  const handleRegister = useCallback(async () => {
    if (!newProcess.code || !newProcess.name || !newProcess.processTime) {
      //   return console.error("필수 항목 (코드, 명칭, 시간)을 입력해주세요.");

      console.error("필수 항목 (코드, 명칭, 시간)을 입력해주세요.");

      alert("필수 항목 (코드, 명칭, 시간)을 입력해주세요.");

      return;
    }

    // 코드를 입력한 상태에서 중복 확인을 눌렀고, 사용 가능한 상태여야 등록 가능

    if (!isCodeChecked || !isCodeAvailable) {
      alert(
        "공정 코드 중복 확인을 완료하거나, 사용 가능한 코드로 수정해주세요."
      );

      return;
    }

    const payload = {
      code: newProcess.code,

      name: newProcess.name,

      processContent: newProcess.processContent || "",

      processTime: parseInt(newProcess.processTime) || 0,
    };

    try {
      // POST 요청: /api/info/routing

      await axios.post(API_BASE_URL, payload);

      console.log("공정이 등록되었습니다.");

      // 등록 후 폼 초기화

      setNewProcess({
        code: "",

        name: "",

        processContent: "",

        processTime: "",
      });

      // 등록 후 1페이지로 이동하여 새로고침

      setCurrentPage(1);

      fetchProcesses();
    } catch (err: any) {
      console.error(
        "공정 등록 실패:",

        err.response?.data?.message || "알 수 없는 오류"
      );

      alert(
        "등록 실패: " +
          (err.response?.data?.message || "공정 코드 중복 또는 서버 오류")
      );
    }
  }, [newProcess, isCodeChecked, isCodeAvailable]);

  // const newId = DUMMY_PROCESS_DATA.length + 1;

  // const newEntry: ProcessItem = {

  //   no: newId,

  //   code: newProcess.code,

  //   name: newProcess.name,

  //   processContent: newProcess.processContent || "", // 내용이 비어있을 수 있음

  //   processTime: parseInt(newProcess.processTime) || 0,

  // };

  // 더미 데이터에 추가 및 갱신 (실제 환경에서는 setFullData만 사용)

  // DUMMY_PROCESS_DATA.push(newEntry);

  // setFullData((prev) =>

  //   [{ ...newEntry, no: prev.length + 1 }, ...prev].map((item, index) => ({

  //     ...item,

  //     no: index + 1,

  //   }))

  // ); // 새 항목을 맨 앞에 추가

  //     setNewProcess({ code: "", name: "", processContent: "", processTime: "" }); // 폼 초기화

  //     console.log("공정이 등록되었습니다.");

  //     setCurrentPage(1);

  //   }, [newProcess]);

  // 검색 실행 로직 (검색 후 첫 페이지로 이동)

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault(); // 폼 기본 제출 막기
      console.log("🔍 검색 버튼 눌림");
      setCurrentPage(1); // 검색 시 페이지 초기화
      setLoading(true);
      setError(null);

      const mappedSearchType =
        searchType === "공정코드"
          ? "code"
          : searchType === "공정명"
          ? "name"
          : "all";

      try {
        const response = await axios.get(API_BASE_URL, {
          params: {
            page: 1,
            limit: 10,
            searchType: mappedSearchType,
            searchTerm: searchTerm.trim(),
          },
        });

        // 백엔드가 Page<OperationResponseDto>를 반환하므로 .content 사용
        console.log("🔍 응답 데이터:", response.data);
        setFullData(response.data.content);
      } catch (err) {
        console.error("🔴 검색 실패:", err);
        setError("검색 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [searchType, searchTerm]
  );

  //   const lowerSearchTerm = searchTerm.toLowerCase().trim();

  //   if (!lowerSearchTerm) {

  //     setFullData(DUMMY_PROCESS_DATA); // 검색어 없으면 전체 조회

  //     return;

  //       const filtered = DUMMY_PROCESS_DATA.filter((item) => {

  //         let target: string;

  //         if (searchType === "공정코드") {

  //           target = item.code;

  //         } else if (searchType === "공정명") {

  //           target = item.name;

  //         } else {

  //           target = `${item.code} ${item.name} ${item.processContent}`;

  //         }

  //         return target.toLowerCase().includes(lowerSearchTerm);

  //       });

  //       // 필터링된 데이터에 No를 다시 부여 (No.는 현재 검색/필터링된 순서대로 보여야 함)

  //       const finalData = filtered.map((item, index) => ({

  //         ...item,

  //         no: index + 1,

  //       }));

  //       setFullData(finalData);

  //     },

  //     [searchTerm, searchType]

  //   );

  // ----------------------------------------------------

  // Computed Values (Paging)

  // ----------------------------------------------------

  //   const totalPages = Math.ceil(fullData.length / itemsPerPage);

  //   const currentData = useMemo(() => {

  //     const startIndex = (currentPage - 1) * itemsPerPage;

  //     const endIndex = startIndex + itemsPerPage;

  //     // 현재 페이지에 해당하는 데이터만 잘라서 반환 (10개씩)

  //     return fullData.slice(startIndex, endIndex);

  //   }, [fullData, currentPage, itemsPerPage]);

  // 페이지 이동 핸들러

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },

    [totalPages]
  );

  // 수정/삭제 버튼 핸들러

  //   const handleAction = (item: ProcessItem, action: "수정" | "삭제") => {

  //     console.log(`${item.name} 공정을 [${action}] 합니다. (코드: ${item.code})`);

  // 실제 API 호출 로직...

  //수정

  const handleEditClick = (item: ProcessItem) => {
    setEditingRowId(item.operationId);
    setRowEdits({
      [item.operationId]: { ...item }, // 독립 복사
    });
  };

  const handleEditChange = (
    operationId: number,
    field: keyof ProcessItem,
    value: any
  ) => {
    setRowEdits((prev) => ({
      ...prev,
      [operationId]: {
        ...prev[operationId],
        [field]: value,
      },
    }));
  };

  const handleSaveRow = async (operationId: number) => {
    const editedRow = rowEdits[operationId];

    if (
      !editedRow?.code?.trim() ||
      !editedRow?.name?.trim() ||
      editedRow.processTime == null
    ) {
      alert("필수 항목(코드, 명칭, 시간)을 입력해주세요.");
      return;
    }

    try {
      // ✅ 공정코드 중복 검사
      const checkRes = await axios.get(`${API_BASE_URL}/check-code`, {
        params: { code: editedRow.code },
      });

      const { isDuplicate, available } = checkRes.data;
      const isCodeUsable = available !== undefined ? available : !isDuplicate;

      if (!isCodeUsable) {
        alert(
          `❌ [${editedRow.code}]는 이미 존재하는 코드입니다. 다른 코드로 수정해주세요.`
        );
        return;
      }

      const payload = {
        code: editedRow.code, // ✅ 백엔드가 필수로 요구할 수 있음
        name: editedRow.name,
        processContent: editedRow.processContent,
        processTime: Number(editedRow.processTime),
      };

      await axios.put(`${API_BASE_URL}/${operationId}`, payload);

      alert("공정이 수정되었습니다.");

      setEditingRowId(null);

      setRowEdits((prev) => {
        const newEdits = { ...prev };
        delete newEdits[operationId];
        return newEdits;
      });

      await fetchProcesses();
    } catch (err) {
      console.error("수정 실패:", err);
      alert("수정 실패: 서버 오류");
    }
  };

  //삭제

  const handleAction = async (item: ProcessItem, action: "수정" | "삭제") => {
    if (action === "삭제") {
      if (!window.confirm(`[${item.code}] 공정을 정말 삭제하시겠습니까?`))
        return;

      try {
        await axios.delete(`${API_BASE_URL}/${item.operationId}`);
        console.log(`[${item.code}] 공정 삭제 성공!`);
        alert("삭제 성공!");
        fetchProcesses(); // 삭제 후 목록 새로고침
      } catch (err: any) {
        console.error("삭제 실패:", err);
        alert(
          "삭제 실패: " + (err.response?.data?.message || "알 수 없는 오류")
        );
      }
    }

    // "수정"은 handleEditClick에서 처리되므로 필요 없음
  };

  // ----------------------------------------------------

  // Render

  // ----------------------------------------------------

  if (loading && fullData.length === 0) {
    return (
      <div
        style={{ ...styles.container, textAlign: "center", paddingTop: "50px" }}
      >
        데이터를 불러오는 중입니다...
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* 1. 헤더 */}

      <h1 style={styles.header}>공정관리 - 등록 및 조회</h1>

      {/* 2. 공정 등록 아코디언 */}

      <div
        style={styles.sectionTitle(isRegisterOpen)}
        onClick={handleToggleRegister}
      >
        <span style={{ fontSize: "18px", fontWeight: "bold" }}>
          {isRegisterOpen ? "▼" : "▶"}
        </span>

        <span>공정 등록</span>
      </div>

      <div style={styles.accordionContent(isRegisterOpen)}>
        {/* 입력 폼 - 항목 명시 및 정렬 */}

        <div style={styles.formRow}>
          <div style={{ ...styles.inputGroup, flex: 1 }}>
            <label style={styles.label}>공정 코드 (필수)</label>

            <input
              style={styles.input}
              name="code"
              value={newProcess.code}
              onChange={handleProcessChange}
              placeholder="예: COAT-01"
            />
          </div>

          <div style={{ ...styles.inputGroup, flex: 1.5 }}>
            <label style={styles.label}>공정명 (필수)</label>

            <input
              style={styles.input}
              name="name"
              value={newProcess.name}
              onChange={handleProcessChange}
              placeholder="예: 습식 도장"
            />
          </div>

          <div style={{ ...styles.inputGroup, flex: 3 }}>
            <label style={styles.label}>공정 내용</label>

            <input
              style={styles.input}
              name="processContent"
              value={newProcess.processContent}
              onChange={handleProcessChange}
              placeholder="예: 2액형 우레탄 도료 사용 및 60분 건조"
            />
          </div>

          <div style={{ ...styles.inputGroup, flex: 0.8 }}>
            <label style={styles.label}>소요 시간 (min)</label>

            <input
              style={styles.input}
              name="processTime"
              type="text" // type="number" 대신 text를 사용하여 입력 제어를 확실히 함
              pattern="\d*" // 모바일 키보드에서 숫자 입력 유도
              value={newProcess.processTime}
              onChange={handleProcessChange}
              placeholder="60"
            />
          </div>

          {/* 중복 확인 버튼 */}

          <button
            style={{
              ...styles.actionButton("#f59e0b"), // amber-600

              height: "40px", // 입력란과 높이 맞춤

              padding: "10px 15px",

              fontWeight: "600",

              // 코드가 입력되지 않았거나 로딩 중일 때 비활성화

              opacity: newProcess.code.trim() && !loading ? 1 : 0.5,

              cursor:
                newProcess.code.trim() && !loading ? "pointer" : "not-allowed",
            }}
            onClick={handleDuplicateCheck}
            disabled={!newProcess.code.trim() || loading}
          >
            코드 중복확인
          </button>

          {/* 공정 등록 버튼 */}

          <button
            style={{
              ...styles.actionButton("#3b82f6"),

              height: "40px", // 입력란과 높이 맞춤

              padding: "10px 15px",

              fontWeight: "600",
            }} // blue-600
            onClick={handleRegister}
          >
            공정 등록
          </button>
        </div>
      </div>

      {/* 3. 검색 및 조회 부분 */}

      <h3
        style={{
          fontSize: "22px",

          fontWeight: "600",

          marginBottom: "12px",

          color: "#1f2937",
        }}
      >
        Q 공정 검색
      </h3>

      <form onSubmit={handleSearch} style={styles.searchContainer}>
        <div style={styles.searchGroup}>
          {/* 검색 타입 선택 */}

          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as SearchOption)}
            style={styles.searchSelect}
          >
            <option value="전체">전체</option>

            <option value="공정코드">공정 코드</option>

            <option value="공정명">공정명</option>
          </select>

          {/* 검색 바 */}

          <input
            style={styles.input}
            placeholder="공정 코드, 공정명, 내용으로 검색해 주세요."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 돋보기 검색 버튼 */}

        <button type="submit" style={styles.searchButton}>
          {/* 돋보기 SVG 아이콘 */}

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

      {/* 4. 데이터 테이블 (현재 페이지 데이터만 사용) */}

      <p
        style={{
          fontSize: "14px",

          color: "#4b5563",

          fontWeight: "500",

          marginBottom: "8px",
        }}
      >
        총{" "}
        <span style={{ color: "#2563eb", fontWeight: "bold" }}>
          {fullData.length.toLocaleString()}
        </span>
        건 조회됨
      </p>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th(true, false)}>No.</th>

              <th style={styles.th(false, false)}>공정 코드</th>

              <th style={styles.th(false, false)}>공정명</th>

              <th style={styles.th(false, false)}>공정 내용</th>

              <th style={styles.th(false, false)}>소요 시간 (min)</th>

              <th style={styles.th(false, true)}>액션</th>
            </tr>
          </thead>

          <tbody>
            {fullData.length === 0 ? (
              <tr key="no-data">
                <td colSpan={6} style={styles.td}>
                  조회된 공정 데이터가 없습니다.
                </td>
              </tr>
            ) : (
              fullData.map((item: ProcessItem, index: number) => {
                const isHovered = hoveredRow === item.no;
                const isEditing = editingRowId === item.operationId;
                const edited = isEditing
                  ? { ...rowEdits[item.operationId] }
                  : { ...item };

                // 순번 계산: 페이지 + 인덱스
                const displayNo =
                  (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

                return (
                  <tr
                    key={`row-${item.operationId}`}
                    style={isHovered ? styles.tdHover : {}}
                    onMouseEnter={() => setHoveredRow(item.no)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td style={{ ...styles.td, width: "5%" }}>{displayNo}</td>

                    <td
                      style={{ ...styles.td, width: "15%", fontWeight: "500" }}
                    >
                      {isEditing ? (
                        <input
                          value={edited.code}
                          onChange={(e) =>
                            handleEditChange(
                              item.operationId,
                              "code",
                              e.target.value
                            )
                          }
                          style={styles.inlineInput}
                        />
                      ) : (
                        item.code
                      )}
                    </td>

                    <td style={{ ...styles.td, width: "15%" }}>
                      {isEditing ? (
                        <input
                          value={edited.name}
                          onChange={(e) =>
                            handleEditChange(
                              item.operationId,
                              "name",
                              e.target.value
                            )
                          }
                          style={styles.inlineInput}
                        />
                      ) : (
                        item.name
                      )}
                    </td>

                    <td
                      style={{
                        ...styles.td,

                        width: "40%",

                        textAlign: "left" as const,

                        color: "#4b5563",

                        fontSize: "13px",
                      }}
                    >
                      {isEditing ? (
                        <input
                          value={edited.processContent}
                          onChange={(e) =>
                            handleEditChange(
                              item.operationId,
                              "processContent",
                              e.target.value
                            )
                          }
                          style={styles.inlineInput}
                        />
                      ) : (
                        item.processContent
                      )}
                    </td>

                    <td
                      style={{
                        ...styles.td,

                        width: "10%",

                        fontWeight: "bold",

                        color: "#1d4ed8",
                      }}
                    >
                      {isEditing ? (
                        <input
                          value={edited.processTime}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleEditChange(
                              item.operationId,
                              "processTime",
                              val === "" ? undefined : parseInt(val)
                            );
                          }}
                          style={styles.inlineInput}
                        />
                      ) : (
                        item.processTime
                      )}
                    </td>

                    <td style={{ ...styles.td, width: "15%" }}>
                      <div
                        style={{
                          display: "flex",

                          justifyContent: "center",

                          gap: "8px",
                        }}
                      >
                        {isEditing ? (
                          <button
                            style={styles.actionButton("#3b82f6")}
                            onClick={() => handleSaveRow(item.operationId)}
                          >
                            저장
                          </button>
                        ) : (
                          <button
                            style={styles.actionButton("#6b7280")}
                            onClick={() => handleEditClick(item)}
                          >
                            수정
                          </button>
                        )}

                        <button
                          style={styles.actionButton("#ef4444")}
                          onClick={() => handleAction(item, "삭제")}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 5. 페이징 UI 구현 */}

      <div style={styles.paginationContainer}>
        <button
          style={{
            ...styles.pageButton(false),

            opacity: currentPage === 1 ? 0.5 : 1,
          }}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          이전
        </button>

        {/* 페이지 번호 렌더링 (최대 5개만 표시) */}

        {Array.from({ length: totalPages }, (_, i) => i + 1)

          .filter((page) => {
            // 페이지네이션 로직은 이전 파일과 동일하게 유지

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
          style={{
            ...styles.pageButton(false),

            opacity: currentPage === totalPages || totalPages === 0 ? 0.5 : 1,
          }}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default ProcessRegisterPage;
