import Sidebar from './conponents/Sidebar'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProcessRegisterPage from './pages/ProcessRegisterPage';
import SalesHistoryQueryPage from './pages/SalesHistoryPage';
import SalesItemInboundPage from './pages/SalesItemInboundPage';
import SalesItemRegisterPage from './pages/SalesItemRegisterPage';
import SalesItemOutboundPage from './pages/SalesItemOutboundPage';
import RawItemInboundPage from './pages/RawItemInboundPage';
import RawItemOutboundPage from './pages/RawItemOutboundPage';
import SalesItemViewPage from './pages/SalesItemViewPage';
import RawItemInventoryPage from './pages/RawsItemInventoryPage';
import ProcessStatusPage from './pages/ProcessStatusPage';

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
            <Route path="/order/item/register" element={<SalesItemRegisterPage />} />
            <Route path="/order/inbound/register" element={<SalesItemInboundPage />} />
            <Route path="/order/outbound/register" element={<SalesItemOutboundPage />} />
            <Route path="/material/inbound/register" element={<RawItemInboundPage />} />
            <Route path="/material/outbound/register" element={<RawItemOutboundPage />} />
            <Route path="/order/item/history" element={<SalesItemViewPage />} />
            <Route path="/material/item/history" element={<RawItemInventoryPage />} />
            <Route path="/ProcessRegitster/Lotid" element={<ProcessStatusPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App
