import React, { useState, ChangeEvent, FormEvent } from "react";
import { Select, MenuItem, TextField, Button } from "@mui/material";

interface ProcessItem {
  no: number;
  processCode: string;
  processName: string;
  processContent: string;
  processTime: number;
}

type SearchOption = "전체" | "공정코드" | "공정명";

const SalesItemRegisterPage: React.FC = () => {
  // 폼 데이터 상태
  const [form, setForm] = useState({
    partnerName: "",
    itemName: "",
    itemCode: "",
    price: "",
    color: "",
    classification: "",
    coatingMethod: "",
    remark: "",
  });

  const [operations, setOperations] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  // 공정 검색 관련 상태
  const [searchType, setSearchType] = useState<SearchOption>("전체");
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // 가상 데이터 (예시)
  const fullData: ProcessItem[] = [
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
  ];

  const ITEMS_PER_PAGE = 10;
  const currentPage = 1;
  const currentData = fullData;

  // 체크박스 핸들러
  const handleCheckboxChange = (code: string) => {
    setSelectedItems((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    alert(`검색: ${searchType} - ${searchTerm}`);
  };

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }
    >
  ) => {
    const name = e.target.name!;
    const value = e.target.value;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);
    setPreview(selectedFile ? URL.createObjectURL(selectedFile) : "");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert("등록 완료!");
  };

  const handleReset = () => {
    setForm({
      partnerName: "",
      itemName: "",
      itemCode: "",
      price: "",
      color: "",
      classification: "",
      coatingMethod: "",
      remark: "",
    });
    setOperations("");
    setFile(null);
    setPreview("");
    setSelectedItems([]);
  };

  const partnerOptions = ["삼성전자", "LG화학", "현대중공업"];
  const classificationOptions = ["방산", "일반", "자동차", "조선"];
  const coatingOptions = ["분체도장", "액체도장"];

  // 스타일 객체
  const styles = {
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
    table: {
      width: "100%",
      borderCollapse: "collapse" as const,
    },
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
        수주품목 관리 - 등록
      </h1>

      <form onSubmit={handleSubmit}>
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
              {/* 2열 입력 필드 */}
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
                      value={form[field.name as keyof typeof form]}
                      onChange={handleChange}
                      fullWidth
                      sx={{ fontSize: 18 }}
                      inputProps={{ sx: { fontSize: 18 } }}
                    >
                      {field.options!.map((option) => (
                        <MenuItem key={option} value={option} sx={{ fontSize: 17 }}>
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
                라우팅
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
                <div style={styles.searchGroup}>
                  <select
                    value={searchType}
                    onChange={(e) =>
                      setSearchType(e.target.value as SearchOption)
                    }
                    style={styles.searchSelect}
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
                      <th style={styles.th(true, false)}>선택</th>
                      <th style={styles.th(false, false)}>공정 코드</th>
                      <th style={styles.th(false, false)}>공정명</th>
                      <th style={styles.th(false, false)}>공정 내용</th>
                      <th style={styles.th(false, true)}>소요 시간 (min)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length === 0 ? (
                      <tr key="no-data">
                        <td colSpan={5} style={styles.td}>
                          조회된 공정 데이터가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      currentData.map((item) => {
                        const isHovered = hoveredRow === item.no;
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
                                checked={selectedItems.includes(item.processCode)}
                                onChange={() =>
                                  handleCheckboxChange(item.processCode)
                                }
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
              {preview ? (
                <img
                  src={preview}
                  alt="미리보기"
                  style={{ maxHeight: "100%", maxWidth: "100%" }}
                />
              ) : (
                <span style={{ fontSize: "17px", color: "#999" }}>
                  이미지 미리보기 영역
                </span>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>
        </div>

        {/* 버튼 영역 */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            right: "-20px",
            display: "flex",
            gap: "16px",
          }}
        >
          <Button
            type="submit"
            variant="contained"
            sx={{ px: 5, py: 1.5, fontSize: 14 }}
          >
            등록
          </Button>
          <Button
            variant="outlined"
            onClick={handleReset}
            sx={{ px: 5, py: 1.5, fontSize: 14 }}
          >
            취소
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SalesItemRegisterPage;
