import React from 'react';
import { HumanStats } from '../types';

interface RadarChartProps {
  stats: HumanStats;
  color?: string; // Hex or tailwind fill class
  size?: number;
}

const STAT_LABELS: Record<keyof HumanStats, string> = {
  sociability: '친화력',
  energy: '활동력',
  responsibility: '책임감',
  laughter: '웃음력',
  alcohol: '주량',
  silence: '침묵력',
  humor: '개그력',
  indifference: '무심력',
};

const STAT_ORDER: (keyof HumanStats)[] = [
  'sociability',
  'energy',
  'responsibility',
  'laughter',
  'alcohol',
  'silence',
  'humor',
  'indifference',
];

export const RadarChart: React.FC<RadarChartProps> = ({ stats, color = '#6366f1', size = 260 }) => {
  const center = size / 2;
  const maxRadius = (size / 2) * 0.72; // Leave margin for labels
  const numStats = STAT_ORDER.length;

  // Calculate coordinates for a stat index at a given value (0 to 100)
  const getCoordinates = (index: number, value: number) => {
    // Start from the top (angle -Math.PI / 2) and rotation clockwise
    const angle = (index * 2 * Math.PI) / numStats - Math.PI / 2;
    const r = (value / 100) * maxRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Concentric ring levels
  const levels = [20, 40, 60, 80, 100];

  // Polygon points for the actual stats
  const points = STAT_ORDER.map((key, index) => {
    const value = Math.max(10, Math.min(100, stats[key] || 0)); // Clamp between 10 & 100 for visual sanity
    const { x, y } = getCoordinates(index, value);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="flex flex-col items-center justify-center p-2 bg-white rounded-2xl border border-zinc-100 shadow-xs">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Concentric helper grids */}
        {levels.map((level, i) => {
          const ringPoints = STAT_ORDER.map((_, index) => {
            const { x, y } = getCoordinates(index, level);
            return `${x},${y}`;
          }).join(' ');
          return (
            <polygon
              key={level}
              points={ringPoints}
              fill="none"
              stroke={i === levels.length - 1 ? '#d4d4d8' : '#e4e4e7'}
              strokeWidth={i === levels.length - 1 ? 1.5 : 1}
              strokeDasharray={i !== levels.length - 1 ? '3 3' : undefined}
            />
          );
        })}

        {/* Grid level labels */}
        {levels.map((level) => {
          // Put the labels slightly offset to the left of the center line
          const { x, y } = getCoordinates(2, level); // 2 is責任感 (90 deg to the right)
          return (
            <text
              key={level}
              x={center}
              y={center - (level / 100) * maxRadius - 2}
              textAnchor="middle"
              className="fill-zinc-400 font-mono select-none"
              style={{ fontSize: '9px' }}
            >
              {level}
            </text>
          );
        })}

        {/* Axis lines */}
        {STAT_ORDER.map((_, index) => {
          const outerPoint = getCoordinates(index, 100);
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={outerPoint.x}
              y2={outerPoint.y}
              className="stroke-zinc-200"
              strokeWidth="1"
            />
          );
        })}

        {/* Stats filled area */}
        <polygon
          points={points}
          fill={color}
          fillOpacity={0.24}
          stroke={color}
          strokeWidth="2.5"
          className="transition-all duration-500 ease-out"
        />

        {/* Outer points indicator */}
        {STAT_ORDER.map((key, index) => {
          const value = stats[key] || 0;
          const { x, y } = getCoordinates(index, value);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="white"
              stroke={color}
              strokeWidth="2"
              className="transition-all duration-500 ease-out"
            />
          );
        })}

        {/* Text Labels */}
        {STAT_ORDER.map((key, index) => {
          // Move labels slightly outwards
          const { x, y } = getCoordinates(index, 118);
          // Set text-anchors depending on quadrant for perfect layout
          const angle = (index * 2 * Math.PI) / numStats - Math.PI / 2;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);

          let textAnchor = 'middle';
          let dy = '0.35em';

          if (Math.abs(cos) < 0.1) {
            textAnchor = 'middle';
            dy = sin < 0 ? '-0.3em' : '1em';
          } else if (cos > 0) {
            textAnchor = 'start';
          } else {
            textAnchor = 'end';
          }

          const value = stats[key] || 0;

          return (
            <g key={key} className="select-none text-xs">
              <text
                x={x}
                y={y}
                textAnchor={textAnchor}
                dy={dy}
                className="font-bold fill-zinc-700"
                style={{ fontSize: '11px' }}
              >
                {STAT_LABELS[key]}
              </text>
              <text
                x={x}
                y={y}
                textAnchor={textAnchor}
                dy={dy === '-0.3em' ? '-1.5em' : dy === '1em' ? '2.1em' : '1.3em'}
                className="font-mono fill-zinc-400 font-medium"
                style={{ fontSize: '9px', transform: 'translateY(1px)' }}
              >
                {value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
