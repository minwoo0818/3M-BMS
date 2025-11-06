import { BrowserRouter, Route, Routes } from 'react-router-dom';
import KakaoMapPage from './pages/KakaoMapPage';

function App() {
  return (
    <>
      <BrowserRouter>
        <div style={{ display: "flex" }}>
          <div style={{ flexGrow: 1, padding: "20px" }}>
            <Routes>
              <Route path="/Kakao" element={<KakaoMapPage />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;