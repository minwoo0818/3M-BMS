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
    useMemo, // useMemo 추가
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// API 함수와 DTO 임포트
import { 
    fetchSalesItemDetail, 
    updateSalesItem,
} from "../api/salesItemApi"; 
import type { SalesItemDetailViewDto, SalesItemRegisterData } from "../types/SalesItemDetail";


// ==============================================================================
// DTO 인터페이스 정의 (컴포넌트 내에서 필요한 구조 정의)
// ==============================================================================
interface ProcessItem {
    operationId: number;
    processCode: string;
    processName: string;
    processContent: string;
    processTime: number;
}

type SearchOption = "전체" | "공정코드" | "공정명";

// 초기 상태값
const initialFormState = {
    partnerId: null as number | null,
    partnerName: "",
    itemName: "",
    itemCode: "",
    price: "",
    color: "",
    classification: "",
    coatingMethod: "",
    remark: "",
};

type FormState = typeof initialFormState;

// ==============================================================================
// 컴포넌트
// ==============================================================================
const SalesItemDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [form, setForm] = useState<FormState>(initialFormState);
    const [selectedRoutings, setSelectedRoutings] = useState<ProcessItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchType, setSearchType] = useState<SearchOption>("전체");
    const [searchTerm, setSearchTerm] = useState("");
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [fullProcessData, setFullProcessData] = useState<ProcessItem[]>([]);
    
    // 이미지 관련 상태
    const [file, setFile] = useState<File | null>(null); 
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null); 
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null); 

    const BASE_API_URL = useMemo(() => import.meta.env.VITE_API_URL || "", []);

    // =====================================================================
    // API 호출 함수
    // =====================================================================
    const fetchItemDetail = async (itemId: string, isMounted: boolean = true) => {
        setIsLoading(true);
        try {
            const data = await fetchSalesItemDetail(itemId);

            if (!isMounted) return;

            setForm({
                partnerId: data.partnerId ?? null,
                partnerName: data.partnerName || "",
                itemName: data.itemName || "",
                itemCode: data.itemCode || "",
                price: String(data.price ?? 0),
                color: data.color || "",
                classification: data.classification || "",
                coatingMethod: data.coatingMethod || "",
                remark: data.remark || "",
            });

            const mappedRoutings: ProcessItem[] = Array.isArray(data.operations)
                ? data.operations.map(op => ({
                      operationId: op.operationId,
                      processCode: op.code,
                      processName: op.name,
                      processContent: op.description,
                      processTime: op.standardTime,
                  }))
                : [];

            setSelectedRoutings(mappedRoutings);
            setFullProcessData(mappedRoutings); 
            
           // ⭐ 이미지 URL 설정 로직 수정
            // 백엔드 DTO에 imagePath: 'images/sales/파일명.png'와 같은 가상 경로만 있다고 가정
            const imagePath = (data as SalesItemDetailViewDto).imagePath;
            if (imagePath) {
                // ⭐ 프록시 설정을 사용하기 위해 BASE URL 없이 상대 경로로 요청
                // 예: /images/sales/1761187175570_스크린샷.png
                setExistingImageUrl(`/${imagePath}`); 
            } else {
                setExistingImageUrl(null);
            }
            
            setFile(null); // 파일 초기화
            setPreviewImageUrl(null); // 미리보기 URL 초기화

        } catch (error: any) {
            console.error(error);
            alert("품목 상세 정보를 불러오는 중 오류가 발생했습니다.");
            navigate("/sales/item/history");
        } finally {
            if (isMounted) setIsLoading(false);
        }
    };

    // =====================================================================
    // 이벤트 핸들러
    // =====================================================================
    const handleRoutingCheckboxChange = (item: ProcessItem) => {
        if (!isEditMode) return;
        
        setSelectedRoutings(prev => {
            const exists = prev.find(r => r.operationId === item.operationId);
            if (exists) {
                return prev.filter(r => r.operationId !== item.operationId);
            } else {
                return [...prev, item];
            }
        });
    };

    const handleSearch = () => {
        alert(`공정 검색: ${searchType} - ${searchTerm}`);
    };

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<unknown>
    ) => {
        const { name, value } = e.target;
        if (name !== "partnerId" && name !== "partnerName") {
             setForm({ ...form, [name]: value });
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files ? e.target.files[0] : null;
        setFile(selectedFile);
        
        // ⭐ 1. 새 파일 미리보기 로직 추가
        if (selectedFile) {
            // 기존 미리보기 URL 해제 (메모리 누수 방지)
            if (previewImageUrl) URL.revokeObjectURL(previewImageUrl);
            
            const url = URL.createObjectURL(selectedFile);
            setPreviewImageUrl(url);
        } else {
            if (previewImageUrl) URL.revokeObjectURL(previewImageUrl);
            setPreviewImageUrl(null);
        }
    };

    // 컴포넌트 언마운트 시 미리보기 URL 해제
    useEffect(() => {
        return () => {
            if (previewImageUrl) {
                URL.revokeObjectURL(previewImageUrl);
            }
        };
    }, [previewImageUrl]);


    const handleEditToggle = async () => {
        if (!isEditMode) {
            console.log("✏️ 수정 모드로 전환합니다");
        }
        setIsEditMode(true);
    };

    const handleFormSubmit = async () => {
        if (!id) {
            alert("품목 ID가 유효하지 않습니다.");
            return;
        }
        if (form.partnerId === null) {
            alert("업체 정보가 유효하지 않습니다.");
            return;
        }

        const operationIds = selectedRoutings.map(op => op.operationId); 

        const updatePayload: SalesItemRegisterData = {
            partnerId: form.partnerId,
            itemName: form.itemName,
            itemCode: form.itemCode,
            price: Number(form.price),
            color: form.color,
            classification: form.classification,
            coatingMethod: form.coatingMethod,
            remark: form.remark,
            operationIds: operationIds,
        };
        
        try {
            await updateSalesItem(id, updatePayload, file);
            
            alert("품목 수정이 완료되었습니다. ✅");
            setIsEditMode(false);
            
            // 수정 후 다시 상세 정보 및 이미지 로드
            fetchItemDetail(id); 
        } catch (error: any) {
            let errorMessage = "품목 수정 중 오류가 발생했습니다.";
            if (axios.isAxiosError(error) && error.response?.status) {
                errorMessage = `품목 수정 실패: HTTP 상태 코드 ${error.response.status}`;
            }
            console.error("품목 수정 오류:", error);
            alert(errorMessage);
        }
    };

    const handleCancel = () => {
        if (isEditMode) {
            console.log("❌ 편집 모드 취소. 데이터 복구 시도.");
            if (id) fetchItemDetail(id); 
            else {
                setForm(initialFormState);
                setSelectedRoutings([]);
            }
            setIsEditMode(false);
        } else {
            navigate("/sales/item/history");
        }
    };

    const classificationOptions = ["방산", "일반", "자동차", "조선"];
    const coatingOptions = ["분체도장", "액체도장", "도금"];

    const styles = {
        searchContainer: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" },
        searchGroup: { display: "flex", flex: 1, gap: "8px" },
        searchSelect: { fontSize: "15px", padding: "6px", border: "1px solid #ccc", borderRadius: "6px" },
        input: { flex: 1, padding: "6px 10px", fontSize: "15px", border: "1px solid #ccc", borderRadius: "6px" },
        searchButton: { padding: "6px 12px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" },
        tableContainer: { border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden", backgroundColor: "white" },
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
        td: { padding: "8px", borderBottom: "1px solid #eee", textAlign: "center" as const, fontSize: "14px" },
        tdHover: { backgroundColor: "#f9fafb" },
        routingOrderContainer: {
            border: "1px solid #ccc", 
            borderRadius: "6px", 
            backgroundColor: "#fff", 
            marginBottom: "16px",
            minHeight: "100px",
            display: "flex",
            flexDirection: "column",
        },
        routingOrderHeader: {
            padding: "10px",
            backgroundColor: "#f3f4f6", 
            fontWeight: "bold",
            borderBottom: "1px solid #ccc",
        },
        routingOrderList: {
            padding: "10px",
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            alignItems: "center" as const,
        },
        routingOrderItem: (isSelected: boolean) => ({
            padding: "8px 12px",
            border: `1px solid ${isSelected ? "#38bdf8" : "#cbd5e1"}`,
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "500",
            backgroundColor: isSelected ? "#e0f2fe" : "#fff",
            color: isSelected ? "#0ea5e9" : "#333",
            cursor: isEditMode ? "pointer" : "default",
            transition: 'all 0.1s',
            boxShadow: isSelected ? '0 0 5px rgba(56, 189, 248, 0.5)' : 'none',
            '&:hover': isEditMode ? {
                backgroundColor: isSelected ? "#e0f2fe" : "#f1f5f9",
            } : {},
        }),
    };

    useEffect(() => {
    let isMounted = true;
    if (id) {
        fetchItemDetail(id, isMounted);
    }
    return () => { isMounted = false; };
}, [id]);


        return (
            <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0px", position: "relative" }}>
                <h1 style={{ fontSize: "24px", marginBottom: "32px", textAlign: "left" }}>
                    수주품목 관리 - {isEditMode ? "수정" : "상세조회"}
                </h1>

                {isLoading ? (
                    <div style={{ textAlign: "center", padding: "100px", fontSize: "18px" }}>
                        **품목 상세 정보를 불러오는 중입니다... ⏳**
                    </div>
                ) : (
                    <Stack component="form" onSubmit={(e) => e.preventDefault()}>
                        <div style={{ display: "flex", gap: "40px" }}>
                            <div style={{ flex: 2 }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    {[
                                        { label: "업체명", name: "partnerName", type: "text" }, 
                                        { label: "품목명", name: "itemName" },
                                        { label: "품목번호", name: "itemCode" },
                                        { label: "단가", name: "price" },
                                        { label: "색상", name: "color" },
                                        { label: "분류", name: "classification", type: "select", options: classificationOptions.map(o => ({ value: o, label: o })) },
                                        { label: "도장방식", name: "coatingMethod", type: "select", options: coatingOptions.map(o => ({ value: o, label: o })) },
                                    ].map((field) => (
                                        <div key={field.name}>
                                            <label style={{ fontSize: "18px", display: "block", marginBottom: "2px" }}>{field.label}</label>
                                            
                                            {field.name === "partnerName" ? (
                                                <TextField
                                                    name="partnerName"
                                                    value={form.partnerName} 
                                                    fullWidth
                                                    inputProps={{ style: { fontSize: 17 } }}
                                                    disabled={true} 
                                                />
                                            ) : field.type === "select" ? (
                                                <Select
                                                    name={field.name}
                                                    value={String(form[field.name as keyof FormState] || '')}
                                                    onChange={handleChange}
                                                    fullWidth
                                                    sx={{ fontSize: 18 }}
                                                    inputProps={{ sx: { fontSize: 18 } }}
                                                    disabled={!isEditMode}
                                                >
                                                    {(field.options as { value: string, label: string }[]).map(option => (
                                                        <MenuItem key={option.value} value={option.value} sx={{ fontSize: 17 }}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            ) : (
                                                <TextField
                                                    name={field.name}
                                                    value={form[field.name as keyof FormState]}
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
                                    <label style={{ fontSize: "18px", display: "block", marginBottom: "4px" }}>비고</label>
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
                                    <label style={{ fontSize: "18px", display: "block", marginBottom: "4px" }}>
                                        라우팅 (선택된 공정: {selectedRoutings.length}건)
                                    </label>

                                    <div style={styles.routingOrderContainer}>
                                        <div style={styles.routingOrderHeader}>선택된 공정 순서</div>
                                        <div style={styles.routingOrderList}>
                                            {selectedRoutings.length === 0 ? (
                                                <span style={{ color: "#999", fontSize: "14px" }}>선택된 공정이 없습니다.</span>
                                            ) : (
                                                selectedRoutings.map((item, index) => {
                                                    const isSelected = selectedRoutings.some(r => r.operationId === item.operationId);
                                                    return (
                                                        <span 
                                                            key={item.operationId} 
                                                            style={styles.routingOrderItem(isSelected)}
                                                            onClick={() => handleRoutingCheckboxChange(item)}
                                                        >
                                                            {index + 1}. {item.processName} ({item.processCode})
                                                        </span>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>

                                    <div style={styles.searchContainer}>
                                        <div style={styles.searchGroup}>
                                            <select style={styles.searchSelect} value={searchType} onChange={e => setSearchType(e.target.value as SearchOption)} disabled={!isEditMode}>
                                                <option value="전체">전체</option>
                                                <option value="공정코드">공정 코드</option>
                                                <option value="공정명">공정명</option>
                                            </select>
                                            <input style={styles.input} type="text" placeholder="검색어를 입력하세요..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} disabled={!isEditMode} />
                                        </div>
                                        <button style={styles.searchButton} onClick={handleSearch} disabled={!isEditMode}>검색</button>
                                    </div>

                                    <p style={{ fontSize: "14px", color: "#4b5563", fontWeight: "500", marginBottom: "8px" }}>
                                        총 <span style={{ color: "#2563eb", fontWeight: "bold" }}>{fullProcessData.length.toLocaleString()}</span> 건 조회됨
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
                                                {fullProcessData.map(item => {
                                                    const isHovered = hoveredRow === item.operationId;
                                                    const isSelected = selectedRoutings.some(r => r.operationId === item.operationId);
                                                    return (
                                                        <tr key={item.operationId} style={isHovered ? styles.tdHover : {}} onMouseEnter={() => setHoveredRow(item.operationId)} onMouseLeave={() => setHoveredRow(null)}>
                                                            <td style={{ ...styles.td, width: "5%" }}>
                                                                <input type="checkbox" checked={isSelected} onChange={() => handleRoutingCheckboxChange(item)} disabled={!isEditMode} />
                                                            </td>
                                                            <td style={{ ...styles.td, width: "15%" }}>{item.processCode}</td>
                                                            <td style={{ ...styles.td, width: "15%" }}>{item.processName}</td>
                                                            <td style={{ ...styles.td, width: "45%", textAlign: "left", color: "#4b5563", fontSize: "13px" }}>{item.processContent}</td>
                                                            <td style={{ ...styles.td, width: "10%", fontWeight: "bold", color: "#1d4ed8" }}>{item.processTime}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* 이미지 파일 처리 섹션 */}
                            <div style={{ width: "360px" }}>
                                <div style={{ 
                                    height: "500px", 
                                    border: "1px dashed #aaa", 
                                    borderRadius: "8px", 
                                    backgroundColor: "#fafafa", 
                                    display: "flex", 
                                    alignItems: "center", 
                                    justifyContent: "center", 
                                    marginBottom: "16px",
                                    overflow: "hidden" 
                                }}>
                                    {(previewImageUrl || existingImageUrl) ? (
                                        <img 
                                            src={previewImageUrl || existingImageUrl || undefined}
                                            alt="품목 이미지" 
                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <span style={{ fontSize: "17px", color: "#999" }}>
                                            품목 이미지 (등록된 이미지가 없습니다.)
                                        </span>
                                    )}
                                </div>
                                {isEditMode && 
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleFileChange} 
                                    />
                                }
                            </div>
                        </div>

                        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 3, position: "absolute", bottom: "-50px", right: "-20px" }}>
                            <Button type="button" variant="contained" sx={{ px: 5, py: 1.5, fontSize: 14, bgcolor: isEditMode ? "#22c55e" : "#2563eb", "&:hover": { bgcolor: isEditMode ? "#16a34a" : "#1d4ed8" } }} onClick={() => { if (isEditMode) handleFormSubmit(); else handleEditToggle(); }}>
                                {isEditMode ? "저장 (수정 완료)" : "수정"}
                            </Button>

                            <Button type="button" variant="outlined" onClick={handleCancel} sx={{ px: 5, py: 1.5, fontSize: 14 }}>
                                {isEditMode ? "취소 (편집 모드 종료)" : "목록으로"}
                            </Button>
                        </Stack>
                    </Stack>
                )}
            </div>
        );
};

export default SalesItemDetailPage;