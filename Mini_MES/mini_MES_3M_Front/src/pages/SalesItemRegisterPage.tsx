// SalesItemRegisterPage.tsx

import {
    Button,
    MenuItem,
    Select,
    TextField,
    type SelectChangeEvent,
} from "@mui/material";
import React, { useState, useMemo, type ChangeEvent, type FormEvent, useCallback } from "react";
import { registerSalesItem } from "../api/salesItemApi";

// ⭐️ Back-end Operations Entity에 맞춰 ID 추가
interface ProcessItem {
    operationId: number; // Back-end Long operationId에 매칭
    processCode: string; // Back-end code에 매칭
    processName: string; // Back-end name에 매칭
    processContent: string; // Back-end description에 매칭
    processTime: number; // Back-end standardTime에 매칭
}

// ⭐️ Partner ID를 포함하도록 수정된 DTO Mock 데이터
interface PartnerOption {
    partnerId: number;
    name: string;
}

type SearchOption = "전체" | "공정코드" | "공정명";

const SalesItemRegisterPage: React.FC = () => {
    
    const [form, setForm] = useState({
        partnerId: null as number | null,
        itemName: "",
        itemCode: "",
        price: "",
        color: "",
        classification: "",
        coatingMethod: "",
        remark: "",
    });

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");

    // 공정 검색 관련 상태
    const [searchType, setSearchType] = useState<SearchOption>("전체");
    
    // ⭐️ [수정] 1. Input에 실시간으로 타이핑되는 값
    const [searchKeyword, setSearchKeyword] = useState(""); 
    
    // ⭐️ [수정] 2. 돋보기/Enter 클릭 시에만 업데이트되어 필터링에 사용되는 값
    const [actualSearchTerm, setActualSearchTerm] = useState(""); 
    
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [selectedOperationIds, setSelectedOperationIds] = useState<number[]>([]);

    // ⭐️ 가상 데이터 (예시: operationId 추가)
    const fullData: ProcessItem[] = [
        {
            operationId: 1, // ⭐️ ID
            processCode: "PRC-001",
            processName: "절단",
            processContent: "원자재를 규격에 맞게 절단합니다.",
            processTime: 30,
        },
        {
            operationId: 2, // ⭐️ ID
            processCode: "PRC-002",
            processName: "도장",
            processContent: "분체 도장 작업을 수행합니다.",
            processTime: 45,
        },
        {
            operationId: 3, // ⭐️ ID
            processCode: "PRC-003",
            processName: "용접",
            processContent: "부품 간 용접 작업을 수행합니다.",
            processTime: 60,
        },
    ];

    // ⭐️ 가상 업체 데이터
    const partnerOptions: PartnerOption[] = [
        { partnerId: 1, name: "삼성전자" },
        { partnerId: 2, name: "LG화학" },
        { partnerId: 3, name: "현대중공업" },
    ];
    
    const classificationOptions = ["방산", "일반", "자동차", "조선"];
    const coatingOptions = ["분체도장", "액체도장"];


    // ⭐️ [수정] 공정 검색 필터링 로직: actualSearchTerm 기준으로 실행
    const filteredData = useMemo(() => {
        const lowerCaseSearchTerm = actualSearchTerm.toLowerCase().trim(); // ⭐️ 실제 검색 용어 사용

        if (!lowerCaseSearchTerm) {
            return fullData;
        }
        
        return fullData.filter((item) => {
            switch (searchType) {
                case "공정코드":
                    return item.processCode.toLowerCase().includes(lowerCaseSearchTerm);
                case "공정명":
                    return item.processName.toLowerCase().includes(lowerCaseSearchTerm);
                default:
                    return (
                        item.processCode.toLowerCase().includes(lowerCaseSearchTerm) ||
                        item.processName.toLowerCase().includes(lowerCaseSearchTerm) ||
                        item.processContent.toLowerCase().includes(lowerCaseSearchTerm)
                    );
            }
        });
    }, [fullData, actualSearchTerm, searchType]); // ⭐️ actualSearchTerm이 바뀔 때만 재실행

    const currentData = filteredData;


    // ⭐️ 체크박스 핸들러 (동일)
    const handleCheckboxChange = (id: number) => {
        setSelectedOperationIds((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    };

    // ⭐️ [수정] 검색 로직: 실제 검색어 (actualSearchTerm)를 업데이트
    const handleSearch = useCallback(() => {
        // ⭐️ Input의 현재 값을 필터링에 사용할 값에 설정
        setActualSearchTerm(searchKeyword); 
        console.log(`검색 실행: ${searchType} - ${searchKeyword}`);
    }, [searchKeyword, searchType]); // searchKeyword, searchType이 변경될 때 함수 재생성

    // ⭐️ [수정] Enter 키 입력 시 handleSearch 실행
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    };


    const handleChange = (
        e:
            | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            | SelectChangeEvent<unknown>
    ) => {
        const { name, value } = e.target;
        
        if (name === 'partnerId') {
            setForm({ ...form, partnerId: value === "" ? null : Number(value) });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        setFile(selectedFile || null);
        setPreview(selectedFile ? URL.createObjectURL(selectedFile) : "");
    };

    // ⭐️ [확인 완료] 등록 로직 (FormData 구성 방식이 백엔드 규약에 맞음)
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        if (!form.partnerId || !form.itemName || !form.itemCode || !form.price || selectedOperationIds.length === 0) {
            alert("업체명, 품목명, 품목번호, 단가, 라우팅은 필수 입력 항목입니다.");
            return;
        }

        const numericPrice = parseInt(form.price.replace(/,/g, ''), 10);
        if (isNaN(numericPrice)) {
            alert("단가 형식이 올바르지 않습니다.");
            return;
        }

        const salesItemDto = {
            partnerId: form.partnerId,
            itemName: form.itemName,
            itemCode: form.itemCode,
            price: numericPrice,
            color: form.color,
            classification: form.classification,
            coatingMethod: form.coatingMethod,
            remark: form.remark,
            operationIds: selectedOperationIds,
        };

        const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(salesItemDto)], { type: "application/json" })); 
    if (file) formData.append("file", file);

    try {
        await registerSalesItem(formData);
        alert("품목 등록 완료!");
        handleReset();
    } catch (error) {
        console.error("등록 실패:", error);
        alert("품목 등록에 실패했습니다.");
    }
};

    const handleReset = () => {
        setForm({
            partnerId: null,
            itemName: "",
            itemCode: "",
            price: "",
            color: "",
            classification: "",
            coatingMethod: "",
            remark: "",
        });
        setFile(null);
        setPreview("");
        setSelectedOperationIds([]);
        setSearchKeyword(""); // ⭐️ searchKeyword 초기화
        setActualSearchTerm(""); // ⭐️ actualSearchTerm 초기화
        setSearchType("전체");
    };


    // 스타일 객체 (동일)
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

            {/* 메인 등록 폼 */}
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
                                    name: "partnerId",
                                    type: "select",
                                    options: partnerOptions,
                                },
                                { label: "품목명", name: "itemName" },
                                { label: "품목번호", name: "itemCode" },
                                { label: "단가", name: "price", type: "text" },
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
                                            value={String(form[field.name as keyof typeof form] || '')}
                                            onChange={handleChange}
                                            fullWidth
                                            sx={{ fontSize: 18 }}
                                            inputProps={{ sx: { fontSize: 18 } }}
                                        >
                                            {/* 업체명 드롭다운 렌더링 수정 */}
                                            {field.name === 'partnerId' ? (
                                                (field.options as PartnerOption[]).map((option) => (
                                                    <MenuItem
                                                        key={option.partnerId}
                                                        value={option.partnerId}
                                                        sx={{ fontSize: 17 }}
                                                    >
                                                        {option.name}
                                                    </MenuItem>
                                                ))
                                            ) : (
                                                // 일반 Select 옵션 렌더링
                                                (field.options as string[]).map((option) => (
                                                    <MenuItem
                                                        key={option}
                                                        value={option}
                                                        sx={{ fontSize: 17 }}
                                                    >
                                                        {option}
                                                    </MenuItem>
                                                ))
                                            )}
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

                            <div style={styles.searchContainer}>
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
                                    </select>

                                    <input
                                        style={styles.input}
                                        placeholder="공정 코드, 공정명, 내용으로 검색해 주세요."
                                        value={searchKeyword} // ⭐️ [수정] searchKeyword 사용
                                        onChange={(e) => setSearchKeyword(e.target.value)} // ⭐️ [수정] searchKeyword만 업데이트
                                        onKeyDown={handleSearchKeyDown} // ⭐️ Enter 키 이벤트
                                    />
                                </div>

                                {/* 검색 버튼에 onClick 이벤트 연결 */}
                                <button 
                                    type="button" 
                                    onClick={handleSearch} // ⭐️ [수정] 클릭 시 handleSearch 실행
                                    style={styles.searchButton}
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
                                    {currentData.length.toLocaleString()}
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
                                    
                                    {/* 하이드레이션 오류 방지 (<tbody>와 map을 한 줄에 붙이기) */}
                                    <tbody>{currentData.length === 0 ? (
                                        <tr key="no-data">
                                            <td colSpan={5} style={styles.td}>
                                                조회된 공정 데이터가 없습니다.
                                            </td>
                                        </tr>
                                    ) : (
                                        currentData.map((item) => {
                                            const isHovered = hoveredRow === item.operationId;
                                            return (
                                                <tr
                                                    key={item.operationId}
                                                    style={isHovered ? styles.tdHover : {}}
                                                    onMouseEnter={() => setHoveredRow(item.operationId)}
                                                    onMouseLeave={() => setHoveredRow(null)}
                                                >
                                                    <td style={{ ...styles.td, width: "5%" }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedOperationIds.includes(
                                                                item.operationId
                                                            )}
                                                            onChange={() =>
                                                                handleCheckboxChange(item.operationId)
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
                                    )}</tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽 이미지 영역 (동일) */}
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

                {/* 버튼 영역 (동일) */}
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