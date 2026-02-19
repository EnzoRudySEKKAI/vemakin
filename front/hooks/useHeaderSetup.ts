import { useEffect } from 'react'
import { useHeaderActions } from '../context/HeaderActionsContext'

interface UseHeaderSetupOptions {
  title: string
  subtitle?: string
  detailLabel: string
  onBack: () => void
  actions?: React.ReactNode
}

export function useHeaderSetup({
  title,
  subtitle,
  detailLabel,
  onBack,
  actions
}: UseHeaderSetupOptions) {
  const { setActions, setTitle, setSubtitle, setOnBack, setDetailLabel } = useHeaderActions()

  useEffect(() => {
    setTitle(title)
    setSubtitle(subtitle || null)
    setDetailLabel(detailLabel)
    setOnBack(onBack)

    return () => {
      setTitle(null)
      setSubtitle(null)
      setDetailLabel(null)
      setActions(null)
      setOnBack(undefined)
    }
  }, [title, subtitle, detailLabel, onBack, setTitle, setSubtitle, setDetailLabel, setActions, setOnBack])

  useEffect(() => {
    if (actions) {
      setActions(actions)
    }
  }, [actions, setActions])
}
