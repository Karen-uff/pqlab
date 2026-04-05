import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type DarkModeCtx = { isDark: boolean; toggle: () => void }

const DarkModeContext = createContext<DarkModeCtx>({ isDark: false, toggle: () => {} })

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('pqlab_dark_mode') === 'true')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('pqlab_dark_mode', String(isDark))
  }, [isDark])

  // Apply on mount (before first paint)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <DarkModeContext.Provider value={{ isDark, toggle: () => setIsDark(p => !p) }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export const useDarkMode = () => useContext(DarkModeContext)
