import React from "react";
import { useCommonStyles } from "../style/useCommonStyles";
import { useDocumentStyles } from "../style/useDocumentStyles";

const mockData = {
  lotNo: "LOT NO:",
  customerName: "코드 하우스",
  itemName: "핀걸이 스프링",
  itemCode: "Code-001",
  classification: "방산",
  color: "Yellow",
  coatingMethod: "입체",
  note: "",
  routingInfo:
    "입고/수입검사 -> 이물질 제거 -> 마스킹1 -> 마스킹2 -> Loading/도장 -> 건조 -> Loading/도장 -> 건조 -> 마스킹 제거 -> 포장",
  photoAlt: "품목 대표 사진",
};

export default function WorkOrderForm() {
  const commonStyles = useCommonStyles();
  const documentStyles = useDocumentStyles();

  const styles = {
    ...commonStyles,
    ...documentStyles,
    container: {
      ...commonStyles.container,
      backgroundColor: "white",
      padding: 40,
      position: "relative",
      fontFamily: "'Nanum Gothic', sans-serif",
      color: "#1f2937",
      minWidth: 900,
      minHeight: 900,
      border: "1px solid #333",
      borderRadius: 12,
    },
    title: {
      ...documentStyles.documentTitle,
      textAlign: "center",
      marginBottom: 30,
      fontSize: 28,
      fontWeight: 700,
    },
    infoLeft: {
      width: "55%",
      float: "left",
      fontSize: 16,
      lineHeight: 1.5,
      userSelect: "none",
      whiteSpace: "pre-line",
    },
    infoItemLabel: {
      fontWeight: "bold",
    },
    photoRight: {
      width: "40%",
      height: 300,
      backgroundColor: "#999",
      color: "white",
      fontSize: 24,
      fontWeight: "bold",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      float: "right",
      borderRadius: 8,
      userSelect: "none",
    },
    routingTitle: {
      marginTop: 30,
      fontWeight: "bold",
      userSelect: "none",
    },
    routingText: {
      marginTop: 6,
      fontSize: 14,
      whiteSpace: "normal",
      userSelect: "text",
      lineHeight: 1.4,
    },
    printButtonWrapper: {
      position: "absolute",
      bottom: 20,
      right: 16,
    },
    printButton: {
      padding: "8px 16px",
      fontSize: 16,
      fontWeight: "bold",
      borderRadius: 6,
      border: "1px solid #666",
      cursor: "pointer",
      backgroundColor: "#fbc02d",
      color: "#333",
      userSelect: "none",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>작업 지시서</h1>

      <div style={styles.infoLeft}>
        <div><strong>{mockData.lotNo}</strong></div>

        <div style={{ marginLeft: 24, marginBottom: 10 }}>
          <strong>※ 수주대상 품목 상세정보</strong>
        </div>

        <div>
          <span style={styles.infoItemLabel}>거래처명: </span>
          {mockData.customerName}
        </div>
        <div>
          <span style={styles.infoItemLabel}>품목명: </span>
          {mockData.itemName}
        </div>
        <div>
          <span style={styles.infoItemLabel}>품목번호: </span>
          {mockData.itemCode}
        </div>
        <div>
          <span style={styles.infoItemLabel}>분류: </span>
          {mockData.classification}
        </div>
        <div>
          <span style={styles.infoItemLabel}>색상: </span>
          {mockData.color}
        </div>
        <div>
          <span style={styles.infoItemLabel}>도장 방식: </span>
          {mockData.coatingMethod}
        </div>
        <div>
          <span style={styles.infoItemLabel}>비고: </span>
          {mockData.note || "-"}
        </div>

        <div style={{ marginTop: 20 }}>
          <strong>※ 라우팅 정보</strong>
          <div style={styles.routingText}>{mockData.routingInfo}</div>
        </div>
      </div>

      <div style={styles.photoRight}>{mockData.photoAlt}</div>

      <div style={styles.printButtonWrapper}>
        <button style={styles.printButton} onClick={() => window.print()}>
          출력
        </button>
      </div>
    </div>
  );
}