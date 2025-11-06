// src/pages/SalesRegistrationPage.tsx
import React, { useState, useCallback } from 'react';
import KakaoMapPage from './KakaoMapPage'; // 경로 다시 확인!

interface SalesEntryData {
  customerName: string;
  customerPhone: string;
  customerLatitude: number | null;
  customerLongitude: number | null;
  drivingDistanceKm: string | null; // "1.23 km" 형태
  // ... 기타 필요한 데이터 필드들
}

function SalesRegistrationPage() {
  console.log('❤️ SalesRegistrationPage Rendered'); // ✨ 디버깅용 로그

  const [salesData, setSalesData] = useState<SalesEntryData>({
    customerName: '',
    customerPhone: '',
    customerLatitude: null,
    customerLongitude: null,
    drivingDistanceKm: null, // 초기값은 null이어야 해
    // ... 초기값 설정
  });

  // 위치 선택 콜백 - useCallback으로 안정화
  const handleLocationSelect = useCallback((location: { lat: number, lng: number } | null) => {
    console.log('👍 SalesRegistrationPage: handleLocationSelect called with', location); // ✨ 디버깅용 로그
    setSalesData(prev => {
      // 위치 값이 실제로 변경될 때만 상태 업데이트
      const newLat = location ? location.lat : null;
      const newLng = location ? location.lng : null;
      if (prev.customerLatitude === newLat && prev.customerLongitude === newLng) {
        return prev; // 변경 없으면 리렌더링 방지
      }
      return {
        ...prev,
        customerLatitude: newLat,
        customerLongitude: newLng,
        drivingDistanceKm: null, // ✨ 위치가 변경되면 거리 정보는 초기화
      };
    });
  }, []); // 의존성 배열이 비어있으므로 컴포넌트 마운트 시 한 번만 생성됨


  // 거리 계산 완료 콜백 - useCallback으로 안정화
  const handleDistanceCalculated = useCallback((distanceKm: string | null) => {
    console.log('👍 SalesRegistrationPage: handleDistanceCalculated called with', distanceKm); // ✨ 디버깅용 로그
    setSalesData(prev => {
      // 💡 가장 중요! 새로운 거리 값이 이전 값과 다를 때만 상태 업데이트를 수행
      if (prev.drivingDistanceKm === distanceKm) {
        console.log('-> 🖐️ SalesRegistrationPage: 거리 값이 동일하여 상태 업데이트 생략.'); // ✨ 디버깅용 로그
        return prev; // 이전 상태와 동일하므로 업데이트하지 않고 리렌더링 방지
      }
      console.log('-> ✅ SalesRegistrationPage: 거리 값 변경 감지, 상태 업데이트.'); // ✨ 디버깅용 로그
      return {
        ...prev,
        drivingDistanceKm: distanceKm,
      };
    });
  }, []); // 의존성 배열이 비어있으므로 컴포넌트 마운트 시 한 번만 생성됨


  // 일반 입력 필드 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSalesData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // 최종 "저장" 버튼 클릭 핸들러 (이 부분은 useCallback 필요 없음)
  const handleSave = async () => {
    console.log('🚀 저장 버튼 클릭!', salesData); // ✨ 디버깅용 로그

    if (!salesData.customerName || salesData.customerLatitude === null || salesData.drivingDistanceKm === null) {
      alert('필수 입력 항목(고객명, 위치, 거리)을 모두 채워주세요!');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/sales-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(salesData),
      });

      if (response.ok) {
        const result = await response.json();
        alert('판매 이력 및 고객 위치 정보가 성공적으로 저장되었습니다!');
        console.log('저장 성공:', result);
      } else {
        const errorData = await response.json();
        alert(`저장 실패: ${errorData.message || response.statusText}`);
        console.error('저장 실패:', errorData);
      }
    } catch (error) {
      console.error('API 호출 중 오류 발생:', error);
      alert('데이터 저장 중 네트워크 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <h1>업체 등록</h1>
      <div>
        <label>업체명:</label>
        <input
          type="text"
          name="customerName"
          value={salesData.customerName}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>편도거리:</label>
        {/* 이 input은 사용자의 입력이 아닌, 계산된 값을 보여주는 용도. readOnly로 처리하거나 <p> 태그 등으로 대체 가능 */}
        <input
          type="text"
          value={salesData.drivingDistanceKm || '거리 미계산'}
          readOnly // 사용자가 직접 수정할 수 없도록 readOnly 속성 추가
          style={{ cursor: 'default' }}
        />
      </div>
      
      <KakaoMapPage
        onLocationSelect={handleLocationSelect}
        onDistanceCalculated={handleDistanceCalculated}
      />

      {salesData.customerLatitude !== null && salesData.customerLongitude !== null && (
        <p>선택된 고객 위치: 위도 {salesData.customerLatitude}, 경도 {salesData.customerLongitude}</p>
      )}
      {salesData.drivingDistanceKm !== null && (
        <p>회사로부터의 거리: {salesData.drivingDistanceKm}</p>
      )}

      <button onClick={handleSave}>저장하기</button>
    </div>
  );
}

export default SalesRegistrationPage;