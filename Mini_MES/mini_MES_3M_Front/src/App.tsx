import Sidebar from './conponents/Sidebar'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProcessRegisterPage from './pages/ProcessRegisterPage';
import SalesHistoryQueryPage from './pages/SalesHistoryPage';

const App = () => {
  return (
    // 1. <Router>가 최상단에 있어야 합니다.
    <BrowserRouter> 
      <div style={{ display: 'flex' }}>
        
        {/* 2. Sidebar는 반드시 <Router> 안에 있어야 합니다. */}
        <Sidebar /> 

        <div style={{ flexGrow: 1, padding: '20px' }}>
          <Routes>
            {/* ... 페이지 라우트 설정 ... */}
            <Route path="/info/routing" element={<ProcessRegisterPage />} />
            <Route path="/order/history/:type" element={<SalesHistoryQueryPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App
