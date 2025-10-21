import { useMemo } from "react";
import type React from "react";
import type { HistoryType } from "../types/sales_history";

export const useSalesHistoryStyles = () => {
  return useMemo(() => ({
    // header: (type: HistoryType): React.CSSProperties => ({
    //   fontSize: '24px',
    //   fontWeight: 'bold',
    //   paddingBottom: '10px',
    //   marginBottom: '20px',
    //   borderBottom: `4px solid ${type === 'INBOUND' ? '#3b82f6' : '#f97316'}`,
    //   color: type === 'INBOUND' ? '#1e3a8a' : '#7c2d12'
    // }),

    modeButton: (isActive: boolean, type: HistoryType): React.CSSProperties => {
      const activeBg = type === 'INBOUND' ? '#3b82f6' : '#f97316';
      return {
        padding: '10px 16px',
        borderRadius: '8px',
        fontWeight: 600,
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.15s ease-in-out',
        backgroundColor: isActive ? activeBg : '#e5e7eb',
        color: isActive ? 'white' : '#4b5563',
        boxShadow: isActive ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
      };
    },

    badge: (bg: string, text: string): React.CSSProperties => ({
      padding: '2px 8px',
      borderRadius: '9999px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: bg,
      color: text,
      display: 'inline-block'
    }),

    searchInput: { 
        padding: '10px', 
        border: 'none', 
        flexGrow: 1, 
        outline: 'none', 
        color: '#1f2937' // text-gray-800
    },

    excelButton: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '8px',
      backgroundColor: '#10b981',
      color: 'white',
      fontWeight: 600,
      cursor: 'pointer',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      transition: 'background-color 0.15s ease-in-out',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    } as const,

  }), []);
};
