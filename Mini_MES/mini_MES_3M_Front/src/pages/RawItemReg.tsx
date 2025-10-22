import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { registerRawsItem } from '../api/rawsItemsApi'; // 새로 만든 RawsItem 등록 API import!
import { getActivePartnersByType, getPartnersList } from '../api/partnersApi'; // 매입처 목록 가져올 API import!
import type { RawsItemRegistrationData } from '../types/RawsItemTypes'; // RawsItem 등록 데이터 타입 import!
import type { PartnerListRowData } from '../types/partner'; // 매입처 타입 import!

const RawItemReg = () => {
  const [formData, setFormData] = useState<RawsItemRegistrationData>({
    supplierId: 0, // 매입처 ID
    itemCode: "", // 품목번호
    itemName: "", // 품목명
    classification: "", // 분류
    color: "", // 색상
    spec: "", // 규격 (unit -> spec 변경)
    manufacturer: "", // 제조사
    remark: "", // 비고
  });

  const [partners, setPartners] = useState<PartnerListRowData[]>([]); // 매입처 목록 상태
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // 유효성 검사 에러 상태
  const navigate = useNavigate();

  // 매입처 목록 불러오기
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const supplierPartners = await getActivePartnersByType('supplier'); // 'supplier' 타입의 파트너만 가져옴
        setPartners(supplierPartners);
      } catch (err) {
        console.error("매입처 목록을 불러오는데 실패했습니다:", err);
        alert("매입처 목록을 불러오는데 실패했습니다.");
      }
    };
    fetchPartners();
  }, []);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: unknown } }
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // 값 변경 시 해당 필드의 에러 메시지 초기화
  };

  // 클라이언트 측 유효성 검사
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.supplierId) newErrors.supplierId = "매입처명을 선택해주세요.";
    if (!formData.itemCode.trim()) newErrors.itemCode = "품목번호는 필수입니다.";
    if (!formData.itemName.trim()) newErrors.itemName = "품목명은 필수입니다.";
    if (!formData.classification.trim()) newErrors.classification = "분류는 필수입니다.";
    if (!formData.spec.trim()) newErrors.spec = "규격은 필수입니다.";
    if (!formData.manufacturer.trim()) newErrors.manufacturer = "제조사는 필수입니다.";
    // 색상, 비고는 필수가 아님 (백엔드 DTO 기준)
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      alert("필수 입력 항목을 확인해주세요.");
      return;
    }

    try {
      // API 호출
      const registeredItem = await registerRawsItem(formData);
      console.log("등록된 원자재 데이터:", registeredItem);
      alert("원자재 등록 완료!");
      navigate("/raw/item/list"); // 성공 후 목록 페이지로 이동
    } catch (err: any) {
      console.error("원자재 등록 실패:", err);
      if (err.response && err.response.data && typeof err.response.data === 'object') {
        const errorDetail = Object.values(err.response.data).join(', ');
        alert(`원자재 등록 실패: ${errorDetail}`);
        // 백엔드에서 필드별 에러를 줄 경우, 이를 errors 상태에 매핑하여 표시 가능
        // 예: setErrors(err.response.data.fieldErrors);
      } else {
        alert("원자재 등록 중 오류가 발생했습니다.");
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
        component="form"
        onSubmit={handleSubmit}
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
          원자재 관리 - 등록
        </Typography>

        {/* 업체명 (매입처) */}
        <FormControl fullWidth required error={!!errors.supplierId}>
          <InputLabel id="partner-select-label">매입처명</InputLabel>
          <Select
            labelId="partner-select-label"
            id="partner-select"
            name="supplierId" // supplierId로 변경
            value={formData.supplierId || ""} // 초기값 처리
            label="매입처명"
            onChange={handleChange}
          >
            <MenuItem value="">
              <em>매입처 선택</em>
            </MenuItem>
            {partners.map((partner) => (
              <MenuItem key={partner.partnerId} value={partner.partnerId}> {/* partnerId 사용 */}
                {partner.name} {/* partner.name 사용 */}
              </MenuItem>
            ))}
          </Select>
          {errors.supplierId && <Typography color="error" variant="caption">{errors.supplierId}</Typography>}
        </FormControl>

        <TextField
          label="품목번호"
          name="itemCode"
          value={formData.itemCode}
          onChange={handleChange}
          required
          error={!!errors.itemCode}
          helperText={errors.itemCode}
        />

        <TextField
          label="품목명"
          name="itemName"
          value={formData.itemName}
          onChange={handleChange}
          required
          error={!!errors.itemName}
          helperText={errors.itemName}
        />

        {/* 📌 분류 (Select) */}
        <FormControl fullWidth required error={!!errors.classification}>
          <InputLabel id="classification-select-label">분류</InputLabel>
          <Select
            labelId="classification-select-label"
            id="classification-select"
            name="classification"
            value={formData.classification}
            label="분류"
            onChange={handleChange}
          >
            <MenuItem value="">
              <em>분류 선택</em>
            </MenuItem>
            <MenuItem value="페인트">페인트</MenuItem>
            <MenuItem value="경화제">경화제</MenuItem>
            <MenuItem value="신나">신나</MenuItem>
            <MenuItem value="방청제">방청제</MenuItem>
            {/* UI 설계도에 따른 옵션 추가 */}
          </Select>
          {errors.classification && <Typography color="error" variant="caption">{errors.classification}</Typography>}
        </FormControl>

        <TextField
          label="색상"
          name="color"
          value={formData.color}
          onChange={handleChange}
        />

        <TextField
          label="규격" // unit -> spec
          name="spec" // unit -> spec
          value={formData.spec} // unit -> spec
          onChange={handleChange}
          required
          error={!!errors.spec}
          helperText={errors.spec}
        />

        <TextField
          label="제조사"
          name="manufacturer"
          value={formData.manufacturer}
          onChange={handleChange}
          required
          error={!!errors.manufacturer}
          helperText={errors.manufacturer}
        />

        <TextField
          label="비고"
          name="remark"
          value={formData.remark}
          onChange={handleChange}
          multiline
          rows={2}
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="contained" type="submit"> {/* type="submit"으로 변경 */}
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

export default RawItemReg;