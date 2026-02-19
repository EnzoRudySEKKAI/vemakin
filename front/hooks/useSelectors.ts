import { useMemo } from 'react'
import { Shot, Note, PostProdTask, PaginatedResponse } from '@/types'

const extractItems = <T>(data: T[] | PaginatedResponse<T> | undefined): T[] => {
  if (!data) return []
  if (Array.isArray(data)) return data
  return data.items || []
}

export const useActiveData = (
  shots: Shot[] | PaginatedResponse<Shot> | undefined,
  notes: Note[] | PaginatedResponse<Note> | undefined,
  tasks: PostProdTask[] | PaginatedResponse<PostProdTask> | undefined
): { shots: Shot[]; notes: Note[]; tasks: PostProdTask[] } => {
  return useMemo(() => ({
    shots: extractItems(shots),
    notes: extractItems(notes),
    tasks: extractItems(tasks)
  }), [shots, notes, tasks])
}

export const useGroupedShots = (shots: Shot[]): Record<string, Shot[]> => {
  return useMemo(() => {
    if (!shots || shots.length === 0) return {}

    const grouped: Record<string, Shot[]> = {}

    shots.forEach(shot => {
      const date = shot.date
      if (!date) return

      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(shot)
    })

    // Sort shots within each date by start time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        const timeA = a.startTime || ''
        const timeB = b.startTime || ''
        return timeA.localeCompare(timeB)
      })
    })

    return grouped
  }, [shots])
}

export const useDynamicDates = (shots: Shot[]): string[] => {
  return useMemo(() => {
    if (!shots || shots.length === 0) return []

    const dateSet = new Set<string>()

    shots.forEach(shot => {
      if (shot.date) {
        dateSet.add(shot.date)
      }
    })

    // Sort dates chronologically
    return Array.from(dateSet).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime()
    })
  }, [shots])
}

export const useProjectProgress = (shots: Shot[]) => {
  return useMemo(() => {
    if (!shots || shots.length === 0) {
      return { total: 0, completed: 0, percentage: 0 }
    }

    const total = shots.length
    const completed = shots.filter(s => s.status === 'done').length
    const percentage = Math.round((completed / total) * 100)

    return { total, completed, percentage }
  }, [shots])
}
