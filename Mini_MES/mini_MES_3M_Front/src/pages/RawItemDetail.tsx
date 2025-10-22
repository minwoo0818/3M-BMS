import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Switch,
  FormGroup,
  FormControlLabel,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

import { getRawsItemById, updateRawsItem } from '../api/rawsItemApi';
import type { RawsItemDetail, RawsItemUpdateRequest, SupplierOption } from '../types/RawsItemTypes';
import { getActivePartnersByType } from "../api/partnersApi";

const CLASSIFICATION_OPTIONS = ["페인트", "신나", "세척제", "경화제"];

const RawItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 모든 useState, useEffect, useCallback 훅들을 여기에 선언!
  const [rawItem, setRawItem] = useState<RawsItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<RawsItemUpdateRequest | null>(null);
  const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});
  
  const [supplierOptions, setSupplierOptions] = useState<SupplierOption[]>([]);


  // 매입처 목록 불러오기 (초기 로드) - useEffect는 항상 최상위에서 호출
  useEffect(() => {
    const fetchSuppliers = async () => {
        try {
            const activeSuppliers = await getActivePartnersByType('supplier');
            setSupplierOptions(activeSuppliers.map(s => ({
                partnerId: s.partnerId,
                partnerName: s.name
            })));
        } catch (err) {
            console.error("매입처 목록을 불러오는데 실패했습니다:", err);
            // setError("매입처 목록을 불러오는데 실패했습니다."); // 전역 에러 상태에 추가하지 않음 (치명적 아님)
        }
    };
    fetchSuppliers();
  }, []);

  // 상세 데이터 불러오기 - useCallback도 항상 최상위에서 호출
  const fetchRawsItemDetail = useCallback(async () => {
    if (!id) {
      setError("원자재 ID가 제공되지 않았습니다.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getRawsItemById(Number(id));
      setRawItem(data);
      setEditedData({
        itemCode: data.itemCode,
        itemName: data.itemName,
        classification: data.classification,
        color: data.color,
        spec: data.spec,
        manufacturer: data.manufacturer,
        remark: data.remark,
        supplierId: data.supplierId,
        active: data.active,
      });
    } catch (err: any) {
      console.error('원자재 상세 정보를 불러오는데 실패했습니다:', err);
      if (err.response && err.response.data && typeof err.response.data === 'object') {
        setError(err.response.data.message || '해당 원자재를 찾을 수 없거나 불러올 수 없습니다.');
      } else {
        setError('원자재 상세 정보를 불러오는 중 오류가 발생했습니다.');
      }
      alert('해당 원자재를 찾을 수 없습니다.');
      navigate("/raws/items/list");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  // 상세 데이터 불러오기 트리거 - useEffect도 항상 최상위에서 호출
  useEffect(() => {
    fetchRawsItemDetail();
  }, [fetchRawsItemDetail]);

  // 수정 모드 토글 - useCallback도 항상 최상위에서 호출
  const handleEditToggle = useCallback(() => {
    setIsEditing(prev => !prev);
    if (!isEditing) {
      setEditedData({
        itemCode: rawItem!.itemCode, // !로 null이 아님을 보장 (rawItem이 null이면 이 함수 호출 안됨)
        itemName: rawItem!.itemName,
        classification: rawItem!.classification,
        color: rawItem!.color,
        spec: rawItem!.spec,
        manufacturer: rawItem!.manufacturer,
        remark: rawItem!.remark,
        supplierId: rawItem!.supplierId,
        active: rawItem!.active,
      });
      setEditErrors({});
    } else {
      setEditedData(null);
      setEditErrors({});
    }
  }, [isEditing, rawItem]); // rawItem이 null일 때 에러 방지를 위해 ! 사용

  // 입력 필드 변경 핸들러 - useCallback도 항상 최상위에서 호출
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setEditedData(prev => prev ? { ...prev, [name as string]: value } : null);
    setEditErrors(prev => ({ ...prev, [name as string]: undefined }));
  }, []);
  
  // Select (분류/매입처) 변경 핸들러 - useCallback도 항상 최상위에서 호출
  const handleSelectChange = useCallback((e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setEditedData(prev => prev ? { ...prev, [name as string]: value as string | number } : null);
    setEditErrors(prev => ({ ...prev, [name as string]: undefined }));
  }, []);

  // Switch (활성화 여부) 변경 핸들러 - useCallback도 항상 최상위에서 호출
  const handleSwitchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setEditedData(prev => prev ? { ...prev, [name as string]: checked } : null);
    setEditErrors(prev => ({ ...prev, [name as string]: undefined }));
  }, []);

  // 저장 버튼 클릭 핸들러 - useCallback도 항상 최상위에서 호출
  const handleSave = useCallback(async () => {
    if (!id || !editedData) return;

    const currentErrors: { [key: string]: string } = {};
    if (!editedData.itemCode.trim()) currentErrors.itemCode = "품목번호는 필수입니다.";
    if (!editedData.itemName.trim()) currentErrors.itemName = "품목명은 필수입니다.";
    if (!editedData.classification.trim()) currentErrors.classification = "분류는 필수입니다.";
    if (!editedData.spec.trim()) currentErrors.spec = "원자재 규격은 필수입니다.";
    if (!editedData.manufacturer.trim()) currentErrors.manufacturer = "제조사는 필수입니다.";
    if (editedData.supplierId === null || editedData.supplierId === undefined) currentErrors.supplierId = "매입처를 선택해 주세요.";

    if (Object.keys(currentErrors).length > 0) {
      setEditErrors(currentErrors);
      alert("필수 입력값을 확인해 주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await updateRawsItem(Number(id), editedData);
      alert('원자재 정보가 성공적으로 수정되었습니다.');
      setIsEditing(false);
      await fetchRawsItemDetail();
    } catch (err: any) {
      console.error('원자재 정보 수정 실패:', err);
      if (err.response && err.response.data && typeof err.response.data === 'object') {
        const errorDetail = err.response.data.message || Object.values(err.response.data).join(', ');
        setEditErrors({ general: `수정 실패: ${errorDetail}` });
      } else {
        setEditErrors({ general: '원자재 정보 수정 중 오류가 발생했습니다.' });
      }
    } finally {
      setLoading(false);
    }
  }, [id, editedData, fetchRawsItemDetail]); // 의존성 배열에 editedData 추가

  // ----- 모든 훅 선언이 끝난 후 조건부 렌더링 시작 -----

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>데이터를 불러오는 중입니다...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error" variant="h6">에러 발생: {error}</Typography>
        <Button variant="contained" onClick={() => navigate("/raws/items/list")}>목록으로 돌아가기</Button>
      </Box>
    );
  }

  // rawItem이 null인 경우는 에러이므로 위의 error 처리 로직으로 이동시키거나, 
  // rawItem이 비어있는 상태로 렌더링을 막기 위한 조건
  if (!rawItem) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6">원자재 정보를 찾을 수 없습니다.</Typography>
        <Button variant="contained" onClick={() => navigate("/raws/items/list")}>목록으로 돌아가기</Button>
      </Box>
    );
  }

  // ----- 여기서부터는 rawItem이 반드시 존재한다고 가정하고 렌더링 시작 -----

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "100vh",
        bgcolor: "#f9f9f9",
        padding: 4,
      }}
    >
      <Stack
        spacing={3}
        sx={{
          width: 500,
          bgcolor: "#fff",
          p: 4,
          borderRadius: 2,
          boxShadow: 2,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          원자재 관리 - {isEditing ? "수정" : "상세조회"}
        </Typography>

        {editErrors.general && (
            <Typography color="error" variant="body2">{editErrors.general}</Typography>
        )}

        {/* 매입처명 (readOnly) */}
        <TextField
          label="매입처명"
          value={rawItem.supplierName || "정보 없음"}
          InputProps={{ readOnly: true }}
          InputLabelProps={{ shrink: true }}
        />
        {/* 품목번호 (수정 가능) */}
        <TextField
          label="품목번호"
          name="itemCode"
          value={isEditing && editedData ? editedData.itemCode : rawItem.itemCode}
          onChange={handleChange}
          InputProps={{ readOnly: !isEditing }}
          InputLabelProps={{ shrink: true }}
          required
          error={!!editErrors.itemCode}
          helperText={editErrors.itemCode}
        />
        {/* 품목명 (수정 가능) */}
        <TextField
          label="품목명"
          name="itemName"
          value={isEditing && editedData ? editedData.itemName : rawItem.itemName}
          onChange={handleChange}
          InputProps={{ readOnly: !isEditing }}
          InputLabelProps={{ shrink: true }}
          required
          error={!!editErrors.itemName}
          helperText={editErrors.itemName}
        />

        {/* 분류 (수정 가능 - Select) */}
        <FormControl fullWidth>
            <InputLabel shrink={true}>분류</InputLabel>
            <Select
                name="classification"
                value={isEditing && editedData ? editedData.classification : rawItem.classification}
                onChange={handleSelectChange}
                label="분류"
                disabled={!isEditing}
                displayEmpty
                error={!!editErrors.classification}
            >
                <MenuItem value=""><em>없음</em></MenuItem>
                {CLASSIFICATION_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
            </Select>
            {editErrors.classification && <Typography color="error" variant="caption">{editErrors.classification}</Typography>}
        </FormControl>
        
        {/* 색상 (수정 가능) */}
        <TextField
          label="색상"
          name="color"
          value={isEditing && editedData ? editedData.color : rawItem.color}
          onChange={handleChange}
          InputProps={{ readOnly: !isEditing }}
          InputLabelProps={{ shrink: true }}
        />
        {/* 규격 (원자재 규격 양/단위) (수정 가능) */}
        <TextField
          label="규격"
          name="spec"
          value={isEditing && editedData ? editedData.spec : rawItem.spec}
          onChange={handleChange}
          InputProps={{ readOnly: !isEditing }}
          InputLabelProps={{ shrink: true }}
          required
          error={!!editErrors.spec}
          helperText={editErrors.spec}
        />
        {/* 제조사 (수정 가능) */}
        <TextField
          label="제조사"
          name="manufacturer"
          value={isEditing && editedData ? editedData.manufacturer : rawItem.manufacturer}
          onChange={handleChange}
          InputProps={{ readOnly: !isEditing }}
          InputLabelProps={{ shrink: true }}
          required
          error={!!editErrors.manufacturer}
          helperText={editErrors.manufacturer}
        />
        {/* 비고 (수정 가능) */}
        <TextField
          label="비고"
          name="remark"
          value={isEditing && editedData ? editedData.remark : rawItem.remark}
          onChange={handleChange}
          multiline
          rows={2}
          InputProps={{ readOnly: !isEditing }}
          InputLabelProps={{ shrink: true }}
        />
        
        {/* +++++ 추가: 매입처 ID (수정 모드일 때만 보이기) +++++
        {isEditing && (
            <FormControl fullWidth>
                <InputLabel shrink={true}>매입처</InputLabel>
                <Select
                    name="supplierId"
                    value={editedData ? editedData.supplierId : rawItem.supplierId}
                    onChange={handleSelectChange}
                    label="매입처"
                    disabled={!isEditing}
                    displayEmpty
                    error={!!editErrors.supplierId}
                >
                    <MenuItem value=""><em>매입처 선택</em></MenuItem>
                    {supplierOptions.map((supplier) => (
                        <MenuItem key={supplier.partnerId} value={supplier.partnerId}>{supplier.partnerName}</MenuItem>
                    ))}
                </Select>
                {editErrors.supplierId && <Typography color="error" variant="caption">{editErrors.supplierId}</Typography>}
            </FormControl>
        )} */}

        {/* 활성화 여부 (수정 모드일 때만 보이기) */}
        {isEditing && (
            <FormGroup>
                <FormControlLabel
                    control={
                        <Switch
                            name="active"
                            checked={editedData ? editedData.active : rawItem.active}
                            onChange={handleSwitchChange}
                            disabled={!isEditing}
                        />
                    }
                    label="활성화 여부"
                />
            </FormGroup>
        )}


        <Stack direction="row" spacing={2} justifyContent="flex-end">
          {isEditing ? (
            <>
              <Button variant="contained" color="success" onClick={handleSave}>
                저장
              </Button>
              <Button variant="outlined" onClick={handleEditToggle}>
                취소
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                onClick={handleEditToggle} // 수정 모드로 전환
              >
                수정
              </Button>
              <Button variant="outlined" onClick={() => navigate("/raw/item/list")}>
                목록
              </Button>
            </>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default RawItemDetail;