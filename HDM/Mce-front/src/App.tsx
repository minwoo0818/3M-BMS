import { BrowserRouter, Route, Routes } from 'react-router-dom';
import SalesRegistrationPage from './pages/SalesRegistrationPage';

function App() {
  return (
    <>
      <BrowserRouter>
        <div style={{ display: "flex" }}>
          <div style={{ flexGrow: 1, padding: "20px" }}>
            <Routes>
              <Route path="/Kakao" element={<SalesRegistrationPage />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;