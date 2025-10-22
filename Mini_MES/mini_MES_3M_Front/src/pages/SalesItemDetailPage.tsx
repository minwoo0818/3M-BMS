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
import { useParams, useNavigate } from "react-router-dom";

interface ProcessItem {
  no: number;
  processCode: string;
  processName: string;
  processContent: string;
  processTime: number;
}

type SearchOption = "전체" | "공정코드" | "공정명";

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

const SalesItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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

  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRoutings, setSelectedRoutings] = useState<ProcessItem[]>(
    dummySalesItem.routings
  );

  const [searchType, setSearchType] = useState<SearchOption>("전체");
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

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

  useEffect(() => {
    console.log(`품목 ID ${id}의 데이터를 로드합니다.`);
  }, [id]);

  const handleRoutingCheckboxChange = (item: ProcessItem) => {
    setSelectedRoutings((prev) => {
      if (prev.find((r) => r.processCode === item.processCode)) {
        return prev.filter((r) => r.processCode !== item.processCode);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleSearch = () => {
    alert(`공정 검색: ${searchType} - ${searchTerm}`);
  };

  const handleChange = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<unknown>
  ) => {
    const name = e.target.name!;
    const value = e.target.value;
    setForm({ ...form, [name]: value });
  };

  const handleEditToggle = () => {
    console.log("✏️ 수정 모드로 전환합니다");
    setIsEditMode(true);
  };

  const handleFormSubmit = () => {
    console.log("💾 저장 완료:", form, selectedRoutings);
    alert("품목 수정이 완료되었습니다.");
    setIsEditMode(false);
  };

  const handleCancel = () => {
    navigate("/sales/item/history");
  };

  const partnerOptions = ["삼성전자", "LG화학", "현대중공업", "코드하우스"];
  const classificationOptions = ["방산", "일반", "자동차", "조선"];
  const coatingOptions = ["분체도장", "액체도장", "도금"];

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

      {/* ✅ 수정된 핵심 부분 */}
      <Stack component="form" onSubmit={(e) => e.preventDefault()}>
        <div style={{ display: "flex", gap: "40px" }}>
          <div style={{ flex: 2 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
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
                      disabled={
                        field.name === "partnerName" ? true : !isEditMode
                      }
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
                      disabled={!isEditMode}
                    />
                  )}
                </div>
              ))}
            </div>

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
                disabled={!isEditMode}
              />
            </div>

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

              <div style={styles.searchContainer}>
                <div style={styles.searchGroup}>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as SearchOption)}
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
                  type="button"
                  style={styles.searchButton}
                  disabled={!isEditMode}
                  onClick={handleSearch}
                >
                  🔍
                </button>
              </div>

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
                  {fullProcessData.length.toLocaleString()}
                </span>{" "}
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
                    {currentProcessData.map((item) => {
                      const isHovered = hoveredRow === item.no;
                      const isSelected = selectedRoutings.some(
                        (r) => r.processCode === item.processCode
                      );
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
                              onChange={() => handleRoutingCheckboxChange(item)}
                              disabled={!isEditMode}
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
                              textAlign: "left",
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
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

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
              <span style={{ fontSize: "17px", color: "#999" }}>
                품목 이미지 (등록된 이미지 표시)
              </span>
            </div>
            {isEditMode && <input type="file" accept="image/*" />}
          </div>
        </div>

        {/* ✅ 버튼: 완전 수정됨 */}
        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-end"
          sx={{ pt: 3, position: "absolute", bottom: "-50px", right: "-20px" }}
        >
          <Button
            type="button"
            variant="contained"
            sx={{
              px: 5,
              py: 1.5,
              fontSize: 14,
              bgcolor: isEditMode ? "#22c55e" : "#2563eb",
              "&:hover": { bgcolor: isEditMode ? "#16a34a" : "#1d4ed8" },
            }}
            onClick={() => {
              if (isEditMode) handleFormSubmit();
              else handleEditToggle();
            }}
          >
            {isEditMode ? "저장 (수정 완료)" : "수정"}
          </Button>

          <Button
            type="button"
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
