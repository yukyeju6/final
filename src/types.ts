export type Rarity = '일반' | '고급' | '희귀' | '영웅' | '전설';

export interface HumanStats {
  sociability: number;     // 친화력
  energy: number;          // 활동력
  responsibility: number;  // 책임감
  laughter: number;        // 웃음력
  alcohol: number;         // 주량
  silence: number;         // 침묵력
  humor: number;           // 개그력
  indifference: number;    // 무심력
}

export interface HumanEntry {
  id: string;
  name: string;            // 이름
  nickname: string;        // 별명
  rarity: Rarity;          // 희귀도
  representativeTrait: string; // 대표 특성
  observation: string;     // 관찰 기록 (3-5줄)
  precaution: string;      // 주의사항
  achievement: string;     // 업적
  stats: HumanStats;       // 주요 능력치
  imageUrl?: string;       // 대표 이미지 (또는 아이콘)
  colorTheme?: string;     // 선택적 커스텀 색상 테마
  createdAt: string;       // 생성일
}
