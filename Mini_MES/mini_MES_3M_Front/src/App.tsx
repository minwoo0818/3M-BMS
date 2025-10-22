import Sidebar from "./conponents/Sidebar";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProcessRegisterPage from "./pages/ProcessRegisterPage";
import SalesHistoryQueryPage from "./pages/SalesHistoryPage";
import SalesItemInboundPage from "./pages/SalesItemInboundPage";
import SalesItemRegisterPage from "./pages/SalesItemRegisterPage";
import SalesItemOutboundPage from "./pages/SalesItemOutboundPage";
import WorkOrderForm from "./pages/WorkOrderPage";
import ShipmentCertificatePage from "./pages/ShipmentCertificatePage";
import PartnersReg from "./pages/PartnersReg";
import PartnersList from "./pages/PartnersList";
import PartnersDetail from "./pages/PartnersDetail";
import RawItemReg from "./pages/RawItemReg";
import RawsHistoryPage from "./pages/RawsHistoryPage";
import RawItemInboundPage from "./pages/RawItemInboundPage";
import RawItemOutboundPage from "./pages/RawItemOutboundPage";
import SalesItemViewPage from "./pages/SalesItemListPage";
import RawItemInventoryPage from "./pages/RawsItemInventoryPage";
import ProcessStatusPage from "./pages/ProcessStatusPage";
import RawItemList from "./pages/RawItemList";
import RawItemDetail from "./pages/RawItemDetail";
import SalesItemDetailPage from "./pages/SalesItemDetailPage";

const App = () => {
  return (
    <>
      {/* 인쇄 시 사이드바 숨기고 작업지시서 영역 최대화하는 스타일 */}
      <style>
        {`
          @media print {
            .sidebar {
              display: none !important;
            }
            div[style*="flex-grow: 1"] {
              flex-grow: 0 !important;
              width: 100% !important;
              padding: 0 !important;
            }
            body {
              background: white !important;
            }
          }
        `}
      </style>
      {/* // 1. <Router>가 최상단에 있어야 합니다. */}
      <BrowserRouter>
        <div style={{ display: "flex" }}>
          {/* 2. Sidebar는 반드시 <Router> 안에 있어야 합니다. */}
          <Sidebar />

          <div style={{ flexGrow: 1, padding: "20px" }}>
            <Routes>
              {/* ... 페이지 라우트 설정 ... */}
              <Route path="/info/routing" element={<ProcessRegisterPage />} />
              <Route path="/info/partners/reg" element={<PartnersReg />} />
              <Route path="/info/partners/list" element={<PartnersList />} />
              <Route path="/info/partners/:id" element={<PartnersDetail />} />
              <Route path="/raw/item/register" element={<RawItemReg />} />
              <Route path="/raw/item/list" element={<RawItemList />} />
              <Route path="/raw/item/detail/:id" element={<RawItemDetail />} />
              <Route
                path="/sales/item/detail/:id"
                element={<SalesItemDetailPage />}
              />
              <Route
                path="/order/history/:type"
                element={<SalesHistoryQueryPage />}
              />
              <Route
                path="/sales/item/register"
                element={<SalesItemRegisterPage />}
              />
              <Route path="/sales/item/list" element={<SalesItemViewPage />} />
              <Route
                path="/order/inbound/register"
                element={<SalesItemInboundPage />}
              />
              <Route
                path="/order/outbound/list"
                element={<SalesItemOutboundPage />}
              />
              {/* 작업지시서 입고 번호를 보냄 DB에 조회해서 불러오는거 필요 */}
              <Route
                path="/work-order/:documentId"
                element={<WorkOrderForm />}
              />
              {/* 출하증 출고 번호를 보냄 DB에 조회해서 불러오는거 필요*/}
              <Route
                path="/shipping-certificate/:documentId"
                element={<ShipmentCertificatePage />}
              />
              {/* 원자재 입고 이력조회 */}
              <Route path="/raw/history/:type" element={<RawsHistoryPage />} />

              {/* ... 페이지 라우트 설정 ... */}
              <Route
                path="/raw/inbound/register"
                element={<RawItemInboundPage />}
              />

              {/* 수주품목 등록 페이지 */}
              <Route
                path="/sales/item/register"
                element={<SalesItemRegisterPage />}
              />
              {/* 수주품목 입고 등록 페이지 */}
              <Route
                path="/sales/inbound/register"
                element={<SalesItemInboundPage />}
              />

              {/* 원자재품목 입고 등록 페이지 */}
              <Route
                path="/raw/inbound/register"
                element={<RawItemInboundPage />}
              />
              {/* 원자재품목 출고 등록 페이지 */}
              <Route
                path="/raw/outbound/register"
                element={<RawItemOutboundPage />}
              />
              {/* 수주품목 조회 페이지 */}
              <Route
                path="/sales/item/history"
                element={<SalesItemViewPage />}
              />
              {/* 재고현황 페이지 */}
              <Route
                path="/raw/stock/status"
                element={<RawItemInventoryPage />}
              />
              {/* 공정진행현황 페이지 */}
              <Route
                path="/ProcessRegister/Lotid"
                element={<ProcessStatusPage />}
              />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </>
  );
};

export default App;
