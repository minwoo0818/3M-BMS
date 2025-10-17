import React, { useState } from "react";
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";

interface PartnerData {
  id: number;
  partnerName: string; // 업체명
  brNum: string; // 사업자등록번호
  bossName: string; // 대표명
  bossPhone: string; // 대표 전화번호
  address: string; // 주소
  representativeName: string; // 담당자 (부서, 직급)
  representativePhone: string; // 담당자 연락처
  representativeEmail: string; // 담당자 이메일
  remark: string; // 비고
  type: "customer" | "supplier"; // 거래처 종류
  active: boolean; // 거래상태
}

const dummyPartners: PartnerData[] = [
  {
    id: 1,
    partnerName: "코드하우스",
    brNum: "123-456789",
    bossName: "박준형",
    bossPhone: "055-123-4567",
    address: "경남 창원시 창원대로123",
    representativeName: "영업부 부장 박준형",
    representativePhone: "010-1234-5678",
    representativeEmail: "jhpark@codehouse.com",
    remark: "주요 고객사",
    type: "customer",
    active: true,
  },
  {
    id: 2,
    partnerName: "구트하우스",
    brNum: "987-654321",
    bossName: "김지훈",
    bossPhone: "051-987-6543",
    address: "경남 창원시 창원대로456",
    representativeName: "품질관리 홍석민 대리",
    representativePhone: "010-9876-5432",
    representativeEmail: "jhkim@goothouse.com",
    remark: "원자재 단가 협의 필요",
    type: "supplier",
    active: false,
  },
  // 💡 원자재 거래처 더미 추가
  {
    id: 3,
    partnerName: "노루표",
    brNum: "999-999999",
    bossName: "김노루",
    bossPhone: "011-111-1111",
    address: "서울 강남구",
    representativeName: "영업팀 노대리",
    representativePhone: "010-9999-9999",
    representativeEmail: "noro@paint.com",
    remark: "주력 원자재 공급처",
    type: "supplier",
    active: true,
  },
  {
    id: 4,
    partnerName: "KCC",
    brNum: "888-888888",
    bossName: "이KCC",
    bossPhone: "022-222-2222",
    address: "부산 해운대구",
    representativeName: "구매팀 이차장",
    representativePhone: "010-8888-8888",
    representativeEmail: "kcc@chem.com",
    remark: "경화제 공급처",
    type: "supplier",
    active: true,
  },
];

const RawItemReg = () => {
  const [formData, setFormData] = useState({
    partnerId: "" as string | number, // 선택된 업체 ID
    itemName: "",
    itemCode: "",
    classification: "",
    color: "",
    unit: "",
    manufacturer: "",
    remark: "",
  });

  const navigate = useNavigate();

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: unknown } }
  ) => {
    const { name, value } = e.target;

    // partnerId는 숫자여야 하므로, Select에서 넘어온 경우 Number()로 변환
    const finalValue =
      name === "partnerId" && typeof value === "string" && !isNaN(Number(value))
        ? Number(value)
        : value;

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.partnerId) {
      alert("업체명을 선택해주세요.");
      return;
    }

    if (!formData.classification) {
      alert("분류를 선택해주세요.");
      return;
    }

    console.log("등록할 원자재 데이터:", formData);
    alert("원자재 등록 완료! (백엔드 연결 예정)");
    navigate("/Raw/item/list");
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

        <FormControl fullWidth required>
          <InputLabel id="partner-select-label">업체명</InputLabel>
          <Select
            labelId="partner-select-label"
            id="partner-select"
            name="partnerId"
            value={String(formData.partnerId)}
            label="업체명"
            onChange={handleChange}
          >
            {/* 💡 Select 옵션 반복문 */}
            {dummyPartners
              .filter((p) => p.type === "supplier") // 원자재 거래처만 필터링
              .map((partner) => (
                <MenuItem key={partner.id} value={partner.id}>
                  {partner.partnerName}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <TextField
          label="품목번호"
          name="itemCode"
          value={formData.itemCode}
          onChange={handleChange}
        />

        <TextField
          label="품목명"
          name="itemName"
          value={formData.itemName}
          onChange={handleChange}
        />

        {/* 📌 4. 분류 (Select로 변경) */}
        <FormControl fullWidth required>
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
            <MenuItem value="KCC">KCC</MenuItem>
            {/* UI 설계도에 따른 더미 옵션 추가 */}
          </Select>
        </FormControl>
        <TextField
          label="색상"
          name="color"
          value={formData.color}
          onChange={handleChange}
        />
        <TextField
          label="규격"
          name="unit"
          value={formData.unit}
          onChange={handleChange}
        />
        <TextField
          label="제조사"
          name="manufacturer"
          value={formData.manufacturer}
          onChange={handleChange}
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

export default RawItemReg;
