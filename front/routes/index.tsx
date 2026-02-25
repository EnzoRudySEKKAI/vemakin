// Route wrapper components that connect view components to route context
// These allow existing view components to work with the router without major refactoring

import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRouteContext } from '@/hooks/useRouteContext'

// Re-export views with route context integration
export { OverviewRoute } from './OverviewRoute'
export { ShotsRoute } from './ShotsRoute'
export { ShotDetailRoute } from './ShotDetailRoute'
export { InventoryRoute } from './InventoryRoute'
export { EquipmentDetailRoute } from './EquipmentDetailRoute'
export { NotesRoute } from './NotesRoute'
export { NoteDetailRoute } from './NoteDetailRoute'
export { PipelineRoute } from './PipelineRoute'
export { TaskDetailRoute } from './TaskDetailRoute'
export { SettingsRoute } from './SettingsRoute'
export { CustomizationRoute } from './CustomizationRoute'
export { ProjectsRoute } from './ProjectsRoute'
export { ShotFormRoute } from './ShotFormRoute'
export { GearFormRoute } from './GearFormRoute'
export { TaskFormRoute } from './TaskFormRoute'
export { NoteFormRoute } from './NoteFormRoute'
