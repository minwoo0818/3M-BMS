import React, { useEffect, useState, useCallback } from 'react';
import { useCommonStyles } from '../style/useCommonStyles';
import axios from 'axios';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Operation {
  operationId: number;
  code: string;
  name: string;
  description?: string;
  standardTime?: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ERROR';
  startTime?: string | null;
}

const API_BASE_URL = 'http://localhost:8080'; // 백엔드 주소

const SortableRow = ({
  row,
  idx,
  selectedId,
  setSelectedId,
  isEditMode,
  handleNameChange,
  operations,
}: {
  row: Operation;
  idx: number;
  selectedId: number | null;
  setSelectedId: (id: number) => void;
  isEditMode: boolean;
  handleNameChange: (id: number, newName: string) => void;
  operations: Operation[];
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: row.operationId,
    disabled: !isEditMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <td style={{ padding: '10px', textAlign: 'center' }}>{row.operationId}</td>
      <td style={{ padding: '10px', textAlign: 'center' }}>
        {isEditMode ? (
          <select
            value={row.name}
            onChange={(e) => handleNameChange(row.operationId, e.target.value)}
            style={{ fontSize: '15px', padding: '4px', textAlign: 'center' }}
          >
            {operations.map((op) => (
              <option key={op.operationId} value={op.name}>
                {op.name}
              </option>
            ))}
          </select>
        ) : (
          row.name
        )}
      </td>
      <td
        style={{
          padding: '10px',
          textAlign: 'center',
          backgroundColor: row.status === 'COMPLETED' ? '#e8f5e9' : 'transparent',
          color: row.status === 'COMPLETED' ? '#2e7d32' : 'inherit',
          fontWeight: row.status === 'COMPLETED' ? 'bold' : 'normal',
        }}
      >
        {row.startTime
          ? new Date(row.startTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
          : '-'}
      </td>
      <td style={{ padding: '10px', textAlign: 'center' }}>
        <input
          type="radio"
          name="selectedOperation"
          checked={selectedId === row.operationId}
          onChange={() => setSelectedId(row.operationId)}
          disabled={!isEditMode}
        />
      </td>
    </tr>
  );
};

const ProcessStatusPage: React.FC = () => {
  const common = useCommonStyles();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const loadOperations = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/info/routing/status`);
      const data = response.data.content || response.data;
      setOperations(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error('공정 데이터를 불러오지 못했습니다.', err);
      setOperations([]);
    }
  }, []);

  useEffect(() => {
    loadOperations();
  }, [loadOperations]);

  const handleStart = async () => {
    if (!selectedId) return;
    try {
      await axios.patch(`${API_BASE_URL}/info/routing/${selectedId}/start`);
      await loadOperations();
    } catch (err) {
      console.error('공정 시작 실패:', err);
    }
  };

  const handleComplete = async () => {
    if (!selectedId) return;
    try {
      await axios.put(`${API_BASE_URL}/info/routing/${selectedId}`, { status: 'COMPLETED' });
      await loadOperations();
    } catch (err) {
      console.error('공정 완료 처리 실패:', err);
    }
  };

  const handleEditToggle = () => setIsEditMode((prev) => !prev);

  const handleNameChange = (id: number, newName: string) => {
    setOperations((prev) =>
      prev.map((op) => (op.operationId === id ? { ...op, name: newName } : op))
    );
  };

  const handleSave = async () => {
    const orderList = operations.map((op, idx) => ({ id: op.operationId, order: idx + 1 }));
    try {
      await axios.put(`${API_BASE_URL}/info/routing/order`, orderList);
      for (const op of operations) {
        await axios.put(`${API_BASE_URL}/info/routing/${op.operationId}`, { name: op.name });
      }
      setIsEditMode(false);
      await loadOperations();
    } catch (err) {
      console.error('수정 저장 실패:', err);
    }
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = operations.findIndex((op) => op.operationId === active.id);
      const newIndex = operations.findIndex((op) => op.operationId === over.id);
      setOperations((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <div style={common.container}>
      <h1 style={{ ...common.header, fontSize: '24px', marginBottom: '20px' }}>
        공정 진행현황 조회
      </h1>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={operations.map((op) => op.operationId)}
          strategy={verticalListSortingStrategy}
        >
          <div style={common.tableContainer}>
            <table style={{ ...common.table, fontSize: '16px', textAlign: 'center' }}>
              <thead>
                <tr>
                  <th style={{ ...common.th(true, false), width: '120px', textAlign: 'center' }}>No.</th>
                  <th style={{ ...common.th(false, false), width: '200px', textAlign: 'center' }}>공정명</th>
                  <th style={{ ...common.th(false, false), width: '160px', textAlign: 'center' }}>시작시간</th>
                  <th style={{ ...common.th(false, false), width: '100px', textAlign: 'center' }}>선택</th>
                </tr>
              </thead>
              <tbody>
                {(operations || []).map((op, idx) => (
                  <SortableRow
                    key={op.operationId}
                    row={op}
                    idx={idx}
                    selectedId={selectedId}
                    setSelectedId={setSelectedId}
                    isEditMode={isEditMode}
                    handleNameChange={handleNameChange}
                    operations={operations}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </SortableContext>
      </DndContext>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          marginTop: '16px',
          marginRight: '20px',
        }}
      >
        <p style={{ fontSize: '15px', color: '#555', fontStyle: 'italic', marginBottom: '8px' }}>
          시작한 공정은 시간이 표기되며 작업완료된 공정은 초록색으로 표시됩니다.
        </p>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            style={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '15px',
              cursor: 'pointer',
            }}
            onClick={handleStart}
          >
            다음 공정
          </button>
          <button
            style={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '15px',
              cursor: 'pointer',
            }}
            onClick={handleComplete}
          >
            완료
          </button>
          <button
            style={{
              backgroundColor: isEditMode ? '#4caf50' : '#fff',
              color: isEditMode ? '#fff' : '#000',
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '15px',
              cursor: 'pointer',
            }}
            onClick={isEditMode ? handleSave : handleEditToggle}
          >
            {isEditMode ? '저장' : '수정'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessStatusPage;
