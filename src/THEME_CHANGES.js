// ─────────────────────────────────────────────────────────────────────────────
// THEME INTEGRATION — make these 5 changes to your existing App.tsx
// ─────────────────────────────────────────────────────────────────────────────

// ── CHANGE 1 ─────────────────────────────────────────────────────────────────
// At the TOP of App.tsx, add this import after the supabase imports:

import { ThemeProvider, ThemeToggle, themeGlobalStyle } from "./Theme";


// ── CHANGE 2 ─────────────────────────────────────────────────────────────────
// Replace the globalStyle constant with this:

const globalStyle = themeGlobalStyle;


// ── CHANGE 3 ─────────────────────────────────────────────────────────────────
// In the Navbar component, add <ThemeToggle /> next to the Sign In / Join Now buttons.
// Find the nav-cta div (the one with Sign In and Join Now) and add ThemeToggle:

// BEFORE:
{user ? (
  <button onClick={()=>setPage("profile")} ...>
    ...
  </button>
) : (
  <div style={{ display:"flex", gap:8, marginLeft:8 }}>
    <Btn size="sm" variant="ghost" onClick={()=>setAuthMode("signin")}>Sign In</Btn>
    <Btn size="sm" onClick={()=>setAuthMode("signup")}>Join Now</Btn>
  </div>
)}

// AFTER — just add <ThemeToggle /> before the user check:
<ThemeToggle />
{user ? (
  <button onClick={()=>setPage("profile")} ...>
    ...
  </button>
) : (
  <div style={{ display:"flex", gap:8, marginLeft:8 }}>
    <Btn size="sm" variant="ghost" onClick={()=>setAuthMode("signin")}>Sign In</Btn>
    <Btn size="sm" onClick={()=>setAuthMode("signup")}>Join Now</Btn>
  </div>
)}


// ── CHANGE 4 ─────────────────────────────────────────────────────────────────
// Replace the color constants at the top of App.tsx with these
// (they now read from CSS variables so they update with the theme):

const ORANGE      = "var(--orange)";
const ORANGE_LIGHT= "var(--orange-light)";
const ORANGE_DARK = "var(--orange-dark)";
const BLUE        = "#0A66C2";
const GRAY50      = "var(--bg2)";
const GRAY100     = "var(--bg3)";
const GRAY200     = "var(--border)";
const GRAY300     = "var(--border2)";
const GRAY400     = "var(--text3)";
const GRAY600     = "var(--text2)";
const GRAY700     = "var(--text2)";
const GRAY800     = "var(--text)";
const GRAY900     = "var(--text)";
const FONT        = "'Plus Jakarta Sans', 'Segoe UI', sans-serif";


// ── CHANGE 5 ─────────────────────────────────────────────────────────────────
// Wrap your entire return() in the App component with ThemeProvider.
// Find the return at the bottom of the App() function:

// BEFORE:
return (
  <>
    <style>{globalStyle}</style>
    <Navbar ... />
    ...
  </>
);

// AFTER:
return (
  <ThemeProvider>
    <style>{globalStyle}</style>
    <Navbar ... />
    ...
  </ThemeProvider>
);
