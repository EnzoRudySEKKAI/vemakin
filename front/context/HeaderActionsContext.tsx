import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

interface HeaderActionsContextType {
  actions: ReactNode;
  setActions: (actions: ReactNode) => void;
  backAction: (() => void) | null;
  setBackAction: (action: (() => void) | null) => void;
  setOnBack: (action: (() => void) | undefined) => void; // Alias for consistency
  detailTitle: string | null;
  setDetailTitle: (title: string | null) => void;
  detailLabel: string | null;
  setDetailLabel: (label: string | null) => void;
  setTitle: (title: string | null) => void; // Alias for consistency
  subtitle: string | null;
  setSubtitle: (subtitle: string | null) => void;
}

const HeaderActionsContext = createContext<HeaderActionsContextType | undefined>(undefined);

export const HeaderActionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [actions, setActions] = useState<ReactNode>(null);
  const [backAction, setBackAction] = useState<(() => void) | null>(null);
  const [detailTitle, setDetailTitle] = useState<string | null>(null);
  const [detailLabel, setDetailLabel] = useState<string | null>(null);
  const [subtitle, setSubtitle] = useState<string | null>(null);

  const setOnBack = useCallback((action: (() => void) | undefined) => {
    setBackAction(() => action || null);
  }, []);

  const value = useMemo(() => ({
    actions,
    setActions,
    backAction,
    setBackAction,
    setOnBack,
    detailTitle,
    setDetailTitle,
    detailLabel,
    setDetailLabel,
    setTitle: setDetailTitle,
    subtitle,
    setSubtitle
  }), [actions, backAction, detailTitle, detailLabel, subtitle, setOnBack]);

  return (
    <HeaderActionsContext.Provider value={value}>
      {children}
    </HeaderActionsContext.Provider>
  );
};

export const useHeaderActions = () => {
  const context = useContext(HeaderActionsContext);
  if (!context) {
    // Return dummy implementation to avoid crashes if provider is missing
    return {
      actions: null,
      setActions: () => { },
      backAction: null,
      setBackAction: () => { },
      setOnBack: () => { },
      detailTitle: null,
      setDetailTitle: () => { },
      detailLabel: null,
      setDetailLabel: () => { },
      setTitle: () => { },
      subtitle: null,
      setSubtitle: () => { }
    };
  }
  return context;
};
