import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Film, Calendar, MapPin, FileText, Package, Check, Search, AlertCircle, Loader2, ExternalLink, Map as MapIcon } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { FormLayout, FormType } from '../organisms/FormLayout';
import { Text } from '../atoms/Text';
import { TimeSelector } from '../ui/TimeSelector';
import { CATEGORY_ICONS } from '../../constants';
import { Shot, Equipment } from '../../types';
import { timeToMinutes, calculateEndTime } from '../../utils';

interface ShotFormPageProps {
  onClose: () => void;
  onSwitchForm: (type: FormType) => void;
  onSubmit: (shot: Shot) => void;
  inventory: Equipment[];
  existingShots: Shot[];
}

const toISODate = (dateStr: string) => {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0];
};

const fromISODate = (isoStr: string) => {
  if (!isoStr) return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const ShotFormPage: React.FC<ShotFormPageProps> = ({
  onClose,
  onSwitchForm,
  onSubmit,
  inventory,
  existingShots
}) => {
  const [form, setForm] = useState({
    title: '',
    sceneNumber: '',
    location: '',
    date: toISODate(new Date().toLocaleDateString()),
    startTime: '08:00',
    endTime: '10:00',
    description: '',
    equipmentIds: [] as string[]
  });

  const [locationSuggestions, setLocationSuggestions] = useState<{ name: string, uri?: string }[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const locationSearchTimeout = useRef<any>(null);
  const [shotGearSearch, setShotGearSearch] = useState('');
  const [shotGearCategory, setShotGearCategory] = useState('All');

  // Shot conflict detection
  const shotConflict = useMemo(() => {
    if (!form.startTime || !form.endTime) return null;

    const startMins = timeToMinutes(form.startTime);
    let endMins = timeToMinutes(form.endTime);
    if (endMins < startMins) endMins += 1440;

    const formattedDate = fromISODate(form.date);

    return existingShots.find(s => {
      if (s.date !== formattedDate) return false;
      const sStart = timeToMinutes(s.startTime);
      const sEnd = timeToMinutes(calculateEndTime(s.startTime, s.duration));
      return (startMins < sEnd && endMins > sStart);
    });
  }, [form.startTime, form.endTime, form.date, existingShots]);

  // Location autocomplete
  const fetchLocationSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setLocationSuggestions([]);
      return;
    }
    setIsSearchingLocation(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `List only 4 real filming locations or addresses matching"${query}". DO NOT include any introductory or concluding sentences. Provide just the names, one per line.`,
        config: {
          tools: [{ googleMaps: {} }],
        }
      });

      const text = response.text || "";
      const lines = text.split('\n')
        .map(l => l.replace(/^\d+\.\s*/, '').trim())
        .filter(l => l.length > 2 && l.length < 60 && !l.toLowerCase().includes('here are') && !l.toLowerCase().includes('locations:'))
        .slice(0, 4);

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const suggestions = lines.map((name: string) => {
        const matchingChunk = chunks.find((c: any) => c.maps?.title?.toLowerCase().includes(name.toLowerCase()));
        return {
          name,
          uri: matchingChunk?.maps?.uri
        };
      });

      setLocationSuggestions(suggestions);
    } catch (err) {
      console.error("Location search failed", err);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm({ ...form, location: val });

    if (locationSearchTimeout.current) clearTimeout(locationSearchTimeout.current);
    locationSearchTimeout.current = setTimeout(() => {
      fetchLocationSuggestions(val);
    }, 500);
  };

  const selectLocation = (suggestion: { name: string, uri?: string }) => {
    setForm({ ...form, location: suggestion.name });
    setLocationSuggestions([]);
  };

  const toggleShotGear = (id: string) => {
    setForm(prev => {
      const exists = prev.equipmentIds.includes(id);
      return {
        ...prev,
        equipmentIds: exists
          ? prev.equipmentIds.filter(x => x !== id)
          : [...prev.equipmentIds, id]
      };
    });
  };

  const handleSubmit = () => {
    if (!form.title.trim() || shotConflict) return;

    const startMins = timeToMinutes(form.startTime);
    let endMins = timeToMinutes(form.endTime);
    if (endMins < startMins) endMins += 1440;
    const diffHours = (endMins - startMins) / 60;
    const duration = `${diffHours.toFixed(1).replace('.0', '')}h`;

    const newShot: Shot = {
      id: `shot-${Date.now()}`,
      title: form.title,
      sceneNumber: form.sceneNumber || `${existingShots.length + 1}X`,
      location: form.location || 'Location TBD',
      date: fromISODate(form.date),
      startTime: form.startTime,
      duration: duration,
      description: form.description,
      remarks: '',
      status: 'pending',
      equipmentIds: form.equipmentIds,
      preparedEquipmentIds: []
    };

    onSubmit(newShot);
    onClose();
  };

  const availableGear = inventory.filter(item => {
    const matchesSearch = (item.customName || item.name).toLowerCase().includes(shotGearSearch.toLowerCase());
    const matchesCat = shotGearCategory === 'All' || item.category === shotGearCategory;
    return matchesSearch && matchesCat;
  });

  const isValid = form.title.trim() && !shotConflict;

  return (
    <FormLayout
      title="New Scene"
      subtitle="Schedule a new shot"
      detailLabel="Create new"
      formType="shot"
      onBack={onClose}
      onSwitchForm={onSwitchForm}
      onSubmit={handleSubmit}
      submitDisabled={!isValid}
      submitLabel="Schedule Scene"
    >
      <div className="flex flex-col gap-8 mb-12 pb-10 border-b border-gray-100 dark:border-white/5">
        {/* Scene Identity */}
        <div className="w-full">
          <Text variant="subtitle" color="muted" className="dark:text-white mb-3 block text-center sm:text-left">Scene identity</Text>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3">
              <div className="flex flex-col gap-1 min-w-0">
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className={`w-full bg-transparent border-b py-2 text-gray-900 dark:text-white focus:outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 ${!form.title.trim() ? 'border-red-200 dark:border-red-500/30' : 'border-gray-200 dark:border-white/10 focus:border-[#3762E3] dark:focus:border-[#4E47DD]'}`}
                  placeholder="Scene title..."
                />
              </div>
            </div>
            <div>
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 bg-transparent border-b border-gray-200 dark:border-white/10 py-2">
                  <span className="px-2 py-0.5 bg-black/5 dark:bg-white/10 rounded-md text-[10px] font-semibold text-gray-500 dark:text-gray-400">SC</span>
                  <input
                    type="text"
                    value={form.sceneNumber}
                    onChange={e => setForm({ ...form, sceneNumber: e.target.value })}
                    className="flex-1 bg-transparent text-base font-semibold focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 min-w-0"
                    placeholder="4C"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="w-full">
          <Text variant="subtitle" color="muted" className="dark:text-white mb-3 block text-center sm:text-left">Schedule</Text>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <div className="flex flex-col gap-1 min-w-0">
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className={`w-full bg-transparent border-b py-2 text-gray-900 dark:text-white focus:outline-none transition-all cursor-pointer text-sm font-semibold ${shotConflict ? 'border-red-200 dark:border-red-500/30' : 'border-gray-200 dark:border-white/10 focus:border-[#3762E3] dark:focus:border-[#4E47DD]'}`}
                />
              </div>
            </div>
            <TimeSelector label="" value={form.startTime} onChange={(v) => setForm({ ...form, startTime: v })} />
            <TimeSelector label="" value={form.endTime} onChange={(v) => setForm({ ...form, endTime: v })} />
          </div>

          {shotConflict && (
            <div className="flex items-center gap-2 p-3 mt-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl">
              <AlertCircle className="text-red-500 dark:text-red-400 shrink-0" size={14} strokeWidth={3} />
              <p className="text-[10px] font-semibold text-red-600 dark:text-red-400 leading-tight">
                Conflict: This slot is already taken by "{shotConflict.title}"
              </p>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="w-full relative z-20">
          <Text variant="subtitle" color="muted" className="dark:text-white mb-3 block text-center sm:text-left">Location</Text>
          
          <div className="relative">
            <div className="flex flex-col gap-1 min-w-0">
              <input
                type="text"
                value={form.location}
                onChange={handleLocationInputChange}
                className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-[#3762E3] dark:focus:border-[#4E47DD] transition-all text-sm font-semibold placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Search filming location..."
              />
            </div>
            {isSearchingLocation && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 size={16} className="text-emerald-500 animate-spin" />
              </div>
            )}
          </div>

          {locationSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-white/5 flex items-center justify-between">
                <span className="text-[9px] font-semibold text-gray-400 dark:text-gray-500">Maps suggestions</span>
                <MapIcon size={12} className="text-emerald-400" />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {locationSuggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => selectLocation(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-white/5 flex items-center justify-between transition-colors border-b border-gray-50 dark:border-white/5 last:border-none group/loc"
                  >
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover/loc:text-blue-600 dark:group-hover/loc:text-indigo-400 transition-colors truncate pr-2">
                      {suggestion.name}
                    </span>
                    {suggestion.uri && <ExternalLink size={12} className="text-gray-300 dark:text-gray-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="w-full">
          <Text variant="subtitle" color="muted" className="dark:text-white mb-3 block text-center sm:text-left">Description</Text>
          
          <div className="flex flex-col gap-1 min-w-0">
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-[#3762E3] dark:focus:border-[#4E47DD] transition-all resize-none text-sm font-medium"
              rows={6}
              placeholder="Describe the action, atmosphere, and key visual elements..."
            />
          </div>
        </div>
      </div>

      {/* Equipment Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <Text variant="subtitle" color="muted" className="dark:text-white">Equipment</Text>
          <span className="bg-blue-50 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg text-[10px] font-semibold">
            {form.equipmentIds.length} Selected
          </span>
        </div>

        {/* Search & Filter */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={shotGearSearch}
              onChange={(e) => setShotGearSearch(e.target.value)}
              placeholder="Search inventory..."
              className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 pl-8 pr-4 py-2 text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#3762E3] dark:focus:border-[#4E47DD] transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {['All', 'Camera', 'Lens', 'Light', 'Filter', 'Support', 'Grip', 'Monitoring', 'Audio', 'Wireless', 'Drone', 'Props'].map(cat => (
              <button
                key={cat}
                onClick={() => setShotGearCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${shotGearCategory === cat
                  ? 'bg-blue-600 dark:bg-indigo-500 text-white'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Equipment List */}
        <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
          {availableGear.map(item => {
            const isSelected = form.equipmentIds.includes(item.id);
            const Icon = (CATEGORY_ICONS as any)[item.category] || Package;

            return (
              <button
                key={item.id}
                onClick={() => toggleShotGear(item.id)}
                className="w-full flex items-center justify-between py-4 text-left border-b border-gray-50 dark:border-white/[0.02] last:border-0"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected ? 'text-blue-600 dark:text-indigo-400' : 'text-gray-400'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-base font-semibold truncate ${
                      isSelected ? 'text-blue-900 dark:text-indigo-400' : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {item.customName || item.name}
                    </p>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{item.category}</p>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  isSelected
                    ? 'bg-blue-600 dark:bg-indigo-500 text-white shadow-lg shadow-blue-600/20 dark:shadow-indigo-500/20'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-300'
                }`}>
                  <Check size={18} strokeWidth={3} />
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </FormLayout>
  );
};
