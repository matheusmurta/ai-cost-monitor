import { randomBytes } from 'node:crypto';

function nonce(): string {
  return randomBytes(16).toString('hex');
}

const SHARED_CSS = `
* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 20px;
  font-family: var(--vscode-font-family, sans-serif);
  font-size: var(--vscode-font-size, 13px);
  color: var(--vscode-foreground);
  background-color: var(--vscode-editor-background);
}
h1 { font-size: 20px; letter-spacing: 1px; margin: 0 0 16px; }
h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.6px; margin: 24px 0 8px; color: var(--vscode-descriptionForeground); }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
.card { background: var(--vscode-editorWidget-background); border: 1px solid var(--vscode-panel-border); border-radius: 8px; padding: 16px; }
.card label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--vscode-descriptionForeground); }
.card .value { font-size: 26px; font-weight: 600; margin-top: 6px; font-variant-numeric: tabular-nums; }
table { width: 100%; border-collapse: collapse; margin-top: 4px; }
th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--vscode-panel-border); }
th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px; color: var(--vscode-descriptionForeground); }
td.num { text-align: right; font-variant-numeric: tabular-nums; }
th.num { text-align: right; }
td.src { color: var(--vscode-descriptionForeground); font-size: 11px; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.empty { color: var(--vscode-descriptionForeground); font-style: italic; }
.hint { color: var(--vscode-descriptionForeground); font-size: 12px; margin-top: 20px; }
.kv { display: grid; grid-template-columns: 220px 1fr; row-gap: 8px; margin-top: 8px; }
.kv .k { color: var(--vscode-descriptionForeground); }
.kv .v { font-variant-numeric: tabular-nums; word-break: break-all; }
.badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
.badge.yes { background: rgba(45, 160, 90, 0.18); color: #2da05a; }
.badge.no { background: rgba(160, 160, 160, 0.18); color: var(--vscode-descriptionForeground); }
`;

// Helpers JS embutidos (sem backslash/regex para evitar escapes no template literal).
const COMMON_JS = `
    function trimZ(s) {
      while (s.indexOf('.') >= 0) {
        var last = s.charAt(s.length - 1);
        if (last === '0' || last === '.') { s = s.slice(0, -1); }
        else { break; }
      }
      return s;
    }
    function usd(v) {
      v = Number(v) || 0;
      if (v === 0) { return '$0.00'; }
      var a = Math.abs(v);
      var d = a >= 1 ? 2 : (a >= 0.01 ? 4 : 6);
      return '$' + trimZ(v.toFixed(d));
    }
    function compact(n) {
      n = Number(n) || 0;
      var a = Math.abs(n);
      if (a >= 1e9) { return trimZ((n / 1e9).toFixed(2)) + 'B'; }
      if (a >= 1e6) { return trimZ((n / 1e6).toFixed(2)) + 'M'; }
      if (a >= 1e3) { return trimZ((n / 1e3).toFixed(1)) + 'K'; }
      return String(Math.round(n));
    }
    function num(n) { return Math.round(Number(n) || 0).toLocaleString('en-US'); }
    function esc(s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }
    function time(t) {
      if (!t) { return '\u2014'; }
      var d = new Date(t);
      if (isNaN(d)) { return String(t); }
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
`;

export function getDashboardHtml(): string {
  const n = nonce();
  const script = `
    var vscode = acquireVsCodeApi();
    ${COMMON_JS}
    function renderRows(id, map) {
      var tbody = document.getElementById(id);
      var rows = Object.entries(map || {}).sort(function (a, b) { return b[1].costUsd - a[1].costUsd; });
      tbody.innerHTML = rows.length
        ? rows.map(function (e) { var d = e[1]; return '<tr><td>' + esc(e[0]) + '</td><td class="num">' + usd(d.costUsd) + '</td><td class="num">' + num(d.totalTokens) + '</td></tr>'; }).join('')
        : '<tr><td colspan="3" class="empty">No data</td></tr>';
    }
    function renderHistory(list) {
      var tbody = document.getElementById('history');
      var items = list || [];
      if (!items.length) { tbody.innerHTML = '<tr><td colspan="8" class="empty">No activity</td></tr>'; return; }
      tbody.innerHTML = items.map(function (r) {
        return '<tr><td>' + time(r.timestamp) + '</td><td>' + esc(r.provider) + '</td><td>' + esc(r.model || 'Unknown') + '</td><td class="num">' + num(r.tokensIn) + '</td><td class="num">' + num(r.tokensOut) + '</td><td class="num">' + num(r.totalTokens) + '</td><td class="num">' + usd(r.costUsd) + '</td><td class="src">' + esc(r.sourceFile) + '</td></tr>';
      }).join('');
    }
    window.addEventListener('message', function (ev) {
      var m = ev.data;
      if (!m || m.type !== 'update') { return; }
      var s = m.summary || {};
      document.getElementById('totalCost').textContent = usd(s.totalCostUsd);
      document.getElementById('totalTokens').textContent = compact(s.totalTokens);
      document.getElementById('inputTokens').textContent = compact(s.totalTokensIn);
      document.getElementById('outputTokens').textContent = compact(s.totalTokensOut);
      renderRows('providers', s.byProvider);
      renderRows('models', s.byModel);
      renderHistory(m.history);
    });
    vscode.postMessage({ type: 'ready' });
  `;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${n}';">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI Cost Monitor</title>
<style>${SHARED_CSS}</style>
</head>
<body>
  <h1>AI COST MONITOR</h1>
  <section class="cards">
    <div class="card"><label>Total Cost</label><div class="value" id="totalCost">$0.00</div></div>
    <div class="card"><label>Total Tokens</label><div class="value" id="totalTokens">0</div></div>
    <div class="card"><label>Input Tokens</label><div class="value" id="inputTokens">0</div></div>
    <div class="card"><label>Output Tokens</label><div class="value" id="outputTokens">0</div></div>
  </section>

  <section>
    <h2>Providers</h2>
    <table>
      <thead><tr><th>Provider</th><th class="num">Cost</th><th class="num">Tokens</th></tr></thead>
      <tbody id="providers"></tbody>
    </table>
  </section>

  <section>
    <h2>Models</h2>
    <table>
      <thead><tr><th>Model</th><th class="num">Cost</th><th class="num">Tokens</th></tr></thead>
      <tbody id="models"></tbody>
    </table>
  </section>

  <section>
    <h2>Recent Activity</h2>
    <table>
      <thead><tr><th>Time</th><th>Provider</th><th>Model</th><th class="num">Input</th><th class="num">Output</th><th class="num">Total</th><th class="num">Cost</th><th>Source</th></tr></thead>
      <tbody id="history"></tbody>
    </table>
  </section>

  <script nonce="${n}">${script}</script>
</body>
</html>`;
}

export function getDiagnosticsHtml(): string {
  const n = nonce();
  const script = `
    var vscode = acquireVsCodeApi();
    ${COMMON_JS}
    function badge(yes) { return yes ? '<span class="badge yes">YES</span>' : '<span class="badge no">NO</span>'; }
    window.addEventListener('message', function (ev) {
      var m = ev.data;
      if (!m || m.type !== 'update') { return; }
      var rows = [
        ['Workspace', m.workspace || '(none)'],
        ['Cline detected', badge(m.clineDetected)],
        ['Claude Code detected', badge(m.claudeDetected)],
        ['Cline files found', String(m.clineFilesFound || 0)],
        ['Claude files found', String(m.claudeFilesFound || 0)],
        ['Records processed', num(m.recordsProcessed)],
        ['Last Cline event', m.lastClineEvent ? time(m.lastClineEvent) : '\u2014'],
        ['Last Claude Code event', m.lastClaudeEvent ? time(m.lastClaudeEvent) : '\u2014'],
        ['Malformed JSON records', String(m.malformedRecords || 0)],
        ['Warnings', String(m.warnings || 0)],
        ['Errors', String(m.errors || 0)]
      ];
      document.getElementById('rows').innerHTML = rows.map(function (r) {
        return '<div class="k">' + r[0] + '</div><div class="v">' + r[1] + '</div>';
      }).join('');
    });
    vscode.postMessage({ type: 'ready' });
  `;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${n}';">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI Cost Monitor: Diagnostics</title>
<style>${SHARED_CSS}</style>
</head>
<body>
  <h1>DIAGNOSTICS</h1>
  <div class="kv" id="rows"></div>
  <p class="hint">Logs detalhados estão disponíveis no Output Channel &ldquo;AI Cost Monitor&rdquo; (menu View → Output).</p>
  <script nonce="${n}">${script}</script>
</body>
</html>`;
}


