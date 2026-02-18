import { useCallback, useRef, useEffect } from 'react'
import { Shot } from '@/types'

export function useGearToggle(
  projectId: string,
  updateShot: (params: { id: string; data: Partial<Shot> }) => Promise<unknown>
) {
  // Track which toggles are being processed (shotId -> equipmentIds)
  const pendingRef = useRef<Map<string, Set<string>>>(new Map())

  const toggleGear = useCallback(async (shotId: string, equipmentId: string): Promise<void> => {
    // Check if already processing this specific toggle
    const shotPending = pendingRef.current.get(shotId)
    if (shotPending?.has(equipmentId)) {
      return // Already processing this toggle
    }
    
    // Mark as pending
    if (!pendingRef.current.has(shotId)) {
      pendingRef.current.set(shotId, new Set())
    }
    pendingRef.current.get(shotId)!.add(equipmentId)
    
    try {
      // The actual state calculation is handled by the component calling this
      // We just need to call updateShot which has optimistic update built-in
      await updateShot({
        id: shotId,
        data: { /* preparedEquipmentIds will be calculated by the caller */ }
      })
    } finally {
      // Remove from pending
      pendingRef.current.get(shotId)?.delete(equipmentId)
      if (pendingRef.current.get(shotId)?.size === 0) {
        pendingRef.current.delete(shotId)
      }
    }
  }, [updateShot])

  const isGearPending = useCallback((shotId: string, equipmentId: string): boolean => {
    return pendingRef.current.get(shotId)?.has(equipmentId) || false
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pendingRef.current.clear()
    }
  }, [])

  return { toggleGear, isGearPending }
}
