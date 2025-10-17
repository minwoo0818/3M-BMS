import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Tabs,
  Tab,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Stack,
} from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
} from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";

interface PartnerData {
  id: number;
  partnerName: string;
  brNum: string;
  bossName: string;
  bossPhone: string;
  address: string;
  representativeName: string;
  representativePhone: string;
  representativeEmail: string;
  remark: string;
  type: "customer" | "supplier";
  active: boolean;
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
  {
    id: 3,
    partnerName: "고투하우스",
    brNum: "123-456789",
    bossName: "홍석민",
    bossPhone: "055-123-4567",
    address: "경남 창원시 창원대로123",
    representativeName: "영업부 부장 류민우",
    representativePhone: "010-1234-5678",
    representativeEmail: "jhpark@codehouse.com",
    remark: "주요 고객사",
    type: "customer",
    active: true,
  },
];

const PartnersList: React.FC = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState<PartnerData[]>(dummyData);
  const [tab, setTab] = useState<"customer" | "supplier">("customer");
  const [searchField, setSearchField] = useState<
    "total" | "partnerName" | "representativeName"
  >("total");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 5,
    page: 0,
  });

  const filteredPartners = partners.filter((p) => {
    if (p.type !== tab) return false;
    const keyword = searchKeyword.toLowerCase();
    if (!keyword) return true;
    if (searchField === "total")
      return (
        p.partnerName.toLowerCase().includes(keyword) ||
        p.representativeName.toLowerCase().includes(keyword)
      );
    return String(p[searchField]).toLowerCase().includes(keyword);
  });

  const togglePartnerStatus = (id: number) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "번호",
      width: 120,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "partnerName",
      headerName: "업체명",
      width: 200,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Button
          variant="text"
          sx={{
            width: "100%",
            textDecoration: "underline",
            fontSize: 20,
            color: "primary.main",
          }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/info/partners/${params.row.id}`);
          }}
        >
          {params.value}
        </Button>
      ),
    },
    {
      field: "brNum",
      headerName: "사업자등록번호",
      width: 250,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "address",
      headerName: "주소",
      width: 300,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "representativeName",
      headerName: "담당자",
      width: 200,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "representativePhone",
      headerName: "연락처",
      width: 250,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "active",
      headerName: "거래상태",
      width: 200,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Button
          variant={params.value ? "outlined" : "contained"}
          color={params.value ? "warning" : "success"}
          onClick={() => togglePartnerStatus(params.row.id)}
        >
          {params.value ? "거래종료" : "거래재개"}
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" mb={2}>
        거래처 목록
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel sx={{ fontSize: 20, top: -6 }}>검색필터</InputLabel>
          <Select
            value={searchField}
            label="검색필터"
            onChange={(e) =>
              setSearchField(e.target.value as typeof searchField)
            }
            size="small"
            sx={{
              height: 48,
              fontSize: 16,
              display: "flex",
              alignItems: "center",
            }}
          >
            <MenuItem value="total">전체</MenuItem>
            <MenuItem value="partnerName">업체명</MenuItem>
            <MenuItem value="representativeName">담당자명</MenuItem>
          </Select>
        </FormControl>

        <TextField
          placeholder="업체명 혹은 담당자로 검색해주세요."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          size="small"
          sx={{
            minWidth: 400,
            height: 48,
            "& .MuiInputBase-root": {
              height: "100%",
              fontSize: 20,
              display: "flex",
              alignItems: "center",
            },
            "& .MuiInputBase-input": {
              padding: "12px 14px",
            },
            "& .MuiInputLabel-root": {
              fontSize: 20,
              top: -6,
            },
          }}
        />

        <Button
          variant="contained"
          size="medium"
          sx={{
            height: 48,
            fontSize: 20,
            padding: "0 24px",
            lineHeight: 1.5,
          }}
        >
          검색
        </Button>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab
          label={<Typography fontSize={20}>수주품 거래처</Typography>}
          value="customer"
        />
        <Tab
          label={<Typography fontSize={20}>원자재 거래처</Typography>}
          value="supplier"
        />
      </Tabs>

      <DataGrid
        rows={filteredPartners}
        columns={columns}
        autoHeight
        rowHeight={48}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 20]}
        disableRowSelectionOnClick
        sx={{
          "& .MuiDataGrid-cell": {
            fontSize: 20,
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
          },
          "& .MuiDataGrid-columnHeader": {
            fontSize: 20,
            justifyContent: "center",
          },
          "& .MuiTablePagination-root": {
            fontSize: 20,
          },
          width: 1530,
        }}
      />
    </Box>
  );
};

export default PartnersList;
