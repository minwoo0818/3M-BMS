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
import { getPartnerDetails } from '../apis/partnersApi'; // API 함수 import
import type { PartnerRegistrationData } from '../types/partner'; // 상세 조회 데이터 타입을 PartnerRegistrationData로 변경!

// ====================================================================
// 상세 페이지 컴포넌트 (내부 전환형)
// ====================================================================

const PartnersDetail = () => {
  const { id } = useParams<{ id: string }>(); // URL 파라미터는 항상 string
  const navigate = useNavigate();
  const [partner, setPartner] = useState<PartnerRegistrationData | null>(null); // 타입 변경!
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState<string | null>(null); // 에러 상태

  useEffect(() => {
    // URL 파라미터로 받은 partnerId가 있는지 확인
    if (id) {
      const idNum = Number(id); // string을 number로 변환
      if (isNaN(idNum)) { // 유효하지 않은 숫자일 경우
        setError("유효하지 않은 거래처 ID입니다.");
        setIsLoading(false);
        return;
      }

      // API 호출 함수
      const fetchDetail = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const data = await getPartnerDetails(idNum); // API 호출
          setPartner(data);
        } catch (err: any) {
          console.error('거래처 상세 정보를 불러오는데 실패했습니다:', err);
          if (err.response && err.response.data && typeof err.response.data === 'object') {
            const errorDetail = Object.values(err.response.data).join(', ');
            setError(`상세 정보 로드 실패: ${errorDetail}`);
          } else {
            setError('거래처 상세 정보를 불러오는 중 오류가 발생했습니다.');
          }
          setPartner(null); // 에러 발생 시 데이터 초기화
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetail();
    } else { // partnerId가 URL에 없는 경우
      setError("거래처 ID가 제공되지 않았습니다.");
      setIsLoading(false);
    }
  }, [id]); // partnerId가 변경될 때마다 재실행

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

  if (!partner)
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
          거래처 상세조회
        </Typography>

        {/* 거래처 종류 */}
        <FormControl component="fieldset" fullWidth>
          <FormLabel>거래처 종류</FormLabel>
          <RadioGroup row value={partner.partnerType}> {/* partner.partnerType 그대로 사용 */}
            <FormControlLabel
              value="customer"
              control={<Radio size="medium" readOnly />}
              label="수주품 거래처"
            />
            <FormControlLabel
              value="supplier"
              control={<Radio size="medium" readOnly />}
              label="원자재 거래처"
            />
          </RadioGroup>
        </FormControl>
        
        {/* 거래상태 표시는 PartnerRegistrationData에 active 필드가 없으므로 제거! */}

        {/* ✅ 기본 정보 (반복문으로 읽기 전용 TextField 바인딩) */}
        {(
          [
            "name", // name 그대로 사용
            "brNum",
            "bossName",
            "bossPhone",
            "address",
            "representativeName",
            "representativePhone",
            "representativeEmail",
          ] as (keyof Omit<PartnerRegistrationData, 'partnerType' | 'remark'>)[] // PartnerRegistrationData에서 제외 필드 명시
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
            value={partner[key] || ''}
            InputProps={{
              readOnly: true,
              style: { fontSize: 16 },
            }}
            InputLabelProps={{ style: { fontSize: 16 } }}
            multiline={key === "address"}
            rows={key === "address" ? 2 : 1}
          />
        ))}

        {/* 비고 (읽기 전용, Multiline) */}
        <TextField
          label="비고"
          name="remark"
          value={partner.remark || ''}
          multiline
          rows={2}
          InputProps={{
            readOnly: true,
            style: { fontSize: 16 },
          }}
          InputLabelProps={{ style: { fontSize: 16 } }}
        />

        {/* 하단 버튼들 */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="contained">수정</Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            목록으로
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default PartnersDetail;