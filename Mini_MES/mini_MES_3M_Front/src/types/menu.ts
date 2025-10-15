// 3 Depth (가장 작은 단위 - 페이지 경로를 가짐)
export type MenuItem3Depth = {
  name: string;
  path: string;
};

// 2 Depth (중간 항목 - 3 Depth 항목들을 포함하거나, path를 가질 수 있음)
// 'items'가 있을 경우 아코디언으로 작동하고, 'path'가 있을 경우 바로 이동
export type MenuItem2Depth = {
  name?: string; // 아코디언 헤더 이름
  path?: string; // 바로 이동할 경로
  items?: MenuItem3Depth[];
};

// 1 Depth (가장 큰 항목 - 2 Depth 항목들을 포함)
export type MenuItem1Depth = {
  title: string;
  items: MenuItem2Depth[];
};