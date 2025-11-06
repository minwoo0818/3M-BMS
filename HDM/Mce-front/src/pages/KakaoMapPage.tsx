// src/components/KakaoMapPage.tsx
import React, { useEffect, useRef, useState } from 'react';
import useKakaoMapScript from '../hooks/useKakaoMapScript';

const KAKAO_APP_KEY = 'df69888e4d9f4a780888af3ed0a74bf6'; // 여기에 네 카카오 앱 키를 넣어줘!

declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapPageProps {
  onLocationSelect: (location: { lat: number, lng: number } | null) => void;
  onDistanceCalculated: (distanceKm: string | null) => void;
  // currentDrivingDistance prop은 여기에서 제거했어. 자식 컴포넌트는 부모의 현재 상태를 몰라도 돼.
}

function KakaoMapPage({ onLocationSelect, onDistanceCalculated }: KakaoMapPageProps) {
  console.log('💚 KakaoMapPage Rendered'); // ✨ 디버깅용 로그

  const mapRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useKakaoMapScript(KAKAO_APP_KEY);
  const [currentMapInstance, setCurrentMapInstance] = useState<any>(null);

  const [clickedLat, setClickedLat] = useState<number | null>(null);
  const [clickedLng, setClickedLng] = useState<number | null>(null);
  const [marker, setMarker] = useState<any>(null);

  // 맵 초기화 및 클릭 리스너 등록 useEffect
  useEffect(() => {
    console.log('🟢 KakaoMapPage: Map Init useEffect running.', { scriptLoaded, mapRefCurrent: mapRef.current, currentMapInstance: !!currentMapInstance }); // ✨ 디버깅용 로그

    // 스크립트가 로드되었고, ref가 연결되었으며, 지도 인스턴스가 아직 없는 경우에만 초기화
    if (scriptLoaded && mapRef.current && !currentMapInstance) {
      const options = {
        center: new window.kakao.maps.LatLng(33.450701, 126.570667), // 초기 지도 중심
        level: 3 // 지도의 확대 레벨
      };
      const map = new window.kakao.maps.Map(mapRef.current, options);
      setCurrentMapInstance(map); // 지도 인스턴스 저장

      // 지도 클릭 이벤트 리스너
      const clickListener = window.kakao.maps.event.addListener(map, 'click', function(mouseEvent: any) {
        const latlng = mouseEvent.latLng;
        const newLat = latlng.getLat();
        const newLng = latlng.getLng();

        setClickedLat(newLat); // 내부 상태 업데이트
        setClickedLng(newLng); // 내부 상태 업데이트

        onLocationSelect({ lat: newLat, lng: newLng }); // 부모에게 위치 정보 전달

        // 기존 마커 제거 후 새로운 마커 표시
        if (marker) {
          marker.setMap(null);
        }
        const newMarker = new window.kakao.maps.Marker({
          position: latlng
        });
        newMarker.setMap(map);
        setMarker(newMarker);
        
        console.log(`🟡 KakaoMapPage: 지도 클릭 - 위도 ${newLat}, 경도 ${newLng}`);
      });

      // 컴포넌트 언마운트 시 이벤트 리스너 정리
      return () => {
        console.log('🔴 KakaoMapPage: Map Init useEffect cleanup.'); // ✨ 디버깅용 로그
        if (currentMapInstance && clickListener) {
          window.kakao.maps.event.removeListener(currentMapInstance, 'click', clickListener);
        }
      };
    }
  }, [scriptLoaded, currentMapInstance, marker, onLocationSelect]); // 이 콜백들은 useCallback으로 안정화되었으므로 괜찮아.


  // 거리 계산 useEffect
  useEffect(() => {
    console.log('🔵 KakaoMapPage: Distance Calc useEffect running.', { clickedLat, clickedLng }); // ✨ 디버깅용 로그

    // 클릭된 위치가 유효할 때만 API 호출 (초기 렌더링 시에는 호출 안 됨)
    if (clickedLat !== null && clickedLng !== null) {
      console.log('-> 🚀 거리 계산 API 호출 시작'); // ✨ 디버깅용 로그
      fetch(`http://localhost:8080/api/map/calculate-distance?lat=${clickedLat}&lng=${clickedLng}`)
        .then(response => response.json())
        .then(data => {
          let calculatedDistance: string | null = null;
          if (data.distance) {
            calculatedDistance = `${(data.distance / 1000).toFixed(2)} km`;
          } else {
            calculatedDistance = "거리 계산 실패";
          }
          // 계산된 값을 부모에게 전달 (부모에서 실제 값 변화 여부 확인 후 업데이트)
          console.log('-> ✅ 거리 계산 완료, 부모에게 전달:', calculatedDistance); // ✨ 디버깅용 로그
          onDistanceCalculated(calculatedDistance);
        })
        .catch(error => {
          console.error('-> ❌ 거리 계산 API 호출 에러:', error); // ✨ 디버깅용 로그
          onDistanceCalculated("거리 계산 중 오류 발생");
        });
    } else {
        // clickedLat, clickedLng가 null일 때, (예: 초기 렌더링 또는 위치 해제 시)
        // 불필요한 onDistanceCalculated(null) 호출을 방지.
        // 부모 컴포넌트는 초기 상태가 null임을 알고 있어야 해.
        // 그리고 위치가 선택되지 않은 상태에서 맵이 리렌더링될 때, 굳이 부모의 `drivingDistanceKm`를 `null`로
        // 계속 업데이트할 필요가 없다고 판단하여 이 부분의 `onDistanceCalculated` 호출을 제거했어.
        // 부모 컴포넌트가 `onLocationSelect(null)`이 호출될 때 거리도 null로 초기화하는 식으로 처리해야 해.
        console.log('-> ⏸️ 클릭된 위치 없음. 거리 계산 API 호출 생략.'); // ✨ 디버깅용 로그
    }
  }, [clickedLat, clickedLng, onDistanceCalculated]); // 의존성 배열에는 내부 상태와 안정화된 콜백만.

  if (!scriptLoaded) {
    return <div>지도를 불러오는 중입니다...</div>;
  }

  return (
    <div className="kakao-map-container">
      <h3>고객 위치 선택</h3>
      <div
        id="map"
        ref={mapRef}
        style={{ width: '100%', height: '400px', border: '1px solid #ccc' }}
      ></div>
    </div>
  );
}

export default KakaoMapPage;