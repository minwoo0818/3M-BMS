import {
  Button,
  MenuItem,
  Select,
  TextField,
  type SelectChangeEvent,
  Stack,
} from "@mui/material";
import React, {
  useState,
  useEffect,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useParams, useNavigate } from "react-router-dom"; // ⭐️ useParams, useNavigate 임포트

// ProcessItem 인터페이스는 등록 페이지와 동일하게 사용
interface ProcessItem {
  no: number;
  processCode: string;
  processName: string;
  processContent: string;
  processTime: number;
}

type SearchOption = "전체" | "공정코드" | "공정명";

// ⭐️ 더미 상세 데이터 (조회 페이지에서 클릭된 항목이라고 가정)
const dummySalesItem = {
  partnerName: "코드하우스",
  itemName: "핀걸이 스프링",
  itemCode: "Code-001",
  price: "1000",
  color: "아이보리",
  classification: "방산",
  coatingMethod: "분체도장",
  remark: "고객 요청사항: 특수 마감 필요",
  ACTIVE: "Y",
  routings: [
    {
      no: 1,
      processCode: "PRC-001",
      processName: "절단",
      processContent: "원자재를 규격에 맞게 절단합니다.",
      processTime: 30,
    },
    {
      no: 2,
      processCode: "PRC-002",
      processName: "도장",
      processContent: "분체 도장 작업을 수행합니다.",
      processTime: 45,
    },
  ],
};

// ⭐️ 상세/수정 페이지 컴포넌트 시작
const SalesItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // URL 파라미터에서 ID 가져오기
  const navigate = useNavigate();

  // ⭐️ [STATE 1] 폼 데이터: 초기값을 더미 데이터로 설정
  const [form, setForm] = useState({
    partnerName: dummySalesItem.partnerName,
    itemName: dummySalesItem.itemName,
    itemCode: dummySalesItem.itemCode,
    price: dummySalesItem.price,
    color: dummySalesItem.color,
    classification: dummySalesItem.classification,
    coatingMethod: dummySalesItem.coatingMethod,
    remark: dummySalesItem.remark,
  });

  // ⭐️ [STATE 2] 수정 모드 상태: 초기에는 조회 모드 (false)
  const [isEditMode, setIsEditMode] = useState(false);

  // ⭐️ [STATE 3] 선택된 공정 항목: 초기값을 더미 라우팅 데이터로 설정
  const [selectedRoutings, setSelectedRoutings] = useState<ProcessItem[]>(
    dummySalesItem.routings
  );

  // ... (나머지 공정 검색 관련 상태는 등록 페이지와 동일하게 유지)
  const [searchType, setSearchType] = useState<SearchOption>("전체");
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  // ⭐️ 가상 데이터 (선택 가능 공정 목록 - 기존 등록 페이지의 fullData와 동일)
  const fullProcessData: ProcessItem[] = [
    {
      no: 1,
      processCode: "PRC-001",
      processName: "절단",
      processContent: "원자재를 규격에 맞게 절단합니다.",
      processTime: 30,
    },
    {
      no: 2,
      processCode: "PRC-002",
      processName: "도장",
      processContent: "분체 도장 작업을 수행합니다.",
      processTime: 45,
    },
    {
      no: 3,
      processCode: "PRC-003",
      processName: "용접",
      processContent: "구조물 접합 작업을 수행합니다.",
      processTime: 60,
    },
  ];
  const currentProcessData = fullProcessData;

  // ⭐️ [효과] ID가 변경될 때마다 데이터를 로드하는 로직 (실제 API 호출)
  useEffect(() => {
    console.log(`품목 ID ${id}의 데이터를 로드합니다.`);
    // TODO: 실제 API 호출을 통해 dummySalesItem을 대체할 데이터 로드
    // 로드 후 setForm, setSelectedRoutings 업데이트
  }, [id]);

  // ⭐️ [핸들러] 체크박스 핸들러 (선택된 라우팅 목록을 ProcessItem 객체로 관리)
  const handleRoutingCheckboxChange = (item: ProcessItem) => {
    setSelectedRoutings((prev) => {
      if (prev.find((r) => r.processCode === item.processCode)) {
        return prev.filter((r) => r.processCode !== item.processCode);
      } else {
        // 기존 선택 항목의 순서를 유지하고, 새 항목을 추가
        return [...prev, item];
      }
    });
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    alert(`공정 검색: ${searchType} - ${searchTerm}`);
  };

  // 기존 등록 페이지의 handleChange 함수 사용 (MUI Select/TextField 겸용)
  const handleChange = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<unknown>
  ) => {
    const name = e.target.name!;
    const value = e.target.value;
    setForm({ ...form, [name]: value });
  };

  // ⭐️ [핸들러] 수정/등록/삭제 버튼 핸들러
  const handleEditToggle = () => {
    if (isEditMode) {
      // 수정 완료 로직 (API 호출)
      console.log("품목 수정 완료:", form, "라우팅:", selectedRoutings);
      alert("품목 수정이 완료되었습니다.");
    }
    // 상태 토글
    setIsEditMode(!isEditMode);
  };

  // const handleDelete = () => {
  //   if (window.confirm("정말로 이 품목을 삭제하시겠습니까?")) {
  //     console.log(`품목 ID ${id} 삭제 요청`);
  //     // TODO: 실제 API 호출로 삭제
  //     alert("품목이 삭제되었습니다.");
  //     navigate("/sales/view"); // 조회 페이지로 돌아가기
  //   }
  // };

  const handleCancel = () => {
    // 수정 중 취소 시 원래 데이터로 복구하는 로직 추가 가능
    // 여기서는 간단히 조회 페이지로 돌아가기
    navigate("/sales/item/history");
  };

  // ... (옵션 및 스타일은 등록 페이지와 동일하게 사용)
  const partnerOptions = ["삼성전자", "LG화학", "현대중공업", "코드하우스"];
  const classificationOptions = ["방산", "일반", "자동차", "조선"];
  const coatingOptions = ["분체도장", "액체도장", "도금"];

  // 스타일 객체는 기존 등록 페이지의 로컬 스타일을 그대로 사용
  const styles = {
    // ... (기존 등록 페이지의 styles 객체 내용)
    searchContainer: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "12px",
    },
    searchGroup: { display: "flex", flex: 1, gap: "8px" },
    searchSelect: {
      fontSize: "15px",
      padding: "6px",
      border: "1px solid #ccc",
      borderRadius: "6px",
    },
    input: {
      flex: 1,
      padding: "6px 10px",
      fontSize: "15px",
      border: "1px solid #ccc",
      borderRadius: "6px",
    },
    searchButton: {
      padding: "6px 12px",
      backgroundColor: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
    },
    tableContainer: {
      border: "1px solid #ccc",
      borderRadius: "8px",
      overflow: "hidden",
      backgroundColor: "white",
    },
    table: { width: "100%", borderCollapse: "collapse" as const },
    th: (first: boolean, last: boolean) => ({
      padding: "10px",
      backgroundColor: "#f3f4f6",
      borderBottom: "1px solid #ddd",
      textAlign: "center" as const,
      fontWeight: 600,
      fontSize: "15px",
      borderTopLeftRadius: first ? "8px" : "0px",
      borderTopRightRadius: last ? "8px" : "0px",
    }),
    td: {
      padding: "8px",
      borderBottom: "1px solid #eee",
      textAlign: "center" as const,
      fontSize: "14px",
    },
    tdHover: { backgroundColor: "#f9fafb" },
  };

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "0px",
        position: "relative",
      }}
    >
      <h1 style={{ fontSize: "24px", marginBottom: "32px", textAlign: "left" }}>
        수주품목 관리 - {isEditMode ? "수정" : "상세조회"}
      </h1>

      <Stack
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleEditToggle();
        }}
      >
        <div style={{ display: "flex", gap: "40px" }}>
          {/* 왼쪽 입력 영역 */}
          <div style={{ flex: 2 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              {/* 2열 입력 필드 (읽기/수정 모드에 따라 disabled 설정) */}
              {[
                {
                  label: "업체명",
                  name: "partnerName",
                  type: "select",
                  options: partnerOptions,
                },
                { label: "품목명", name: "itemName" },
                { label: "품목번호", name: "itemCode" },
                { label: "단가", name: "price" },
                { label: "색상", name: "color" },
                {
                  label: "분류",
                  name: "classification",
                  type: "select",
                  options: classificationOptions,
                },
                {
                  label: "도장방식",
                  name: "coatingMethod",
                  type: "select",
                  options: coatingOptions,
                },
              ].map((field) => (
                <div key={field.name}>
                  <label
                    style={{
                      fontSize: "18px",
                      display: "block",
                      marginBottom: "2px",
                    }}
                  >
                    {field.label}
                  </label>
                  {field.type === "select" ? (
                    <Select
                      name={field.name}
                      value={String(form[field.name as keyof typeof form])}
                      onChange={handleChange}
                      fullWidth
                      sx={{ fontSize: 18 }}
                      inputProps={{ sx: { fontSize: 18 } }}
                      disabled={!isEditMode} // ⭐️ 수정 모드가 아니면 비활성화
                    >
                      {/* Select는 value가 없으면 에러가 날 수 있으므로 기본 '선택' 항목은 제외하거나, 해당 필드가 필수인지 확인 필요 */}
                      {field.options!.map((option) => (
                        <MenuItem
                          key={option}
                          value={option}
                          sx={{ fontSize: 17 }}
                        >
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : (
                    <TextField
                      name={field.name}
                      value={form[field.name as keyof typeof form]}
                      onChange={handleChange}
                      fullWidth
                      inputProps={{ style: { fontSize: 17 } }}
                      disabled={!isEditMode} // ⭐️ 수정 모드가 아니면 비활성화
                    />
                  )}
                </div>
              ))}
            </div>

            {/* 비고 */}
            <div style={{ marginTop: "12px" }}>
              <label
                style={{
                  fontSize: "18px",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                비고
              </label>
              <TextField
                name="remark"
                value={form.remark}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
                inputProps={{ style: { fontSize: 17 } }}
                disabled={!isEditMode} // ⭐️ 수정 모드가 아니면 비활성화
              />
            </div>

            {/* 라우팅란 */}
            <div style={{ marginTop: "12px" }}>
              <label
                style={{
                  fontSize: "18px",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                라우팅 (선택된 공정: {selectedRoutings.length}건)
              </label>

              {/* 공정 검색 및 조회 */}
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
                {/* 검색 필드는 수정 모드일 때만 활성화 */}
                <div style={styles.searchGroup}>
                  <select
                    value={searchType}
                    onChange={(e) =>
                      setSearchType(e.target.value as SearchOption)
                    }
                    style={styles.searchSelect}
                    disabled={!isEditMode}
                  >
                    <option value="전체">전체</option>
                    <option value="공정코드">공정 코드</option>
                    <option value="공정명">공정명</option>
                    <option value="내용">내용</option>
                  </select>

                  <input
                    style={styles.input}
                    placeholder="공정 코드, 공정명, 내용으로 검색해 주세요."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={!isEditMode}
                  />
                </div>

                <button
                  type="submit"
                  style={styles.searchButton}
                  disabled={!isEditMode}
                >
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
                  {" "}
                  {fullProcessData.length.toLocaleString()}{" "}
                </span>{" "}
                건 조회됨
              </p>

              {/* 공정 목록 테이블 */}
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th(true, false)}>선택</th>
                      <th style={styles.th(false, false)}>공정 코드</th>
                      <th style={styles.th(false, false)}>공정명</th>
                      <th style={styles.th(false, false)}>공정 내용</th>
                      <th style={styles.th(false, true)}>소요 시간 (min)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProcessData.length === 0 ? (
                      <tr key="no-data">
                        <td colSpan={5} style={styles.td}>
                          {" "}
                          조회된 공정 데이터가 없습니다.{" "}
                        </td>
                      </tr>
                    ) : (
                      currentProcessData.map((item) => {
                        const isHovered = hoveredRow === item.no;
                        const isSelected = selectedRoutings.some(
                          (r) => r.processCode === item.processCode
                        ); // ⭐️ 선택 여부 확인
                        return (
                          <tr
                            key={item.processCode}
                            style={isHovered ? styles.tdHover : {}}
                            onMouseEnter={() => setHoveredRow(item.no)}
                            onMouseLeave={() => setHoveredRow(null)}
                          >
                            <td style={{ ...styles.td, width: "5%" }}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() =>
                                  handleRoutingCheckboxChange(item)
                                }
                                disabled={!isEditMode} // ⭐️ 수정 모드가 아니면 비활성화
                              />
                            </td>
                            <td style={{ ...styles.td, width: "15%" }}>
                              {item.processCode}
                            </td>
                            <td style={{ ...styles.td, width: "15%" }}>
                              {item.processName}
                            </td>
                            <td
                              style={{
                                ...styles.td,
                                width: "45%",
                                textAlign: "left" as const,
                                color: "#4b5563",
                                fontSize: "13px",
                              }}
                            >
                              {item.processContent}
                            </td>
                            <td
                              style={{
                                ...styles.td,
                                width: "10%",
                                fontWeight: "bold",
                                color: "#1d4ed8",
                              }}
                            >
                              {item.processTime}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 오른쪽 이미지 영역 */}
          <div style={{ width: "360px" }}>
            <div
              style={{
                height: "500px",
                border: "1px dashed #aaa",
                borderRadius: "8px",
                backgroundColor: "#fafafa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              {/* 이미지 미리보기 로직은 등록 페이지와 동일하게 유지 */}
              <span style={{ fontSize: "17px", color: "#999" }}>
                품목 이미지 (등록된 이미지 표시)
              </span>
            </div>
            {/* 파일 첨부 필드는 수정 모드일 때만 표시 */}
            {isEditMode && (
              <input
                type="file"
                accept="image/*" /* onChange={handleFileChange} */
              />
            )}
          </div>
        </div>

        {/* 버튼 영역: 수정 모드에 따라 버튼 변경 */}
        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-end"
          sx={{ pt: 3, position: "absolute", bottom: "-50px", right: "-20px" }}
        >
          {/* 1. 수정/저장 버튼 */}
          <Button
            type={isEditMode ? "submit" : "button"} // 수정 모드일 때만 submit
            variant="contained"
            sx={{
              px: 5,
              py: 1.5,
              fontSize: 14,
              bgcolor: isEditMode ? "#22c55e" : "#2563eb",
              "&:hover": { bgcolor: isEditMode ? "#16a34a" : "#1d4ed8" },
            }}
            onClick={!isEditMode ? handleEditToggle : undefined} // 조회 모드일 때만 클릭 이벤트 직접 처리
          >
            {isEditMode ? "저장 (수정 완료)" : "수정"}
          </Button>

          {/* 2. 취소 버튼 (항상 표시) */}
          <Button
            variant="outlined"
            onClick={handleCancel}
            sx={{ px: 5, py: 1.5, fontSize: 14 }}
          >
            취소
          </Button>
        </Stack>
      </Stack>
    </div>
  );
};

export default SalesItemDetailPage;
