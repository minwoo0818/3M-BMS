import React, { useEffect, useState } from "react";
import { useCommonStyles } from "../style/useCommonStyles";
import { useDocumentStyles } from "../style/useDocumentStyles";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function WorkOrderPage() {
  const { inboundId } = useParams();
  const commonStyles = useCommonStyles();
  const documentStyles = useDocumentStyles();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getWorkOrder = async () => {
  try {
    setLoading(true);
    const res = await axios.get(`/work-order/${inboundId}`);
    setData(res.data);
  } catch (err) {
    console.error(err);
    setError("데이터를 불러오는데 실패했습니다.");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  if (inboundId) getWorkOrder();
}, [inboundId]);


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

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;
  if (!data) return <div>데이터가 없습니다.</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>작업 지시서</h1>

      <div style={styles.infoLeft}>
        <div><strong>{data.lotNo}</strong></div>

        <div style={{ marginLeft: 24, marginBottom: 10 }}>
          <strong>※ 수주대상 품목 상세정보</strong>
        </div>

        <div>
          <span style={styles.infoItemLabel}>거래처명: </span>
          {data.customerName}
        </div>
        <div>
          <span style={styles.infoItemLabel}>품목명: </span>
          {data.itemName}
        </div>
        <div>
          <span style={styles.infoItemLabel}>품목번호: </span>
          {data.itemCode}
        </div>
        <div>
          <span style={styles.infoItemLabel}>분류: </span>
          {data.classification}
        </div>
        <div>
          <span style={styles.infoItemLabel}>색상: </span>
          {data.color}
        </div>
        <div>
          <span style={styles.infoItemLabel}>도장 방식: </span>
          {data.coatingMethod}
        </div>
        <div>
          <span style={styles.infoItemLabel}>비고: </span>
          {data.note || "-"}
        </div>

        <div style={{ marginTop: 20 }}>
          <strong>※ 라우팅 정보</strong>
          <div style={styles.routingText}>{data.routingInfo}</div>
        </div>
      </div>

      <div style={styles.photoRight}>{data.photoAlt || "품목 대표 사진"}</div>

      <div style={styles.printButtonWrapper}>
        <button style={styles.printButton} onClick={() => window.print()}>
          출력
        </button>
      </div>
    </div>
  );
}
