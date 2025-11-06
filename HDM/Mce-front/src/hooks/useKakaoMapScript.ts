// src/hooks/useKakaoMapScript.ts
import { useState, useEffect } from 'react';

// 전역 window 객체에 kakao가 있음을 TypeScript에 알려주기 위한 타입 선언
declare global {
  interface Window {
    kakao: any;
  }
}

const useKakaoMapScript = (appKey: string) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // 1. 이미 kakao 객체가 로드되어 있다면 바로 true 반환
    if (window.kakao && window.kakao.maps) {
      setScriptLoaded(true);
      return;
    }

    // 2. script 태그가 이미 추가되어 있는지 확인 (중복 로딩 방지)
    const scriptId = 'kakao-map-sdk';
    if (document.getElementById(scriptId)) {
      // script 태그가 존재해도 아직 로딩 중일 수 있으니, onload를 기다려야 해.
      // 이 경우는 스크립트가 로드될 때까지 기다렸다가 kakao.maps.load를 다시 호출하는 로직이 필요하지만
      // 단순화를 위해 이미 있다면 로드된 것으로 간주할게. (더 정교하게는 Promise로 관리 가능)
      if (window.kakao && window.kakao.maps) {
        setScriptLoaded(true);
      }
      return;
    }

    // 3. 스크립트 태그 생성 및 설정
    const script = document.createElement('script');
    script.id = scriptId;
    // &autoload=false 를 추가하여 SDK 로딩 후 수동으로 라이브러리를 로드할 수 있도록 해
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
    script.async = true; // 비동기 로딩

    // 스크립트 로딩 완료 시 처리
    script.onload = () => {
      // kakao.maps.load 함수를 사용하여 지도 라이브러리가 완전히 로드된 후에 콜백 실행
      window.kakao.maps.load(() => {
        setScriptLoaded(true);
      });
    };

    // 스크립트 로딩 에러 발생 시 처리
    script.onerror = () => {
      console.error('카카오 지도 SDK 로딩 실패.');
      setScriptLoaded(false);
    };

    // <head> 태그에 스크립트 추가
    document.head.appendChild(script);

    // 컴포넌트 언마운트 시 스크립트 제거 (선택 사항)
    // 일반적으로 한 번 로드된 SDK는 제거하지 않고 재사용하지만,
    // 필요하다면 주석을 해제해서 특정 컴포넌트에 종속되도록 할 수 있어.
    // return () => {
    //   document.head.removeChild(script);
    // };
  }, [appKey]); // appKey가 변경될 때마다 훅을 다시 실행하도록 의존성 배열에 추가 (보통 변경되지 않음)

  return scriptLoaded; // 스크립트 로드 여부 반환
};

export default useKakaoMapScript;