import {
    Button,
    MenuItem,
    Select,
    TextField,
    type SelectChangeEvent,
} from "@mui/material";
import React, { useState, useMemo, type ChangeEvent, type FormEvent, useCallback, useEffect } from "react";
// ⭐️ [추가/수정] 공정 조회 API 및 타입 import
import { registerSalesItem, fetchActivePartners, fetchAllOperations } from "../api/salesItemApi"; 
import type { OperationResponseDto } from "../api/salesItemApi.ts";

// Back-end Operations Entity에 맞춰 ID 추가 (프론트엔드에서 사용할 일관된 이름)
interface ProcessItem {
    operationId: number; // Back-end Long operationId에 매칭
    processCode: string; // Back-end code에 매칭
    processName: string; // Back-end name에 매칭
    processContent: string; // Back-end description에 매칭
    processTime: number; // Back-end standardTime에 매칭
}

// ⭐️ [수정] API 응답 형식에 맞게 name 필드를 사용하도록 수정
// (원래 API DTO와 필드명이 다르지만, 사용자님의 콘솔 출력 형식에 맞춤)
interface CustomPartnerSelectResponseDto {
    partnerId: number;
    name: string; // API 응답 형식에 맞춰 'partnerName' 대신 'name' 사용
}

type PartnerOption = CustomPartnerSelectResponseDto; 

type SearchOption = "전체" | "공정코드" | "공정명";

const SalesItemRegisterPage: React.FC = () => {
    
    // 전체 공정 목록 상태 (검색 필터링 전 원본 데이터)
    const [fullData, setFullData] = useState<ProcessItem[]>([]); 
    // ⭐️ [수정] 업체 목록 상태 - 수정된 CustomPartnerSelectResponseDto[] 사용
    const [partners, setPartners] = useState<PartnerOption[]>([]);

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
    const [searchKeyword, setSearchKeyword] = useState(""); 
    const [actualSearchTerm, setActualSearchTerm] = useState(""); 
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [selectedOperationIds, setSelectedOperationIds] = useState<number[]>([]);
    
    // ⭐️ [수정] 컴포넌트 마운트 시 활성 거래처 목록을 불러오는 useEffect
    useEffect(() => {
    const loadPartners = async () => {
        try {
            // API에서 정의한 fetchActivePartners를 호출하지만, 반환되는 데이터 구조가
            // { partnerId: number, name: string } 형태라고 가정하고 처리
            const partnersData = await fetchActivePartners();
            
            // 💡 [핵심 수정 부분] 만약 API가 CustomPartnerSelectResponseDto 형식으로 데이터를 반환한다면,
            // (즉, partnerName이 아닌 name으로 반환한다면) 아래와 같이 매핑하거나,
            // 아니면 API 함수의 반환 타입을 정확히 CustomPartnerSelectResponseDto[]로 설정해야 합니다.
            // 일단은 fetchActivePartners가 CustomPartnerSelectResponseDto[]를 반환한다고 가정합니다.
            setPartners(partnersData as PartnerOption[]);
        } catch (error) {
            console.error('거래처 목록 조회 실패:', error);
            alert('거래처 목록을 불러오는 데 실패했습니다.');
        }
    };
    loadPartners();
}, []);


    // 컴포넌트 마운트 시 모든 공정 목록을 불러오는 useEffect (유지)
    useEffect(() => {
        const loadOperations = async () => {
            try {
                const data = await fetchAllOperations();
                
                const mappedData: ProcessItem[] = data.map((item: OperationResponseDto) => ({
                    operationId: item.operationId,
                    processCode: item.code,
                    processName: item.name,
                    processContent: item.description,
                    processTime: item.standardTime,
                }));

                setFullData(mappedData); // 전체 공정 데이터 저장
            } catch (error) {
                console.error('공정 목록 조회 실패:', error);
                alert('공정 목록을 불러오는 데 실패했습니다.'); 
            }
        };
        loadOperations();
    }, []);
    
    const classificationOptions = ["방산", "일반", "자동차", "조선"];
    const coatingOptions = ["분체도장", "액체도장"];


    // 공정 검색 필터링 로직 (유지)
    const filteredData = useMemo(() => {
        const lowerCaseSearchTerm = actualSearchTerm.toLowerCase().trim(); 

        if (!lowerCaseSearchTerm) {
            return fullData; // 검색어가 없으면 전체 데이터 반환
        }
        
        return fullData.filter((item) => { // 검색어가 있으면 필터링 실행
            switch (searchType) {
                case "공정코드":
                    return item.processCode.toLowerCase().includes(lowerCaseSearchTerm);
                case "공정명":
                    return item.processName.toLowerCase().includes(lowerCaseSearchTerm);
                default: // 전체
                    return (
                        item.processCode.toLowerCase().includes(lowerCaseSearchTerm) ||
                        item.processName.toLowerCase().includes(lowerCaseSearchTerm) ||
                        item.processContent.toLowerCase().includes(lowerCaseSearchTerm)
                    );
            }
        });
    }, [fullData, actualSearchTerm, searchType]);

    const currentData = filteredData;


    // 체크박스 핸들러 (유지)
    const handleCheckboxChange = (id: number) => {
        setSelectedOperationIds((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    };

    // 검색 로직 (유지)
    const handleSearch = useCallback(() => {
        setActualSearchTerm(searchKeyword); 
        console.log(`검색 실행: ${searchType} - ${searchKeyword}`);
    }, [searchKeyword, searchType]); 

    // Enter 키 입력 시 handleSearch 실행 (유지)
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
        
        // partnerId는 Number로 변환 (유지)
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

    // 등록 로직 (유지)
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
        console.log("📦 salesItemDto:", salesItemDto);

        const formData = new FormData();
        formData.append(
  "data",
  new Blob([JSON.stringify(salesItemDto)], { type: "application/json;charset=UTF-8" }));
        if (file) formData.append("file", file);
          console.log("📦 FormData 내용:");
  formData.forEach((value, key) => {
    console.log(`  ${key}:`, value);
  });
        try {
            await registerSalesItem(salesItemDto);
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
        setSearchKeyword(""); 
        setActualSearchTerm(""); 
        setSearchType("전체");
    };

    // 스타일 객체 (유지)
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
                                    // ⭐️ [수정] partners 사용
                                    options: partners, 
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
                                            value={
                                            field.name === 'partnerId'
                                                ? (form.partnerId === null ? "" : form.partnerId)
                                                : form[field.name as keyof typeof form]
                                            }
                                            onChange={handleChange}
                                            fullWidth
                                            sx={{ fontSize: 18 }}
                                            inputProps={{ sx: { fontSize: 18 } }}
                                        >
                                            {field.name === 'partnerId' ? (
                                            [
                                                <MenuItem key="placeholder-select" value="" sx={{ fontSize: 17, color: '#999' }}>
                                                --- 업체 선택 ---
                                                </MenuItem>,
                                                // ⭐️ [핵심 수정] partnerName 대신 option.name 사용
                                                ...(Array.isArray(field.options)
                                                ? (field.options as PartnerOption[]).map((option) => (
                                                        <MenuItem 
                                                            key={option.partnerId} 
                                                            value={option.partnerId} 
                                                            sx={{ fontSize: 17 }}
                                                        >
                                                            {option.name} 
                                                        </MenuItem>
                                                        ))
                                                : [])
                                            ]
                                            ) : (
                                            // 일반 select (classification, coatingMethod)
                                            Array.isArray(field.options)
                                                ? (field.options as string[]).map((option) => (
                                                        <MenuItem key={option} value={option} sx={{ fontSize: 17 }}>
                                                        {option}
                                                        </MenuItem>
                                                        ))
                                                : null
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
                                        value={searchKeyword} 
                                        onChange={(e) => setSearchKeyword(e.target.value)} 
                                        onKeyDown={handleSearchKeyDown} 
                                    />
                                </div>

                                {/* 검색 버튼에 onClick 이벤트 연결 */}
                                <button 
                                    type="button" 
                                    onClick={handleSearch} 
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