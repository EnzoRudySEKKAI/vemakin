
import React, { useState, useMemo, useRef } from 'react';
import {
  X, Briefcase, Film, Package, Zap, StickyNote,
  ChevronLeft, PenLine, Scissors, Music, Layers, Palette, Hash,
  Save, Calendar, Search, Check, Tag, ChevronDown, Sliders, Info, AlertCircle,
  MapPin, Loader2, ExternalLink, Map as MapIcon, FileText, Clock, Monitor, Speaker, GitBranch, Activity, Aperture,
  BookOpen, Crop, Target, Sparkles, Camera, Eye, Link as LinkIcon, Box, ChevronUp, PlusCircle, ArrowLeft,
  Paperclip, ArrowUpRight, Image as ImageIcon, File, Trash2, CircleDot, Flag, DollarSign
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { PostProdTask, Equipment, Shot, Attachment } from '../../types.ts';
import { SHOOT_DATES, CATEGORY_ICONS, POST_PROD_CATEGORIES } from '../../constants.ts';
import { timeToMinutes, calculateEndTime } from '../../utils.ts';
import { TimeSelector } from '../ui/TimeSelector.tsx';
import { GlassCard } from '../ui/GlassCard.tsx';
import { NoteForm, NoteFormData } from '../notes/NoteForm';
import { TaskForm, TaskFormData } from '../postprod/TaskForm';
import { GearForm, GearFormData } from '../inventory/GearForm';

interface ActionSuiteProps {
  onClose: () => void;
  onCommitProject: (name: string, startDate: string, endDate: string, location: string, description: string) => void;
  onCommitShot: (shot: Shot) => void;
  onCommitGear: (gear: Equipment) => void;
  onCommitTask: (task: PostProdTask) => void;
  onCommitNote: (title: string, content: string, linkedId?: string, linkType?: 'shot' | 'task', attachments?: Attachment[]) => void;
  inventory: Equipment[];
  currentProject: string;
  existingShots: Shot[];
  existingTasks?: PostProdTask[];
  initialView?: ViewMode;
  initialLink?: { type: 'shot' | 'task'; id: string };
}

type ViewMode = 'hub' | 'shot' | 'gear' | 'task' | 'note' | 'project';

const VIEWS: { id: ViewMode; label: string; icon: any; color: string }[] = [
  { id: 'gear', label: 'Gear', icon: Package, color: 'text-blue-600 dark:text-indigo-600' },
  { id: 'shot', label: 'Scene', icon: Film, color: 'text-blue-600 dark:text-indigo-600' },
  { id: 'task', label: 'Task', icon: Zap, color: 'text-orange-600' },
  { id: 'note', label: 'Note', icon: StickyNote, color: 'text-gray-600' },
];

export const ActionSuite: React.FC<ActionSuiteProps> = ({
  onClose,
  onCommitProject,
  onCommitShot,
  onCommitGear,
  onCommitTask,
  onCommitNote,
  inventory,
  currentProject,
  existingShots,
  existingTasks = [],
  initialView,
  initialLink
}) => {
  // Default to 'shot' if no initial view is provided, skipping the hub completely
  const [view, setView] = useState<ViewMode>(initialView && initialView !== 'hub' ? initialView : 'shot');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -- UTILS --
  const toISODate = (dateStr: string) => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0];
  };

  const fromISODate = (isoStr: string) => {
    if (!isoStr) return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // -- FORM STATES --

  // Project Form
  const [projectForm, setProjectForm] = useState({
    name: '',
    productionCompany: '',
    startDate: toISODate(new Date().toLocaleDateString()),
    endDate: toISODate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()),
    description: '',
    location: ''
  });

  // Shot Form
  const [shotForm, setShotForm] = useState({
    title: '',
    sceneNumber: '',
    location: '',
    date: toISODate(new Date().toLocaleDateString()),
    startTime: '08:00',
    endTime: '10:00',
    description: '',
    remarks: '',
    equipmentIds: [] as string[]
  });

  // Shot Gear Management State
  const [isCreatingGearInline, setIsCreatingGearInline] = useState(false);
  const [shotGearSearch, setShotGearSearch] = useState('');
  const [shotGearCategory, setShotGearCategory] = useState('All');
  const [inlineGearForm, setInlineGearForm] = useState({
    name: '',
    category: 'Camera'
  });

  // Location Autocomplete State
  const [locationSuggestions, setLocationSuggestions] = useState<{ name: string, uri?: string }[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const locationSearchTimeout = useRef<any>(null);

  // Gear Form (Standalone)
  const [gearForm, setGearForm] = useState({
    name: '',
    serialNumber: '',
    category: '',
    brand: '',
    mount: '',
    model: '',
    isOwned: true,
    price: 0,
    frequency: 'day' as 'hour' | 'day' | 'week' | 'month' | 'year',
    customSpecs: [] as { key: string, value: string }[],
    specs: {} as Record<string, any>
  });
  const [showSpecsInForm, setShowSpecsInForm] = useState(false);

  // Task Form
  const [taskForm, setTaskForm] = useState({
    title: '',
    category: 'Script' as PostProdTask['category'],
    status: 'todo' as PostProdTask['status'],
    priority: 'medium' as PostProdTask['priority'],
    dueDate: toISODate(new Date().toLocaleDateString()),
    description: '',
    metadata: {} as Record<string, string | number | boolean>
  });

  // Note Form
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    linkType: initialLink?.type || 'none' as 'none' | 'shot' | 'task',
    linkedId: initialLink?.id || '',
    attachments: [] as Attachment[]
  });

  // -- COMPUTED --

  const shotConflict = useMemo(() => {
    if (view !== 'shot' || !shotForm.startTime || !shotForm.endTime) return null;

    const startMins = timeToMinutes(shotForm.startTime);
    let endMins = timeToMinutes(shotForm.endTime);
    if (endMins < startMins) endMins += 1440;

    const formattedDate = fromISODate(shotForm.date);

    return existingShots.find(s => {
      if (s.date !== formattedDate) return false;
      const sStart = timeToMinutes(s.startTime);
      const sEnd = timeToMinutes(calculateEndTime(s.startTime, s.duration));
      return (startMins < sEnd && endMins > sStart);
    });
  }, [shotForm.startTime, shotForm.endTime, shotForm.date, existingShots, view]);


  // -- HANDLERS --

  // Google Maps Autocomplete Implementation
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
    setShotForm({ ...shotForm, location: val });

    if (locationSearchTimeout.current) clearTimeout(locationSearchTimeout.current);
    locationSearchTimeout.current = setTimeout(() => {
      fetchLocationSuggestions(val);
    }, 500);
  };

  const selectLocation = (suggestion: { name: string, uri?: string }) => {
    setShotForm({ ...shotForm, location: suggestion.name });
    setLocationSuggestions([]);
  };

  const handleCommitProject = () => {
    if (!projectForm.name.trim()) return;
    onCommitProject(
      projectForm.name.trim(),
      projectForm.startDate,
      projectForm.endDate,
      projectForm.location,
      projectForm.description
    );
    onClose();
  };

  const handleCommitShot = () => {
    if (!shotForm.title.trim() || shotConflict) return;

    const startMins = timeToMinutes(shotForm.startTime);
    let endMins = timeToMinutes(shotForm.endTime);
    if (endMins < startMins) endMins += 1440;
    const diffHours = (endMins - startMins) / 60;
    const duration = `${diffHours.toFixed(1).replace('.0', '')}h`;

    const newShot: Shot = {
      id: `shot-${Date.now()}`,
      title: shotForm.title,
      sceneNumber: shotForm.sceneNumber || `${existingShots.length + 1}X`,
      location: shotForm.location || 'Location TBD',
      date: fromISODate(shotForm.date),
      startTime: shotForm.startTime,
      duration: duration,
      description: shotForm.description,
      remarks: shotForm.remarks,
      status: 'pending',
      equipmentIds: shotForm.equipmentIds,
      preparedEquipmentIds: []
    };

    onCommitShot(newShot);
    onClose();
  };

  const handleCommitGear = () => {
    const newId = `e-${Date.now()}`;
    const modelName = gearForm.model || gearForm.brand || gearForm.category || 'New Equipment';

    const newEquipment: Equipment = {
      id: newId,
      name: modelName,
      catalogItemId: gearForm.model || undefined,
      customName: gearForm.name.trim() || undefined,
      serialNumber: gearForm.serialNumber.trim() || undefined,
      category: gearForm.category as any || 'Other',
      pricePerDay: gearForm.isOwned ? 0 : gearForm.price,
      rentalPrice: gearForm.isOwned ? undefined : gearForm.price,
      rentalFrequency: gearForm.isOwned ? undefined : gearForm.frequency,
      quantity: 1,
      isOwned: gearForm.isOwned,
      status: 'operational',
      specs: gearForm.specs || {}
    };

    onCommitGear(newEquipment);
    onClose();
  };

  // Inline Gear Creation (Inside Shot Form)
  const handleInlineGearCreate = () => {
    if (!inlineGearForm.name) return;

    const newId = `e-inline-${Date.now()}`;
    const newEquipment: Equipment = {
      id: newId,
      name: inlineGearForm.name,
      customName: inlineGearForm.name,
      category: inlineGearForm.category as any,
      pricePerDay: 0,
      quantity: 1,
      isOwned: true,
      status: 'operational',
      specs: {}
    };

    // Add to global inventory via parent prop
    onCommitGear(newEquipment);

    // Add to current shot form
    setShotForm(prev => ({
      ...prev,
      equipmentIds: [...prev.equipmentIds, newId]
    }));

    // Reset inline states
    setIsCreatingGearInline(false);
    setInlineGearForm({ name: '', category: 'Camera' });
  };

  const toggleShotGear = (id: string) => {
    setShotForm(prev => {
      const exists = prev.equipmentIds.includes(id);
      return {
        ...prev,
        equipmentIds: exists
          ? prev.equipmentIds.filter(x => x !== id)
          : [...prev.equipmentIds, id]
      };
    });
  };

  const handleCommitTask = () => {
    if (!taskForm.title.trim()) return;

    const newTask: PostProdTask = {
      id: `task-${Date.now()}`,
      title: taskForm.title,
      category: taskForm.category as any,
      status: taskForm.status,
      priority: taskForm.priority,
      dueDate: fromISODate(taskForm.dueDate),
      description: taskForm.description,
      metadata: taskForm.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onCommitTask(newTask);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const isImage = file.type.startsWith('image/');

      const newAttachment: Attachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        type: isImage ? 'image' : 'document',
        url: URL.createObjectURL(file), // Create a local preview URL
        size: `${(file.size / 1024).toFixed(1)} KB`,
        createdAt: new Date().toISOString()
      };

      setNoteForm(prev => ({
        ...prev,
        attachments: [...prev.attachments, newAttachment]
      }));
    }
  };

  const removeAttachment = (attId: string) => {
    setNoteForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== attId)
    }));
  };

  const handleCommitNote = () => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) return;
    onCommitNote(
      noteForm.title,
      noteForm.content,
      noteForm.linkedId,
      noteForm.linkType === 'none' ? undefined : noteForm.linkType,
      noteForm.attachments
    );
    onClose();
  };

  // -- RENDER --

  return (
    <div
      className={`fixed inset-0 z-[2000] bg-black/80 backdrop-blur-3xl flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in duration-500 overflow-hidden`}
      style={{
        paddingTop: 'max(16px, env(safe-area-inset-top))',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))'
      }}
      onClick={onClose}
    >
      <div
        className="w-full md:w-[85vw] lg:max-w-5xl xl:max-w-6xl h-full md:h-auto flex flex-col justify-center"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/10 shadow-2xl rounded-[32px] sm:rounded-[48px] animate-in slide-in-from-bottom-8 duration-500 relative max-h-[95vh] md:max-h-[92vh] lg:max-h-[90vh] flex flex-col overflow-hidden">

          {/* Header Area with Navigation */}
          <div className="px-6 py-6 sm:px-10 sm:py-8 border-b border-gray-50 dark:border-white/5 flex flex-col gap-6 shrink-0 bg-white dark:bg-[#1C1C1E] z-20">
            {/* Navigation Switcher */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {view !== 'project' && VIEWS.map(v => {
                  const Icon = v.icon;
                  const isActive = view === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setView(v.id)}
                      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border transition-all active:scale-95 whitespace-nowrap ${isActive
                        ? `bg-blue-600 dark:bg-indigo-600 dark:bg-yellow-400 border-indigo-600 dark:border-yellow-400 text-white dark:text-gray-900 shadow-lg shadow-blue-500 dark:shadow-indigo-500/30 dark:shadow-yellow-400/20`
                        : `bg-white dark:bg-[#2C2C30] border-gray-100 dark:border-white/5 text-gray-400 dark:text-gray-500 hover:border-gray-200 dark:hover:border-white/20 hover:text-gray-600 dark:hover:text-gray-300`
                        }`}
                    >
                      <Icon size={14} strokeWidth={2.5} className={isActive ? 'text-white' : ''} />
                      <span className={`text-[10px] font-semibold ${isActive ? '' : 'hidden sm:inline'}`}>{v.label}</span>
                    </button>
                  )
                })}
              </div>
              <button onClick={onClose} className="p-2 bg-gray-50 dark:bg-[#2C2C30] text-gray-400 dark:text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-[#3A3A3E] hover:text-gray-900 dark:hover:text-white transition-colors ml-4 shrink-0">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Dynamic Title */}
            <div>
              <p className="text-[9px] font-semibold text-blue-500 dark:text-indigo-500 mb-1">Create new</p>
              <h3 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white leading-none">
                {view === 'gear' ? 'Register gear' : view === 'shot' ? 'Schedule scene' : view === 'project' ? 'Production' : view === 'task' ? 'Pipeline task' : view === 'note' ? 'Creative note' : 'Entry'}
              </h3>
            </div>
          </div>

          <div className="space-y-8 overflow-y-auto px-6 py-6 sm:px-10 sm:py-8 no-scrollbar pb-0 flex-1">
            {/* ... (Rest of the JSX for views remains unchanged, except Gear form removing 'targetProjectId' related UI if it existed, but it didn't in visible JSX so no change needed there) ... */}
            {/* SHOT FORM */}
            {view === 'shot' && (
              <div className="space-y-5 relative h-full flex flex-col">

                {/* SECTION 1: Scene Identity */}
                <div className="rounded-[24px] p-5 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-500 dark:bg-indigo-500/10 rounded-xl">
                      <Film size={16} className="text-blue-600 dark:text-indigo-600 dark:text-blue-400 dark:text-indigo-400" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Scene identity</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        value={shotForm.title}
                        onChange={e => setShotForm({ ...shotForm, title: e.target.value })}
                        className={`w-full bg-white/70 dark:bg-white/5 border rounded-2xl px-4 py-3.5 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 dark:ring-indigo-500/20 dark:focus:ring-yellow-400/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${!shotForm.title.trim() ? 'border-red-200 dark:border-red-500/30' : 'border-white/60 dark:border-white/10'}`}
                        placeholder="Scene title..."
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 bg-white/70 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-2xl px-4 py-3.5">
                        <span className="px-2 py-0.5 bg-black/5 dark:bg-white/10 rounded-md text-[10px] font-semibold text-gray-500 dark:text-gray-400">SC</span>
                        <input
                          type="text"
                          value={shotForm.sceneNumber}
                          onChange={e => setShotForm({ ...shotForm, sceneNumber: e.target.value })}
                          className="flex-1 bg-transparent text-base font-semibold focus:outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 min-w-0"
                          placeholder="4C"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Schedule */}
                <div className="rounded-[24px] p-5 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-indigo-50 dark:bg-blue-500 dark:bg-indigo-500/10 rounded-xl">
                      <Calendar size={16} className="text-blue-600 dark:text-indigo-600 dark:text-blue-400 dark:text-indigo-400" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Schedule</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="relative">
                      <input
                        type="date"
                        value={shotForm.date}
                        onChange={e => setShotForm({ ...shotForm, date: e.target.value })}
                        className={`w-full bg-white/70 dark:bg-white/5 border rounded-2xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 dark:ring-indigo-500/20 dark:focus:ring-yellow-400/20 transition-all cursor-pointer appearance-none text-gray-900 dark:text-white ${shotConflict ? 'border-red-200 dark:border-red-500/30' : 'border-white/60 dark:border-white/10'}`}
                      />
                    </div>
                    <TimeSelector label="" value={shotForm.startTime} onChange={(v) => setShotForm({ ...shotForm, startTime: v })} />
                    <TimeSelector label="" value={shotForm.endTime} onChange={(v) => setShotForm({ ...shotForm, endTime: v })} />
                  </div>

                  {shotConflict && (
                    <div className="flex items-center gap-2 p-3 mt-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl">
                      <AlertCircle className="text-red-500 dark:text-red-400 shrink-0" size={14} strokeWidth={3} />
                      <p className="text-[10px] font-semibold text-red-600 dark:text-red-400 leading-tight">
                        Conflict: This slot is already taken by"{shotConflict.title}"
                      </p>
                    </div>
                  )}
                </div>

                {/* SECTION 3: Location */}
                <div className="rounded-[24px] p-5 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 relative z-20">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                      <MapPin size={16} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Location</span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={shotForm.location}
                      onChange={handleLocationInputChange}
                      className="w-full bg-white/70 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-2xl px-4 py-3.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-yellow-400/20 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Search filming location..."
                    />
                    {isSearchingLocation && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 size={16} className="text-emerald-500 animate-spin" />
                      </div>
                    )}
                  </div>

                  {locationSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-2 mx-5 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover/loc:text-blue-600 dark:text-indigo-600 dark:group-hover/loc:text-yellow-400 transition-colors truncate pr-2">
                              {suggestion.name}
                            </span>
                            {suggestion.uri && <ExternalLink size={12} className="text-gray-300 dark:text-gray-600 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 4: Details */}
                <div className="rounded-[24px] p-5 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
                      <FileText size={16} className="text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Scene description</span>
                  </div>

                  <textarea
                    value={shotForm.description}
                    onChange={e => setShotForm({ ...shotForm, description: e.target.value })}
                    className="w-full bg-white/70 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-2xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-yellow-400/20 transition-all min-h-[100px] resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Describe the action, atmosphere, and key visual elements..."
                  />
                </div>

                {/* SECTION 5: Equipment Selection */}
                <div className="rounded-[24px] p-5 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-50 dark:bg-blue-500 dark:bg-indigo-500/10 rounded-xl">
                        <Package size={16} className="text-blue-600 dark:text-indigo-600 dark:text-blue-400 dark:text-indigo-400" />
                      </div>
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Equipment</span>
                    </div>
                    <span className="bg-blue-50 dark:bg-yellow-500/10 text-blue-600 dark:text-indigo-600 dark:text-blue-400 dark:text-indigo-400 px-2.5 py-1 rounded-lg text-[10px] font-semibold">{shotForm.equipmentIds.length} Selected</span>
                  </div>

                  {isCreatingGearInline ? (
                    <div className="p-4 bg-indigo-50 dark:bg-yellow-500/10 border border-indigo-100 dark:border-yellow-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block ml-1">Item name / model</label>
                          <input
                            type="text"
                            value={inlineGearForm.name}
                            onChange={(e) => setInlineGearForm({ ...inlineGearForm, name: e.target.value })}
                            className="w-full bg-white dark:bg-[#2C2C30] border-2 border-gray-100 dark:border-white/10 rounded-[20px] px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:border-indigo-500 dark:focus:border-yellow-400 transition-all placeholder-gray-300 dark:placeholder-gray-500"
                            placeholder="e.g. Red Komodo, extension cable..."
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block ml-1">Category</label>
                          <select
                            value={inlineGearForm.category}
                            onChange={(e) => setInlineGearForm({ ...inlineGearForm, category: e.target.value })}
                            className="w-full bg-white dark:bg-[#2C2C30] border-2 border-gray-100 dark:border-white/10 rounded-[20px] px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:border-indigo-500 dark:focus:border-yellow-400 transition-all cursor-pointer"
                          >
                            {['Camera', 'Lens', 'Light', 'Filter', 'Audio', 'Support', 'Grip', 'Other'].map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={handleInlineGearCreate}
                          disabled={!inlineGearForm.name.trim()}
                          className="flex-1 py-2.5 bg-blue-600 dark:bg-indigo-600 dark:bg-yellow-400 text-white dark:text-gray-900 rounded-xl text-[9px] font-semibold shadow-md disabled:opacity-50 hover:bg-blue-700 dark:bg-indigo-700 dark:hover:bg-yellow-500"
                        >
                          Save & Select
                        </button>
                        <button
                          onClick={() => setIsCreatingGearInline(false)}
                          className="px-6 py-2.5 bg-white dark:bg-[#3A3A3E] text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-xl text-[9px] font-semibold hover:bg-gray-50 dark:hover:bg-[#4A4A4E]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                          <input
                            type="text"
                            value={shotGearSearch}
                            onChange={(e) => setShotGearSearch(e.target.value)}
                            placeholder="Search inventory..."
                            className="w-full bg-white dark:bg-[#2C2C30] border border-gray-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-[10px] font-semibold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-yellow-400/20"
                          />
                        </div>
                      </div>
                      <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
                        {['All', 'Camera', 'Lens', 'Light', 'Filter', 'Support', 'Grip', 'Monitoring', 'Audio', 'Wireless', 'Drone', 'Props'].map(cat => (
                          <button
                            key={cat}
                            onClick={() => setShotGearCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-[8px] font-semibold whitespace-nowrap border transition-all ${shotGearCategory === cat
                              ? 'bg-blue-600 dark:bg-indigo-600 dark:bg-yellow-400 text-white border-indigo-600 dark:border-yellow-400 dark:text-gray-900'
                              : 'bg-white dark:bg-[#2C2C30] border-gray-100 dark:border-white/10 text-gray-400 dark:text-gray-500 hover:border-blue-200 dark:hover:border-yellow-400/30 hover:text-blue-500 dark:text-indigo-500 dark:hover:text-yellow-400'
                              }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
                        {inventory.filter(item => {
                          const matchesSearch = (item.customName || item.name).toLowerCase().includes(shotGearSearch.toLowerCase());
                          const matchesCat = shotGearCategory === 'All' || item.category === shotGearCategory;
                          return matchesSearch && matchesCat;
                        }).map(item => {
                          const isSelected = shotForm.equipmentIds.includes(item.id);
                          const Icon = (CATEGORY_ICONS as any)[item.category] || Package;

                          return (
                            <button
                              key={item.id}
                              onClick={() => toggleShotGear(item.id)}
                              className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left group ${isSelected
                                ? 'bg-blue-50 dark:bg-yellow-500/10 border-blue-200 dark:border-yellow-400/30 shadow-sm ring-1 ring-blue-200 dark:ring-yellow-400/20'
                                : 'bg-white dark:bg-[#2C2C30] border-gray-100 dark:border-white/10 hover:border-blue-100 dark:hover:border-yellow-400/20 hover:bg-gray-50 dark:hover:bg-[#3A3A3E]'
                                }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`p-1.5 rounded-lg transition-colors ${isSelected ? 'bg-blue-100 dark:bg-yellow-500/20 text-blue-600 dark:text-indigo-600 dark:text-blue-400 dark:text-indigo-400' : 'bg-gray-50 dark:bg-[#3A3A3E] text-gray-400 dark:text-gray-500'}`}>
                                  <Icon size={12} />
                                </div>
                                <div className="min-w-0">
                                  <p className={`text-[10px] font-semibold truncate leading-none mb-0.5 ${isSelected ? 'text-blue-900 dark:text-blue-400 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {item.customName || item.name}
                                  </p>
                                  <p className="text-[8px] font-semibold text-gray-400 dark:text-gray-500">{item.category}</p>
                                </div>
                              </div>
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${isSelected ? 'bg-blue-600 dark:bg-indigo-600 dark:bg-yellow-400 border-indigo-600 dark:border-yellow-400 text-white dark:text-gray-900' : 'bg-white dark:bg-[#3A3A3E] border-gray-200 dark:border-white/10 text-transparent'
                                }`}>
                                <Check size={10} strokeWidth={4} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 sticky bottom-0 bg-white dark:bg-[#1C1C1E] flex justify-center pb-6 mt-auto">
                  <button
                    onClick={handleCommitShot}
                    disabled={!shotForm.title.trim() || !!shotConflict}
                    className={`w-full sm:w-auto sm:px-24 py-4 rounded-full font-semibold text-[12px] text-white shadow-2xl transition-all flex items-center justify-center gap-3 ${!shotForm.title.trim() || !!shotConflict ? 'bg-gray-400 cursor-not-allowed opacity-40' : 'bg-blue-400 dark:bg-indigo-400/60 dark:bg-yellow-400/60 shadow-blue-500 dark:shadow-indigo-500/10 dark:shadow-yellow-400/10 active:scale-[0.98] hover:bg-blue-500 dark:bg-indigo-500 dark:hover:bg-yellow-500 dark:text-gray-900'}`}
                  >
                    Add scene <Save size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}

            {/* NOTE FORM */}
            {view === 'note' && (
              <NoteForm
                form={noteForm}
                setForm={setNoteForm}
                existingShots={existingShots}
                existingTasks={existingTasks}
                onSubmit={handleCommitNote}
              />
            )}

            {/* TASK FORM */}
            {view === 'task' && (
              <TaskForm
                form={taskForm}
                setForm={setTaskForm}
                onSubmit={handleCommitTask}
              />
            )}

            {/* PROJECT FORM */}
            {view === 'project' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block ml-1">Production title</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500" size={16} />
                      <input
                        type="text"
                        value={projectForm.name}
                        onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-[#2C2C30] border border-gray-100 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 dark:ring-indigo-500/10 dark:focus:ring-yellow-400/10 text-gray-900 dark:text-white"
                        placeholder="e.g. Neon Paradox"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={handleCommitProject}
                    disabled={!projectForm.name.trim()}
                    className="w-full py-5 rounded-[24px] font-semibold text-[12px] bg-emerald-600 dark:bg-emerald-500 text-white shadow-2xl shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:grayscale"
                  >
                    Initialize project <Check size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}

            {/* GEAR FORM */}
            {view === 'gear' && (
              <GearForm
                form={gearForm}
                setForm={setGearForm}
                onSubmit={handleCommitGear}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
