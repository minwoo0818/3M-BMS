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
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// ==============================================================================
// DTO 인터페이스 정의
// ==============================================================================
interface ProcessItem {
    operationId: number;
    processCode: string;
    processName: string;
    processContent: string;
    processTime: number;
}

interface SalesItemDetailViewDto {
    partnerId: number;
    partnerName: string;
    itemName: string;
    itemCode: string;
    price: number;
    color: string;
    classification: string;
    coatingMethod: string;
    remark: string;
    operations: Array<{
        operationId: number;
        code: string;
        name: string;
        description: string;
        standardTime: number;
    }>;
}

interface PartnerSelectResponseDto {
    partnerId: number;
    partnerName: string;
}

interface SalesItemRegisterData {
    partnerId: number;
    itemName: string;
    itemCode: string;
    price: number;
    color: string;
    classification: string;
    coatingMethod: string;
    remark: string;
    operationIds: number[];
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
    const [activePartners, setActivePartners] = useState<PartnerSelectResponseDto[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchType, setSearchType] = useState<SearchOption>("전체");
    const [searchTerm, setSearchTerm] = useState("");
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);
    const [fullProcessData, setFullProcessData] = useState<ProcessItem[]>([]);

    // =====================================================================
    // API 호출 함수
    // =====================================================================
    const loadPartners = async () => {
        try {
            const res = await axios.get<PartnerSelectResponseDto[]>("/api/sales-items/partners/active");
            setActivePartners(res.data);
        } catch (error) {
            console.error("거래처 목록 로드 실패:", error);
        }
    };

const fetchItemDetail = async (itemId: string, isMounted: boolean = true) => {
    setIsLoading(true);
    try {
        const res = await axios.get<SalesItemDetailViewDto>(`/api/sales/items/${itemId}`);
        const data = res.data;

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
    } catch (error: any) {
        console.error(error);
        alert("품목 상세 정보를 불러오는 중 오류가 발생했습니다.");
        navigate("/sales/item/history");
    } finally {
        if (isMounted) setIsLoading(false);
    }
};

     const updateSalesItem = async (itemId: string, payload: SalesItemRegisterData, file?: File) => {
        const formData = new FormData();
        formData.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
        if (file) formData.append("file", file);

        await axios.put(`/api/sales-items/${itemId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    };

    // =====================================================================
    // 이벤트 핸들러
    // =====================================================================
    const handleRoutingCheckboxChange = (item: ProcessItem) => {
        if (!isEditMode) return;
        setSelectedRoutings(prev => {
            if (prev.find(r => r.operationId === item.operationId)) {
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
        if (name === "partnerId") {
            const partnerId = Number(value);
            const partner = activePartners.find(p => p.partnerId === partnerId);
            setForm({
                ...form,
                partnerId: partnerId,
                partnerName: partner?.partnerName || "",
            });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleEditToggle = () => {
        console.log("✏️ 수정 모드로 전환합니다");
        setIsEditMode(true);
    };

    const handleFormSubmit = async () => {
        if (!id) {
            alert("품목 ID가 유효하지 않습니다.");
            return;
        }
        if (form.partnerId === null) {
            alert("업체명을 선택해주세요.");
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
            await updateSalesItem(id, updatePayload);
            alert("품목 수정이 완료되었습니다. ✅");
            setIsEditMode(false);
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
    };

    useEffect(() => {
    let isMounted = true;
    loadPartners();
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
                                    { label: "업체명", name: "partnerId", type: "select", options: activePartners.map(p => ({ value: p.partnerId, label: p.partnerName })) },
                                    { label: "품목명", name: "itemName" },
                                    { label: "품목번호", name: "itemCode" },
                                    { label: "단가", name: "price" },
                                    { label: "색상", name: "color" },
                                    { label: "분류", name: "classification", type: "select", options: classificationOptions.map(o => ({ value: o, label: o })) },
                                    { label: "도장방식", name: "coatingMethod", type: "select", options: coatingOptions.map(o => ({ value: o, label: o })) },
                                ].map((field) => (
                                    <div key={field.name}>
                                        <label style={{ fontSize: "18px", display: "block", marginBottom: "2px" }}>{field.label}</label>
                                        {field.type === "select" ? (
                                            <Select
                                                name={field.name}
                                                value={field.name === "partnerId" ? String(form.partnerId ?? '') : String(form[field.name as keyof FormState] || '')}
                                                onChange={handleChange}
                                                fullWidth
                                                sx={{ fontSize: 18 }}
                                                inputProps={{ sx: { fontSize: 18 } }}
                                                disabled={!isEditMode}
                                            >
                                                {field.name === "partnerId" ? (
                                                    activePartners.map(option => (
                                                        <MenuItem key={option.partnerId} value={option.partnerId} sx={{ fontSize: 17 }}>
                                                            {option.partnerName}
                                                        </MenuItem>
                                                    ))
                                                ) : (
                                                    (field.options as { value: string, label: string }[]).map(option => (
                                                        <MenuItem key={option.value} value={option.value} sx={{ fontSize: 17 }}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))
                                                )}
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

                        <div style={{ width: "360px" }}>
                            <div style={{ height: "500px", border: "1px dashed #aaa", borderRadius: "8px", backgroundColor: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                                <span style={{ fontSize: "17px", color: "#999" }}>품목 이미지 (등록된 이미지 표시)</span>
                            </div>
                            {isEditMode && <input type="file" accept="image/*" />}
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
