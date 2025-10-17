// src/components/PartnersReg.tsx
import React, { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import type{ PartnerRegistrationData } from '../types/partner';

const PartnersReg: React.FC = () => {
  const [form, setForm] = useState<PartnerRegistrationData>({
    partnerType: "customer",
    name: "",
    brNum: "",
    bossName: "",
    bossPhone: "",
    address: "",
    representativeName: "",
    representativePhone: "",
    representativeEmail: "",
    remark: "",
  });

  // 유효성 검사 에러 상태 추가
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // 입력할 때 에러 메시지 초기화
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 클라이언트 사이드 유효성 검사 함수
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) {
      newErrors.name = "업체명은 필수 입력 항목입니다.";
    }
    if (!form.brNum.trim()) {
      newErrors.brNum = "사업자 등록번호는 필수 입력 항목입니다.";
    }
    // 다른 필수 필드도 여기에 추가할 수 있어!
    // if (!form.bossName.trim()) {
    //   newErrors.bossName = "대표명은 필수 입력 항목입니다.";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // 에러가 없으면 true 반환
  };

  const handleSubmit = async () => {
    // 클라이언트 사이드 유효성 검사 먼저 수행
    if (!validateForm()) {
      alert("필수 입력 항목을 모두 채워주세요."); // 사용자에게 알림
      return; // 유효성 검사 실패 시 제출 막기
    }

    const apiUrl = import.meta.env.VITE_API_URL || '/api'; 

    try {
      const response = await axios.post(`${apiUrl}/partners`, form);
      const registeredPartnerName = response.data.name; 

      alert(`${registeredPartnerName} 거래처 등록 완료!`);
      navigate("/info/partners/list");
    } catch (err) {
      console.error('거래처 등록 실패:', err);
      if (axios.isAxiosError(err) && err.response) {
        // 백엔드에서 내려주는 에러 메시지 활용
        const errorMsg = err.response.data.message || '알 수 없는 서버 오류';
        alert(`등록 실패: ${errorMsg}`);
        // 백엔드에서 특정 필드 에러를 준다면 여기에 그 필드에 대한 에러를 세팅할 수도 있어!
      } else {
        alert("거래처 등록 실패: 네트워크 오류 또는 알 수 없는 오류가 발생했습니다.");
      }
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

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
          거래처 등록
        </Typography>

        <FormControl>
          <FormLabel>거래처 종류</FormLabel>
          <RadioGroup
            row
            name="partnerType"
            value={form.partnerType}
            onChange={handleChange}
          >
            <FormControlLabel
              value="customer"
              control={<Radio />}
              label="수주품 거래처"
            />
            <FormControlLabel
              value="supplier"
              control={<Radio />}
              label="원자재 거래처"
            />
          </RadioGroup>
        </FormControl>

        <TextField
          label="업체명"
          name="name"
          value={form.name}
          onChange={handleChange}
          required // <-- HTML5 required 속성 추가 (시각적으로 * 표시됨)
          error={!!errors.name} // <-- 에러 발생 시 Material-UI TextField 빨간색으로 변경
          helperText={errors.name} // <-- 에러 메시지 표시
        />
        <TextField
          label="사업자 등록번호  ex)000-00-00000"
          name="brNum"
          value={form.brNum}
          onChange={handleChange}
          required // <-- HTML5 required 속성 추가
          error={!!errors.brNum} // <-- 에러 발생 시 Material-UI TextField 빨간색으로 변경
          helperText={errors.brNum} // <-- 에러 메시지 표시
        />
        <TextField
          label="대표명"
          name="bossName"
          value={form.bossName}
          onChange={handleChange}
          required
        />
        <TextField
          label="대표 전화번호"
          name="bossPhone"
          value={form.bossPhone}
          onChange={handleChange}
          required
        />
        <TextField
          label="주소"
          name="address"
          value={form.address}
          onChange={handleChange}
          multiline
          rows={2}
          required
        />
        <TextField
          label="담당자명"
          name="representativeName"
          value={form.representativeName}
          onChange={handleChange}
          required
        />
        <TextField
          label="담당자 연락처"
          name="representativePhone"
          value={form.representativePhone}
          onChange={handleChange}
          required
        />
        <TextField
          label="담당자 이메일"
          name="representativeEmail"
          value={form.representativeEmail}
          onChange={handleChange}
          type="email"
        />
        <TextField
          label="비고"
          name="remark"
          value={form.remark}
          onChange={handleChange}
          multiline
          rows={2}
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="contained" onClick={handleSubmit}>
            등록
          </Button>
          <Button variant="outlined" onClick={handleCancel}>
            취소
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default PartnersReg;