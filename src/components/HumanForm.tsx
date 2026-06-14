import React, { useState, useEffect } from 'react';
import { HumanEntry, HumanStats, Rarity } from '../types';
import { getIconComponent } from './HumanCard';
import { X, Save, AlertCircle, Sparkles, Wand2 } from 'lucide-react';

interface HumanFormProps {
  entryToEdit: HumanEntry | null;
  onSave: (entry: Omit<HumanEntry, 'id' | 'createdAt'> & { id?: string }) => void;
  onClose: () => void;
}

const RARITIES: Rarity[] = ['일반', '고급', '희귀', '영웅', '전설'];

const ICON_PRESETS = [
  { name: 'Flame', label: '열정파/화끈형' },
  { name: 'Shield', label: '수호자/책임감' },
  { name: 'Sparkles', label: '인싸/개그형' },
  { name: 'Beer', label: '애주가/주당' },
  { name: 'Moon', label: '과묵함/수도승' },
  { name: 'Coffee', label: '워커홀릭/카페인' },
  { name: 'Zap', label: '에너자이저' },
  { name: 'Compass', label: '개척자/자유형' },
  { name: 'Heart', label: '공감형/천사' },
  { name: 'Smile', label: '해맑음/단순함' },
  { name: 'Cloud', label: '무심함/인디고' },
  { name: 'Crown', label: '리더/존재감' },
];

const STAT_INFO = [
  { key: 'sociability' as keyof HumanStats, label: '친화력', desc: '처음 보는 사람과의 친해지는 속도' },
  { key: 'energy' as keyof HumanStats, label: '활동력', desc: '지치지 않고 대외 활동을 이어가는 체력' },
  { key: 'responsibility' as keyof HumanStats, label: '책임감', desc: '맡은 바 책임을 성실하고 우직하게 수행' },
  { key: 'laughter' as keyof HumanStats, label: '웃음력', desc: '조그만 재미에도 박장대소하는 리액션' },
  { key: 'alcohol' as keyof HumanStats, label: '주량', desc: '술자리 생존율과 절대 섭취 수치' },
  { key: 'silence' as keyof HumanStats, label: '침묵력', desc: '말수가 적고 차분하게 주변을 관망하는 능력' },
  { key: 'humor' as keyof HumanStats, label: '개그력', desc: '적재적소에 배꼽 빠지는 오리지널 개그 투척력' },
  { key: 'indifference' as keyof HumanStats, label: '무심력', desc: '세상만사 주변 상황에 휘둘리지 않는 멘탈' },
];

export const HumanForm: React.FC<HumanFormProps> = ({ entryToEdit, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [rarity, setRarity] = useState<Rarity>('일반');
  const [representativeTrait, setRepresentativeTrait] = useState('');
  const [observation, setObservation] = useState('');
  const [precaution, setPrecaution] = useState('');
  const [achievement, setAchievement] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('User');

  // Stats
  const [stats, setStats] = useState<HumanStats>({
    sociability: 50,
    energy: 50,
    responsibility: 50,
    laughter: 50,
    alcohol: 50,
    silence: 50,
    humor: 50,
    indifference: 50,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Bind values on edit module
  useEffect(() => {
    if (entryToEdit) {
      setName(entryToEdit.name);
      setNickname(entryToEdit.nickname);
      setRarity(entryToEdit.rarity);
      setRepresentativeTrait(entryToEdit.representativeTrait);
      setObservation(entryToEdit.observation);
      setPrecaution(entryToEdit.precaution || '');
      setAchievement(entryToEdit.achievement || '');
      setSelectedIcon(entryToEdit.imageUrl || 'User');
      setStats({ ...entryToEdit.stats });
    } else {
      // Set defaults for new entry
      setName('');
      setNickname('');
      setRarity('일반');
      setRepresentativeTrait('');
      setObservation('');
      setPrecaution('');
      setAchievement('');
      setSelectedIcon('Heart');
      setStats({
        sociability: 50,
        energy: 50,
        responsibility: 50,
        laughter: 50,
        alcohol: 20,
        silence: 30,
        humor: 40,
        indifference: 30,
      });
    }
    setErrors({});
  }, [entryToEdit]);

  const handleStatChange = (key: keyof HumanStats, val: number) => {
    setStats((prev) => ({ ...prev, [key]: val }));
  };

  // Helper validation and submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = '이름은 필수 항목입니다.';
    if (!nickname.trim()) newErrors.nickname = '별명은 필수 항목입니다.';
    if (!representativeTrait.trim()) newErrors.representativeTrait = '대표 특성은 필수 항목입니다.';

    // Observation constraint recommendation
    const lines = observation.split('\n').filter((l) => l.trim().length > 0);
    if (!observation.trim()) {
      newErrors.observation = '관찰 기록을 입력해주세요.';
    } else if (lines.length < 3 || lines.length > 5) {
      newErrors.observation = '관찰 기록은 가독성을 위해 약 3~5줄 작성을 권장합니다. (현재 ' + lines.length + '줄)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll form to top / error location if possible
      document.getElementById('form-scroll-top')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    onSave({
      id: entryToEdit?.id,
      name,
      nickname,
      rarity,
      representativeTrait,
      observation,
      precaution,
      achievement,
      imageUrl: selectedIcon,
      stats,
    });
  };

  // Fun helper to recommend a title based on highest stats
  const autoRecommendNickname = () => {
    const sorted = Object.entries(stats).sort((a, b) => (b[1] as number) - (a[1] as number));
    const topStat = sorted[0][0];
    const topVal = sorted[0][1] as number;

    let recommended = '';
    if (topVal < 60) {
      recommended = '평온한 올라운더';
    } else {
      switch (topStat) {
        case 'sociability':
          recommended = '홍대 사거리 마당발';
          break;
        case 'energy':
          recommended = '에너자이저 비타민';
          break;
        case 'responsibility':
          recommended = '우직한 고인돌 대장';
          break;
        case 'laughter':
          recommended = '리액션 공장장';
          break;
        case 'alcohol':
          recommended = '간 세포 복제술사';
          break;
        case 'silence':
          recommended = '침묵의 수도승';
          break;
        case 'humor':
          recommended = '드립계의 아인슈타인';
          break;
        case 'indifference':
          recommended = '강철 멘탈 가이';
          break;
        default:
          recommended = '미스터리 도감인';
      }
    }
    setNickname(recommended);
  };

  return (
    <div className="flex flex-col h-full bg-[#fbfbfa]" id="form-scroll-top">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200/60 bg-white shadow-xs">
        <div>
          <h2 className="text-lg font-black text-zinc-950 flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            {entryToEdit ? '인간 도감 정보 수정' : '새로운 인간 도감 추가'}
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            기록 대상의 특징과 개성 넘치는 수치들을 등록해보세요.
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Fields Flow */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Name and Nickname */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5">이름 <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 홍길동"
              className={`w-full px-4 py-2.5 bg-white border ${errors.name ? 'border-rose-400 focus:outline-rose-400' : 'border-zinc-200 focus:outline-indigo-500'} rounded-xl text-sm transition`}
            />
            {errors.name && (
              <span className="text-rose-500 text-[11px] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.name}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5 flex items-center justify-between">
              <span>별명 (Nickname) <span className="text-rose-500">*</span></span>
              <button
                type="button"
                onClick={autoRecommendNickname}
                className="text-[10px] text-indigo-500 font-bold hover:text-indigo-700 flex items-center gap-0.5 hover:underline"
                title="능력치 바탕으로 추천 별명을 제안합니다"
              >
                <Wand2 className="w-3 h-3" />
                별명 자동추천
              </button>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: 밤새 구워 먹는 불나방"
              className={`w-full px-4 py-2.5 bg-white border ${errors.nickname ? 'border-rose-400 focus:outline-rose-400' : 'border-zinc-200 focus:outline-indigo-500'} rounded-xl text-sm transition`}
            />
            {errors.nickname && (
              <span className="text-rose-500 text-[11px] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.nickname}
              </span>
            )}
          </div>
        </div>

        {/* Rarity select */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-2">희귀도 등급</label>
          <div className="grid grid-cols-5 gap-2">
            {RARITIES.map((r) => {
              const isActive = rarity === r;
              let btnClass = 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600';
              if (isActive) {
                if (r === '일반') btnClass = 'bg-zinc-800 text-white border-zinc-800 shadow-xs';
                if (r === '고급') btnClass = 'bg-emerald-600 text-white border-emerald-600 shadow-xs';
                if (r === '희귀') btnClass = 'bg-blue-600 text-white border-blue-600 shadow-xs';
                if (r === '영웅') btnClass = 'bg-purple-600 text-white border-purple-600 shadow-xs';
                if (r === '전설') btnClass = 'bg-amber-500 text-white border-amber-500 shadow-xs animate-shake';
              }

              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRarity(r)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition cursor-pointer ${btnClass}`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        {/* Icon Picker preset */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-2">대표 아이콘</label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 bg-white p-3 rounded-2xl border border-zinc-200/60 max-h-[148px] overflow-y-auto">
            {ICON_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setSelectedIcon(preset.name)}
                title={preset.label}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition cursor-pointer ${
                  selectedIcon === preset.name
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-600 font-bold'
                    : 'border-zinc-100 hover:border-zinc-200 text-zinc-500'
                }`}
              >
                {getIconComponent(preset.name)}
                <span className="text-[9px] mt-1 truncate max-w-full text-center scale-90">{preset.label.split('/')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Slider Section */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/60 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
            <h4 className="text-xs font-extrabold text-zinc-800 tracking-wider uppercase">핵심 능력치 (0 ~ 100)</h4>
            <span className="text-[10px] text-zinc-400">레이더 차트에 실시간 반영됩니다</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {STAT_INFO.map((info) => (
              <div key={info.key} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-zinc-700">
                  <span title={info.desc}>{info.label}</span>
                  <span className="font-mono text-indigo-600">{stats[info.key]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={stats[info.key]}
                  onChange={(e) => handleStatChange(info.key, parseInt(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-[9px] text-zinc-400">{info.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Representative Trait */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1.5">대표 특성 <span className="text-rose-500">*</span></label>
          <input
            type="text"
            value={representativeTrait}
            onChange={(e) => setRepresentativeTrait(e.target.value)}
            placeholder="예: 벼락치기 연금술사 / 침대 침대 침대 / 리액션 기관차"
            className={`w-full px-4 py-2.5 bg-white border ${errors.representativeTrait ? 'border-rose-400 focus:outline-rose-400' : 'border-zinc-200 focus:outline-indigo-500'} rounded-xl text-sm transition`}
          />
          <p className="text-[10px] text-zinc-400 mt-1">이 사람을 구별할 수 있는 한 단어 / 문구를 적어주세요.</p>
          {errors.representativeTrait && (
            <span className="text-rose-500 text-[11px] mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.representativeTrait}
            </span>
          )}
        </div>

        {/* Observation text (3 to 5 lines) */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1.5 flex justify-between items-center">
            <span>관찰 기록 <span className="text-rose-500">*</span></span>
            <span className="text-[10px] font-mono text-zinc-400">3~5줄 작성 권장</span>
          </label>
          <textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            rows={4}
            placeholder={`1. 밤새 게임을 하지만 수업 시간에는 절대 졸지 않는 기묘한 에너지를 지님.&#13;2. 소수 고도 집중형 인싸로 가만히 있어도 곁에 사람들이 모여듬.&#13;3. 피곤할 때는 혼잣말로 알 수 없는 암호를 중얼거리는 특성이 관찰됨.`}
            className={`w-full px-4 py-3 bg-white border ${errors.observation ? 'border-rose-400 focus:outline-rose-400' : 'border-zinc-200 focus:outline-indigo-500'} rounded-xl text-sm transition font-sans whitespace-pre-wrap leading-relaxed`}
          />
          {errors.observation && (
            <span className="text-rose-500 text-[11px] mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.observation}
            </span>
          )}
        </div>

        {/* Additional information: warning & achievement */}
        <div className="space-y-4">
          <div className="border-t border-zinc-100 pt-4">
            <h4 className="text-xs font-bold text-zinc-500 tracking-wider uppercase mb-3">추가 관측 정보</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5">주의사항 (Warnings)</label>
              <textarea
                value={precaution}
                onChange={(e) => setPrecaution(e.target.value)}
                rows={2}
                placeholder="예: 배고플 때 건드리면 개그력이 -100이 되며 무서워집니다."
                className="w-full px-4 py-2.5 bg-white border border-zinc-200 focus:outline-indigo-500 rounded-xl text-xs transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5">업적 (Achievements)</label>
              <textarea
                value={achievement}
                onChange={(e) => setAchievement(e.target.value)}
                rows={2}
                placeholder="예: 3일간 커피로 연명하며 성실하게 완벽 제출을 마침."
                className="w-full px-4 py-2.5 bg-white border border-zinc-200 focus:outline-indigo-500 rounded-xl text-xs transition"
              />
            </div>
          </div>
        </div>

        {/* Sticky footer action bar */}
        <div className="pt-4 border-t border-zinc-200 flex gap-2">
          <button
            type="submit"
            id="save-form-btn"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-xs hover:shadow-md transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {entryToEdit ? '기록 변경 완료' : '새로운 도감 등록'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-sm font-bold transition cursor-pointer"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};
