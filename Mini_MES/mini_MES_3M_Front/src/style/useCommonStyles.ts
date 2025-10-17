import { useMemo } from "react";
import type React from "react";

export const useCommonStyles = () => {
  return useMemo(() => ({
    container: {
      padding: '30px',
      fontFamily: 'Inter, sans-serif',
      backgroundColor: '#f9f9f9',
      minHeight: '100vh'
    } as const,

    header: {
      fontSize: '28px',
      fontWeight: 'bold',
      paddingBottom: '10px',
      marginBottom: '30px',
      borderBottom: `4px solid #3b82f6`,
      color: '#1f2937'
    },

    sectionTitle: (isOpen: boolean): React.CSSProperties => ({
      fontSize: '22px',
      fontWeight: 600,
      cursor: 'pointer',
      padding: '15px 20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: '#1f2937',
      transition: 'all 0.15s ease-in-out',
      borderLeft: isOpen ? '4px solid #3b82f6' : '4px solid #d1d5db',
    }),

    accordionContent: (isOpen: boolean): React.CSSProperties => ({
      maxHeight: isOpen ? '500px' : '0',
      overflow: 'hidden',
      transition: 'max-height 0.3s ease-in-out',
      padding: isOpen ? '20px' : '0',
      marginBottom: isOpen ? '24px' : '0',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    }),

    formRow: {
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-end' as const,
      width: '100%'
    } as const,

    inputGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      flex: 1,
      minWidth: '80px',
    } as const,

    label: {
      marginBottom: '4px',
      fontSize: '13px',
      fontWeight: 600,
      color: '#4b5563'
    },

    input: {
      padding: '10px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      outline: 'none',
      transition: 'border-color 0.15s ease-in-out',
      width: '90%',
      color: '#1f2937'
    },

    searchContainer: {
      display: 'flex',
      gap: '12px',
      padding: '16px',
      border: '1px solid #d1d5db',
      borderRadius: '12px',
      marginBottom: '24px',
      alignItems: 'center',
      backgroundColor: 'white',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    } as const,

    searchGroup: {
      display: 'flex',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      overflow: 'hidden',
      flexGrow: 1
    } as const,

    searchSelect: {
      borderRight: '1px solid #d1d5db',
      padding: '10px',
      backgroundColor: '#f3f4f6',
      minWidth: '120px',
      outline: 'none',
      appearance: 'none' as const,
      color: '#4b5563'
    } as const,

    searchButton: {
      padding: '12px',
      border: 'none',
      backgroundColor: '#3b82f6',
      color: 'white',
      borderRadius: '9999px',
      width: '48px',
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      transition: 'background-color 0.15s ease-in-out',
    },

    tableContainer: {
      overflowX: 'auto',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      borderRadius: '12px'
    } as const,

    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      fontSize: '14px',
      backgroundColor: 'white',
      borderRadius: '12px'
    } as const,

    tableHeaderRow: {
      backgroundColor: '#e0e7ff', // 헤더 행 배경색을 좀 더 시원한 파란색 계열로 해봤어!
      borderBottom: '2px solid #a5b4fc', // 헤더 아래 경계선
    } as const,

    tableRow: {
      backgroundColor: 'white',
      borderBottom: '1px solid #f3f4f6', // 각 행의 구분선
      transition: 'background-color 0.2s ease-in-out',
    } as const,

    th: (isFirst: boolean, isLast: boolean): React.CSSProperties => ({
      padding: '14px',
      backgroundColor: '#e5e7eb',
      fontWeight: '700',
      textAlign: 'center' as const,
      border: '1px solid #d1d5db',
      ...(isFirst && { borderTopLeftRadius: '12px' }),
      ...(isLast && { borderTopRightRadius: '12px' }),
      whiteSpace: 'nowrap',
      color: '#1f2937'
    }),

    td: {
      padding: '12px',
      textAlign: 'center' as const,
      border: '1px solid #e5e7eb',
      transition: 'background-color 0.15s ease-in-out',
      whiteSpace: 'nowrap'
    } as const,

        tdCenter: {
      textAlign: 'center'
    } as React.CSSProperties,
    tdRight: {
      textAlign: 'right',
      fontWeight: '600',
    } as React.CSSProperties,

    tdHover: { backgroundColor: '#eff6ff' },

    paginationContainer: {
      display: 'flex',
      justifyContent: 'center' as const,
      marginTop: '24px',
      gap: '8px'
    } as const,

    actionButton: (color: string): React.CSSProperties => ({
      padding: '4px 8px',
      border: 'none',
      borderRadius: '6px',
      color: 'white',
      cursor: 'pointer',
      fontSize: '12px',
      backgroundColor: color,
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    }),

    pageButton: (isActive: boolean): React.CSSProperties => ({
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.15s ease-in-out',
      backgroundColor: isActive ? '#3b82f6' : 'white',
      color: isActive ? 'white' : '#4b5563',
      fontWeight: isActive ? 600 : 400,
    }),
    
  }), []);
};