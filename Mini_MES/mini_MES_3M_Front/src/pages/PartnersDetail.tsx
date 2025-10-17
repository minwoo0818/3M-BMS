import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";

import { useNavigate, useParams } from "react-router-dom";
import { getPartnerDetails, updatePartner } from '../apis/partnersApi';
import type { PartnerDetailResponse, PartnerDetailUpdateRequest } from '../types/partner'; // 변경된 타입 import!

const PartnersDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // 불러온 초기 데이터를 저장하는 상태 (PartnerDetailResponse 타입)
  const [initialPartnerData, setInitialPartnerData] = useState<PartnerDetailResponse | null>(null);
  // 편집 가능한 폼 데이터를 저장하는 상태 (PartnerDetailUpdateRequest 타입)
  const [editableFormData, setEditableFormData] = useState<PartnerDetailUpdateRequest | null>(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false); // 수정 모드 여부
  const [apiError, setApiError] = useState<{ [key: string]: string } | null>(null); // API 에러 (유효성 검사 등)

  // API 호출하여 상세 정보를 가져오는 함수
  const fetchDetail = useCallback(async (partnerIdNum: number) => {
    setIsLoading(true);
    setError(null);
    setApiError(null);
    try {
      const data = await getPartnerDetails(partnerIdNum); // PartnerDetailResponse 타입으로 받아옴
      setInitialPartnerData(data); // 초기 데이터 설정

      // editableFormData는 PartnerDetailUpdateRequest 타입에 맞춰서 partnerId 제거 후 초기화
      const { partnerId, ...rest } = data; // partnerId 제거
      setEditableFormData(rest); // PartnerDetailUpdateRequest로 설정
    } catch (err: any) {
      console.error('거래처 상세 정보를 불러오는데 실패했습니다:', err);
      if (err.response && err.response.data && typeof err.response.data === 'object') {
        const errorDetail = Object.values(err.response.data).join(', ');
        setError(`상세 정보 로드 실패: ${errorDetail}`);
      } else {
        setError('거래처 상세 정보를 불러오는 중 오류가 발생했습니다.');
      }
      setInitialPartnerData(null);
      setEditableFormData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      const idNum = Number(id);
      if (isNaN(idNum)) {
        setError("유효하지 않은 거래처 ID입니다.");
        setIsLoading(false);
        return;
      }
      fetchDetail(idNum);
    } else {
      setError("거래처 ID가 제공되지 않았습니다.");
      setIsLoading(false);
    }
  }, [id, fetchDetail]);

  // TextField 값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditableFormData((prev) => (prev ? { ...prev, [name]: value } : null));
    setApiError(null);
  };

  // RadioGroup 값 변경 핸들러 (partnerType)
  const handlePartnerTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableFormData((prev) => (prev ? { ...prev, [name]: value } : null));
    setApiError(null);
  };

  // RadioGroup 값 변경 핸들러 (active 상태)
  const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableFormData((prev) => prev ? { ...prev, active: value === "true" } : null); // "true"/"false" 문자열을 boolean으로 변환
    setApiError(null);
  };

  // 수정 버튼 클릭 시
  const handleUpdate = async () => {
    if (!editableFormData || !initialPartnerData || !id) return;
    
    try {
      // updatePartner에 editableFormData (PartnerDetailUpdateRequest) 전체를 전송
      const updatedData = await updatePartner(Number(id), editableFormData); // partnerId는 PathVariable로, 바디는 editableFormData

      setInitialPartnerData(updatedData); // 성공하면 initialPartnerData를 최신 정보 (partnerId 포함)로 업데이트
      
      // editableFormData는 partnerId가 제거된 형태여야 함
      const { partnerId, ...rest } = updatedData; // 업데이트된 데이터 (PartnerDetailResponse)에서 partnerId 제거
      setEditableFormData(rest); // 편집 데이터도 업데이트

      setIsEditing(false); // 수정 모드 종료
      alert("거래처 정보가 성공적으로 업데이트되었습니다!");
    } catch (err: any) {
      console.error('거래처 정보 업데이트 실패:', err);
      if (err.response && err.response.data) {
        if (err.response.status === 400 && typeof err.response.data === 'object') {
          setApiError(err.response.data);
        } else {
          setApiError({ general: err.response.data.message || '정보 업데이트 실패' });
          alert(`정보 업데이트 실패: ${err.response.data.message || '알 수 없는 오류'}`);
        }
      } else {
        setApiError({ general: '정보 업데이트 중 네트워크 오류 발생' });
        alert("정보 업데이트 중 네트워크 오류 발생.");
      }
    }
  };

  // 취소 버튼 클릭 시
  const handleCancelEdit = () => {
    if (initialPartnerData) { // 초기 데이터가 있으면 그걸 기반으로 편집 데이터 복구
        const { partnerId, ...rest } = initialPartnerData; // initialPartnerData (PartnerDetailResponse)에서 partnerId 제거
        setEditableFormData(rest); // 편집 데이터 복구 (PartnerDetailUpdateRequest 타입)
    }
    setIsEditing(false); // 수정 모드 종료
    setApiError(null); // 에러 메시지 초기화
  };


  if (isLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5">거래처 정보를 불러오는 중입니다...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" color="error">
          {error}
        </Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
          목록으로
        </Button>
      </Box>
    );
  }

  if (!initialPartnerData || !editableFormData) // 초기 또는 편집 데이터가 없으면 오류 처리
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5">업체 정보를 찾을 수 없습니다.</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
          목록으로
        </Button>
      </Box>
    );

  // 파트너 데이터가 정상적으로 로드되었을 때 UI 렌더링
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
          거래처 {isEditing ? "수정" : "상세조회"}
        </Typography>

        {apiError && apiError.general && (
          <Typography color="error" variant="body2">{apiError.general}</Typography>
        )}

        {/* 거래처 종류 */}
        <FormControl component="fieldset" fullWidth>
          <FormLabel>거래처 종류</FormLabel>
          <RadioGroup 
            row 
            name="partnerType"
            value={editableFormData.partnerType} 
            onChange={handlePartnerTypeChange} // handlePartnerTypeChange로 변경
          >
            <FormControlLabel
              value="customer"
              control={<Radio size="medium" readOnly={!isEditing} />}
              label="수주품 거래처"
            />
            <FormControlLabel
              value="supplier"
              control={<Radio size="medium" readOnly={!isEditing} />}
              label="원자재 거래처"
            />
          </RadioGroup>
        </FormControl>
        
        {/* 거래상태 표시 및 수정 */}
        <FormControl component="fieldset" fullWidth>
            <FormLabel>거래 상태</FormLabel>
            {isEditing ? (
              // 수정 모드일 때 라디오 버튼으로 편집 가능
              <RadioGroup row name="active" value={editableFormData.active.toString()} onChange={handleActiveChange}> {/* handleActiveChange로 변경 */}
                <FormControlLabel value="true" control={<Radio size="medium" />} label="거래 중" />
                <FormControlLabel value="false" control={<Radio size="medium" />} label="거래 중지" />
              </RadioGroup>
            ) : (
              // 수정 모드가 아닐 때 텍스트로 표시
              <Typography variant="body1" sx={{ ml: 1, fontWeight: 'bold' }}>
                  {initialPartnerData.active ? "거래 중" : "거래 중지"}
              </Typography>
            )}
        </FormControl>


        {/* ✅ 기본 정보 (반복문으로 TextField 바인딩) */}
        {(
          // PartnerDetailUpdateRequest 타입에서 파트너 ID, 타입, active, remark 필드를 제외한 키들을 순회
          [
            "name", 
            "brNum",
            "bossName",
            "bossPhone",
            "address",
            "representativeName",
            "representativePhone",
            "representativeEmail",
          ] as (keyof Omit<PartnerDetailUpdateRequest, 'partnerType' | 'active' | 'remark'>)[] // Omit 타입도 변경
        ).map((key) => (
          <TextField
            key={key}
            label={
              key === "name"
                ? "업체명"
                : key === "brNum"
                ? "사업자 등록번호"
                : key === "bossName"
                ? "대표명"
                : key === "bossPhone"
                ? "대표 전화번호"
                : key === "address"
                ? "주소"
                : key === "representativeName"
                ? "담당자 (부서, 직급)"
                : key === "representativePhone"
                ? "담당자 연락처"
                : key === "representativeEmail"
                ? "담당자 이메일"
                : "" 
            }
            name={key as string}
            value={editableFormData[key] || ''} // editableFormData 사용
            onChange={handleChange} 
            InputProps={{
              readOnly: !isEditing, // 수정 모드일 때만 편집 가능
              style: { fontSize: 16 },
            }}
            InputLabelProps={{ style: { fontSize: 16 } }}
            multiline={key === "address"}
            rows={key === "address" ? 2 : 1}
            error={!!apiError?.[key]}
            helperText={apiError?.[key]}
          />
        ))}

        {/* 비고 (TextField) */}
        <TextField
          label="비고"
          name="remark"
          value={editableFormData.remark || ''} // editableFormData 사용
          onChange={handleChange}
          multiline
          rows={2}
          InputProps={{
            readOnly: !isEditing,
            style: { fontSize: 16 },
          }}
          InputLabelProps={{ style: { fontSize: 16 } }}
        />

        {/* 하단 버튼들 */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          {isEditing ? (
            <>
              <Button variant="contained" onClick={handleUpdate}>
                저장
              </Button>
              <Button variant="outlined" onClick={handleCancelEdit}>
                취소
              </Button>
            </>
          ) : (
            <>
              <Button variant="contained" onClick={() => setIsEditing(true)}>
                수정
              </Button>
              <Button variant="outlined" onClick={() => navigate(-1)}>
                목록으로
              </Button>
            </>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default PartnersDetail;