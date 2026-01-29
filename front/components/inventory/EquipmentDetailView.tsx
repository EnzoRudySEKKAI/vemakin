
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Package, ShieldCheck,
  Info, DollarSign, Edit3, Trash2, Save,
  Database, Sliders, Weight,
  Film, Check, ListChecks, MessageSquare, ExternalLink,
  ChevronDown, ChevronUp, Plus, Search, Layers, Box,
  MoreVertical, FileText, Hourglass, MoreHorizontal, RotateCcw, CalendarPlus,
  ArrowRight, ChevronLeft, ChevronRight, Home, Share2, Archive, ArrowLeft, Pencil, Calendar, Settings, User
} from 'lucide-react';
import { useHeaderActions } from '../../context/HeaderActionsContext';
import { Equipment, Currency, Shot } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { HoverCard } from '../ui/HoverCard';
import { EmptyState } from '../ui/EmptyState';
import { ConfirmModal } from '../ui/ConfirmModal';
import { CATEGORY_ICONS, GEAR_DATABASE } from '../../constants';
import { IconButton } from '../ui/IconButton';

import { useClickOutside } from '../../hooks/useClickOutside';

interface EquipmentDetailViewProps {
  item: Equipment;
  involvedProjects?: string[];
  projectData: Record<string, any>;
  onClose: () => void;
  onNavigateToShot: (projectName: string, shotId: string) => void;
  currency: Currency;
  onUpdate?: (updated: Equipment) => void;
  onDelete?: (id: string) => void;
}

export const EquipmentDetailView: React.FC<EquipmentDetailViewProps> = ({
  item,
  involvedProjects = [],
  projectData,
  onClose,
  onNavigateToShot,
  currency,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [expandedProjectShots, setExpandedProjectShots] = useState<string | null>(null);
  const [editedItem, setEditedItem] = useState<Equipment>(item);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSave = useCallback(() => {
    if (onUpdate) {
      onUpdate(editedItem);
    }
    setIsEditing(false);
  }, [editedItem, onUpdate]);

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(item.id);
    }
    setShowDeleteConfirm(false);
    onClose();
  }, [onDelete, item.id, onClose]);

  const menuRef = useRef<HTMLDivElement>(null);
  const Icon = (CATEGORY_ICONS as any)[item.category] || Package;

  // Header integration
  const { setActions, setTitle, setSubtitle, setOnBack, setDetailLabel } = useHeaderActions();

  useClickOutside(menuRef, () => setShowMoreMenu(false), showMoreMenu);

  useEffect(() => {
    setEditedItem(item);
  }, [item]);

  // Update header on mount and when interactions change
  useEffect(() => {
    setTitle(item.name);
    setSubtitle(`${item.category} • ${item.location}`);
    setDetailLabel('Equipment Detail');
    setOnBack(onClose);

    return () => {
      setTitle(null);
      setSubtitle(null);
      setDetailLabel(null);
      setActions(null);
      setOnBack(undefined);
    };
  }, [item, setTitle, setSubtitle, setDetailLabel, setOnBack, setActions, onClose]);

  useEffect(() => {
    setActions(
      <div className="flex items-center gap-2">
        {!isEditing ? (
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-black dark:hover:text-white transition-all shadow-sm"
              title="Edit Gear"
            >
              <Edit3 size={20} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all shadow-sm"
              title="Delete Gear"
            >
              <Trash2 size={20} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => { setIsEditing(false); setEditedItem(item); }}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm"
              title="Cancel Changes"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
            <button
              onClick={handleSave}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#3762E3] dark:bg-[#4E47DD] text-white shadow-lg shadow-[#3762E3]/20 dark:shadow-[#4E47DD]/20 hover:scale-105 active:scale-95 transition-all"
              title="Save Changes"
            >
              <Check size={20} strokeWidth={3} />
            </button>
          </div>
        )}
      </div>
    );
  }, [isEditing, item, handleSave, setActions]);

  const toggleProjectShots = (projectName: string) => {
    setExpandedProjectShots(prev => prev === projectName ? null : projectName);
  };

  const getShotsForEquipmentInProject = (projectName: string): Shot[] => {
    const projectShots = projectData[projectName]?.shots || [];
    return projectShots.filter((s: Shot) => s.equipmentIds.includes(item.id));
  };

  const renderProjectItem = (pName: string) => {
    const relatedShots = getShotsForEquipmentInProject(pName);
    const isExpanded = expandedProjectShots === pName;

    return (
      <div key={pName} className="border-b border-gray-100/50 dark:border-white/5 last:border-none bg-transparent">
        <button
          onClick={() => toggleProjectShots(pName)}
          className={`w-full flex justify-between items-center py-4 px-4 hover:bg-white/50 dark:hover:bg-white/5 rounded-2xl transition-all group my-1 ${isExpanded ? 'bg-white/50 dark:bg-white/5' : ''}`}
        >
          <div className="flex items-center gap-4 min-w-0">
            <span className={`text-sm font-semibold truncate capitalize ${isExpanded ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}`}>{pName}</span>
          </div>
          <div className="flex items-center gap-3">
            {relatedShots.length > 0 && (
              <span className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500">
                {relatedShots.length} Scenes
              </span>
            )}
            <div className={`transition-transform duration-300 text-gray-400 dark:text-gray-500 ${isExpanded ? 'rotate-180 text-blue-600 dark:text-indigo-400' : ''}`}>
              <ChevronDown size={16} strokeWidth={2.5} />
            </div>
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-2 pb-4 pt-1 space-y-2">
                {relatedShots.length > 0 ? (
                  relatedShots.map(shot => (
                    <button
                      key={shot.id}
                      onClick={() => onNavigateToShot(pName, shot.id)}
                      className="w-full flex items-center justify-between p-3 pl-4 rounded-xl text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-all group/shot"
                    >
                      <div className="flex items-center gap-4 truncate">
                        <div className="truncate">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover/shot:text-gray-900 dark:group-hover/shot:text-white tracking-tight truncate transition-colors">{shot.title}</p>
                          <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400/30 dark:bg-indigo-400/30 group-hover/shot:bg-blue-500 dark:group-hover/shot:bg-indigo-400 transition-colors" />
                            Sc. {shot.sceneNumber}
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            {shot.startTime}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 group-hover/shot:text-blue-400 dark:text-indigo-400 mr-2" strokeWidth={2.5} />
                    </button>
                  ))
                ) : (
                  <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 py-3 italic pl-6 border-l-2 border-dashed border-gray-200 dark:border-white/10">
                    No active shoots scheduled
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] dark:bg-[#141417] min-h-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1920px] mx-auto p-4 md:p-8 pt-0 pb-32">

          {/* FLUID CONTEXT BAR */}
          <div className="flex flex-col gap-8 mb-12 pb-10 border-b border-gray-100 dark:border-white/5">
            {/* Status Section - Ownership */}
            <div className="w-full">
              <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] leading-none mb-3 block text-center sm:text-left">Availability & Asset Type</span>

              <div
                className={`flex items-center justify-center gap-3 px-5 py-3 rounded-2xl border transition-all duration-300 w-full ${item.isOwned
                  ? 'bg-[#3762E3]/5 dark:bg-[#4E47DD]/10 border-[#3762E3]/20 dark:border-[#4E47DD]/20 text-[#3762E3] dark:text-[#4E47DD]'
                  : 'bg-orange-500/5 border-orange-500/20 text-orange-600 dark:text-orange-400'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${item.isOwned ? 'bg-[#3762E3] dark:bg-[#4E47DD] shadow-[0_0_8px_rgba(55,98,227,0.4)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]'}`} />
                  <span className="text-base font-bold tracking-tight">
                    {item.isOwned ? 'Owned Asset' : 'Rented Equipment'}
                  </span>
                </div>
                {item.isOwned ? <ShieldCheck size={16} className="opacity-40" /> : <DollarSign size={16} className="opacity-40" />}
              </div>
            </div>

            {/* Metadata Row */}
            <div className="grid grid-cols-2 lg:flex lg:flex-wrap items-start gap-x-8 lg:gap-x-16 gap-y-8">
              {/* Internal Designation (Custom Name) */}
              {(isEditing || item.customName) && (
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] leading-none">Internal Desig.</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedItem.customName || ''}
                      onChange={e => setEditedItem({ ...editedItem, customName: e.target.value })}
                      placeholder="e.g. A-CAM"
                      className="bg-transparent border-b border-gray-200 dark:border-white/10 py-1 text-lg font-bold text-gray-900 dark:text-white focus:outline-none placeholder-gray-300 w-32"
                    />
                  ) : (
                    <span className="text-lg font-bold text-gray-900 dark:text-white block leading-tight py-1.5 truncate">
                      {item.customName}
                    </span>
                  )}
                </div>
              )}

              {/* Category */}
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] leading-none">Category</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white block leading-tight py-1.5 capitalize">
                  {item.category}
                </span>
              </div>

              {/* Serial Number */}
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] leading-none">Identification</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedItem.serialNumber || ''}
                    onChange={e => setEditedItem({ ...editedItem, serialNumber: e.target.value })}
                    className="bg-transparent border-b border-gray-200 dark:border-white/10 py-1 text-lg font-bold text-gray-900 dark:text-white focus:outline-none placeholder-gray-300"
                    placeholder="S/N"
                  />
                ) : (
                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400 py-1.5">
                    {item.serialNumber || "No serial label"}
                  </span>
                )}
              </div>

              {/* Brand/Model (Detailed) */}
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] leading-none">Model Reference</span>
                <span className="text-sm font-bold text-gray-400 dark:text-gray-500 py-1.5 truncate">
                  {item.name}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
            {/* MAIN CONTENT AREA */}
            <div className="xl:col-span-8 space-y-16">
              {/* Rental Rate (Conditional) */}
              {!item.isOwned && (
                <section className="bg-orange-50 dark:bg-orange-500/[0.03] border border-orange-100 dark:border-orange-500/20 rounded-[32px] p-8 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 flex items-center justify-center bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl border border-orange-200 dark:border-orange-500/20">
                      <DollarSign size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <span className="text-xs font-black text-orange-400 dark:text-orange-500 uppercase tracking-widest block mb-1">Rental Rate</span>
                      <p className="text-2xl font-black text-orange-900 dark:text-orange-50 leading-none">
                        {currency.symbol}{item.rentalPrice?.toLocaleString()}
                        <span className="text-sm text-orange-400 dark:text-orange-500/50 ml-2 font-bold uppercase tracking-tight">/ {item.rentalFrequency}</span>
                      </p>
                    </div>
                  </div>
                </section>
              )}



              {/* Technical Details */}
              <section className="">
                <div className="mb-10">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Hardware Interface</h3>
                  <p className="text-[11px] font-bold text-gray-300 dark:text-white/20 uppercase tracking-[0.1em]">Technical Specifications</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-12 gap-x-8">
                  {Object.entries(item.specs).map(([key, val]) => (
                    <div key={key} className="group">
                      <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2.5 border-l-2 border-gray-200 dark:border-white/10 pl-3 leading-none">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <p className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                        {String(val || "—")}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: Project Usage */}
            <aside className="xl:col-span-4 lg:sticky lg:top-8 self-start">
              <div className="p-2">
                <div className="mb-10">
                  <h3 className="font-black text-xl text-gray-900 dark:text-white tracking-tight leading-none mb-2">Project Usage</h3>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Global Allocation</p>
                </div>

                <div className="space-y-1">
                  {involvedProjects.length > 0 ? (
                    involvedProjects.map((pName) => renderProjectItem(pName))
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                      <Package size={32} className="mb-4 text-gray-300" />
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-tight">Currently<br />Unassigned</p>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Equipment"
        message="Are you sure you want to permanently delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
