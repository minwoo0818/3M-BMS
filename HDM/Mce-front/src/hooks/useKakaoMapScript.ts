// src/hooks/useKakaoMapScript.ts
import { useState, useEffect } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

const SCRIPT_ID = 'kakao-map-sdk';

const useKakaoMapScript = (appKey: string) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    console.log('🌈 useKakaoMapScript useEffect running.', { scriptLoaded }); // ✨ 디버깅용 로그

    // 이미 스크립트가 로드되었고, kakao 객체가 사용 가능한지 확인
    if (window.kakao && window.kakao.maps) {
      if (!scriptLoaded) {
          console.log('-> 💡 Kakao 객체 이미 존재, scriptLoaded false여서 true로 변경.'); // ✨ 디버깅용 로그
          setScriptLoaded(true); // 외부에서 이미 로드되었다면 바로 true로 설정
      }
      return;
    }

    // 스크립트 태그가 이미 추가되어 있는지 확인 (중복 로딩 방지)
    if (document.getElementById(SCRIPT_ID)) {
      console.log('-> 🧩 Kakao Map SDK script tag already exists.'); // ✨ 디버깅용 로그
      // 태그가 있으면, kakao.maps.load를 기다림
      if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(() => {
              console.log('-> ⚡ Kakao Map API fully ready after kakao.maps.load from existing script.'); // ✨ 디버깅용 로그
              setScriptLoaded(true);
          });
      }
      return;
    }

    // 스크립트 태그 생성 및 설정
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
    script.async = true;

    const handleScriptLoad = () => {
        console.log('-> 📦 Kakao Map SDK script loaded via onload event.'); // ✨ 디버깅용 로그
        window.kakao.maps.load(() => {
            console.log('-> 🚀 Kakao Map API fully ready after kakao.maps.load from new script.'); // ✨ 디버깅용 로그
            setScriptLoaded(true);
        });
    };

    const handleScriptError = () => {
        console.error('-> ❌ 카카오 지도 SDK 로딩 실패.'); // ✨ 디버깅용 로그
        setScriptLoaded(false);
    };

    script.addEventListener('load', handleScriptLoad);
    script.addEventListener('error', handleScriptError);

    document.head.appendChild(script);

    return () => {
        console.log('-> 🧹 useKakaoMapScript cleanup.'); // ✨ 디버깅용 로그
        script.removeEventListener('load', handleScriptLoad);
        script.removeEventListener('error', handleScriptError);
        // SDK는 한 번 로드되면 앱 전역에서 사용될 수 있으므로, 일반적으로 제거하지 않아.
    };
  }, [appKey]); // appKey가 변경되지 않는 한 이 useEffect는 한 번만 설정돼.

  return scriptLoaded;
};

export default useKakaoMapScript;