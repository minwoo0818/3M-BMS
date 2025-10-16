import type React from "react";
import { useDocumentStyles } from "../style/useDocumentStyles";
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';


// --- ShipmentCertificateData Interface ---
export interface ShipmentCertificateData {
  receivingDate: string;
  shippingDate: string;
  shipmentNo: string;
  customerName: string;
  itemCode: string;
  itemName: string;
  shippingQuantity: string;
}

// ✨ 출하증 목 데이터 리스트 (실제로는 API 호출 등으로 데이터를 가져오겠지!)
const mockShipmentCertificates: ShipmentCertificateData[] = [
  {
    receivingDate: "2025-10-09",
    shippingDate: "2025-10-10",
    shipmentNo: "OUT-20251010-001",
    customerName: "코드하우스",
    itemCode: "Code-001",
    itemName: "핀걸이 스프링",
    shippingQuantity: "500 EA",
  },
  {
    receivingDate: "2025-10-10",
    shippingDate: "2025-10-11",
    shipmentNo: "OUT-20251011-002",
    customerName: "또다른 회사",
    itemCode: "Code-002",
    itemName: "너트 M10",
    shippingQuantity: "1000 EA",
  },
];

// ✨ 데이터가 없을 때 보여줄 더미 출하증 데이터 정의!
const dummyShipmentCertificate: ShipmentCertificateData = {
  receivingDate: "----년 --월 --일",
  shippingDate: "----년 --월 --일",
  shipmentNo: "--- 등록되지 않은 출고번호 ---",
  customerName: "--- 해당 거래처명 ---",
  itemCode: "--- 품목코드 ---",
  itemName: "--- 품목명 ---",
  shippingQuantity: "--- 수량 ---",
};


// --- ShipmentCertificate Component ---
const ShipmentCertificatePage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const s = useDocumentStyles(false);

  // ✨ 데이터를 저장할 상태. 초기값은 더미 데이터로 설정
  const [shipmentData, setShipmentData] = useState<ShipmentCertificateData>(dummyShipmentCertificate);
  const [isLoading, setIsLoading] = useState(true);
  // ✨ 에러 메시지는 이제 필요 없을 것 같아서 제거했어. (더미 데이터를 보여줄 거니까)


  useEffect(() => {
    setIsLoading(true);
    // 실제라면 여기서 API를 호출해서 documentId에 해당하는 데이터를 가져오겠지!

    // 목 데이터 리스트에서 찾아오는 걸로 구현
    const foundData = mockShipmentCertificates.find(
      (item) => item.shipmentNo === documentId
    );

    if (foundData) {
      setShipmentData(foundData); // 찾으면 실제 데이터로 설정
    } else {
      setShipmentData(dummyShipmentCertificate); // ✨ 못 찾으면 더미 데이터로 설정!
    }
    setIsLoading(false);
  }, [documentId]);

  // ✨ 로딩 중일 때만 표시할 내용 (더미 데이터는 로딩 완료 후 표시되니까)
  if (isLoading) {
    return (
      <div style={s.documentBase}>
        <h1 style={s.documentTitle}>출하증</h1>
        <p style={{textAlign: 'center', fontSize: '18px'}}>데이터를 불러오는 중...</p>
      </div>
    );
  }

  // ✨ 데이터가 성공적으로 불러와졌거나 (실제 데이터든 더미 데이터든) 로딩이 끝나면 항상 양식을 렌더링 해!
  return (
    <div style={s.documentBase}>
      <h1 style={s.documentTitle}>출하증</h1>
      <div style={s.documentRow}>
        <div style={s.rowLabel}>출고 번호</div>
        <div style={s.rowValue}>{shipmentData.shipmentNo}</div>
      </div>
      <div style={s.documentRow}>
        <div style={s.rowLabel}>출하 일자</div>
        <div style={s.rowValue}>{shipmentData.shippingDate}</div>
      </div>
      <div style={s.documentRow}>
        <div style={s.rowLabel}>접수 일자</div>
        <div style={s.rowValue}>{shipmentData.receivingDate}</div>
      </div>
      <div style={s.documentRow}>
        <div style={s.rowLabel}>거래처명</div>
        <div style={s.rowValue}>{shipmentData.customerName}</div>
      </div>
      <div style={s.documentRow}>
        <div style={s.rowLabel}>품목코드</div>
        <div style={s.rowValue}>{shipmentData.itemCode}</div>
      </div>
      <div style={s.documentRow}>
        <div style={s.rowLabel}>품목명</div>
        <div style={s.rowValue}>{shipmentData.itemName}</div>
      </div>
      <div style={s.documentRow}>
        <div style={s.rowLabel}>출하 수량</div>
        <div style={s.rowValue}>{shipmentData.shippingQuantity}</div>
      </div>
      {/* 여기에 출하증에 필요한 다른 필드들을 documentRow 형태로 추가하면 돼! */}
      <div style={s.printButtonWrapper}>
        <button style={s.printButton} onClick={() => window.print()}>출력 (Print)</button>
      </div>
    </div>
  );
};

export default ShipmentCertificatePage;