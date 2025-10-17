export const menuItems = [
  {
    title: "수주품목", // 1 depth
    items: [
      {
        name: "수주품목 입고", // 2 depth (중간 항목)
        items: [
          { name: "수주품목 입고 등록", path: "/order/inbound/register" }, // 3 depth (소항목)
          { name: "수주품목 입고 이력조회", path: "/order/history/inbound" },
        ],
      },
      {
        name: "공정진행현황",
        path: "/ProcessRegitster/Lotid",
      },
      {
        name: "수주품목 출고", // 2 depth
        items: [
          { name: "수주품목 출고 등록", path: "/order/outbound/register" },
          { name: "수주품목 출고 이력조회", path: "/order/history/outbound" },
        ],
      },
      {
        name: "품목관리", // 2 depth
        items: [
          { name: "수주품목 등록", path: "/sales/item/register" },
          { name: "수주품목 조회", path: "/sales/item/history" },
        ],
      },
    ],
  },
  {
    title: "원자재품목", // 1 depth
    items: [
      {
        name: "원자재품목 입고", // 2 depth
        items: [
          { name: "원자재품목 입고 등록", path: "/raw/inbound/register" },
          { name: "원자재품목 입고 이력조회", path: "/raw/history/inbound" },
        ],
      },
      {
        name: "원자재품목 출고",
        items: [
          { name: "원자재품목 출고 등록", path: "/raw/outbound/register" },
          { name: "원자재품목 출고 이력조회", path: "/raw/history/outbound" },
        ],
      },
      {
        name: "재고현황",
        path: "/raw/stock/status",
      },
      {
        name: "품목관리", // 2 depth
        items: [
          { name: "원자재품목 등록", path: "/raw/item/reg" },
          { name: "원자재품목 조회", path: "/raw/item/list" },
        ],
      },
    ],
  },
  {
    title: "정보관리", // 1 depth
    items: [
      { name: "라우팅", path: "/info/routing" }, // 2 depth에서 바로 페이지 이동 (3 depth 없음)
      {
        name: "거래처",
        items: [
          { name: "거래처 등록", path: "/info/partners/reg" },
          { name: "거래처 관리", path: "/info/partners/list" },
        ],
      },
    ],
  },
];
