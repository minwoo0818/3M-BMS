import { useMemo } from "react";
import type React from "react";

export const useDocumentStyles = () => {

  return useMemo(() => ({
    documentBase: {
      width: "900px" ,
      minHeight: "900px" ,
      margin: "0 auto",
      padding: "40px",
      backgroundColor: "white",
      border: "2px solid #1f2937",
      borderRadius: "12px",
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      fontSize: "16px",
      lineHeight: 1.6,
    } as React.CSSProperties,

    documentTitle: {
      fontSize: "36px" ,
      fontWeight: "900",
      textAlign: "center",
      marginBottom: "40px",
      color: "#1f2937",
    } as React.CSSProperties,

    documentRow: {
      display: "flex",
      alignItems: "flex-start",
      marginBottom: "10px",
    } as React.CSSProperties,

    rowLabel: {
      fontWeight: "bold",
      minWidth: "150px",
      padding: "8px 15px",
      backgroundColor: "#f3f4f6",
      border: "1px solid #d1d5db",
      borderRadius: "4px 0 0 4px",
      whiteSpace: "nowrap",
      color: "#374151",
    } as React.CSSProperties,

    rowValue: {
      flex: 1,
      padding: "8px 15px",
      border: "1px solid #d1d5db",
      borderLeft: "none",
      borderRadius: "0 4px 4px 0",
      backgroundColor: "white",
      wordBreak: "break-word" as const,
      minHeight: "40px",
      display: "flex",
      alignItems: "center",
      color: "#1f2937",
    } as React.CSSProperties,

    printButton: {
      marginTop: "30px",
      padding: "12px 25px",
      fontSize: "16px",
      fontWeight: "bold",
      backgroundColor: "#3b82f6",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      alignSelf: "flex-end",
    } as React.CSSProperties,
  }), []);
};
