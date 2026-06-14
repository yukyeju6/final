import React from 'react';
import { HumanEntry, Rarity } from '../types';
import * as Icons from 'lucide-react';

interface HumanCardProps {
  entry: HumanEntry;
  onClick: () => void;
}

// Maps rarity to custom styling classes
export const RARITY_THEMES: Record<Rarity, {
  border: string;
  badge: string;
  glow: string;
  text: string;
  bgGrad: string;
  accentColor: string;
}> = {
  일반: {
    border: 'border-zinc-200 hover:border-zinc-300',
    badge: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    glow: 'hover:shadow-zinc-100',
    text: 'text-zinc-600',
    bgGrad: 'from-zinc-50 to-zinc-100/50',
    accentColor: '#71717a',
  },
  고급: {
    border: 'border-emerald-100 hover:border-emerald-200',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    glow: 'hover:shadow-emerald-100',
    text: 'text-emerald-700',
    bgGrad: 'from-emerald-50/50 to-emerald-100/10',
    accentColor: '#10b981',
  },
  희귀: {
    border: 'border-sky-100 hover:border-sky-200',
    badge: 'bg-sky-50 text-sky-700 border-sky-100',
    glow: 'hover:shadow-sky-100',
    text: 'text-sky-700',
    bgGrad: 'from-sky-50/50 to-sky-100/10',
    accentColor: '#0ea5e9',
  },
  영웅: {
    border: 'border-purple-200/80 hover:border-purple-300',
    badge: 'bg-purple-50 text-purple-700 border-purple-200/60',
    glow: 'hover:shadow-purple-100/80',
    text: 'text-purple-700',
    bgGrad: 'from-purple-50/40 to-purple-100/10',
    accentColor: '#a855f7',
  },
  전설: {
    border: 'border-amber-300 hover:border-amber-400 bg-amber-50/10',
    badge: 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse',
    glow: 'hover:shadow-amber-200/80 shadow-md',
    text: 'text-amber-700',
    bgGrad: 'from-amber-50/40 to-amber-100/20',
    accentColor: '#f59e0b',
  },
};

// Dynamic helper to construct icon components safely
export const getIconComponent = (iconName: string) => {
  const IconNode = (Icons as any)[iconName] || Icons.User;
  return <IconNode className="w-5 h-5" />;
};

export const HumanCard: React.FC<HumanCardProps> = ({ entry, onClick }) => {
  const theme = RARITY_THEMES[entry.rarity];
  const MainIcon = getIconComponent(entry.imageUrl || 'User');

  // Shorten preview text to fit within card
  const cleanLine = entry.observation.split('\n')[0] || '';
  const observationPreview = cleanLine.length > 36 ? `${cleanLine.slice(0, 36)}...` : cleanLine;

  return (
    <button
      id={`human-card-${entry.id}`}
      onClick={onClick}
      className={`relative flex flex-col w-full text-left bg-white rounded-2xl border ${theme.border} p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer ${theme.glow} overflow-hidden group`}
    >
      {/* Dynamic top corner gradient stripe */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${entry.rarity === '전설' ? 'from-amber-400 via-yellow-300 to-amber-500' : entry.rarity === '영웅' ? 'from-purple-500 to-indigo-500' : 'from-transparent to-transparent'}`} />

      {/* Rarity & Icon Badge Row */}
      <div className="flex items-center justify-between mb-4 mt-1 w-full">
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wider uppercase ${theme.badge}`}>
          {entry.rarity}
        </span>
        <div className={`p-2 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-600 transition-colors group-hover:bg-white group-hover:border-zinc-200`}>
          {MainIcon}
        </div>
      </div>

      {/* Profile Name & Nickname Block */}
      <div className="mb-3">
        <div className="flex items-baseline gap-1.5">
          <h3 className="text-lg font-bold text-zinc-900 tracking-tight group-hover:text-zinc-950 transition-colors">
            {entry.name}
          </h3>
          <span className="text-xs text-zinc-400 font-medium">#{entry.representativeTrait}</span>
        </div>
        <p className="text-sm font-semibold text-zinc-500 mt-0.5 italic">
          &ldquo;{entry.nickname}&rdquo;
        </p>
      </div>

      {/* Observation Snippet */}
      <div className="mb-4 text-xs text-zinc-500 leading-relaxed min-h-[32px]">
        {observationPreview || "아직 첫 관찰 기록이 등록되지 않았습니다."}
      </div>

      {/* Rarity/Stat Min-indicator bar (shows highest capability stat inside card) */}
      <div className="mt-auto pt-3 border-t border-zinc-100/80 w-full">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-zinc-400">주특성 레벨</span>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="font-bold text-zinc-700">
              LV.{Math.max(
                entry.stats.sociability,
                entry.stats.energy,
                entry.stats.responsibility,
                entry.stats.laughter,
                entry.stats.alcohol,
                entry.stats.silence,
                entry.stats.humor,
                entry.stats.indifference
              )}
            </span>
            <div className="w-12 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(
                    entry.stats.sociability,
                    entry.stats.energy,
                    entry.stats.responsibility,
                    entry.stats.laughter,
                    entry.stats.alcohol,
                    entry.stats.silence,
                    entry.stats.humor,
                    entry.stats.indifference
                  )}%`,
                  backgroundColor: theme.accentColor
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};
