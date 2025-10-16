// src/components/Sidebar.tsx (기본 펼침 구조로 수정)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { menuItems } from '../data/MenuData'; 
import type { MenuItem2Depth } from '../types/menu'; 

// [스타일링]
// (이전과 동일하게 인라인 스타일로 간단하게 처리하며, 실제 프로젝트에서는 CSSProperties 타입을 사용합니다.)
const sidebarStyle: React.CSSProperties = {
  width: '220px',
  flexShrink: 0, 
  padding: '10px',
  backgroundColor: '#f8f8f8',
  borderRight: '1px solid #ddd',
  fontFamily: 'Arial, sans-serif'
};
const depth1Style: React.CSSProperties = {
  padding: '10px 0',
  fontWeight: 'bold',
  cursor: 'pointer',
  borderBottom: '1px solid #ccc',
  color: '#0056b3'
};
const depth2Style: React.CSSProperties = {
  padding: '8px 0 8px 15px',
  cursor: 'pointer',
  fontWeight: '600',
  color: '#333'
};
const depth3Style: React.CSSProperties = {
  padding: '6px 0 6px 30px',
  cursor: 'pointer',
  color: '#555',
};

// isClosed 상태에 따라 max-height를 제어하는 함수
const accordionContentStyle = (isClosed: boolean): React.CSSProperties => ({
  overflow: 'hidden',
  transition: 'max-height 0.3s ease-in-out',
  // isClosed가 true일 때 0, false (열려있을 때) 500px
  maxHeight: isClosed ? '0' : '500px', 
});


const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  // '접힌 상태'인 1 Depth 항목의 title을 저장하는 Set
  const [closedDepth1, setClosedDepth1] = useState<Set<string>>(new Set()); 
  
  // '접힌 상태'인 2 Depth 항목의 고유 키를 저장하는 Set
  const [closedDepth2, setClosedDepth2] = useState<Set<string>>(new Set()); 

  // 1 depth 클릭 핸들러 (토글)
  const handleToggleDepth1 = (title: string) => {
    setClosedDepth1(prevClosed => {
      const newClosed = new Set(prevClosed);
      if (newClosed.has(title)) {
        // 현재 닫혀있다면 -> 연다 (Set에서 제거)
        newClosed.delete(title);
      } else {
        // 현재 열려있다면 -> 닫는다 (Set에 추가)
        newClosed.add(title);
        // 1 depth가 닫힐 때, 그 안에 있는 2 depth 항목들도 모두 접히게 처리할 수 있습니다.
        // 이 예시에서는 1 depth가 닫힐 때 2 depth 상태는 건드리지 않고, CSS로만 가려지게 합니다.
      }
      return newClosed;
    });
  };

  // 2 depth 클릭 핸들러 (토글)
  const handleToggleDepth2 = (key: string, item: MenuItem2Depth) => {
    // 3 depth가 있는 항목만 아코디언으로 작동
    if (item.items && item.items.length > 0) {
        setClosedDepth2(prevClosed => {
            const newClosed = new Set(prevClosed);
            if (newClosed.has(key)) {
                // 현재 닫혀있다면 -> 연다 (Set에서 제거)
                newClosed.delete(key);
            } else {
                // 현재 열려있다면 -> 닫는다 (Set에 추가)
                newClosed.add(key);
            }
            return newClosed;
        });
    } else if (item.path) {
        // 3 depth 없이 path만 있는 경우 바로 이동
        handleNavigation(item.path);
    }
  };

  // 3 depth 클릭 핸들러 및 페이지 이동
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div style={sidebarStyle}>
      <h3 style={{ color: '#007bff', paddingBottom: '15px', borderBottom: '2px solid #007bff' }}>
        대원공업(주)
      </h3>

      {menuItems.map((depth1) => {
        const isDepth1Closed = closedDepth1.has(depth1.title);

        return (
          <div key={depth1.title}>
            {/* 1 Depth (큰 항목) */}
            <div 
              style={depth1Style} 
              onClick={() => handleToggleDepth1(depth1.title)}
            >
              {depth1.title} {isDepth1Closed ? '▶' : '▼'} {/* 상태에 따라 아이콘 변경 */}
            </div>

            {/* 1 Depth Content (기본적으로 열림) */}
            <div style={accordionContentStyle(isDepth1Closed)}>
              {depth1.items.map((depth2) => {
                const depth2Key = `${depth1.title}-${depth2.name || depth2.path}`;
                const hasDepth3 = depth2.items && depth2.items.length > 0;
                const isDepth2Closed = closedDepth2.has(depth2Key);
                
                return (
                  <div key={depth2Key}>
                    {/* 2 Depth (중간 항목) */}
                    <div
                      style={depth2Style}
                      onClick={() => handleToggleDepth2(depth2Key, depth2)}
                    >
                      - {depth2.name || depth2.path} {hasDepth3 ? (isDepth2Closed ? '▶' : '▼') : ''}
                    </div>

                    {/* 2 Depth Content (3 Depth) - 기본적으로 열림 */}
                    {hasDepth3 && depth2.items && (
                      <div style={accordionContentStyle(isDepth2Closed)}>
                        {depth2.items.map((depth3) => (
                          <div
                            key={depth3.name}
                            style={depth3Style}
                            onClick={() => handleNavigation(depth3.path)}
                          >
                            - {depth3.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Sidebar;