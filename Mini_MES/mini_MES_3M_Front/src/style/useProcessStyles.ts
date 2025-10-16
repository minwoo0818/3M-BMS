import { useMemo } from "react";
import { useCommonStyles } from "./useCommonStyles";

export const useProcessStyles = () => {
  const common = useCommonStyles();

  return useMemo(() => ({
    ...common,

    sectionTitle: (isOpen: boolean): React.CSSProperties => ({
      fontSize: "22px",
      fontWeight: "600",
      padding: "15px 20px",
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      marginBottom: "16px",
      cursor: "pointer",
      borderLeft: isOpen ? "4px solid #3b82f6" : "4px solid #d1d5db",
      transition: "all 0.15s ease-in-out",
    }),

    sectionContent: {
      backgroundColor: "white",
      padding: "16px",
      borderRadius: "8px",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    } as const,
  }), [common]);
};
