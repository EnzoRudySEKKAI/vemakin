
import React from 'react';
import { Clock, MapPin, CheckCircle2, Film, Check, ListChecks, Package, ChevronUp, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Shot, ShotLayout, Equipment } from '../../types.ts';
import { calculateEndTime } from '../../utils.ts';
import { TerminalCard } from '../ui/TerminalCard.tsx';

interface ShotCardProps {
	shot: Shot;
	shotLayout: ShotLayout;
	isChecklistOpen: boolean;
	onShotClick: (s: Shot) => void;
	onToggleStatus: (id: string) => void;
	onToggleChecklist: (id: string) => void;
	onToggleEquipment: (shotId: string, equipmentId: string) => void;
	inventory: Equipment[];
}

export const ShotCard: React.FC<ShotCardProps> = ({
	shot,
	shotLayout,
	isChecklistOpen,
	onShotClick,
	onToggleStatus,
	onToggleChecklist,
	onToggleEquipment,
	inventory
}) => {
	const isChecklistComplete = shot.equipmentIds.length > 0 &&
		shot.preparedEquipmentIds.length === shot.equipmentIds.length;

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
	};

	if (shotLayout === 'list') {
		return (
			<TerminalCard
				className="cursor-pointer"
				onClick={() => onShotClick(shot)}
			>
				<div className="px-6 py-3 flex flex-col gap-0">
					{/* Header: Tags */}
					<div className="flex items-center flex-wrap gap-2">
						<span className="px-2.5 py-1 bg-secondary border border-border text-foreground text-[10px] font-mono  tracking-wider">
							Scene {shot.sceneNumber}
						</span>
						<span className="px-2.5 py-1 border border-border text-muted-foreground flex items-center gap-1.5 text-[10px] font-mono  tracking-wider">
							{formatDate(shot.date)}
						</span>
						<span className="px-2.5 py-1 border border-border text-muted-foreground flex items-center gap-1.5 text-[10px] font-mono  tracking-wider">
							<Clock size={10} strokeWidth={2.5} /> {shot.startTime}
						</span>
						<span className="hidden md:block px-2.5 py-1 border border-border text-muted-foreground text-[10px] font-mono  tracking-wider">
							{shot.duration}
						</span>
					</div>

					{/* Title */}
					<div className="mt-3">
						<h3 className="text-2xl font-semibold text-foreground">
							{shot.title}
						</h3>
					</div>

					{/* Location & Actions Row */}
					<div className="flex items-end justify-between gap-4 mt-1 md:-mt-2">
						<div className="flex items-center gap-2 text-muted-foreground font-medium text-base flex-1 min-w-0">
							<MapPin size={16} strokeWidth={2.5} className="shrink-0" />
							<span className="truncate font-mono text-sm">{shot.location}</span>
						</div>

						{/* Actions */}
						<div className="hidden md:flex items-center gap-3 shrink-0">
							{/* Gear Badge (Visual) */}
							{shot.equipmentIds.length > 0 && (
								<div className="hidden md:flex items-center gap-2 py-1.5 text-primary text-xs font-mono  tracking-wider">
									<Package size={14} strokeWidth={2.5} />
									<span>Gear {shot.preparedEquipmentIds.length}/{shot.equipmentIds.length}</span>
								</div>
							)}

							{/* Checklist Button */}
							<button
								onClick={(e) => {
									e.stopPropagation();
									onToggleChecklist(shot.id);
								}}
								className={`h-10 px-4 flex items-center gap-2 text-xs font-mono  tracking-wider border transition-all ${isChecklistOpen
									? 'bg-primary text-primary-foreground border-primary'
									: 'bg-secondary/50 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
									}`}
							>
								<span>Checklist</span>
								{isChecklistOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
							</button>

							{/* Status Checkbox */}
							<button
								onClick={(e) => { e.stopPropagation(); onToggleStatus(shot.id); }}
								className={`w-10 h-10 flex items-center justify-center border transition-all ${shot.status === 'done'
									? 'bg-primary text-primary-foreground border-primary'
									: 'bg-transparent text-muted-foreground border-border hover:border-primary/30'
									}`}
							>
								<Check size={18} strokeWidth={3} />
							</button>
						</div>
					</div>

					{/* Expanded Checklist in List Mode */}
					{isChecklistOpen && (
						<div className="w-full mt-4 pt-4 border-t border-border">
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
								{shot.equipmentIds.map(eId => {
									const equip = inventory.find(e => e.id === eId);
									const isPrepared = shot.preparedEquipmentIds.includes(eId);
									return (
										<button
											key={eId}
											onClick={(e) => { e.stopPropagation(); onToggleEquipment(shot.id, eId); }}
											className={`
													flex items-center justify-between p-3 text-xs font-mono border text-left
													${isPrepared
														? 'bg-primary/10 border-primary/30 text-primary'
														: 'bg-secondary/30 border-border text-muted-foreground hover:border-primary/30'
													}
												`}
										>
											<span className="truncate mr-2">{equip?.name || 'Unknown Item'}</span>
											<div className={`
													w-4 h-4 flex items-center justify-center border
													${isPrepared
														? 'bg-primary border-primary text-primary-foreground'
														: 'border-border'
													}
												`}>
												{isPrepared && <Check size={10} strokeWidth={4} />}
											</div>
										</button>
									);
									})}
							</div>
						</div>
					)}
				</div>
			</TerminalCard>
		);
	}

	// Grid Layout (Timeline Card)
	return (
		<div
			className={`relative w-full group ${isChecklistOpen ? 'z-10' : 'z-0'}`}
			onClick={() => onShotClick(shot)}
		>
			<TerminalCard
				className={`
					${isChecklistOpen
						? 'border-primary/50'
						: ''
					}
				`}
			>
				{/* Main Card Content */}
				<div className="p-6 relative z-10">
					<div className="flex flex-col gap-2">

						{/* Header Tags */}
						<div className="flex items-center justify-between">
							<div className="flex flex-wrap items-center gap-2">
								<span className="px-2.5 py-1 bg-secondary border border-border text-foreground text-[10px] font-mono  tracking-wider">
									Scene {shot.sceneNumber}
								</span>
								<span className="px-2.5 py-1 border border-border text-muted-foreground flex items-center gap-1.5 text-[10px] font-mono  tracking-wider">
									{formatDate(shot.date)}
								</span>
								<span className="px-2.5 py-1 border border-border text-muted-foreground flex items-center gap-1.5 text-[10px] font-mono  tracking-wider">
									<Clock size={10} strokeWidth={2.5} />
									{shot.startTime}
								</span>
							</div>
						</div>

						{/* Title & Location Group */}
						<div>
							{/* Title */}
							<h3 className="text-2xl font-semibold text-foreground">
								{shot.title}
							</h3>

							{/* Location Row (Dedicated) */}
							<div className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
								<MapPin size={14} strokeWidth={2.5} className="shrink-0" />
								<span className="truncate font-mono">{shot.location}</span>
							</div>
						</div>

						{/* Footer Actions Row */}
						<div className="flex items-center justify-between gap-4">
							{/* Left: Gear Badge + Checklist */}
							<div className="flex items-center gap-2">
								<button
									onClick={(e) => {
										e.stopPropagation();
										onToggleChecklist(shot.id);
									}}
									className={`h-9 px-3 flex items-center gap-1.5 text-[10px] font-mono  tracking-wider border transition-colors ${isChecklistOpen
										? 'bg-primary text-primary-foreground border-primary'
										: 'bg-secondary/50 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
										}`}
								>
									<span>Checklist</span>
									{isChecklistOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
								</button>

								{/* Gear Badge (Moved from top-right) */}
								{shot.equipmentIds.length > 0 && (
									<div className="flex items-center gap-2 py-1.5 text-primary text-xs font-mono  tracking-wider">
										<Package size={14} strokeWidth={2.5} />
										<span className="hidden sm:inline">Gear {shot.preparedEquipmentIds.length}/{shot.equipmentIds.length}</span>
										<span className="sm:hidden">{shot.preparedEquipmentIds.length}/{shot.equipmentIds.length}</span>
									</div>
								)}
							</div>

							{/* Right: Status Check */}
							<button
								onClick={(e) => { e.stopPropagation(); onToggleStatus(shot.id); }}
								className={`w-9 h-9 flex items-center justify-center border transition-all shrink-0 ${shot.status === 'done'
									? 'bg-primary text-primary-foreground border-primary'
									: 'bg-transparent text-muted-foreground border-border hover:border-primary/30'
									}`}
							>
								<Check size={14} strokeWidth={3} />
							</button>
						</div>

					</div>

					{/* Expanded Checklist */}
					{isChecklistOpen && (
						<div className="mt-6 pt-6 border-t border-border">
							<div className="grid grid-cols-2 gap-2">
								{shot.equipmentIds.map(eId => {
									const equip = inventory.find(e => e.id === eId);
									const isPrepared = shot.preparedEquipmentIds.includes(eId);
									return (
										<button
											key={eId}
											onClick={(e) => { e.stopPropagation(); onToggleEquipment(shot.id, eId); }}
											className={`
												group flex items-center justify-between p-3 text-xs font-mono border text-left transition-all
												${isPrepared
													? 'bg-primary/10 border-primary/30 text-primary'
													: 'bg-secondary/30 border-border text-muted-foreground hover:border-primary/30'
												}
											`}
										>
											<span className="truncate mr-2">{equip?.name || 'Unknown item'}</span>
											<div className={`
												w-4 h-4 flex items-center justify-center border transition-colors
												${isPrepared
													? 'bg-primary border-primary text-primary-foreground'
													: 'border-border group-hover:border-primary/30'
												}
											`}>
												{isPrepared && <Check size={10} strokeWidth={4} />}
											</div>
										</button>
									);
									})}
							</div>
							{shot.equipmentIds.length === 0 && (
								<div className="text-center py-4 text-muted-foreground text-xs font-mono italic">
									No gear assigned to this shot.
								</div>
							)}
						</div>
					)}
				</div>
			</TerminalCard>
		</div>
	);
};
