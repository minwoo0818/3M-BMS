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

const PartnersReg = () => {
  const [form, setForm] = useState({
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

  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // try {
    //   await axios.post("/partners", form);
    //   alert("등록 완료!");
    //   navigate("/partners");
    // } catch (err) {
    //   console.error(err);
    //   alert("등록 실패");
    // }
    alert("등록 완료! (백엔드 연결 예정)");
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
        />
        <TextField
          label="사업자 등록번호"
          name="brNum"
          value={form.brNum}
          onChange={handleChange}
        />
        <TextField
          label="대표명"
          name="bossName"
          value={form.bossName}
          onChange={handleChange}
        />
        <TextField
          label="대표 전화번호"
          name="bossPhone"
          value={form.bossPhone}
          onChange={handleChange}
        />
        <TextField
          label="주소"
          name="address"
          value={form.address}
          onChange={handleChange}
        />
        <TextField
          label="담당자명"
          name="representativeName"
          value={form.representativeName}
          onChange={handleChange}
        />
        <TextField
          label="담당자 연락처"
          name="representativePhone"
          value={form.representativePhone}
          onChange={handleChange}
        />
        <TextField
          label="담당자 이메일"
          name="representativeEmail"
          value={form.representativeEmail}
          onChange={handleChange}
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
