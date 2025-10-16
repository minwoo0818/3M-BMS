import React from 'react';
import { useCommonStyles } from '../style/useCommonStyles';
import { useProcessStyles } from '../style/useProcessStyles';
import { useSalesHistoryStyles } from '../style/useSalesHistoryStyles';

const ProcessStatusPage: React.FC = () => {
  const common = useCommonStyles();

  const data = [
    { id: '1', operationsName: '입고/수입검사', startTime: '08:00' },
    { id: '2', operationsName: '이물질 제거', startTime: '08:20' },
    { id: '3', operationsName: '마스킹1', startTime: '09:00' },
    { id: '4', operationsName: '마스킹2', startTime: '10:00' },
    { id: '5', operationsName: 'Loadimg/도장', startTime: '' },
    { id: '6', operationsName: '건조', startTime: '' },
    { id: '7', operationsName: 'Loadimg/도장', startTime: '' },
    { id: '8', operationsName: '건조', startTime: '' },
    { id: '9', operationsName: '마스킹 제거', startTime: '' },
    { id: '10', operationsName: '포장', startTime: '' },
  ];

  return (
    <div style={common.container}>
      <h1 style={{ ...common.header, fontSize: '24px', marginBottom: '20px' }}>
        공정 진행현황 조회
      </h1>

      {/* 📋 테이블 */}
      <div style={common.tableContainer}>
        <table style={{ ...common.table, fontSize: '16px' }}>
          <thead>
            <tr>
              <th style={{ ...common.th(true, false), width: '120px', padding: '10px' }}>No.</th>
              <th style={{ ...common.th(false, false), width: '200px', padding: '10px' }}>공정명</th>
              <th style={{ ...common.th(false, false), width: '160px', padding: '10px' }}>시작시간</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                <td style={{ ...common.td, padding: '10px' }}>{row.id}</td>
                <td style={{ ...common.td, padding: '10px' }}>{row.operationsName}</td>
                <td
                  style={{
                    ...common.td,
                    padding: '10px',
                    backgroundColor: row.startTime ? '#e8f5e9' : 'transparent',
                    color: row.startTime ? '#2e7d32' : 'inherit',
                    fontWeight: row.startTime ? 'bold' : 'normal',
                  }}
                >
                  {row.startTime || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📘 안내 문구 + 버튼 영역 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          marginTop: '16px',
          marginRight: '20px',
        }}
      >
        <p
          style={{
            fontSize: '15px',
            color: '#555',
            fontStyle: 'italic',
            marginBottom: '8px',
          }}
        >
          시작한 공정은 시간이 표기되며 작업완료된 공정은 초록색으로 표시됩니다.
        </p>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            style={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            수정
          </button>
          <button
            style={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '15px',
              cursor: 'pointer',
            }}
          >
            다음 공정
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessStatusPage;
