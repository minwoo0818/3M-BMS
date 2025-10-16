import React, { useState, useEffect } from "react";
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

// ====================================================================
// 1. 데이터 구조 및 더미 데이터
// ====================================================================

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

const dummyData: PartnerData[] = [
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
];

// ====================================================================
// 2. 상세 페이지 컴포넌트 (내부 전환형)
// ====================================================================

const PartnersDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<PartnerData | null>(null);

  useEffect(() => {
    const found = dummyData.find((p) => p.id === Number(id));
    setPartner(found ?? null);
  }, [id]);

  if (!partner)
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5">업체 정보를 찾을 수 없습니다.</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
          목록으로
        </Button>
      </Box>
    );

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start", // 상단에서부터 카드 배치
        minHeight: "100vh",
        bgcolor: "#f9f9f9",
        padding: 4,
      }}
    >
      <Stack
        spacing={3}
        sx={{
          width: 500, // 등록 페이지와 동일한 너비
          bgcolor: "#fff",
          p: 4,
          borderRadius: 2,
          boxShadow: 2,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          거래처 상세조회
        </Typography>

        {/* 거래처 종류 */}
        <FormControl component="fieldset" fullWidth>
          <FormLabel>거래처 종류</FormLabel>
          <RadioGroup row value={partner.type}>
            <FormControlLabel
              value="customer"
              control={<Radio size="medium" readOnly />} // ✅ readOnly 설정
              label="수주품 거래처"
            />
            <FormControlLabel
              value="supplier"
              control={<Radio size="medium" readOnly />} // ✅ readOnly 설정
              label="원자재 거래처"
            />
          </RadioGroup>
        </FormControl>

        {/* ✅ 기본 정보 (반복문으로 읽기 전용 TextField 바인딩) */}
        {(
          [
            "partnerName",
            "brNum",
            "bossName",
            "bossPhone",
            "address",
            "representativeName",
            "representativePhone",
            "representativeEmail",
          ] as (keyof PartnerData)[]
        ).map((key) => (
          <TextField
            key={key}
            label={
              key === "partnerName"
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
            value={partner[key]}
            // ✅ InputProps를 합쳐서 readOnly와 스타일을 적용
            InputProps={{
              readOnly: true,
              style: { fontSize: 16 }, // 텍스트 크기 조정
            }}
            InputLabelProps={{ style: { fontSize: 16 } }}
          />
        ))}

        {/* 비고 (읽기 전용, Multiline) */}
        <TextField
          label="비고"
          name="remark"
          value={partner.remark}
          multiline
          rows={2}
          InputProps={{
            readOnly: true,
            style: { fontSize: 16 },
          }}
          InputLabelProps={{ style: { fontSize: 16 } }}
        />

        {/* 버튼 */}
        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-end"
          sx={{ mt: 5 }}
        >
          <Button
            variant="contained"
            size="large"
            sx={{ fontSize: 20, height: 50 }}
          >
            수정
          </Button>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/info/partners/list")} // 목록 경로로 이동하도록 수
            sx={{ fontSize: 20, height: 50 }}
          >
            취소
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default PartnersDetail;
