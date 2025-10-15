import React, { useState, useCallback, useMemo } from 'react';
import type { ProcessItem, SearchOption } from '../types/process';

// --- 2. 더미 데이터 ---
// 데이터를 충분히 늘려서 페이징 테스트 용이하게 함 (총 35개)
const DUMMY_PROCESS_DATA: ProcessItem[] = Array.from({ length: 35 }, (_, i) => ({
  no: i + 1,
  processCode: `PC-${10 + i}`,
  processName: `공정명 ${i + 1}`,
  processContent: `공정 내용 ${i + 1}: 품질 검사 기준`,
  processTime: 20 + (i % 10),
}));

// --- 3. 스타일 정의 ---
// React.CSSProperties와 as const를 사용하여 타입 안정성 및 추론 최적화
const styles = {
  container: { padding: '20px' as const },
  header: { fontSize: '24px', fontWeight: 'normal' as const, borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px' },
  sectionTitle: { fontSize: '20px', fontWeight: 'bold' as const, cursor: 'pointer', padding: '10px 0', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: '8px' },
  accordionContent: (isOpen: boolean): React.CSSProperties => ({
    maxHeight: isOpen ? '500px' : '0',
    overflow: 'hidden',
    transition: 'max-height 0.3s ease-in-out',
    padding: isOpen ? '20px 0' : '0',
  }),
  formRow: { display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' as const },
  inputGroup: { display: 'flex', flexDirection: 'column' as const, flex: 1, minWidth: '80px' },
  input: { padding: '8px', border: '1px solid #ccc', borderRadius: '4px' },
  label: { marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' as const, color: '#555' },
  // 버튼 높이 통일 및 상단 여백 제거 (라벨에 맞춰 정렬)
  button: { padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', height: '38px', alignSelf: 'flex-end' as const }, 
  searchBar: { display: 'flex', gap: '5px', padding: '15px 0', borderBottom: '1px solid #eee' },
  searchOption: { border: '1px solid #ccc', padding: '8px', borderRadius: '4px', marginRight: '10px' },
  table: { width: '100%', borderCollapse: 'collapse' as const, marginTop: '20px' as const, fontSize: '14px' },
  th: { border: '1px solid #ddd', padding: '10px', backgroundColor: '#f2f2f2' },
  td: { border: '1px solid #ddd', padding: '10px', textAlign: 'center' as const },
  pagination: { display: 'flex', justifyContent: 'center' as const, marginTop: '20px', gap: '5px' },
  pageButton: (isActive: boolean): React.CSSProperties => ({
    padding: '8px 12px',
    border: '1px solid #ccc',
    backgroundColor: isActive ? '#007bff' : 'white',
    color: isActive ? 'white' : '#333',
    cursor: 'pointer',
    borderRadius: '4px',
    fontWeight: isActive ? 'bold' as const : 'normal' as const,
  }),
};


// --- 4. 컴포넌트 시작 ---
const ProcessRegisterPage: React.FC = () => {
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
  const itemsPerPage = 10; // 페이지 당 항목 수: 10개

  // --- 이벤트 핸들러 ---
  
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
    
    // alert 대신 console.error 사용 (캔버스 환경 고려)
    if (isDuplicate) {
      console.error(`[${newProcess.code}]는 이미 존재하는 코드입니다.`);
    } else {
      console.log(`[${newProcess.code}]는 사용 가능한 코드입니다.`);
    }
  }, [newProcess.code]);

  // 공정 등록 처리 (더미 로직)
  const handleRegister = useCallback(() => {
    if (!newProcess.code || !newProcess.name || !newProcess.time) return console.error("필수 항목을 입력해주세요.");
    
    // 실제 API 호출 및 데이터 갱신 로직...
    const newId = DUMMY_PROCESS_DATA.length + 1;
    const newEntry: ProcessItem = {
      no: newId,
      processCode: newProcess.code,
      processName: newProcess.name,
      processContent: newProcess.content,
      processTime: parseInt(newProcess.time) || 0,
    };
    
    // 더미 데이터에 추가 (실제는 API를 호출하고 setFullData를 통해 갱신)
    DUMMY_PROCESS_DATA.push(newEntry);
    setFullData(prev => [...prev, newEntry]); 
    
    setNewProcess({ code: '', name: '', content: '', time: '' }); // 폼 초기화
    console.log("공정이 등록되었습니다.");
    // 등록 후 1페이지로 돌아가도록 설정 (선택 사항)
    setCurrentPage(1); 
  }, [newProcess]);
  
  // 검색 실행 로직 (검색 후 첫 페이지로 이동)
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // 검색 시 1페이지로 초기화

    if (!searchTerm) {
      setFullData(DUMMY_PROCESS_DATA); // 검색어 없으면 전체 조회
      return;
    }

    const filtered = DUMMY_PROCESS_DATA.filter(item => {
      const target = searchType === '공정코드' ? item.processCode
                   : searchType === '공정명' ? item.processName
                   : `${item.processCode} ${item.processName}`; 

      return target.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    // 필터링된 데이터에 No를 다시 부여 (No.는 현재 검색/필터링된 순서대로 보여야 함)
    const finalData = filtered.map((item, index) => ({...item, no: index + 1}));
    setFullData(finalData);
  }, [searchTerm, searchType]);


  // 페이징 계산 (useMemo로 최적화)
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


  return (
    <div style={styles.container}>
      {/* 1. 상단 경로 표시 */}
      <h1 style={styles.header}>정보관리 - 라우팅</h1>
      
      {/* 2. 공정 등록 아코디언 */}
      <div 
        style={styles.sectionTitle} 
        onClick={handleToggleRegister}
      >
        {isRegisterOpen ? '▼' : '▶'} 공정 등록
      </div>
      
      <div style={styles.accordionContent(isRegisterOpen)}>
        {/* 입력 폼 - 항목 명시 및 정렬 */}
        <div style={styles.formRow}>
            
          <div style={styles.inputGroup}>
            <label style={styles.label}>공정 코드</label>
            <input style={styles.input} name="code" value={newProcess.code} onChange={handleProcessChange} />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>공정명</label>
            <input style={styles.input} name="name" value={newProcess.name} onChange={handleProcessChange} />
          </div>

          <div style={{...styles.inputGroup, flex: 2}}>
            <label style={styles.label}>공정 내용</label>
            <input style={styles.input} name="content" value={newProcess.content} onChange={handleProcessChange} />
          </div>

          <div style={{...styles.inputGroup, flex: 0.5}}>
            <label style={styles.label}>공정 시간(min)</label>
            <input style={styles.input} name="time" type="number" value={newProcess.time} onChange={handleProcessChange} />
          </div>
          
          {/* 중복 확인 버튼 */}
          <button 
            style={{ ...styles.button, backgroundColor: '#ffc107', color: '#333' }}
            onClick={handleDuplicateCheck}
          >
            공정코드 중복확인
          </button>
          
          {/* 공정 등록 버튼 */}
          <button 
            style={{ ...styles.button, backgroundColor: '#007bff', color: 'white' }}
            onClick={handleRegister}
          >
            공정 등록
          </button>
        </div>
      </div>

      {/* 3. 검색 및 조회 부분 */}
      <h3 style={{ fontSize: '18px', fontWeight: 'bold' as const, margin: '20px 0 10px 0' }}>Q 검색</h3>
      <form onSubmit={handleSearch} style={styles.searchBar}>
        {/* 검색 타입 선택 */}
        <div style={styles.searchOption}>
            <select 
                value={searchType} 
                onChange={(e) => setSearchType(e.target.value as SearchOption)}
                style={{ border: 'none' }}
            >
                <option value="전체">전체</option>
                <option value="공정코드">공정코드</option>
                <option value="공정명">공정명</option>
            </select>
        </div>
        
        {/* 검색 바 */}
        <input 
          style={{ ...styles.input, flex: 4 }} 
          placeholder="공정 코드, 공정명으로 검색해 주세요."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        {/* 돋보기 검색 버튼 */}
        <button 
          type="submit"
          style={{ ...styles.button, backgroundColor: '#eee', color: '#333', padding: '8px 10px', height: 'auto', marginTop: '0' }}
        >
          🔍
        </button>
      </form>

      {/* 4. 데이터 테이블 (현재 페이지 데이터만 사용) */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{...styles.th, width: '5%'}}>No.</th>
            <th style={{...styles.th, width: '10%'}}>공정 코드</th>
            <th style={{...styles.th, width: '15%'}}>공정명</th>
            <th style={{...styles.th, width: '35%'}}>공정 내용</th>
            <th style={{...styles.th, width: '10%'}}>공정 시간 (min)</th>
            <th style={{...styles.th, width: '25%'}}>수정 및 삭제</th>
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? (
            currentData.map((item) => (
              <tr key={item.processCode}>
                {/* No.는 현재 필터링/페이징된 순서를 따릅니다. */}
                <td style={styles.td}>{(currentPage - 1) * itemsPerPage + item.no}</td> 
                <td style={styles.td}>{item.processCode}</td>
                <td style={styles.td}>{item.processName}</td>
                <td style={{...styles.td, textAlign: 'left' as const}}>{item.processContent}</td>
                <td style={styles.td}>{item.processTime}</td>
                <td style={styles.td}>
                  <button 
                    style={{ ...styles.button, backgroundColor: '#6c757d', color: 'white', marginRight: '5px', height: 'auto', marginTop: '0' }}
                    onClick={() => handleAction(item, '수정')}
                  >
                    수정
                  </button>
                  <button 
                    style={{ ...styles.button, backgroundColor: '#dc3545', color: 'white', height: 'auto', marginTop: '0' }}
                    onClick={() => handleAction(item, '삭제')}
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={styles.td}>조회된 데이터가 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 5. 페이징 UI 구현 */}
      <div style={styles.pagination}>
        {/* '이전' 버튼 */}
        <button 
          style={styles.pageButton(false)} 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {'<'}
        </button>

        {/* 페이지 번호 버튼 */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            style={styles.pageButton(page === currentPage)}
            onClick={() => handlePageChange(page)}
            disabled={page === currentPage} // 현재 페이지는 비활성화
          >
            {page}
          </button>
        ))}

        {/* '다음' 버튼 */}
        <button 
          style={styles.pageButton(false)} 
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          {'>'}
        </button>
      </div>
    </div>
  );
};

export default ProcessRegisterPage;
