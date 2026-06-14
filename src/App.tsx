import { useState, useEffect, useMemo } from 'react';
import { HumanEntry, Rarity, HumanStats } from './types';
import { INITIAL_HUMAN_ENTRIES } from './data';
import { HumanCard, getIconComponent } from './components/HumanCard';
import { HumanDetail } from './components/HumanDetail';
import { HumanForm } from './components/HumanForm';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Plus,
  BookOpen,
  ArrowUpDown,
  Filter,
  Layers,
  Sparkles,
  BarChart2,
  Trash2,
  Info
} from 'lucide-react';

const STORAGE_KEY = 'human_human_encyclopedia_entries_v2';

const STATS_KO: Record<keyof HumanStats, string> = {
  sociability: '친화력',
  energy: '활동력',
  responsibility: '책임감',
  laughter: '웃음력',
  alcohol: '주량',
  silence: '침묵력',
  humor: '개그력',
  indifference: '무심력',
};

export default function App() {
  // Load initial state from localstorage or preset data
  const [entries, setEntries] = useState<HumanEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing local storage entries:', e);
      }
    }
    return INITIAL_HUMAN_ENTRIES;
  });

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState<'전체' | Rarity>('전체');
  const [selectedSort, setSelectedSort] = useState<string>('createdAt_desc'); // default to newest

  // Drawer / Modal triggers
  const [selectedEntry, setSelectedEntry] = useState<HumanEntry | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<HumanEntry | null>(null);

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  // Handle entry submission (Create & Update)
  const handleSaveEntry = (formData: Omit<HumanEntry, 'id' | 'createdAt'> & { id?: string }) => {
    if (formData.id) {
      // Update
      setEntries((prev) =>
        prev.map((item) =>
          item.id === formData.id
            ? {
                ...item,
                ...formData,
                imageUrl: formData.imageUrl || 'User',
              } as HumanEntry
            : item
        )
      );

      // If we are currently viewing this item, sync the detail view
      if (selectedEntry && selectedEntry.id === formData.id) {
        setSelectedEntry({
          ...selectedEntry,
          ...formData,
          imageUrl: formData.imageUrl || 'User'
        } as HumanEntry);
      }
    } else {
      // Create
      const newEntry: HumanEntry = {
        ...formData,
        id: `human-${Date.now()}`,
        imageUrl: formData.imageUrl || 'User',
        createdAt: new Date().toISOString(),
      };
      setEntries((prev) => [newEntry, ...prev]);
    }

    // Close forms
    setIsFormOpen(false);
    setEntryToEdit(null);
  };

  // Handle entry deletion
  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
    if (selectedEntry?.id === id) {
      setSelectedEntry(null);
    }
  };

  // Reset core collection to defaults
  const handleResetToDefaults = () => {
    if (confirm('모든 기록을 초기 기본 데이터로 원상 복구하시겠습니까? (커스텀 등록 기록은 지워집니다)')) {
      setEntries(INITIAL_HUMAN_ENTRIES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_HUMAN_ENTRIES));
    }
  };

  // Stat Aggregates for Collector Dashboard View
  const aggregates = useMemo(() => {
    if (entries.length === 0) return null;

    const count = entries.length;
    let averageStats = {
      sociability: 0,
      energy: 0,
      responsibility: 0,
      laughter: 0,
      alcohol: 0,
      silence: 0,
      humor: 0,
      indifference: 0,
    };

    entries.forEach((e) => {
      Object.keys(averageStats).forEach((key) => {
        const k = key as keyof HumanStats;
        averageStats[k] += e.stats[k] || 0;
      });
    });

    Object.keys(averageStats).forEach((key) => {
      const k = key as keyof HumanStats;
      averageStats[k] = Math.round(averageStats[k] / count);
    });

    // Find highest average stat across the entire collection group
    const sortedAverages = Object.entries(averageStats).sort((a, b) => b[1] - a[1]);
    const strongestGroupStat = sortedAverages[0];

    // Rarity count
    const rarityDistribution = entries.reduce((acc, current) => {
      acc[current.rarity] = (acc[current.rarity] || 0) + 1;
      return acc;
    }, {} as Record<Rarity, number>);

    return {
      count,
      averageStats,
      strongestGroupStat: strongestGroupStat ? { key: strongestGroupStat[0] as keyof HumanStats, value: strongestGroupStat[1] } : null,
      rarityDistribution,
    };
  }, [entries]);

  // Combined Search, Filter and Sorting computation
  const filteredAndSortedEntries = useMemo(() => {
    let result = [...entries];

    // Search query matching (Check Name, Nickname or Representative Trait)
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (normalizedQuery) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(normalizedQuery) ||
          item.nickname.toLowerCase().includes(normalizedQuery) ||
          item.representativeTrait.toLowerCase().includes(normalizedQuery)
      );
    }

    // Rarity filtering
    if (rarityFilter !== '전체') {
      result = result.filter((item) => item.rarity === rarityFilter);
    }

    // Sort options mapping
    result.sort((a, b) => {
      const [criterion, direction] = selectedSort.split('_');

      if (criterion === 'createdAt') {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return direction === 'desc' ? timeB - timeA : timeA - timeB;
      }

      if (criterion === 'name') {
        return direction === 'desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
      }

      // If sorting by keyof HumanStats
      const statKey = criterion as keyof HumanStats;
      if (a.stats[statKey] !== undefined) {
        return direction === 'desc'
          ? (b.stats[statKey] || 0) - (a.stats[statKey] || 0)
          : (a.stats[statKey] || 0) - (b.stats[statKey] || 0);
      }

      return 0;
    });

    return result;
  }, [entries, searchQuery, rarityFilter, selectedSort]);

  // Open creation panel
  const handleOpenCreateForm = () => {
    setEntryToEdit(null);
    setIsFormOpen(true);
  };

  // Open edit panel from details or list
  const handleOpenEditForm = (entry: HumanEntry) => {
    setEntryToEdit(entry);
    setSelectedEntry(null); // Close detail modal to swap views smoothly
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-zinc-800 font-sans antialiased relative selection:bg-indigo-500 selection:text-white">

      {/* Decorative top ambient bar */}
      <div className="h-2 bg-gradient-to-r from-teal-400 via-indigo-500 to-purple-600" />

      {/* Header Container */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-zinc-900 text-white rounded-2xl shadow-xl animate-float">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3.5xl font-black text-zinc-950 tracking-tight flex items-center gap-2">
                인간 도감
                <span className="text-xs font-black tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase">
                  Field Guide
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                주변 인물들의 8가지 특이 능력치와 버릇을 기록, 분류, 보관하는 비밀 연구소입니다.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenCreateForm}
              id="header-register-btn"
              className="flex items-center gap-1.5 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-indigo-100 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer text-sm"
            >
              <Plus className="w-4 h-4" />
              새로운 인간 분석 등록
            </button>
            <button
              onClick={handleResetToDefaults}
              className="flex items-center gap-1.5 px-4 py-3 bg-white hover:bg-zinc-50 text-zinc-500 hover:text-zinc-700 border border-zinc-200 rounded-2xl transition cursor-pointer text-xs font-semibold"
              title="기본 샘플 데이터로 복원하기"
            >
              초기화
            </button>
          </div>
        </div>
      </header>

      {/* Core Body Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Aggregate Mini-Dashboard Column */}
        {aggregates && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/70 backdrop-blur-xs p-5 rounded-3xl border border-zinc-200/50 shadow-xs">
            <div className="flex items-center gap-3.5 p-1">
              <div className="p-3.5 bg-zinc-100 rounded-2xl text-zinc-600">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-medium">총 관측 도감 수</p>
                <p className="text-xl font-extrabold text-zinc-950">{aggregates.count} <span className="text-xs text-zinc-400 font-normal">명</span></p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-1">
              <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-medium">집단 최고 발달 수치</p>
                <p className="text-xl font-extrabold text-indigo-950">
                  {aggregates.strongestGroupStat ? `${STATS_KO[aggregates.strongestGroupStat.key]} (${aggregates.strongestGroupStat.value}%)` : '기록 없음'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-1">
              <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-medium">전설/영웅 등급 개체 수</p>
                <p className="text-xl font-extrabold text-amber-950">
                  {((aggregates.rarityDistribution['전설'] || 0) + (aggregates.rarityDistribution['영웅'] || 0))} <span className="text-xs text-zinc-400 font-normal">명</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-[11px] text-zinc-400 leading-normal">
              <div className="text-zinc-600">
                <Info className="w-4 h-4 shrink-0" />
              </div>
              <span>희귀도 등급에 따라 수치 가이드라인 및 테마 색상이 자동으로 동기화 매칭됩니다.</span>
            </div>
          </div>
        )}

        {/* Searching & Filter Control Panel */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/50 shadow-xs flex flex-col md:flex-row gap-4 items-center">
          {/* Search bar */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="관측자 이름, 별명 또는 대표 특성 검색..."
              className="w-full pl-11 pr-4 py-3 bg-[#fbfbfa] border border-zinc-200 focus:border-zinc-300 focus:outline-indigo-500 rounded-2xl text-sm transition"
            />
          </div>

          {/* Filtering buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <div className="text-xs font-extrabold text-zinc-400 mr-1 flex items-center gap-1 uppercase shrink-0">
              <Filter className="w-3.5 h-3.5" />
              등급
            </div>
            {(['전체', '일반', '고급', '희귀', '영웅', '전설'] as const).map((rarity) => (
              <button
                key={rarity}
                onClick={() => setRarityFilter(rarity)}
                className={`px-3 py-2 text-xs font-bold rounded-xl transition shrink-0 cursor-pointer ${
                  rarityFilter === rarity
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200/70 hover:text-zinc-700'
                }`}
              >
                {rarity}
              </button>
            ))}
          </div>

          {/* Sorting selection dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-zinc-100 pt-3 md:pt-0 md:pl-4">
            <div className="text-xs font-extrabold text-zinc-400 flex items-center gap-1 uppercase">
              <ArrowUpDown className="w-3.5 h-3.5" />
              정렬
            </div>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="px-3 py-2 bg-zinc-100 text-zinc-600 border-none rounded-xl text-xs font-bold focus:outline-zinc-300 cursor-pointer"
            >
              <option value="createdAt_desc">최근 등록순</option>
              <option value="createdAt_asc">과거 등록순</option>
              <option value="name_asc">이름순 (가나다)</option>
              <option value="sociability_desc">친화력 높은순</option>
              <option value="energy_desc">활동력 높은순</option>
              <option value="responsibility_desc">책임감 높은순</option>
              <option value="silence_desc">침묵력 높은순</option>
              <option value="alcohol_desc">주량 높은순</option>
              <option value="humor_desc">개그력 높은순</option>
            </select>
          </div>
        </div>

        {/* Main Grid display of cards */}
        <div id="human-guide-grid">
          {filteredAndSortedEntries.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              <AnimatePresence mode="popLayout">
                {filteredAndSortedEntries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    layoutId={`card-container-${entry.id}`}
                    initial={{ opacity: 0, scale: 0.93 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.93 }}
                    transition={{ duration: 0.25 }}
                  >
                    <HumanCard
                      entry={entry}
                      onClick={() => setSelectedEntry(entry)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-3xl border border-zinc-200/50 shadow-xs text-center max-w-xl mx-auto">
              <div className="p-4 bg-zinc-50 rounded-full text-zinc-300 mb-4">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-base font-bold text-zinc-900">관측 결과 없음</h3>
              <p className="text-xs text-zinc-400 mt-2 max-w-sm leading-normal">
                선택한 필터 조건에 부합하는 도감 기록이 발견되지 않았습니다. 다른 검색어를 입력하거나 새로운 인물을 등록해보세요!
              </p>
              {searchQuery || rarityFilter !== '전체' ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setRarityFilter('전체');
                  }}
                  className="mt-4 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition"
                >
                  필터 초기화
                </button>
              ) : null}
            </div>
          )}
        </div>
      </main>

      {/* Decorative footer credits */}
      <footer className="py-12 text-center text-xs text-zinc-400 max-w-7xl mx-auto border-t border-zinc-200/40 mt-12 px-4">
        <p className="font-extrabold uppercase tracking-wider text-[10px] text-zinc-300 mb-1">인간 관측 연구소 사설 도감</p>
        <p>© 2026 Human Field Guide. 모든 개인의 개성 수치를 존중합니다.</p>
      </footer>

      {/* Slider Drawer Form for Registering/Editing (Swings in from the right) */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Dark background backing overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsFormOpen(false);
                setEntryToEdit(null);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Sliding sheet element */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-xl bg-white h-full shadow-2xl z-10"
            >
              <HumanForm
                entryToEdit={entryToEdit}
                onSave={handleSaveEntry}
                onClose={() => {
                  setIsFormOpen(false);
                  setEntryToEdit(null);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Detail Viewer Modal overlay */}
      <HumanDetail
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onEdit={(entry) => handleOpenEditForm(entry)}
        onDelete={(id) => handleDeleteEntry(id)}
      />
    </div>
  );
}
