export const menuItems = [
  {
    title: '수주품목', // 1 depth
    items: [
      { 
        name: '입고', // 2 depth (중간 항목)
        items: [
          { name: '등록', path: '/order/inbound/register' }, // 3 depth (소항목)
          { name: '이력조회', path: '/order/inbound/history' },
        ]
      },
      { 
        name: '출고', // 2 depth
        items: [
          { name: '등록', path: '/order/outbound/register' },
          { name: '이력조회', path: '/order/outbound/history' },
        ]
      },
      { 
        name: '품목관리', // 2 depth
        items: [
          { name: '등록', path: '/order/item/register' },
          { name: '조회', path: '/order/item/history' },
        ]
      },
    ],
  },
  {
    title: '원자재', // 1 depth
    items: [
      { 
        name: '입고', // 2 depth
        items: [
          { name: '입고 등록', path: '/material/inbound/register' },
          { name: '입고 이력조회', path: '/material/inbound/history' },


        ]
      },
      {
        name: '출고',
        items:[
            { name: '출고 등록', path: '/material/outbound/register' },
            { name: '출고 이력조회', path: '/material/outbound/history' },
        ]
      },
      { 
        name: '재고현황', path: '/material/stock/status' 
      },
      { 
        name: '품목관리', // 2 depth
        items: [
          { name: '등록', path: '/material/item/register' },
          { name: '조회', path: '/material/item/history' },
        ]
      },
    ],
  },
  {
    title: '정보관리', // 1 depth
    items: [
      { name: '라우팅', path: '/info/routing' }, // 2 depth에서 바로 페이지 이동 (3 depth 없음)
      { name: '거래처',
        items: [
            { name: '등록', path: '/info/customer/register' },
            { name: '관리', path: '/info/customer/management' },
        ] },
    ],
  },
];