import React, { useEffect, useState } from "react";
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
import { useParams, useNavigate } from "react-router-dom";

interface RawItem {
  id: number;
  partnerId: number;
  itemName: string;
  itemCode: string;
  classification: string;
  color: string;
  unit: string;
  manufacturer: string;
  remark: string;
  active: boolean;
}

interface PartnerData {
  id: number;
  partnerName: string;
  type: "customer" | "supplier";
}

const dummyPartners: PartnerData[] = [
  { id: 3, partnerName: "노루표", type: "supplier" },
  { id: 4, partnerName: "KCC", type: "supplier" },
];

const dummyRawItems: RawItem[] = [
  {
    id: 1,
    partnerId: 3,
    itemName: "노루페인트",
    itemCode: "NORU-DEF10",
    classification: "페인트",
    color: "빨강",
    unit: "10kg",
    manufacturer: "노루",
    remark: "주력 품목",
    active: true,
  },
  {
    id: 2,
    partnerId: 4,
    itemName: "KCC 경화제",
    itemCode: "KCC-HARD20",
    classification: "경화제",
    color: "투명",
    unit: "20kg",
    manufacturer: "KCC",
    remark: "단가 협의 필요",
    active: false,
  },
];

const RawItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rawItem, setRawItem] = useState<RawItem | null>(null);

  useEffect(() => {
    const item = dummyRawItems.find((i) => i.id === Number(id));
    if (!item) {
      alert("해당 원자재를 찾을 수 없습니다.");
      navigate("/raw/item/list");
    } else {
      setRawItem(item);
    }
  }, [id, navigate]);

  if (!rawItem) return null;

  const partner = dummyPartners.find((p) => p.id === rawItem.partnerId);
  const partnerName = partner ? partner.partnerName : "알 수 없음";

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
          원자재 관리 - 상세조회
        </Typography>

        <TextField
          label="업체명"
          value={partnerName}
          InputProps={{ readOnly: true }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="품목번호"
          value={rawItem.itemCode}
          InputProps={{ readOnly: true }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="품목명"
          value={rawItem.itemName}
          InputProps={{ readOnly: true }}
          InputLabelProps={{ shrink: true }}
        />

        <FormControl fullWidth disabled>
          <InputLabel>분류</InputLabel>
          <Select value={rawItem.classification} label="분류" readOnly>
            <MenuItem value={rawItem.classification}>
              {rawItem.classification}
            </MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="색상"
          value={rawItem.color}
          InputProps={{ readOnly: true }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="규격"
          value={rawItem.unit}
          InputProps={{ readOnly: true }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="제조사"
          value={rawItem.manufacturer}
          InputProps={{ readOnly: true }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="비고"
          value={rawItem.remark}
          multiline
          rows={2}
          InputProps={{ readOnly: true }}
          InputLabelProps={{ shrink: true }}
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="contained"
            onClick={() => alert("수정 모드로 전환 예정")}
            //   onClick={() => navigate(`/raw/item/list/${rawItem.id}/edit`)} // 실제 수정 페이지로 이동
          >
            수정
          </Button>
          <Button variant="outlined" onClick={() => navigate("/raw/item/list")}>
            목록
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default RawItemDetail;
