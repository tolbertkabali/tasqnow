// @ts-nocheck
// ─────────────────────────────────────────────────────────────────────────────
// TASQNOW THEME SYSTEM
// 1. Copy this file to src/Theme.jsx
// 2. In App.tsx, import { ThemeProvider, ThemeToggle, useTheme } from "./Theme"
// 3. Wrap your return in App with <ThemeProvider>...</ThemeProvider>
// 4. Add <ThemeToggle /> inside your Navbar
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "light", toggle: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

const LIGHT = {
  "--bg":          "#ffffff",
  "--bg2":         "#F9FAFB",
  "--bg3":         "#F3F4F6",
  "--card":        "#ffffff",
  "--text":        "#111827",
  "--text2":       "#6B7280",
  "--text3":       "#9CA3AF",
  "--border":      "#E5E7EB",
  "--border2":     "#D1D5DB",
  "--input-bg":    "#ffffff",
  "--nav-bg":      "rgba(255,255,255,0.95)",
  "--shadow":      "0 2px 16px rgba(0,0,0,0.08)",
  "--badge-bg":    "#F3F4F6",
  "--hover":       "#F9FAFB",
  "--orange":      "#F07320",
  "--orange-light":"#FEF0E7",
  "--orange-dark": "#C85A10",
};

const DARK = {
  "--bg":          "#0f1117",
  "--bg2":         "#161b27",
  "--bg3":         "#1e2330",
  "--card":        "#1a1f2e",
  "--text":        "#f1f5f9",
  "--text2":       "#94a3b8",
  "--text3":       "#64748b",
  "--border":      "#2d3348",
  "--border2":     "#374060",
  "--input-bg":    "#1e2330",
  "--nav-bg":      "rgba(15,17,23,0.95)",
  "--shadow":      "0 2px 16px rgba(0,0,0,0.4)",
  "--badge-bg":    "#1e2330",
  "--hover":       "#1e2330",
  "--orange":      "#F07320",
  "--orange-light":"#2a1a0e",
  "--orange-dark": "#f59547",
};

function applyTheme(theme) {
  const vars = theme === "dark" ? DARK : LIGHT;
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  root.setAttribute("data-theme", theme);
  // also set meta theme-color for mobile browsers
  const meta = document.querySelector('meta[name="theme-color"]') || (() => {
    const m = document.createElement("meta");
    m.name = "theme-color";
    document.head.appendChild(m);
    return m;
  })();
  meta.content = theme === "dark" ? "#0f1117" : "#ffffff";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("tasqnow_theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("tasqnow_theme", theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === "light" ? "dark" : "light");

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ── TOGGLE BUTTON ─────────────────────────────────────────────────────────────

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        width: 38, height: 38, borderRadius: "50%",
        background: isDark ? "#1e2330" : "#F3F4F6",
        border: `1.5px solid ${isDark ? "#2d3348" : "#E5E7EB"}`,
        cursor: "pointer", display: "flex", alignItems: "center",
        justifyContent: "center", transition: "all .2s", flexShrink: 0,
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#F07320"}
      onMouseLeave={e => e.currentTarget.style.borderColor = isDark ? "#2d3348" : "#E5E7EB"}
    >
      {isDark ? (
        // Sun icon
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
        </svg>
      ) : (
        // Moon icon
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}

// ── THEME-AWARE CSS ───────────────────────────────────────────────────────────
// Add this to your globalStyle string in App.tsx, replacing the existing one

export const themeGlobalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { transition: background-color .2s, color .2s; }

  body {
    font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
    background: var(--bg);
    color: var(--text);
    transition: background-color .2s, color .2s;
  }

  input, button, textarea, select {
    font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* Global theme overrides — applied automatically via CSS variables */
  input, textarea, select {
    background: var(--input-bg) !important;
    color: var(--text) !important;
    border-color: var(--border) !important;
  }

  input::placeholder, textarea::placeholder {
    color: var(--text3) !important;
  }

  /* Smooth theme transitions on key elements */
  nav, .card, input, textarea, select, button {
    transition: background-color .2s, border-color .2s, color .2s;
  }
`;
