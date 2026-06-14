import React from 'react';
import { HumanEntry, Rarity } from '../types';
import { RadarChart } from './RadarChart';
import { RARITY_THEMES, getIconComponent } from './HumanCard';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, AlertTriangle, Award, FileText, Compass, Trash2, Edit } from 'lucide-react';

interface HumanDetailProps {
  entry: HumanEntry | null;
  onClose: () => void;
  onEdit: (entry: HumanEntry) => void;
  onDelete: (id: string) => void;
}

const STAT_LABELS_KO: Record<string, string> = {
  sociability: '친화력 (Sociability)',
  energy: '활동력 (Energy)',
  responsibility: '책임감 (Responsibility)',
  laughter: '웃음력 (Laughter)',
  alcohol: '주량 (Alcohol)',
  silence: '침묵력 (Silence)',
  humor: '개그력 (Humor)',
  indifference: '무심력 (Indifference)',
};

export const HumanDetail: React.FC<HumanDetailProps> = ({ entry, onClose, onEdit, onDelete }) => {
  if (!entry) return null;

  const theme = RARITY_THEMES[entry.rarity];
  const MainIcon = getIconComponent(entry.imageUrl || 'User');

  const handleDeleteClick = () => {
    if (confirm(`정말로 ${entry.name} 님의 기록을 도감에서 삭제하시겠습니까?`)) {
      onDelete(entry.id);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 cursor-zoom-out"
        />

        {/* Modal content sheet */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-[#fafafa] rounded-3xl overflow-hidden shadow-2xl border border-zinc-200/60 z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header section with theme colors */}
          <div className={`relative px-6 py-6 md:px-8 md:py-8 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br ${theme.bgGrad}`}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full hover:bg-zinc-200/50 text-zinc-400 hover:text-zinc-700 transition"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-2xl bg-white border border-zinc-200 text-zinc-800 shadow-sm ${entry.rarity === '전설' ? 'ring-2 ring-amber-300' : ''}`}>
                {MainIcon}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-black text-zinc-900 tracking-tight">{entry.name}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wider uppercase ${theme.badge}`}>
                    {entry.rarity} 등급
                  </span>
                </div>
                <p className="text-base font-bold text-zinc-500 mt-1 italic">
                  &ldquo;{entry.nickname}&rdquo;
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-xs text-zinc-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>도감 최초 등록일: {new Date(entry.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 self-start md:self-center mt-2 md:mt-0 mr-8">
              <button
                id="edit-entry-btn"
                onClick={() => onEdit(entry)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-zinc-200 hover:border-indigo-200 rounded-xl transition"
              >
                <Edit className="w-3.5 h-3.5" />
                정보 수정
              </button>
              <button
                id="delete-entry-btn"
                onClick={handleDeleteClick}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-400 hover:text-rose-600 bg-white hover:bg-rose-50 border border-zinc-200/60 hover:border-rose-200 rounded-xl transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                기록 파기
              </button>
            </div>
          </div>

          {/* Body Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-8 lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Visual Spider Radar column: spans 5 cols */}
            <div className="lg:col-span-5 flex flex-col items-center gap-4 mb-8 lg:mb-0">
              <h3 className="text-sm font-bold text-zinc-400 self-start tracking-wider uppercase mb-1">
                전투/생활 능력치 그래프
              </h3>
              <RadarChart stats={entry.stats} color={theme.accentColor} size={280} />

              {/* Individual Numerical Levels */}
              <div className="w-full bg-white rounded-2xl border border-zinc-100 p-4 mt-2">
                <h4 className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-wider">세부 능력 기록</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(entry.stats).map(([key, val]) => (
                    <div key={key} className="flex flex-col">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-zinc-500">{STAT_LABELS_KO[key]?.split(' ')[0]}</span>
                        <span className="font-mono font-bold text-zinc-700">{val}</span>
                      </div>
                      <div className="w-full h-1 bg-zinc-50 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${val}%`,
                            backgroundColor: theme.accentColor,
                            opacity: 0.75
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Structured Text details column: spans 7 cols */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Representative trait */}
              <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-2 text-zinc-700">
                  <Compass className="w-4 h-4 text-indigo-500" />
                  <h4 className="text-sm font-bold">대표 특성</h4>
                </div>
                <div className="inline-block px-3 py-1 bg-indigo-50/80 border border-indigo-100 rounded-lg text-indigo-700 font-bold text-sm">
                  {entry.representativeTrait}
                </div>
              </div>

              {/* Observations */}
              <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3 text-zinc-700">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <h4 className="text-sm font-bold">관찰 기록</h4>
                </div>
                <div className="text-zinc-600 text-sm leading-relaxed whitespace-pre-line bg-zinc-50/50 p-3.5 rounded-xl border border-zinc-100 min-h-[5.5rem]">
                  {entry.observation}
                </div>
              </div>

              {/* Additional facts grid: Warnings and Achievements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Warnings / Precautions */}
                <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-xs">
                  <div className="flex items-center gap-2 mb-2.5 text-zinc-700">
                    <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
                    <h4 className="text-sm font-bold text-zinc-800">주의사항</h4>
                  </div>
                  <p className="text-zinc-600 text-xs leading-relaxed bg-amber-50/30 border border-amber-100/40 p-3 rounded-lg min-h-[3rem]">
                    {entry.precaution || '기록된 주의사항이 없습니다.'}
                  </p>
                </div>

                {/* Achievements */}
                <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-xs">
                  <div className="flex items-center gap-2 mb-2.5 text-zinc-700">
                    <Award className="w-4.5 h-4.5 text-emerald-500" />
                    <h4 className="text-sm font-bold text-zinc-800">업적</h4>
                  </div>
                  <p className="text-zinc-600 text-xs leading-relaxed bg-emerald-50/30 border border-emerald-100/40 p-3 rounded-lg min-h-[3rem]">
                    {entry.achievement || '기록된 업적이 없습니다.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
