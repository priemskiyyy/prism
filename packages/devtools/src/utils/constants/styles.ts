import { DEVTOOLS_Z_INDEX } from "src/utils/constants/zIndex";

export const DEVTOOLS_STYLES = `
:host {
  --bg: #0e1118; --raised: #151924; --hover: #1c2130; --border: #262c3b; --text: #e6e9f2; --muted: #8790a6;
  --accent: #8b93ff; --accent-text: #c3c8ff; --ok: #3fd99a; --warn: #f0b653; --error: #ff7d8c; --well: #090b10;
  --font: 12px/1.5 ui-sans-serif, system-ui, -apple-system, sans-serif; --mono: 11px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace;
  color-scheme: dark; color: var(--text); font: var(--font); text-align: left;
}
@media (prefers-color-scheme: light) {
  :host {
    --bg: #ffffff; --raised: #f5f6fa; --hover: #eceef5; --border: #dde0ea; --text: #1a1e2c; --muted: #646b80;
    --accent: #4f46e5; --accent-text: #3730a3; --ok: #15803d; --warn: #b45309; --error: #dc2626; --well: #f3f4f8; color-scheme: light;
  }
}
*, *::before, *::after { box-sizing: border-box; }
[hidden] { display: none !important; }
button, input, textarea { font: inherit; color: inherit; letter-spacing: normal; }
button { cursor: pointer; border: 1px solid var(--border); border-radius: 8px; background: var(--raised); padding: 4px 10px; transition: background 120ms, border-color 120ms; }
button:hover:not(:disabled) { background: var(--hover); }
button:disabled { cursor: not-allowed; opacity: 0.5; }
:is(button, input, textarea):focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
p, h2 { margin: 0; }
code, pre { font: var(--mono); }
.dot { display: inline-block; flex-shrink: 0; width: 7px; height: 7px; border-radius: 50%; background: var(--muted); }
[data-state="ready"] > .dot { background: var(--ok); box-shadow: 0 0 0 3px color-mix(in srgb, var(--ok) 18%, transparent); }
[data-state="loading"] > .dot, [data-state="refreshing"] > .dot { background: var(--warn); animation: pulse 1.2s ease-in-out infinite; }
[data-state="error"] > .dot { background: var(--error); box-shadow: 0 0 0 3px color-mix(in srgb, var(--error) 25%, transparent); }
@keyframes pulse { 50% { opacity: 0.35; } }
.launcher { position: fixed; z-index: ${DEVTOOLS_Z_INDEX}; right: 16px; bottom: 16px; display: inline-flex; align-items: center; gap: 9px; border-radius: 999px; padding: 8px 14px 8px 12px; background: color-mix(in srgb, var(--bg) 92%, transparent); backdrop-filter: blur(10px); box-shadow: 0 12px 32px -12px #000c; font-weight: 500; }
.launcher:hover { transform: translateY(-1px); }
.pill { padding: 0 7px; border-radius: 999px; background: var(--hover); color: var(--muted); font: var(--mono); font-variant-numeric: tabular-nums; }
.pill[data-tone="accent"] { background: color-mix(in srgb, var(--accent) 18%, transparent); color: var(--accent-text); }
.panel { position: fixed; z-index: ${DEVTOOLS_Z_INDEX}; left: 16px; right: 16px; bottom: 16px; height: var(--panel-size); max-height: calc(100dvh - 24px); display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--border); border-radius: 14px; background: color-mix(in srgb, var(--bg) 95%, transparent); backdrop-filter: blur(16px); box-shadow: 0 28px 80px -24px #000d; }
.panel[data-position="RIGHT"] { top: 16px; left: auto; height: auto; width: var(--panel-size); max-width: calc(100vw - 24px); padding-left: 8px; }
.resize { flex-shrink: 0; height: 8px; cursor: row-resize; touch-action: none; background: var(--raised); border-bottom: 1px solid var(--border); }
.resize::after { content: ""; display: block; width: 40px; height: 3px; margin: 2px auto 0; border-radius: 2px; background: var(--border); }
.resize[data-position="RIGHT"] { position: absolute; top: 0; bottom: 0; left: 0; width: 8px; height: auto; cursor: col-resize; border-bottom: 0; border-right: 1px solid var(--border); }
.resize[data-position="RIGHT"]::after { width: 3px; height: 40px; margin: 0; position: absolute; top: 50%; left: 2px; transform: translateY(-50%); }
.resize:hover::after, .resize:focus-visible::after { background: var(--accent); }
.header { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; padding: 8px 12px; border-bottom: 1px solid var(--border); }
.header h2 { font-size: 13px; font-weight: 600; }
.header .close { margin-left: auto; }
.status { display: inline-flex; align-items: center; gap: 7px; padding: 1px 9px 1px 8px; border: 1px solid var(--border); border-radius: 999px; font: var(--mono); white-space: nowrap; }
.status[data-state="ready"] { border-color: color-mix(in srgb, var(--ok) 40%, transparent); color: var(--ok); }
.status[data-state="loading"], .status[data-state="refreshing"] { border-color: color-mix(in srgb, var(--warn) 40%, transparent); color: var(--warn); }
.status[data-state="error"] { border-color: color-mix(in srgb, var(--error) 40%, transparent); color: var(--error); }
.close { border: 0; background: transparent; color: var(--muted); font-size: 16px; line-height: 1; padding: 4px 8px; }
.error { color: var(--error); overflow-wrap: anywhere; font-size: 11px; }
.status-error { padding: 6px 12px; border-bottom: 1px solid var(--border); background: color-mix(in srgb, var(--error) 8%, transparent); }
.tabs { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 8px 12px 0; }
.actions { display: flex; flex-wrap: wrap; gap: 6px; margin-left: auto; }
.tabs button { border-color: transparent; background: transparent; color: var(--muted); }
.tabs button[aria-pressed="true"] { border-color: color-mix(in srgb, var(--accent) 35%, transparent); background: color-mix(in srgb, var(--accent) 12%, transparent); color: var(--accent-text); }
.view { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.toolbar { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; padding: 8px 12px; border-bottom: 1px solid var(--border); }
.toolbar input { flex: 1; min-width: 140px; height: 28px; border: 1px solid var(--border); border-radius: 8px; padding: 4px 10px; background: var(--bg); }
.toolbar input::placeholder { color: var(--muted); }
.toolbar button[aria-pressed="true"] { border-color: var(--warn); color: var(--warn); }
.total { color: var(--muted); font: var(--mono); white-space: nowrap; }
.list { flex: 1; min-height: 0; margin: 0; padding: 0; overflow: auto; overscroll-behavior: contain; list-style: none; }
.flag { border-bottom: 1px solid var(--border); }
.flag-summary { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 10px; width: 100%; padding: 8px 12px; border: 0; border-radius: 0; background: transparent; text-align: left; }
.flag-summary[aria-expanded="true"] { background: var(--raised); }
.flag-key { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font: var(--mono); font-weight: 600; }
.flag-value { grid-column: 1 / -1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--muted); }
.resolution { justify-self: end; padding: 0 7px; border-radius: 999px; font: var(--mono); background: var(--hover); color: var(--muted); }
.resolution[data-resolution="resolved"] { background: color-mix(in srgb, var(--ok) 15%, transparent); color: var(--ok); }
.resolution[data-resolution="pending"] { background: color-mix(in srgb, var(--warn) 15%, transparent); color: var(--warn); }
.resolution[data-resolution="error"] { background: color-mix(in srgb, var(--error) 15%, transparent); color: var(--error); }
.resolution[data-resolution="override"] { background: color-mix(in srgb, var(--accent) 18%, transparent); color: var(--accent-text); }
.flag[data-resolution="error"] { box-shadow: inset 2px 0 0 var(--error); }
.flag[data-resolution="override"] { box-shadow: inset 2px 0 0 var(--accent); }
.flag-detail { display: flex; flex-direction: column; gap: 8px; padding: 4px 12px 12px; background: var(--raised); }
.facts { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 2px 12px; margin: 0; }
.facts dt { color: var(--muted); }
.facts dd { margin: 0; overflow-wrap: anywhere; font: var(--mono); }
.json { margin: 0; max-height: 180px; overflow: auto; padding: 8px 10px; border-radius: 8px; background: var(--well); white-space: pre-wrap; overflow-wrap: anywhere; }
.override { display: flex; flex-direction: column; gap: 6px; }
.override textarea { min-height: 64px; resize: vertical; border: 1px solid var(--border); border-radius: 8px; padding: 6px 8px; background: var(--bg); font: var(--mono); }
.buttons { display: flex; flex-wrap: wrap; gap: 6px; }
.primary { border-color: color-mix(in srgb, var(--accent) 45%, transparent); background: color-mix(in srgb, var(--accent) 16%, transparent); color: var(--accent-text); }
.event { display: grid; grid-template-columns: 88px minmax(0, 1fr); gap: 10px; padding: 6px 12px; border-bottom: 1px solid var(--border); font: var(--mono); }
.event time { color: var(--muted); font-variant-numeric: tabular-nums; }
.event-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.event[data-kind="STATUS"] { box-shadow: inset 2px 0 0 var(--muted); }
.event[data-resolution="error"] { box-shadow: inset 2px 0 0 var(--error); }
.event[data-resolution="override"] { box-shadow: inset 2px 0 0 var(--accent); }
.empty { margin: auto; padding: 30px; max-width: 360px; text-align: center; color: var(--muted); }
@media (max-width: 520px) {
  .launcher { right: 10px; bottom: 10px; }
  .panel, .panel[data-position="RIGHT"] { top: auto; left: 6px; right: 6px; bottom: 6px; width: auto; height: calc(100dvh - 12px); padding-left: 0; }
  .resize, .dock { display: none; }
}
`;
