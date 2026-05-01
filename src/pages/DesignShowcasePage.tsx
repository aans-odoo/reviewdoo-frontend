import { useState } from "react";
import {
  Search, Bell, Mail, Settings, ChevronDown, Plus, Trash2, Edit,
  Check, X, AlertTriangle, Info, CheckCircle, XCircle,
  Home, Users, BookOpen, ClipboardCheck, ScrollText, Brain,
  Sparkles, UserCog, MoreHorizontal, ArrowUpDown, Filter,
  Eye, Download, Upload, RefreshCw, Star, Heart, Zap,
  Shield, Lock, Unlock, Globe, Moon, Sun,
} from "lucide-react";

// ─── V2 Design Tokens (inline for showcase isolation) ───────────────────────
const v2 = {
  // Backgrounds — pure dark with subtle warm undertone matching bgCard
  body:      "#030203",       // darkest — the page body behind everything
  bg:        "#070607",       // main app background
  bgCard:    "#130f13",       // card / sidebar / navbar surfaces
  bgElevated:"#151215",      // elevated elements (inputs, dropdowns)
  bgHover:   "#1d191d",      // hover states
  border:    "rgba(255,255,255,0.08)",
  borderLight:"rgba(255,255,255,0.13)",
  // Text
  text:      "#f4f3f5",
  textMuted: "#b5b0b8",
  textDim:   "#7e7a82",
  // Purple — warm mauve-violet inspired by Odoo, tuned to pop on dark
  purple:    "#b560ad",       // primary actions (bumped brightness)
  purpleLight:"#d090c6",     // hover / lighter variant
  purpleDark:"#8a4082",      // pressed / darker variant
  purpleMuted:"rgba(181,96,173,0.12)", // subtle tinted backgrounds
  // Accent colors
  orange:    "#faa61a",
  orangeLight:"#fcc63a",
  green:     "#2dd468",
  red:       "#d43d5e",
  blue:      "#4a8ff7",
  cyan:      "#0ec5e2",
  // Radii
  radius:    "12px",
  radiusSm:  "8px",
  radiusLg:  "16px",
  radiusXl:  "20px",
  radiusFull:"9999px",
  // Shadows
  shadow:    "0 4px 24px rgba(0,0,0,0.5)",
  shadowLg:  "0 8px 40px rgba(0,0,0,0.6)",
  // Gradients
  gradientPurple: "linear-gradient(135deg, #b560ad, #8a4082)",
  gradientOrange: "linear-gradient(135deg, #faa61a, #ea580c)",
  gradientMixed:  "linear-gradient(135deg, #b560ad, #faa61a)",
  gradientCard:   "linear-gradient(135deg, rgba(181,96,173,0.12), rgba(250,166,26,0.06))",
  font:      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

// ─── Reusable style helpers ─────────────────────────────────────────────────
const sectionStyle: React.CSSProperties = {
  marginBottom: "48px",
};

const sectionTitle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "1.5px",
  color: v2.textMuted,
  marginBottom: "20px",
  paddingBottom: "12px",
  borderBottom: `1px solid ${v2.border}`,
};

const row: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: "12px",
  alignItems: "center",
};

const cardBase: React.CSSProperties = {
  background: v2.bgCard,
  border: `1px solid ${v2.border}`,
  borderRadius: v2.radius,
  padding: "24px",
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function ShowcaseButton({ children, variant = "primary", size = "md", icon: Icon, disabled = false }: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline" | "gradient";
  size?: "sm" | "md" | "lg" | "icon";
  icon?: React.ComponentType<{ size?: number }>;
  disabled?: boolean;
}) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontFamily: v2.font,
    fontWeight: 500,
    borderRadius: v2.radiusFull,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "all 0.2s ease",
    border: "none",
    outline: "none",
    whiteSpace: "nowrap" as const,
  };

  const sizes: Record<string, React.CSSProperties> = {
    sm: { fontSize: "13px", padding: "6px 14px", height: "32px" },
    md: { fontSize: "14px", padding: "8px 20px", height: "38px" },
    lg: { fontSize: "15px", padding: "10px 28px", height: "44px" },
    icon: { fontSize: "14px", padding: "8px", height: "38px", width: "38px", borderRadius: "50%" },
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: { background: v2.gradientPurple, color: "#fff" },
    secondary: { background: v2.bgElevated, color: v2.text, border: `1px solid ${v2.border}` },
    ghost: { background: "transparent", color: v2.textMuted },
    destructive: { background: v2.red, color: "#fff" },
    outline: { background: "transparent", color: v2.text, border: `1px solid ${v2.borderLight}` },
    gradient: { background: v2.gradientMixed, color: "#fff" },
  };

  return (
    <button style={{ ...base, ...sizes[size], ...variants[variant] }} disabled={disabled}>
      {Icon && <Icon size={size === "sm" ? 14 : 16} />}
      {size !== "icon" && children}
    </button>
  );
}

function ShowcaseInput({ placeholder, label, type = "text", icon: Icon, error }: {
  placeholder?: string;
  label?: string;
  type?: string;
  icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  error?: string;
}) {
  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: "44px",
    background: v2.bgElevated,
    border: `1px solid ${error ? v2.red : v2.border}`,
    borderRadius: "10px",
    padding: Icon ? "8px 14px 8px 40px" : "8px 14px",
    color: v2.text,
    fontSize: "14px",
    fontFamily: v2.font,
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: "220px" }}>
      {label && <label style={{ fontSize: "13px", fontWeight: 500, color: v2.textMuted }}>{label}</label>}
      <div style={{ position: "relative" }}>
        {Icon && (
          <Icon size={16} style={{ position: "absolute", left: "14px", top: "14px", color: v2.textDim }} />
        )}
        <input type={type} placeholder={placeholder} style={inputStyle} readOnly />
      </div>
      {error && <span style={{ fontSize: "12px", color: v2.red }}>{error}</span>}
    </div>
  );
}

function ShowcaseBadge({ children, variant = "default" }: {
  children: React.ReactNode;
  variant?: "default" | "purple" | "orange" | "green" | "red" | "blue" | "outline";
}) {
  const variants: Record<string, React.CSSProperties> = {
    default: { background: v2.bgElevated, color: v2.text, border: `1px solid ${v2.border}` },
    purple: { background: "rgba(181,96,173,0.15)", color: v2.purpleLight, border: `1px solid rgba(181,96,173,0.3)` },
    orange: { background: "rgba(245,158,11,0.15)", color: v2.orangeLight, border: `1px solid rgba(245,158,11,0.3)` },
    green: { background: "rgba(34,197,94,0.15)", color: v2.green, border: `1px solid rgba(34,197,94,0.3)` },
    red: { background: "rgba(239,68,68,0.15)", color: v2.red, border: `1px solid rgba(239,68,68,0.3)` },
    blue: { background: "rgba(59,130,246,0.15)", color: v2.blue, border: `1px solid rgba(59,130,246,0.3)` },
    outline: { background: "transparent", color: v2.textMuted, border: `1px solid ${v2.borderLight}` },
  };

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 10px",
      borderRadius: v2.radiusFull,
      fontSize: "12px",
      fontWeight: 600,
      fontFamily: v2.font,
      ...variants[variant],
    }}>
      {children}
    </span>
  );
}

function ShowcaseAlert({ variant, title, message }: {
  variant: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
}) {
  const config = {
    info:    { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.25)", color: v2.blue, Icon: Info },
    success: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)", color: v2.green, Icon: CheckCircle },
    warning: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", color: v2.orange, Icon: AlertTriangle },
    error:   { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)", color: v2.red, Icon: XCircle },
  };
  const c = config[variant];

  return (
    <div style={{
      display: "flex", gap: "12px", padding: "14px 16px",
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: v2.radiusSm, alignItems: "flex-start",
    }}>
      <c.Icon size={18} style={{ color: c.color, flexShrink: 0, marginTop: "1px" }} />
      <div>
        <div style={{ fontSize: "14px", fontWeight: 600, color: c.color, marginBottom: "2px" }}>{title}</div>
        <div style={{ fontSize: "13px", color: v2.textMuted }}>{message}</div>
      </div>
    </div>
  );
}

function ShowcaseSelect({ label, options, placeholder }: {
  label?: string;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: "180px" }}>
      {label && <label style={{ fontSize: "13px", fontWeight: 500, color: v2.textMuted }}>{label}</label>}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "44px", background: v2.bgElevated, border: `1px solid ${v2.border}`,
        borderRadius: "10px", padding: "8px 14px", cursor: "pointer",
      }}>
        <span style={{ fontSize: "14px", color: v2.textMuted }}>{placeholder || options[0]}</span>
        <ChevronDown size={16} style={{ color: v2.textDim }} />
      </div>
    </div>
  );
}

function ShowcaseToggle({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{
        width: "44px", height: "24px", borderRadius: "12px",
        background: checked ? v2.purple : v2.bgElevated,
        border: `1px solid ${checked ? v2.purple : v2.border}`,
        position: "relative", cursor: "pointer", transition: "all 0.2s",
      }}>
        <div style={{
          width: "18px", height: "18px", borderRadius: "50%",
          background: "#fff", position: "absolute", top: "2px",
          left: checked ? "22px" : "2px", transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }} />
      </div>
      <span style={{ fontSize: "14px", color: v2.text }}>{label}</span>
    </div>
  );
}

function ShowcaseAvatar({ name, size = 40, src }: { name: string; size?: number; src?: string }) {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: src ? `url(${src}) center/cover` : v2.gradientPurple,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 600, color: "#fff",
      fontFamily: v2.font, border: `2px solid ${v2.border}`,
    }}>
      {!src && initials}
    </div>
  );
}

function ShowcaseTooltip({ children, text }: { children: React.ReactNode; text: string }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "50%",
          transform: "translateX(-50%)", padding: "6px 12px",
          background: v2.bgElevated, border: `1px solid ${v2.border}`,
          borderRadius: "6px", fontSize: "12px", color: v2.text,
          whiteSpace: "nowrap", boxShadow: v2.shadow, zIndex: 10,
        }}>
          {text}
        </div>
      )}
    </div>
  );
}

function ShowcaseProgress({ value, color = v2.purple }: { value: number; color?: string }) {
  return (
    <div style={{
      width: "100%", height: "6px", background: v2.bgElevated,
      borderRadius: "3px", overflow: "hidden",
    }}>
      <div style={{
        width: `${value}%`, height: "100%",
        background: color, borderRadius: "3px",
        transition: "width 0.3s ease",
      }} />
    </div>
  );
}

function ShowcaseCheckbox({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
      <div style={{
        width: "20px", height: "20px", borderRadius: "4px",
        background: checked ? v2.purple : "transparent",
        border: `2px solid ${checked ? v2.purple : v2.borderLight}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s",
      }}>
        {checked && <Check size={14} style={{ color: "#fff" }} />}
      </div>
      <span style={{ fontSize: "14px", color: v2.text }}>{label}</span>
    </div>
  );
}

function ShowcaseRadio({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
      <div style={{
        width: "20px", height: "20px", borderRadius: "50%",
        border: `2px solid ${checked ? v2.purple : v2.borderLight}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s",
      }}>
        {checked && <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: v2.purple }} />}
      </div>
      <span style={{ fontSize: "14px", color: v2.text }}>{label}</span>
    </div>
  );
}

// ─── Main Showcase Page ─────────────────────────────────────────────────────
export function DesignShowcasePage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div style={{
      minHeight: "100vh",
      background: v2.body,
      color: v2.text,
      fontFamily: v2.font,
      padding: "8px",
    }}>
      {/* Floating layout — sidebar + right column with gaps */}
      <div style={{ display: "flex", minHeight: "calc(100vh - 16px)", gap: "8px" }}>

        {/* ── Sidebar Preview ── */}
        <aside style={{
          width: "260px", flexShrink: 0,
          background: v2.bgCard,
          borderRadius: v2.radiusXl,
          border: `1px solid ${v2.border}`,
          display: "flex", flexDirection: "column",
          height: "calc(100vh - 16px)", position: "sticky", top: "8px",
          overflow: "hidden",
        }}>
          {/* Logo area */}
          <div style={{
            padding: "20px 20px 16px",
            borderBottom: `1px solid ${v2.border}`,
            display: "flex", alignItems: "center", gap: "12px",
          }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: v2.radiusSm,
              background: v2.gradientPurple,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Zap size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: v2.text }}>Reviewdoo</div>
              <div style={{ fontSize: "11px", color: v2.textDim }}>v2 Design System</div>
            </div>
          </div>

          {/* Search */}
          <div style={{ padding: "16px 16px 8px" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: v2.bgElevated, borderRadius: "10px",
              padding: "10px 12px", border: `1px solid ${v2.border}`,
            }}>
              <Search size={14} style={{ color: v2.textDim }} />
              <span style={{ fontSize: "13px", color: v2.textDim }}>Search...</span>
            </div>
          </div>

          {/* Nav items */}
          <nav style={{ flex: 1, padding: "8px 12px", display: "flex", flexDirection: "column", gap: "2px" }}>
            {[
              { icon: Home, label: "Dashboard", active: false },
              { icon: ClipboardCheck, label: "Checklist Items", active: true },
              { icon: BookOpen, label: "Guidelines", active: false },
              { icon: Users, label: "Authors", active: false },
              { icon: ScrollText, label: "Ingestion Logs", active: false },
              { icon: Brain, label: "AI Config", active: false },
              { icon: Sparkles, label: "Prompt Generator", active: false },
            ].map((item) => (
              <div key={item.label} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 12px", borderRadius: v2.radiusSm,
                background: item.active ? v2.purpleMuted : "transparent",
                color: item.active ? v2.purpleLight : v2.textMuted,
                cursor: "pointer", fontSize: "14px", fontWeight: item.active ? 500 : 400,
                transition: "all 0.15s",
              }}>
                <item.icon size={18} />
                {item.label}
                {item.label === "Checklist Items" && (
                  <span style={{
                    marginLeft: "auto", fontSize: "11px", fontWeight: 600,
                    background: v2.purpleMuted, color: v2.purpleLight,
                    padding: "1px 8px", borderRadius: v2.radiusFull,
                  }}>24</span>
                )}
              </div>
            ))}

            <div style={{ borderTop: `1px solid ${v2.border}`, margin: "12px 0" }} />
            <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: v2.textDim, padding: "4px 12px", marginBottom: "4px" }}>
              Admin
            </div>
            {[
              { icon: UserCog, label: "User Management" },
              { icon: Mail, label: "SMTP Config" },
              { icon: Shield, label: "Security" },
            ].map((item) => (
              <div key={item.label} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "9px 12px", borderRadius: v2.radiusSm,
                color: v2.textMuted, cursor: "pointer", fontSize: "14px",
              }}>
                <item.icon size={18} />
                {item.label}
              </div>
            ))}
          </nav>

          {/* User area */}
          <div style={{
            padding: "16px", borderTop: `1px solid ${v2.border}`,
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <ShowcaseAvatar name="John Doe" size={34} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: 500, color: v2.text }}>John Doe</div>
              <div style={{ fontSize: "11px", color: v2.textDim }}>Admin</div>
            </div>
            <Settings size={16} style={{ color: v2.textDim, cursor: "pointer" }} />
          </div>
        </aside>

        {/* ── Main Content ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
          {/* Header Preview — floating rounded card */}
          <header style={{
            height: "60px", display: "flex", alignItems: "center",
            justifyContent: "space-between", padding: "0 24px",
            background: v2.bgCard, borderRadius: v2.radiusXl,
            border: `1px solid ${v2.border}`,
            flexShrink: 0,
          }}>
            <div style={{ fontSize: "18px", fontWeight: 600 }}>Design System v2</div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <ShowcaseTooltip text="Notifications">
                <div style={{ position: "relative", cursor: "pointer" }}>
                  <Bell size={20} style={{ color: v2.textMuted }} />
                  <div style={{
                    position: "absolute", top: "-2px", right: "-2px",
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: v2.red, border: `2px solid ${v2.bgCard}`,
                  }} />
                </div>
              </ShowcaseTooltip>
              <div style={{ width: "1px", height: "24px", background: v2.border }} />
              <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                <ShowcaseAvatar name="John Doe" size={30} />
                <span style={{ fontSize: "14px", fontWeight: 500 }}>John Doe</span>
                <ChevronDown size={14} style={{ color: v2.textDim }} />
              </div>
            </div>
          </header>

          {/* Content — floating rounded card */}
          <div style={{
            flex: 1, overflow: "auto",
            background: v2.bgCard, borderRadius: v2.radiusXl,
            border: `1px solid ${v2.border}`,
          }}>
          <div style={{ padding: "40px 32px", maxWidth: "1200px" }}>

            {/* ── Design System Rules & Guidelines ── */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>Design System Rules & Guidelines</div>

              {/* Critical Rules */}
              <div style={{
                ...cardBase, marginBottom: "16px",
                borderLeft: `3px solid ${v2.purple}`,
              }}>
                <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: v2.purple }}>
                  Critical Implementation Rules
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px", lineHeight: "1.6" }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <span style={{ color: v2.red, fontWeight: 700, flexShrink: 0 }}>1.</span>
                    <span><strong style={{ color: v2.text }}>NEVER use custom hex colors or Tailwind default colors.</strong> <span style={{ color: v2.textMuted }}>Always reference theme tokens (CSS variables or the v2 design tokens). If a color you need does not exist in the theme, add it to the theme first, then use the token. No inline hex values, no bg-red-500, no text-gray-400.</span></span>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <span style={{ color: v2.red, fontWeight: 700, flexShrink: 0 }}>2.</span>
                    <span><strong style={{ color: v2.text }}>All colors must come from the design token system.</strong> <span style={{ color: v2.textMuted }}>This includes backgrounds, text, borders, shadows, and gradients. Use CSS variables like var(--v2-bg-card) or Tailwind classes mapped to theme tokens like bg-card, text-muted-foreground, etc.</span></span>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <span style={{ color: v2.red, fontWeight: 700, flexShrink: 0 }}>3.</span>
                    <span><strong style={{ color: v2.text }}>If a color is missing, extend the theme — never work around it.</strong> <span style={{ color: v2.textMuted }}>Add the new token to globals.css and tailwind.config.ts so it is available everywhere. Document it in this design system page.</span></span>
                  </div>
                </div>
              </div>

              {/* Color Usage Rules */}
              <div style={{
                ...cardBase, marginBottom: "16px",
              }}>
                <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "14px" }}>
                  Color Usage
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", color: v2.textMuted, lineHeight: "1.7" }}>
                  <div>• <strong style={{ color: v2.text }}>body</strong> — Page canvas behind all panels. The darkest tone. Used on the root html/body.</div>
                  <div>• <strong style={{ color: v2.text }}>bg</strong> — Main app background. Slightly lighter than body. Rarely used directly since panels sit on body.</div>
                  <div>• <strong style={{ color: v2.text }}>bgCard</strong> — Primary surface color for sidebar, navbar, content cards, modals, and all floating panels.</div>
                  <div>• <strong style={{ color: v2.text }}>bgElevated</strong> — Inputs, dropdowns, select triggers, textareas, code blocks, and any element that sits on top of a card.</div>
                  <div>• <strong style={{ color: v2.text }}>bgHover</strong> — Hover state for interactive elements on cards (table rows, sidebar items, dropdown items).</div>
                  <div>• <strong style={{ color: v2.text }}>border / borderLight</strong> — Subtle white-opacity borders. Use border (0.06) for most dividers, borderLight (0.10) for elements that need more definition.</div>
                  <div>• <strong style={{ color: v2.text }}>purple</strong> — Primary action color. Buttons, active nav items, links, focus rings, primary badges.</div>
                  <div>• <strong style={{ color: v2.text }}>purpleLight</strong> — Hover states on purple elements, lighter text accents, active sidebar text.</div>
                  <div>• <strong style={{ color: v2.text }}>purpleDark</strong> — Pressed/active states, gradient endpoints.</div>
                  <div>• <strong style={{ color: v2.text }}>purpleMuted</strong> — Very subtle purple tint for active sidebar backgrounds, selected row highlights.</div>
                  <div>• <strong style={{ color: v2.text }}>red</strong> — Destructive actions, error states, failed badges. Use sparingly.</div>
                  <div>• <strong style={{ color: v2.text }}>green / blue / orange / cyan</strong> — Status indicators, badges, progress bars. Not for primary UI chrome.</div>
                </div>
              </div>

              {/* Typography Rules */}
              <div style={{
                ...cardBase, marginBottom: "16px",
              }}>
                <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "14px" }}>
                  Typography
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", color: v2.textMuted, lineHeight: "1.7" }}>
                  <div>• Font family is Inter. Always use the theme font stack, never set font-family manually.</div>
                  <div>• <strong style={{ color: v2.text }}>text</strong> — Primary content, headings, important labels. High contrast on dark backgrounds.</div>
                  <div>• <strong style={{ color: v2.text }}>textMuted</strong> — Secondary content, descriptions, helper text, table column headers, sidebar inactive items.</div>
                  <div>• <strong style={{ color: v2.text }}>textDim</strong> — Tertiary content, timestamps, metadata, placeholders, disabled text.</div>
                  <div>• Never use white (#fff) or black (#000) for text. Always use the theme text tokens.</div>
                  <div>• Heading sizes: 36/28/22/18px. Body: 14-15px. Small: 13px. Caption: 12px. Overline: 11px uppercase.</div>
                </div>
              </div>

              {/* Component Rules */}
              <div style={{
                ...cardBase, marginBottom: "16px",
              }}>
                <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "14px" }}>
                  Component Rules
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", color: v2.textMuted, lineHeight: "1.7" }}>
                  <div>• <strong style={{ color: v2.text }}>Buttons</strong> — Always fully rounded (border-radius: 9999px / pill shape). Primary uses gradientPurple. Destructive uses red. Secondary uses bgElevated with border.</div>
                  <div>• <strong style={{ color: v2.text }}>Inputs / Selects / Textareas</strong> — Height 44px, border-radius 10px, bgElevated background, border color from theme. Never use browser default styles.</div>
                  <div>• <strong style={{ color: v2.text }}>Cards</strong> — border-radius 12px (radius token), bgCard background, 1px border using border token. Padding 24px.</div>
                  <div>• <strong style={{ color: v2.text }}>Sidebar / Navbar / Main Content</strong> — Floating rounded panels (border-radius: 20px / radiusXl) on the body background with 8px gaps between them.</div>
                  <div>• <strong style={{ color: v2.text }}>Badges</strong> — Fully rounded (radiusFull). Use semantic color variants (green for success, red for error, etc.) with low-opacity backgrounds and matching borders.</div>
                  <div>• <strong style={{ color: v2.text }}>Dialogs / Modals</strong> — border-radius 16px (radiusLg), bgElevated background, shadow-lg. Always include a close button.</div>
                  <div>• <strong style={{ color: v2.text }}>Tables</strong> — bgCard background, border token for row dividers. Header text uses textDim, uppercase, 12px. Hover rows use bgHover.</div>
                  <div>• <strong style={{ color: v2.text }}>Dropdowns</strong> — bgElevated background, border, shadow, border-radius 8px. Items have 4px border-radius on hover.</div>
                  <div>• <strong style={{ color: v2.text }}>Toggles / Checkboxes / Radios</strong> — Active/checked state uses purple. Unchecked uses bgElevated with border.</div>
                  <div>• <strong style={{ color: v2.text }}>Alerts</strong> — Low-opacity semantic color backgrounds with matching border and icon. border-radius 8px.</div>
                  <div>• <strong style={{ color: v2.text }}>Toasts</strong> — bgElevated background, border, shadow. Positioned bottom-right.</div>
                </div>
              </div>

              {/* Layout Rules */}
              <div style={{
                ...cardBase,
              }}>
                <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "14px" }}>
                  Layout & Spacing
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px", color: v2.textMuted, lineHeight: "1.7" }}>
                  <div>• <strong style={{ color: v2.text }}>Page structure</strong> — Body (darkest) → floating panels (sidebar, header, content) with 8px gaps. Panels use bgCard with radiusXl and 1px border.</div>
                  <div>• <strong style={{ color: v2.text }}>Sidebar</strong> — Fixed 260px width, sticky, full viewport height minus body padding. Rounded corners all sides.</div>
                  <div>• <strong style={{ color: v2.text }}>Header</strong> — 60px height, same bgCard surface, rounded, sits at top of the right column.</div>
                  <div>• <strong style={{ color: v2.text }}>Content area</strong> — Fills remaining space, scrollable, rounded, bgCard surface. Inner padding 24-32px.</div>
                  <div>• <strong style={{ color: v2.text }}>Spacing scale</strong> — Use 4/8/12/16/20/24/32/40/48px. Prefer consistent gaps. Section spacing: 48px. Card padding: 24px. Element gaps: 8-16px.</div>
                  <div>• <strong style={{ color: v2.text }}>Border radius scale</strong> — sm: 8px, md: 12px, lg: 16px, xl: 20px, full: 9999px. Inputs: 10px. Buttons: full. Cards: 12px. Panels: 20px.</div>
                  <div>• <strong style={{ color: v2.text }}>Shadows</strong> — Use sparingly. Default shadow for dropdowns/toasts. Large shadow for modals. No shadows on cards within the main content (borders are enough).</div>
                  <div>• <strong style={{ color: v2.text }}>Responsive</strong> — Sidebar collapses on mobile. Content takes full width. Maintain the floating panel aesthetic with reduced gaps on smaller screens.</div>
                </div>
              </div>
            </div>

            {/* ── Color Palette ── */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>Color Palette</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px" }}>
                {[
                  { name: "Background", color: v2.bg },
                  { name: "Card", color: v2.bgCard },
                  { name: "Elevated", color: v2.bgElevated },
                  { name: "Hover", color: v2.bgHover },
                  { name: "Purple", color: v2.purple },
                  { name: "Purple Light", color: v2.purpleLight },
                  { name: "Orange", color: v2.orange },
                  { name: "Green", color: v2.green },
                  { name: "Red", color: v2.red },
                  { name: "Blue", color: v2.blue },
                  { name: "Cyan", color: v2.cyan },
                  { name: "Text", color: v2.text },
                  { name: "Text Muted", color: v2.textMuted },
                  { name: "Text Dim", color: v2.textDim },
                ].map((c) => (
                  <div key={c.name} style={{
                    background: v2.bgCard, border: `1px solid ${v2.border}`,
                    borderRadius: v2.radiusSm, overflow: "hidden",
                  }}>
                    <div style={{ height: "56px", background: c.color, borderBottom: `1px solid ${v2.border}` }} />
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: v2.text }}>{c.name}</div>
                      <div style={{ fontSize: "11px", color: v2.textDim, fontFamily: "monospace" }}>{c.color}</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Gradients */}
              <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {[
                  { name: "Purple Gradient", bg: v2.gradientPurple },
                  { name: "Orange Gradient", bg: v2.gradientOrange },
                  { name: "Mixed Gradient", bg: v2.gradientMixed },
                ].map((g) => (
                  <div key={g.name} style={{
                    height: "60px", borderRadius: v2.radiusSm,
                    background: g.bg, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "13px", fontWeight: 600, color: "#fff",
                  }}>
                    {g.name}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Typography ── */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>Typography</div>
              <div style={{ ...cardBase, display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ fontSize: "36px", fontWeight: 700, color: v2.text, letterSpacing: "-0.5px" }}>
                  Heading 1 — Display
                </div>
                <div style={{ fontSize: "28px", fontWeight: 700, color: v2.text, letterSpacing: "-0.3px" }}>
                  Heading 2 — Page Title
                </div>
                <div style={{ fontSize: "22px", fontWeight: 600, color: v2.text }}>
                  Heading 3 — Section Title
                </div>
                <div style={{ fontSize: "18px", fontWeight: 600, color: v2.text }}>
                  Heading 4 — Card Title
                </div>
                <div style={{ fontSize: "15px", fontWeight: 500, color: v2.text }}>
                  Body Large — Primary content text
                </div>
                <div style={{ fontSize: "14px", color: v2.text }}>
                  Body — Standard paragraph text used throughout the interface for descriptions and content.
                </div>
                <div style={{ fontSize: "13px", color: v2.textMuted }}>
                  Body Small — Secondary text, descriptions, and helper text
                </div>
                <div style={{ fontSize: "12px", color: v2.textDim }}>
                  Caption — Timestamps, metadata, and fine print
                </div>
                <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px", color: v2.textDim }}>
                  Overline — Section labels and categories
                </div>
                <div style={{ fontSize: "14px", fontFamily: "monospace", color: v2.purpleLight, background: v2.bgElevated, padding: "8px 12px", borderRadius: v2.radiusSm, display: "inline-block" }}>
                  Monospace — Code and technical values
                </div>
              </div>
            </div>

            {/* ── Buttons ── */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>Buttons</div>
              <div style={{ ...cardBase, display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <div style={{ fontSize: "13px", color: v2.textDim, marginBottom: "10px" }}>Variants</div>
                  <div style={row}>
                    <ShowcaseButton variant="primary">Primary</ShowcaseButton>
                    <ShowcaseButton variant="secondary">Secondary</ShowcaseButton>
                    <ShowcaseButton variant="outline">Outline</ShowcaseButton>
                    <ShowcaseButton variant="ghost">Ghost</ShowcaseButton>
                    <ShowcaseButton variant="destructive">Destructive</ShowcaseButton>
                    <ShowcaseButton variant="gradient">Gradient</ShowcaseButton>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "13px", color: v2.textDim, marginBottom: "10px" }}>Sizes</div>
                  <div style={row}>
                    <ShowcaseButton variant="primary" size="sm">Small</ShowcaseButton>
                    <ShowcaseButton variant="primary" size="md">Medium</ShowcaseButton>
                    <ShowcaseButton variant="primary" size="lg">Large</ShowcaseButton>
                    <ShowcaseButton variant="primary" size="icon" icon={Plus}>{""}</ShowcaseButton>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "13px", color: v2.textDim, marginBottom: "10px" }}>With Icons</div>
                  <div style={row}>
                    <ShowcaseButton variant="primary" icon={Plus}>Add New</ShowcaseButton>
                    <ShowcaseButton variant="secondary" icon={Download}>Export</ShowcaseButton>
                    <ShowcaseButton variant="outline" icon={Upload}>Import</ShowcaseButton>
                    <ShowcaseButton variant="ghost" icon={RefreshCw}>Refresh</ShowcaseButton>
                    <ShowcaseButton variant="destructive" icon={Trash2}>Delete</ShowcaseButton>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "13px", color: v2.textDim, marginBottom: "10px" }}>Disabled</div>
                  <div style={row}>
                    <ShowcaseButton variant="primary" disabled>Disabled Primary</ShowcaseButton>
                    <ShowcaseButton variant="secondary" disabled>Disabled Secondary</ShowcaseButton>
                    <ShowcaseButton variant="outline" disabled>Disabled Outline</ShowcaseButton>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Form Elements ── */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>Form Elements</div>
              <div style={{ ...cardBase, display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                  <ShowcaseInput label="Email" placeholder="john@example.com" icon={Mail} />
                  <ShowcaseInput label="Password" placeholder="Enter password" type="password" icon={Lock} />
                  <ShowcaseInput label="With Error" placeholder="Invalid input" error="This field is required" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                  <ShowcaseSelect label="Status" options={["Active", "Inactive", "Pending"]} placeholder="Select status" />
                  <ShowcaseSelect label="Role" options={["Admin", "Editor", "Viewer"]} placeholder="Select role" />
                  <ShowcaseSelect label="Priority" options={["High", "Medium", "Low"]} placeholder="Select priority" />
                </div>
                <div>
                  <div style={{ fontSize: "13px", color: v2.textDim, marginBottom: "12px" }}>Textarea</div>
                  <textarea
                    placeholder="Enter a description..."
                    rows={3}
                    readOnly
                    style={{
                      width: "100%", background: v2.bgElevated,
                      border: `1px solid ${v2.border}`, borderRadius: "10px",
                      padding: "12px 14px", color: v2.text, fontSize: "14px",
                      fontFamily: v2.font, outline: "none", resize: "vertical",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: "40px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ fontSize: "13px", color: v2.textDim }}>Toggles</div>
                    <ShowcaseToggle label="Dark mode" checked={true} />
                    <ShowcaseToggle label="Notifications" checked={false} />
                    <ShowcaseToggle label="Auto-save" checked={true} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ fontSize: "13px", color: v2.textDim }}>Checkboxes</div>
                    <ShowcaseCheckbox label="Remember me" checked={true} />
                    <ShowcaseCheckbox label="Send notifications" checked={false} />
                    <ShowcaseCheckbox label="Accept terms" checked={true} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ fontSize: "13px", color: v2.textDim }}>Radio Buttons</div>
                    <ShowcaseRadio label="Option A" checked={true} />
                    <ShowcaseRadio label="Option B" checked={false} />
                    <ShowcaseRadio label="Option C" checked={false} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Badges & Tags ── */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>Badges & Tags</div>
              <div style={{ ...cardBase, display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "13px", color: v2.textDim, marginBottom: "10px" }}>Status Badges</div>
                  <div style={row}>
                    <ShowcaseBadge variant="green">Completed</ShowcaseBadge>
                    <ShowcaseBadge variant="blue">Running</ShowcaseBadge>
                    <ShowcaseBadge variant="orange">Pending</ShowcaseBadge>
                    <ShowcaseBadge variant="red">Failed</ShowcaseBadge>
                    <ShowcaseBadge variant="purple">Processing</ShowcaseBadge>
                    <ShowcaseBadge variant="default">Draft</ShowcaseBadge>
                    <ShowcaseBadge variant="outline">Archived</ShowcaseBadge>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "13px", color: v2.textDim, marginBottom: "10px" }}>Tags (like #EVENTS, #TEST from reference)</div>
                  <div style={row}>
                    {["#EVENTS", "#TEST", "#URGENT", "#FEATURE", "#BUG"].map((tag, i) => (
                      <span key={tag} style={{
                        padding: "4px 12px", borderRadius: v2.radiusFull,
                        fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px",
                        background: [v2.gradientPurple, v2.gradientOrange, v2.red, "linear-gradient(135deg, #22c55e, #16a34a)", "linear-gradient(135deg, #3b82f6, #2563eb)"][i],
                        color: "#fff",
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Alerts ── */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>Alerts & Notifications</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <ShowcaseAlert variant="info" title="Information" message="A new version of the application is available for update." />
                <ShowcaseAlert variant="success" title="Success" message="Your changes have been saved successfully." />
                <ShowcaseAlert variant="warning" title="Warning" message="Your API key will expire in 3 days. Please renew it." />
                <ShowcaseAlert variant="error" title="Error" message="Failed to connect to the database. Please check your configuration." />
              </div>
            </div>

            {/* ── Cards ── */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>Cards</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {/* Standard Card */}
                <div style={cardBase}>
                  <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>Standard Card</div>
                  <div style={{ fontSize: "13px", color: v2.textMuted, marginBottom: "16px" }}>
                    Basic card with border and subtle background. Used for most content containers.
                  </div>
                  <ShowcaseButton variant="primary" size="sm">Action</ShowcaseButton>
                </div>

                {/* Gradient Card (like the highlighted email in reference) */}
                <div style={{
                  background: v2.gradientCard,
                  border: `1px solid rgba(181,96,173,0.2)`,
                  borderRadius: v2.radius, padding: "24px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <ShowcaseAvatar name="Leyton Graves" size={36} />
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600 }}>Leyton Graves</div>
                      <div style={{ fontSize: "12px", color: v2.textMuted }}>2 hours ago</div>
                    </div>
                    <span style={{
                      marginLeft: "auto", padding: "3px 10px", borderRadius: v2.radiusFull,
                      background: v2.gradientPurple, fontSize: "11px", fontWeight: 700, color: "#fff",
                    }}>#EVENTS</span>
                  </div>
                  <div style={{ fontSize: "13px", color: v2.textMuted }}>
                    Hello, help me with email configuration...
                  </div>
                </div>

                {/* Stat Card */}
                <div style={{
                  ...cardBase,
                  display: "flex", flexDirection: "column", gap: "12px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "13px", color: v2.textMuted }}>Total Items</div>
                    <ClipboardCheck size={18} style={{ color: v2.purple }} />
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: 700 }}>1,284</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "12px", color: v2.green, fontWeight: 600 }}>+12.5%</span>
                    <span style={{ fontSize: "12px", color: v2.textDim }}>from last month</span>
                  </div>
                  <ShowcaseProgress value={72} />
                </div>
              </div>

              {/* Second row of cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "16px" }}>
                {/* Interactive List Card */}
                <div style={cardBase}>
                  <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px" }}>Recent Activity</div>
                  {[
                    { name: "Anna Bobson", action: "updated guideline", time: "2m ago", color: v2.blue },
                    { name: "Pierre Smith", action: "added checklist item", time: "15m ago", color: v2.green },
                    { name: "Elias Holly", action: "deleted author", time: "1h ago", color: v2.red },
                  ].map((item) => (
                    <div key={item.name} style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "10px 0", borderBottom: `1px solid ${v2.border}`,
                    }}>
                      <ShowcaseAvatar name={item.name} size={30} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: "13px", fontWeight: 500 }}>{item.name}</span>
                        <span style={{ fontSize: "13px", color: v2.textMuted }}> {item.action}</span>
                      </div>
                      <span style={{ fontSize: "11px", color: v2.textDim }}>{item.time}</span>
                    </div>
                  ))}
                </div>

                {/* Empty State Card */}
                <div style={{
                  ...cardBase, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", textAlign: "center",
                  minHeight: "200px",
                }}>
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "50%",
                    background: v2.bgElevated, display: "flex",
                    alignItems: "center", justifyContent: "center", marginBottom: "16px",
                  }}>
                    <ScrollText size={24} style={{ color: v2.textDim }} />
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>No logs yet</div>
                  <div style={{ fontSize: "13px", color: v2.textMuted, marginBottom: "16px" }}>
                    Start an ingestion to see logs here
                  </div>
                  <ShowcaseButton variant="primary" size="sm" icon={Plus}>Start Ingestion</ShowcaseButton>
                </div>

                {/* Settings Card */}
                <div style={cardBase}>
                  <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px" }}>Quick Settings</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Moon size={16} style={{ color: v2.textMuted }} />
                        <span style={{ fontSize: "14px" }}>Dark Mode</span>
                      </div>
                      <ShowcaseToggle label="" checked={true} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Bell size={16} style={{ color: v2.textMuted }} />
                        <span style={{ fontSize: "14px" }}>Notifications</span>
                      </div>
                      <ShowcaseToggle label="" checked={true} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Globe size={16} style={{ color: v2.textMuted }} />
                        <span style={{ fontSize: "14px" }}>Public Profile</span>
                      </div>
                      <ShowcaseToggle label="" checked={false} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Dialog / Modal ── */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>Dialog / Modal</div>
              <div style={{ ...cardBase }}>
                <ShowcaseButton variant="primary" icon={Eye}>
                  <span onClick={() => setDialogOpen(true)}>Open Dialog Preview</span>
                </ShowcaseButton>

                {/* Inline dialog preview (always visible) */}
                <div style={{
                  marginTop: "20px",
                  background: v2.bgElevated, border: `1px solid ${v2.border}`,
                  borderRadius: v2.radiusLg, padding: "0", maxWidth: "480px",
                  boxShadow: v2.shadowLg, overflow: "hidden",
                }}>
                  {/* Dialog header */}
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "16px 20px", borderBottom: `1px solid ${v2.border}`,
                  }}>
                    <div style={{ fontSize: "16px", fontWeight: 600 }}>Create New Item</div>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "6px",
                      background: v2.bgHover, display: "flex",
                      alignItems: "center", justifyContent: "center", cursor: "pointer",
                    }}>
                      <X size={16} style={{ color: v2.textMuted }} />
                    </div>
                  </div>
                  {/* Dialog body */}
                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <ShowcaseInput label="Subject" placeholder="Schedule app training" icon={Edit} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <ShowcaseSelect label="Status" options={["Open", "Closed"]} placeholder="Open" />
                      <ShowcaseSelect label="Priority" options={["Normal", "High", "Low"]} placeholder="Normal" />
                    </div>
                    <div>
                      <label style={{ fontSize: "13px", fontWeight: 500, color: v2.textMuted, display: "block", marginBottom: "6px" }}>Description</label>
                      <textarea
                        placeholder="Enter details..."
                        rows={3}
                        readOnly
                        style={{
                          width: "100%", background: v2.bg,
                          border: `1px solid ${v2.border}`, borderRadius: "10px",
                          padding: "12px 14px", color: v2.text, fontSize: "14px",
                          fontFamily: v2.font, outline: "none", resize: "none",
                        }}
                      />
                    </div>
                  </div>
                  {/* Dialog footer */}
                  <div style={{
                    display: "flex", justifyContent: "flex-end", gap: "8px",
                    padding: "16px 20px", borderTop: `1px solid ${v2.border}`,
                  }}>
                    <ShowcaseButton variant="ghost">Cancel</ShowcaseButton>
                    <ShowcaseButton variant="primary">Create</ShowcaseButton>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Data Table ── */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>Data Table</div>
              <div style={{
                background: v2.bgCard, border: `1px solid ${v2.border}`,
                borderRadius: v2.radius, overflow: "hidden",
              }}>
                {/* Table toolbar */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "16px 20px", borderBottom: `1px solid ${v2.border}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      background: v2.bgElevated, borderRadius: "10px",
                      padding: "9px 12px", border: `1px solid ${v2.border}`, width: "240px",
                    }}>
                      <Search size={14} style={{ color: v2.textDim }} />
                      <span style={{ fontSize: "13px", color: v2.textDim }}>Search items...</span>
                    </div>
                    <ShowcaseButton variant="outline" size="sm" icon={Filter}>Filter</ShowcaseButton>
                  </div>
                  <ShowcaseButton variant="primary" size="sm" icon={Plus}>Add Item</ShowcaseButton>
                </div>

                {/* Table */}
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${v2.border}` }}>
                      {["Name", "Status", "Priority", "Assigned To", "Updated", ""].map((h) => (
                        <th key={h} style={{
                          padding: "12px 20px", textAlign: "left",
                          fontSize: "12px", fontWeight: 600, color: v2.textDim,
                          textTransform: "uppercase", letterSpacing: "0.5px",
                        }}>
                          {h && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                              {h} {h !== "" && <ArrowUpDown size={12} />}
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Review API endpoints", status: "green", statusLabel: "Completed", priority: "High", assignee: "Anna B.", time: "2h ago" },
                      { name: "Update documentation", status: "blue", statusLabel: "In Progress", priority: "Medium", assignee: "Pierre S.", time: "5h ago" },
                      { name: "Fix auth middleware", status: "orange", statusLabel: "Pending", priority: "High", assignee: "Elias H.", time: "1d ago" },
                      { name: "Add email templates", status: "red", statusLabel: "Failed", priority: "Low", assignee: "Blake K.", time: "2d ago" },
                      { name: "Database migration", status: "purple", statusLabel: "Processing", priority: "Medium", assignee: "Leyton G.", time: "3d ago" },
                    ].map((item) => (
                      <tr key={item.name} style={{
                        borderBottom: `1px solid ${v2.border}`,
                        transition: "background 0.15s",
                      }}>
                        <td style={{ padding: "14px 20px", fontWeight: 500 }}>{item.name}</td>
                        <td style={{ padding: "14px 20px" }}>
                          <ShowcaseBadge variant={item.status as "green" | "blue" | "orange" | "red" | "purple"}>{item.statusLabel}</ShowcaseBadge>
                        </td>
                        <td style={{ padding: "14px 20px", color: item.priority === "High" ? v2.orange : v2.textMuted }}>{item.priority}</td>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <ShowcaseAvatar name={item.assignee} size={24} />
                            <span style={{ color: v2.textMuted }}>{item.assignee}</span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px", color: v2.textDim, fontSize: "13px" }}>{item.time}</td>
                        <td style={{ padding: "14px 20px" }}>
                          <MoreHorizontal size={16} style={{ color: v2.textDim, cursor: "pointer" }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 20px", borderTop: `1px solid ${v2.border}`,
                }}>
                  <span style={{ fontSize: "13px", color: v2.textDim }}>Showing 1-5 of 24 items</span>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {["<", "1", "2", "3", "...", "5", ">"].map((p, i) => (
                      <div key={i} style={{
                        width: "32px", height: "32px", borderRadius: v2.radiusSm,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "13px", cursor: "pointer",
                        background: p === "1" ? v2.purple : "transparent",
                        color: p === "1" ? "#fff" : v2.textMuted,
                        border: p === "1" ? "none" : `1px solid ${v2.border}`,
                      }}>
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Avatars & User Elements ── */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>Avatars & User Elements</div>
              <div style={{ ...cardBase, display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <div style={{ fontSize: "13px", color: v2.textDim, marginBottom: "10px" }}>Sizes</div>
                  <div style={row}>
                    <ShowcaseAvatar name="John Doe" size={24} />
                    <ShowcaseAvatar name="Anna Bobson" size={32} />
                    <ShowcaseAvatar name="Pierre Smith" size={40} />
                    <ShowcaseAvatar name="Elias Holly" size={48} />
                    <ShowcaseAvatar name="Blake Kraft" size={56} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "13px", color: v2.textDim, marginBottom: "10px" }}>Avatar Group (stacked)</div>
                  <div style={{ display: "flex" }}>
                    {["John D", "Anna B", "Pierre S", "Elias H", "+3"].map((name, i) => (
                      <div key={name} style={{ marginLeft: i > 0 ? "-8px" : 0, zIndex: 5 - i }}>
                        {name.startsWith("+") ? (
                          <div style={{
                            width: 36, height: 36, borderRadius: "50%",
                            background: v2.bgElevated, border: `2px solid ${v2.bgCard}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "12px", fontWeight: 600, color: v2.textMuted,
                          }}>{name}</div>
                        ) : (
                          <div style={{ border: `2px solid ${v2.bgCard}`, borderRadius: "50%" }}>
                            <ShowcaseAvatar name={name} size={32} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Progress & Loading ── */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>Progress & Loading</div>
              <div style={{ ...cardBase, display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", color: v2.textMuted }}>Ingestion Progress</span>
                    <span style={{ fontSize: "13px", color: v2.purple, fontWeight: 600 }}>72%</span>
                  </div>
                  <ShowcaseProgress value={72} color={v2.purple} />
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", color: v2.textMuted }}>Storage Used</span>
                    <span style={{ fontSize: "13px", color: v2.orange, fontWeight: 600 }}>45%</span>
                  </div>
                  <ShowcaseProgress value={45} color={v2.orange} />
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", color: v2.textMuted }}>API Quota</span>
                    <span style={{ fontSize: "13px", color: v2.red, fontWeight: 600 }}>89%</span>
                  </div>
                  <ShowcaseProgress value={89} color={v2.red} />
                </div>
                <div>
                  <div style={{ fontSize: "13px", color: v2.textDim, marginBottom: "10px" }}>Loading Spinner</div>
                  <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                    <div style={{
                      width: "24px", height: "24px", borderRadius: "50%",
                      border: `3px solid ${v2.bgElevated}`,
                      borderTopColor: v2.purple,
                      animation: "spin 0.8s linear infinite",
                    }} />
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "50%",
                      border: `3px solid ${v2.bgElevated}`,
                      borderTopColor: v2.orange,
                      animation: "spin 0.8s linear infinite",
                    }} />
                    <span style={{ fontSize: "13px", color: v2.textMuted }}>Loading...</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Dropdown Menu ── */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>Dropdown Menu</div>
              <div style={{ ...cardBase, display: "flex", gap: "24px" }}>
                {/* Inline dropdown preview */}
                <div style={{
                  background: v2.bgElevated, border: `1px solid ${v2.border}`,
                  borderRadius: v2.radiusSm, padding: "4px", minWidth: "200px",
                  boxShadow: v2.shadow,
                }}>
                  {[
                    { icon: Eye, label: "View Details" },
                    { icon: Edit, label: "Edit" },
                    { icon: Download, label: "Export" },
                    { icon: Star, label: "Add to Favorites" },
                  ].map((item) => (
                    <div key={item.label} style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "8px 12px", borderRadius: "4px",
                      fontSize: "13px", color: v2.text, cursor: "pointer",
                      transition: "background 0.15s",
                    }}>
                      <item.icon size={15} style={{ color: v2.textMuted }} />
                      {item.label}
                    </div>
                  ))}
                  <div style={{ height: "1px", background: v2.border, margin: "4px 0" }} />
                  <div style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "8px 12px", borderRadius: "4px",
                    fontSize: "13px", color: v2.red, cursor: "pointer",
                  }}>
                    <Trash2 size={15} />
                    Delete
                  </div>
                </div>

                {/* Context menu style */}
                <div style={{
                  background: v2.bgElevated, border: `1px solid ${v2.border}`,
                  borderRadius: v2.radiusSm, padding: "4px", minWidth: "220px",
                  boxShadow: v2.shadow,
                }}>
                  <div style={{ padding: "6px 12px", fontSize: "12px", fontWeight: 600, color: v2.textDim }}>
                    Actions
                  </div>
                  {[
                    { icon: RefreshCw, label: "Refresh Data", shortcut: "Ctrl+R" },
                    { icon: Filter, label: "Apply Filters", shortcut: "Ctrl+F" },
                    { icon: Download, label: "Export CSV", shortcut: "Ctrl+E" },
                  ].map((item) => (
                    <div key={item.label} style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "8px 12px", borderRadius: "4px",
                      fontSize: "13px", color: v2.text, cursor: "pointer",
                    }}>
                      <item.icon size={15} style={{ color: v2.textMuted }} />
                      <span style={{ flex: 1 }}>{item.label}</span>
                      <span style={{ fontSize: "11px", color: v2.textDim }}>{item.shortcut}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Toast Notifications ── */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>Toast Notifications</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "400px" }}>
                {[
                  { title: "Item Created", desc: "New checklist item has been added.", icon: CheckCircle, color: v2.green },
                  { title: "Processing...", desc: "Ingestion pipeline is running.", icon: RefreshCw, color: v2.blue },
                  { title: "Connection Lost", desc: "Attempting to reconnect...", icon: AlertTriangle, color: v2.orange },
                ].map((t) => (
                  <div key={t.title} style={{
                    display: "flex", alignItems: "flex-start", gap: "12px",
                    background: v2.bgElevated, border: `1px solid ${v2.border}`,
                    borderRadius: v2.radiusSm, padding: "14px 16px",
                    boxShadow: v2.shadow,
                  }}>
                    <t.icon size={18} style={{ color: t.color, flexShrink: 0, marginTop: "1px" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "2px" }}>{t.title}</div>
                      <div style={{ fontSize: "13px", color: v2.textMuted }}>{t.desc}</div>
                    </div>
                    <X size={14} style={{ color: v2.textDim, cursor: "pointer", flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </div>

            {/* ── Spacing & Borders ── */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>Border Radius & Spacing</div>
              <div style={{ ...cardBase, display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <div style={{ fontSize: "13px", color: v2.textDim, marginBottom: "12px" }}>Border Radius Scale</div>
                  <div style={row}>
                    {[
                      { label: "sm (8px)", radius: v2.radiusSm },
                      { label: "md (12px)", radius: v2.radius },
                      { label: "lg (16px)", radius: v2.radiusLg },
                      { label: "full", radius: v2.radiusFull },
                    ].map((r) => (
                      <div key={r.label} style={{
                        width: "80px", height: "80px",
                        background: v2.bgElevated, border: `1px solid ${v2.borderLight}`,
                        borderRadius: r.radius,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "11px", color: v2.textMuted, textAlign: "center",
                      }}>
                        {r.label}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "13px", color: v2.textDim, marginBottom: "12px" }}>Shadow Levels</div>
                  <div style={row}>
                    <div style={{
                      width: "120px", height: "80px", background: v2.bgCard,
                      borderRadius: v2.radius, display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "12px", color: v2.textMuted,
                      border: `1px solid ${v2.border}`,
                    }}>No shadow</div>
                    <div style={{
                      width: "120px", height: "80px", background: v2.bgCard,
                      borderRadius: v2.radius, display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "12px", color: v2.textMuted,
                      boxShadow: v2.shadow,
                    }}>Default</div>
                    <div style={{
                      width: "120px", height: "80px", background: v2.bgCard,
                      borderRadius: v2.radius, display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "12px", color: v2.textMuted,
                      boxShadow: v2.shadowLg,
                    }}>Large</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Icons ── */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>Icons (Lucide React)</div>
              <div style={{ ...cardBase }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "8px" }}>
                  {[
                    { Icon: Home, name: "Home" }, { Icon: Users, name: "Users" },
                    { Icon: Settings, name: "Settings" }, { Icon: Search, name: "Search" },
                    { Icon: Bell, name: "Bell" }, { Icon: Mail, name: "Mail" },
                    { Icon: Plus, name: "Plus" }, { Icon: Trash2, name: "Trash" },
                    { Icon: Edit, name: "Edit" }, { Icon: Eye, name: "Eye" },
                    { Icon: Download, name: "Download" }, { Icon: Upload, name: "Upload" },
                    { Icon: RefreshCw, name: "Refresh" }, { Icon: Filter, name: "Filter" },
                    { Icon: Star, name: "Star" }, { Icon: Heart, name: "Heart" },
                    { Icon: Shield, name: "Shield" }, { Icon: Lock, name: "Lock" },
                    { Icon: Unlock, name: "Unlock" }, { Icon: Globe, name: "Globe" },
                    { Icon: Zap, name: "Zap" }, { Icon: Brain, name: "Brain" },
                    { Icon: Sparkles, name: "Sparkles" }, { Icon: Check, name: "Check" },
                  ].map(({ Icon, name }) => (
                    <div key={name} style={{
                      display: "flex", flexDirection: "column", alignItems: "center",
                      gap: "6px", padding: "12px 8px", borderRadius: v2.radiusSm,
                      border: `1px solid ${v2.border}`, cursor: "pointer",
                      transition: "background 0.15s",
                    }}>
                      <Icon size={20} style={{ color: v2.textMuted }} />
                      <span style={{ fontSize: "11px", color: v2.textDim }}>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Design Tokens Summary ── */}
            <div style={sectionStyle}>
              <div style={sectionTitle}>Design Tokens Summary</div>
              <div style={{
                ...cardBase, fontFamily: "monospace", fontSize: "13px",
                lineHeight: "2", color: v2.textMuted,
              }}>
                <div><span style={{ color: v2.purple }}>--v2-body:</span> {v2.body}</div>
                <div><span style={{ color: v2.purple }}>--v2-bg:</span> {v2.bg}</div>
                <div><span style={{ color: v2.purple }}>--v2-bg-card:</span> {v2.bgCard}</div>
                <div><span style={{ color: v2.purple }}>--v2-bg-elevated:</span> {v2.bgElevated}</div>
                <div><span style={{ color: v2.purple }}>--v2-border:</span> {v2.border}</div>
                <div><span style={{ color: v2.purple }}>--v2-text:</span> {v2.text}</div>
                <div><span style={{ color: v2.purple }}>--v2-text-muted:</span> {v2.textMuted}</div>
                <div><span style={{ color: v2.purple }}>--v2-purple:</span> {v2.purple}</div>
                <div><span style={{ color: v2.purple }}>--v2-purple-light:</span> {v2.purpleLight}</div>
                <div><span style={{ color: v2.purple }}>--v2-orange:</span> {v2.orange}</div>
                <div><span style={{ color: v2.purple }}>--v2-radius:</span> {v2.radius}</div>
                <div><span style={{ color: v2.purple }}>--v2-btn-radius:</span> {v2.radiusFull} (pill)</div>
                <div><span style={{ color: v2.purple }}>--v2-font:</span> {v2.font}</div>
              </div>
            </div>

          </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
