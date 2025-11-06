import React, { useEffect, useRef } from 'react';
import useKakaoMapScript from '../hooks/useKakaoMapScript'; // 훅 경로에 맞게 수정

// Kakao Maps API에 사용할 앱 키 (실제 키로 변경!)
const KAKAO_APP_KEY = 'df69888e4d9f4a780888af3ed0a74bf6';

function KakaoMapPage() {
  const mapRef = useRef<HTMLDivElement>(null); // 지도를 띄울 div의 ref
  const scriptLoaded = useKakaoMapScript(KAKAO_APP_KEY); // 커스텀 훅 호출

  useEffect(() => {
    // 스크립트가 성공적으로 로드되고, mapRef.current가 존재할 때만 지도를 초기화
    if (scriptLoaded && mapRef.current) {
      const options = {
        center: new window.kakao.maps.LatLng(35.24749968285757, 128.60962616500987), // 지도의 중심 좌표
        level: 3 // 지도의 확대 레벨
      };
      const map = new window.kakao.maps.Map(mapRef.current, options);
      console.log('Kakao Map initialized:', map);

      // 여기에서 마커 추가, 이벤트 리스너 등록 등 지도 관련 추가 작업을 할 수 있어.
    } else if (!scriptLoaded) {
      console.log('카카오 지도 SDK 로딩 대기 중...');
    }
  }, [scriptLoaded]); // scriptLoaded 값이 변경될 때마다 useEffect 재실행

  if (!scriptLoaded) {
    return <div>지도를 불러오는 중입니다...</div>; // 로딩 중 UI 표시
  }

  return (
    <div className="kakao-map-container">
      <h2>카카오 지도 페이지</h2>
      <div
        id="map" // id는 옵션이지만, CSS 스타일링에 유용할 수 있어.
        ref={mapRef}
        style={{ width: '500px', height: '400px', border: '1px solid #ccc' }}
      ></div>
    </div>
  );
}

export default KakaoMapPage;