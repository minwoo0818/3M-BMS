import React, { useState, useCallback, useMemo } from 'react';
import type { ProcessItem, SearchOption } from '../types/process';
import { useCommonStyles } from '../style/useCommonStyles';
import { useProcessStyles } from '../style/useProcessStyles';

// ==========================================================
// 2. 상수 및 더미 데이터
// ==========================================================

// 데이터를 충분히 늘려서 페이징 테스트 용이하게 함 (총 35개)
const DUMMY_PROCESS_DATA: ProcessItem[] = Array.from({ length: 35 }, (_, i) => ({
    no: i + 1,
    processCode: `PC-${10 + i}`,
    processName: `공정명 ${i + 1}`,
    processContent: `공정 내용 ${i + 1}: 품질 검사 기준`,
    processTime: 20 + (i % 10),
}));

const ITEMS_PER_PAGE = 10;

// --- 3. 스타일 정의 ---
// const useProcessStyles = () => useMemo(() => ({
//     // Global Container
//     container: { 
//         padding: '30px', 
//         fontFamily: 'Inter, sans-serif', 
//         backgroundColor: '#f9f9f9', 
//         minHeight: '100vh' 
//     } as const,
//     // Header
//     header: {
//         fontSize: '28px', 
//         fontWeight: 'bold', 
//         paddingBottom: '10px', 
//         marginBottom: '30px',
//         borderBottom: `4px solid #3b82f6`, // blue-500
//         color: '#1f2937'
//     },
//     // Section Title (Accordion Header)
//     sectionTitle: (isOpen: boolean): React.CSSProperties => ({
//         fontSize: '22px', 
//         fontWeight: '600', 
//         cursor: 'pointer', 
//         padding: '15px 20px', 
//         backgroundColor: 'white', 
//         borderRadius: '8px', 
//         boxShadow: '0 1px 3px rgba(0,0,0,0.05)', 
//         marginBottom: '16px', 
//         display: 'flex', 
//         alignItems: 'center', 
//         gap: '12px',
//         color: '#1f2937',
//         transition: 'all 0.15s ease-in-out',
//         borderLeft: isOpen ? '4px solid #3b82f6' : '4px solid #d1d5db', // Active/Inactive color
//     }),
//     // Accordion Content Container
//     accordionContent: (isOpen: boolean): React.CSSProperties => ({
//         maxHeight: isOpen ? '500px' : '0',
//         overflow: 'hidden',
//         transition: 'max-height 0.3s ease-in-out',
//         padding: isOpen ? '20px' : '0',
//         marginBottom: isOpen ? '24px' : '0',
//         backgroundColor: 'white',
//         borderRadius: '12px',
//         boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
//         border: '1px solid #e5e7eb'
//     }),
//     // Form Input Group
//     formRow: { 
//         display: 'flex', 
//         gap: '12px', 
//         alignItems: 'flex-end' as const, 
//         width: '100%' 
//     } as const,
//     inputGroup: { 
//         display: 'flex', 
//         flexDirection: 'column' as const, 
//         flex: 1, 
//         minWidth: '80px',
//     },
//     label: { 
//         marginBottom: '4px', 
//         fontSize: '13px', 
//         fontWeight: '600', 
//         color: '#4b5563' 
//     },
//     input: { 
//         padding: '10px', 
//         border: '1px solid #d1d5db', 
//         borderRadius: '8px', 
//         outline: 'none', 
//         transition: 'border-color 0.15s ease-in-out', 
//         width: '90%',
//         color: '#1f2937'
//     },
//     // Action Buttons (Primary, Secondary)
//     actionButton: (bg: string): React.CSSProperties => ({
//         padding: '10px 18px', 
//         border: 'none', 
//         borderRadius: '8px', 
//         color: 'white', 
//         fontWeight: '600', 
//         cursor: 'pointer', 
//         transition: 'all 0.15s ease-in-out',
//         backgroundColor: bg,
//         boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
//         height: '42px', // Height standardization
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         whiteSpace: 'nowrap'
//     }),
//     // Search Area
//     searchContainer: { 
//         display: 'flex', 
//         gap: '12px', 
//         padding: '16px', 
//         border: '1px solid #d1d5db', 
//         borderRadius: '12px', 
//         marginBottom: '24px', 
//         alignItems: 'center',
//         backgroundColor: 'white',
//         boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
//     } as const,
//     searchGroup: { 
//         display: 'flex', 
//         border: '1px solid #d1d5db', 
//         borderRadius: '8px', 
//         overflow: 'hidden', 
//         flexGrow: 1 
//     } as const,
//     searchSelect: { 
//         borderRight: '1px solid #d1d5db', 
//         padding: '10px', 
//         backgroundColor: '#f3f4f6', 
//         minWidth: '120px', 
//         outline: 'none', 
//         appearance: 'none' as const,
//         color: '#4b5563'
//     } as const,
//     searchButton: { 
//         padding: '12px', 
//         border: 'none', 
//         backgroundColor: '#3b82f6', 
//         color: 'white', 
//         borderRadius: '9999px',
//         width: '48px', 
//         height: '48px', 
//         display: 'flex', 
//         alignItems: 'center', 
//         justifyContent: 'center', 
//         cursor: 'pointer',
//         boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
//         transition: 'background-color 0.15s ease-in-out',
//     },
//     // Data Table
//     tableContainer: { 
//         overflowX: 'auto', 
//         boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
//         borderRadius: '12px' 
//     } as const,
//     table: { 
//         width: '100%', 
//         borderCollapse: 'collapse' as const, 
//         fontSize: '14px', 
//         backgroundColor: 'white', 
//         borderRadius: '12px' 
//     } as const,
//     th: (isFirst: boolean, isLast: boolean): React.CSSProperties => ({
//         padding: '14px', 
//         backgroundColor: '#e5e7eb', // Slightly darker header
//         fontWeight: '700', 
//         textAlign: 'center' as const, 
//         border: '1px solid #d1d5db', 
//         ...(isFirst && { borderTopLeftRadius: '12px' }),
//         ...(isLast && { borderTopRightRadius: '12px' }),
//         whiteSpace: 'nowrap',
//         color: '#1f2937'
//     }),
//     td: { 
//         padding: '12px', 
//         textAlign: 'center' as const, 
//         border: '1px solid #e5e7eb', 
//         transition: 'background-color 0.15s ease-in-out',
//         whiteSpace: 'nowrap'
//     },
//     tdHover: {
//         backgroundColor: '#eff6ff' // blue-50
//     },
//     // Pagination
//     paginationContainer: { 
//         display: 'flex', 
//         justifyContent: 'center' as const, 
//         marginTop: '24px', 
//         gap: '8px' 
//     } as const,
//     pageButton: (isActive: boolean): React.CSSProperties => ({
//         padding: '8px 12px',
//         border: '1px solid #d1d5db', 
//         borderRadius: '6px',
//         cursor: 'pointer',
//         transition: 'all 0.15s ease-in-out',
//         backgroundColor: isActive ? '#3b82f6' : 'white', // blue-500 or white
//         color: isActive ? 'white' : '#4b5563', // white or gray-700
//         fontWeight: isActive ? 'bold' : 'normal',
//         minWidth: '40px',
//         boxShadow: isActive ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
//     }),
// }), []);


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
        code: '',
        name: '',
        content: '',
        time: '',
    });

    // 검색/조회 상태
    const [searchType, setSearchType] = useState<SearchOption>('전체');
    const [searchTerm, setSearchTerm] = useState('');
    const [fullData, setFullData] = useState<ProcessItem[]>(DUMMY_PROCESS_DATA); // 검색 결과 전체 데이터

    // 페이징 상태
    const [currentPage, setCurrentPage] = useState(1);
    const [hoveredRow, setHoveredRow] = useState<number | null>(null); // 행 호버 상태
    const itemsPerPage = ITEMS_PER_PAGE; // 페이지 당 항목 수: 10개

    // ----------------------------------------------------
    // Handlers
    // ----------------------------------------------------
    
    // 공정 등록 아코디언 토글
    const handleToggleRegister = useCallback(() => {
        setIsRegisterOpen(prev => !prev);
    }, []);
    
    // 공정 등록 입력 변경
    const handleProcessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // 공정 시간은 숫자만 받도록 처리
        if (name === 'time' && value !== '' && !/^\d+$/.test(value)) return;
        setNewProcess(prev => ({ ...prev, [name]: value }));
    };

    // 공정 코드 중복 확인 (더미 로직)
    const handleDuplicateCheck = useCallback(() => {
        if (!newProcess.code) return console.error("공정 코드를 입력해주세요.");
        
        // 실제 API 호출 로직...
        const isDuplicate = DUMMY_PROCESS_DATA.some(item => item.processCode === newProcess.code);
        
        // Custom Modal 대신 console.log 사용
        if (isDuplicate) {
            console.error(`[${newProcess.code}]는 이미 존재하는 코드입니다.`);
        } else {
            console.log(`[${newProcess.code}]는 사용 가능한 코드입니다.`);
        }
    }, [newProcess.code]);

    // 공정 등록 처리 (더미 로직)
    const handleRegister = useCallback(() => {
        if (!newProcess.code || !newProcess.name || !newProcess.time) return console.error("필수 항목 (코드, 명칭, 시간)을 입력해주세요.");
        
        const newId = DUMMY_PROCESS_DATA.length + 1;
        const newEntry: ProcessItem = {
            no: newId,
            processCode: newProcess.code,
            processName: newProcess.name,
            processContent: newProcess.content || '', // 내용이 비어있을 수 있음
            processTime: parseInt(newProcess.time) || 0,
        };
        
        // 더미 데이터에 추가 및 갱신 (실제 환경에서는 setFullData만 사용)
        DUMMY_PROCESS_DATA.push(newEntry);
        setFullData(prev => [{...newEntry, no: prev.length + 1}, ...prev].map((item, index) => ({...item, no: index + 1}))); // 새 항목을 맨 앞에 추가
        
        setNewProcess({ code: '', name: '', content: '', time: '' }); // 폼 초기화
        console.log("공정이 등록되었습니다.");
        setCurrentPage(1); 
    }, [newProcess]);
    
    // 검색 실행 로직 (검색 후 첫 페이지로 이동)
    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1); // 검색 시 1페이지로 초기화

        const lowerSearchTerm = searchTerm.toLowerCase().trim();

        if (!lowerSearchTerm) {
            setFullData(DUMMY_PROCESS_DATA); // 검색어 없으면 전체 조회
            return;
        }

        const filtered = DUMMY_PROCESS_DATA.filter(item => {
            let target: string;
            
            if (searchType === '공정코드') {
                target = item.processCode;
            } else if (searchType === '공정명') {
                target = item.processName;
            } else { 
                target = `${item.processCode} ${item.processName} ${item.processContent}`; 
            }

            return target.toLowerCase().includes(lowerSearchTerm);
        });
        
        // 필터링된 데이터에 No를 다시 부여 (No.는 현재 검색/필터링된 순서대로 보여야 함)
        const finalData = filtered.map((item, index) => ({...item, no: index + 1}));
        setFullData(finalData);
    }, [searchTerm, searchType]);


    // ----------------------------------------------------
    // Computed Values (Paging)
    // ----------------------------------------------------
    const totalPages = Math.ceil(fullData.length / itemsPerPage);
    const currentData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        // 현재 페이지에 해당하는 데이터만 잘라서 반환 (10개씩)
        return fullData.slice(startIndex, endIndex);
    }, [fullData, currentPage, itemsPerPage]);

    // 페이지 이동 핸들러
    const handlePageChange = useCallback((page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }, [totalPages]);
    
    // 수정/삭제 버튼 핸들러 (더미 로직)
    const handleAction = (item: ProcessItem, action: '수정' | '삭제') => {
        console.log(`${item.processName} 공정을 [${action}] 합니다. (코드: ${item.processCode})`);
        // 실제 API 호출 로직...
    };

    // ----------------------------------------------------
    // Render
    // ----------------------------------------------------

    return (
        <div style={styles.container}>
            {/* 1. 헤더 */}
            <h1 style={styles.header}>공정관리 - 등록 및 조회</h1>
            
            {/* 2. 공정 등록 아코디언 */}
            <div 
                style={styles.sectionTitle(isRegisterOpen)} 
                onClick={handleToggleRegister}
            >
                <span style={{fontSize: '18px', fontWeight: 'bold'}}>{isRegisterOpen ? '▼' : '▶'}</span>
                <span>공정 등록</span>
            </div>
            
            <div style={styles.accordionContent(isRegisterOpen)}>
                {/* 입력 폼 - 항목 명시 및 정렬 */}
                <div style={styles.formRow}>
                    
                    <div style={{...styles.inputGroup, flex: 1}}>
                        <label style={styles.label}>공정 코드 (필수)</label>
                        <input 
                            style={styles.input} 
                            name="code" 
                            value={newProcess.code} 
                            onChange={handleProcessChange} 
                            placeholder="예: COAT-01"
                        />
                    </div>
                    
                    <div style={{...styles.inputGroup, flex: 1.5}}>
                        <label style={styles.label}>공정명 (필수)</label>
                        <input 
                            style={styles.input} 
                            name="name" 
                            value={newProcess.name} 
                            onChange={handleProcessChange} 
                            placeholder="예: 습식 도장"
                        />
                    </div>

                    <div style={{...styles.inputGroup, flex: 3}}>
                        <label style={styles.label}>공정 내용</label>
                        <input 
                            style={styles.input} 
                            name="content" 
                            value={newProcess.content} 
                            onChange={handleProcessChange} 
                            placeholder="예: 2액형 우레탄 도료 사용 및 60분 건조"
                        />
                    </div>

                    <div style={{...styles.inputGroup, flex: 0.8}}>
                        <label style={styles.label}>소요 시간 (min)</label>
                        <input 
                            style={styles.input} 
                            name="time" 
                            type="text" // type="number" 대신 text를 사용하여 입력 제어를 확실히 함
                            pattern="\d*" // 모바일 키보드에서 숫자 입력 유도
                            value={newProcess.time} 
                            onChange={handleProcessChange} 
                            placeholder="60"
                        />
                    </div>
                    
                    {/* 중복 확인 버튼 */}
                    <button 
                        style={styles.actionButton('#f59e0b')} // amber-600
                        onClick={handleDuplicateCheck}
                    >
                        코드 중복확인
                    </button>
                    
                    {/* 공정 등록 버튼 */}
                    <button 
                        style={styles.actionButton('#3b82f6')} // blue-600
                        onClick={handleRegister}
                    >
                        공정 등록
                    </button>
                </div>
            </div>

            {/* 3. 검색 및 조회 부분 */}
            <h3 style={{fontSize: '22px', fontWeight: '600', marginBottom: '12px', color: '#1f2937'}}>Q 공정 검색</h3>
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
                    <svg style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </button>
            </form>

            {/* 4. 데이터 테이블 (현재 페이지 데이터만 사용) */}
            <p style={{fontSize: '14px', color: '#4b5563', fontWeight: '500', marginBottom: '8px'}}>총 <span style={{color: '#2563eb', fontWeight: 'bold'}}>{fullData.length.toLocaleString()}</span>건 조회됨</p>

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
                        {currentData.length === 0 ? (
                            <tr key="no-data">
                                <td colSpan={6} style={styles.td}>
                                    조회된 공정 데이터가 없습니다.
                                </td>
                            </tr>
                        ) : currentData.map((item) => {
                            const uniqueKey = item.processCode;
                            const isHovered = hoveredRow === item.no;
                            const displayNo = (currentPage - 1) * ITEMS_PER_PAGE + item.no;

                            return (
                                <tr 
                                    key={uniqueKey} 
                                    style={isHovered ? styles.tdHover : {}} 
                                    onMouseEnter={() => setHoveredRow(item.no)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                >
                                    <td style={{...styles.td, width: '5%'}}>{displayNo}</td>
                                    <td style={{...styles.td, width: '15%', fontWeight: '500'}}>{item.processCode}</td>
                                    <td style={{...styles.td, width: '15%'}}>{item.processName}</td>
                                    <td style={{...styles.td, width: '40%', textAlign: 'left' as const, color: '#4b5563', fontSize: '13px'}}>{item.processContent}</td>
                                    <td style={{...styles.td, width: '10%', fontWeight: 'bold', color: '#1d4ed8'}}>{item.processTime}</td>
                                    <td style={{...styles.td, width: '15%'}}>
                                        <div style={{display: 'flex', justifyContent: 'center', gap: '8px'}}>
                                            <button 
                                                style={styles.actionButton('#6b7280')} // gray-500
                                                onClick={() => handleAction(item, '수정')}
                                            >
                                                수정
                                            </button>
                                            <button 
                                                style={styles.actionButton('#ef4444')} // red-500
                                                onClick={() => handleAction(item, '삭제')}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* 5. 페이징 UI 구현 */}
            <div style={styles.paginationContainer}>
                <button 
                    style={{...styles.pageButton(false), opacity: currentPage === 1 ? 0.5 : 1}}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    이전
                </button>

                {/* 페이지 번호 렌더링 (최대 5개만 표시) */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                        // 페이지네이션 로직은 이전 파일과 동일하게 유지
                        const maxPagesToShow = 5;
                        if (totalPages <= maxPagesToShow) return true;
                        if (currentPage <= Math.ceil(maxPagesToShow / 2)) {
                            return page <= maxPagesToShow; 
                        }
                        if (currentPage > totalPages - Math.floor(maxPagesToShow / 2)) {
                            return page > totalPages - maxPagesToShow; 
                        }
                        return page >= currentPage - Math.floor(maxPagesToShow / 2) && page <= currentPage + Math.floor(maxPagesToShow / 2); 
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
                    style={{...styles.pageButton(false), opacity: currentPage === totalPages || totalPages === 0 ? 0.5 : 1}}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                >
                    다음
                </button>
            </div>
        </div>
    );
}

export default ProcessRegisterPage;