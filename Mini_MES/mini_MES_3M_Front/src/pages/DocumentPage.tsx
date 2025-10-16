import { useState } from "react";
import type React from "react";
import { useCommonStyles } from "../style/useCommonStyles";
import { useDocumentStyles } from "../style/useDocumentStyles";

// --- Mock Data (기존 유지) ---
interface WorkInstructionData {
  lotNo: string;
  customerName: string;
  itemName: string;
  itemCode: string;
  classification: string;
  color: string;
  coatingMethod: string;
  notes: string;
  processSequence: string;
  photoUrl: string;
}

interface ShipmentCertificateData {
  receivingDate: string;
  shippingDate: string;
  shipmentNo: string;
  customerName: string;
  itemCode: string;
  itemName: string;
  shippingQuantity: string;
}

const mockWorkInstruction: WorkInstructionData = {
  lotNo: "20250615-001A",
  customerName: "코드하우스",
  itemName: "핀걸이 스프링",
  itemCode: "Code-001",
  classification: "방산",
  color: "Yellow",
  coatingMethod: "액체",
  notes: "도장 후 48시간 건조 필요. 특이사항 없음.",
  processSequence:
    "입고/수입검사 -> 이물질 제거 -> 마스킹1 -> 도장 -> 건조 -> 마스킹 제거 -> 포장",
  photoUrl: "https://placehold.co/400x300/a0a0a0/ffffff?text=품목+대표+사진",
};

const mockShipmentCertificate: ShipmentCertificateData = {
  receivingDate: "2025-10-09",
  shippingDate: "2025-10-10",
  shipmentNo: "OUT-20251010-001",
  customerName: "코드하우스",
  itemCode: "Code-001",
  itemName: "핀걸이 스프링",
  shippingQuantity: "500 EA",
};

// --- WorkInstruction Component ---
const WorkInstruction: React.FC<{ data: WorkInstructionData }> = ({ data }) => {
  const s = useDocumentStyles(true);

  return (
    <div style={s.documentBase}>
      <h1 style={s.documentTitle}>작업 지시서</h1>
      <div style={s.documentRow}>
        <div style={s.rowLabel}>LOT NO</div>
        <div style={s.rowValue}>{data.lotNo}</div>
      </div>
      <div style={s.documentRow}>
        <div style={s.rowLabel}>거래처명</div>
        <div style={s.rowValue}>{data.customerName}</div>
      </div>
      {/* ... 생략된 행들 동일 ... */}
      <button style={s.printButton}>출력 (Print)</button>
    </div>
  );
};

// --- ShipmentCertificate Component ---
const ShipmentCertificate: React.FC<{ data: ShipmentCertificateData }> = ({ data }) => {
  const s = useDocumentStyles(false);

  return (
    <div style={s.documentBase}>
      <h1 style={s.documentTitle}>출하증</h1>
      <div style={s.documentRow}>
        <div style={s.rowLabel}>출고 번호</div>
        <div style={s.rowValue}>{data.shipmentNo}</div>
      </div>
      {/* ... 생략된 행들 동일 ... */}
      <button style={s.printButton}>출력 (Print)</button>
    </div>
  );
};

// --- Main App ---
type View = "menu" | "work" | "shipment";
const App: React.FC = () => {
  const styles = useCommonStyles();
  const [view, setView] = useState<View>("menu");

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>문서 생성 시스템</h1>

      {view === "menu" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <button
            style={styles.tabButton(true)}
            onClick={() => setView("work")}
          >
            작업 지시서 보기
          </button>
          <button
            style={styles.tabButton(true)}
            onClick={() => setView("shipment")}
          >
            출하증 보기
          </button>
        </div>
      )}

      {view === "work" && (
        <div>
          <WorkInstruction data={mockWorkInstruction} />
          <button
            style={{ ...styles.tabButton(false), marginTop: "30px" }}
            onClick={() => setView("menu")}
          >
            돌아가기
          </button>
        </div>
      )}

      {view === "shipment" && (
        <div>
          <ShipmentCertificate data={mockShipmentCertificate} />
          <button
            style={{ ...styles.tabButton(false), marginTop: "30px" }}
            onClick={() => setView("menu")}
          >
            돌아가기
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
