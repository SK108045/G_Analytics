(() => {
const main = document.getElementById('app');
if (!main) return;
const key = document.body.dataset.page;
const reportData = window.NicooReportData;
const { number, percent, time, ratio, ranked, pageNames } = reportData;
const dataLabel = 'Demo data';
const esc = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
const store = localStorage;
const metricNames = {
  users: 'Total users', newUsers: 'New users', sessions: 'Sessions',
  engaged: 'Engaged sessions', avgEngagement: 'Average engagement time', views: 'Views', count: 'Event count',
};
const metricFormat = (name, value) => name === 'avgEngagement' ? time(value) : number(value);
const metricValue = (data, name) => name === 'avgEngagement' ? ratio(data.seconds, data.users) : data[name];
const rangeName = range => range.days ? 'Last ' + range.days + ' days' : 'Custom range';
const exactChange = (value, previous) => previous ? (value - previous) / previous : null;
const changeText = (value, previous) => {
  const change = exactChange(value, previous);
  if (change === null) return '—';
  return (change > 0 ? '+' : '') + percent(change);
};

let range = reportData.selectedRange();
let current;
let comparison;
let seriesCache;
let realtimeMinutes = Number(store.getItem('gaRealtimeWindow'));
if (![5, 30, 60].includes(realtimeMinutes)) realtimeMinutes = 30;

function head(title, mode = 'historical') {
  const initial = window.PortalSession?.initial() || 'R';
  let date = '';
  if (mode === 'historical') {
    date = `<button class="date-pill" type="button" aria-label="Change date range" aria-haspopup="true"><b>${rangeName(range)} · ${reportData.rangeLabel(range)}</b>${range.compare ? '<span class="muted">Compare: ' + reportData.rangeLabel(reportData.previous(range)) + '</span>' : ''}</button>`;
  }
  if (mode === 'realtime') {
    date = `<button class="date-pill" type="button" aria-label="Change realtime window" aria-haspopup="true"><b>Last ${realtimeMinutes} minutes</b></button>`;
  }
  return `<div class="report-head"><div class="report-badge">${esc(initial)}</div>
    ${mode === 'historical' ? '<button class="ga-plus-circle report-add-compare" type="button" data-compare-period aria-label="Compare periods" title="Compare periods"></button>' : ''}
    <h1 class="report-title">${title}</h1>${date ? '<span class="report-data-label">' + dataLabel + '</span>' : ''}
    <div class="report-spacer"></div>${date}
    <button class="report-action" type="button" data-share aria-label="Share report">↗︎</button>
    <button class="report-action" type="button" data-more aria-label="More report actions">⋮</button></div>`;
}

function reportMenu(anchor, title, items) {
  document.querySelector('.report-menu')?.dispatchEvent(new Event('dismiss'));
  const rect = anchor.getBoundingClientRect();
  const menu = document.createElement('div');
  menu.className = 'panel-menu report-menu';
  menu.style.top = (rect.bottom + 6) + 'px';
  menu.style.right = Math.max(10, Math.min(innerWidth - 230, innerWidth - rect.right)) + 'px';
  menu.innerHTML = '<div class="report-menu-heading">' + title + '</div>';
  function close() {
    menu.remove();
    document.removeEventListener('pointerdown', outside);
    document.removeEventListener('keydown', escape);
  }
  function outside(event) { if (!menu.contains(event.target) && !anchor.contains(event.target)) close(); }
  function escape(event) { if (event.key === 'Escape') { close(); anchor.focus(); } }
  items.forEach(({ label, selected, action }) => {
    const button = menu.appendChild(document.createElement('button'));
    button.type = 'button';
    button.textContent = (selected ? '✓  ' : '') + label;
    button.onclick = () => { close(); action(); };
  });
  menu.addEventListener('dismiss', close, { once: true });
  document.body.appendChild(menu);
  document.addEventListener('pointerdown', outside);
  document.addEventListener('keydown', escape);
  menu.querySelector('button').focus();
}

function simpleModal(title, html, actions = []) {
  const back = document.createElement('div');
  back.className = 'import-modal-backdrop';
  back.innerHTML = '<div class="import-modal" role="dialog" aria-modal="true" style="width:min(560px,calc(100vw - 40px))"><div class="import-modal-head"><h2>'+title+'</h2><button class="import-modal-close" type="button" aria-label="Close">×</button></div><div class="import-modal-body">'+html+'</div><div class="import-modal-foot"></div></div>';
  document.body.appendChild(back);
  const close = () => back.remove();
  back.querySelector('.import-modal-close').onclick = close;
  back.addEventListener('click', event => { if (event.target === back) close(); });
  const foot = back.querySelector('.import-modal-foot');
  actions.forEach(({ label, primary, action }) => {
    const button = foot.appendChild(document.createElement('button'));
    button.type = 'button';
    button.className = primary ? 'primary' : 'btn-secondary';
    button.textContent = label;
    button.onclick = () => action(close, back);
  });
  return back;
}

function shareCurrent() {
  if (navigator.share) return navigator.share({ title: document.title, text: 'Nicoo Furniture Analytics · Demo data', url: location.href }).catch(() => {});
  if (navigator.clipboard) return navigator.clipboard.writeText(location.href).then(() => GAToast('Report link copied')).catch(() => GAToast('Copy the URL from the address bar'));
  GAToast('Copy the URL from the address bar');
}

function exportCurrentTable() {
  const table = main.querySelector('[data-report-primary] table') || (key === 'import' ? main.querySelector('table') : null);
  const blocks = table ? [...table.rows].map(row => [...row.cells].map(cell => cell.textContent.trim())) :
    [...main.querySelectorAll('[data-export]')].map(el => [el.dataset.export, el.dataset.value]);
  if (!blocks.length) { GAToast('No exportable report data found'); return; }
  const enclose = value => '"' + value.replaceAll('"', '""') + '"';
  const demo = key !== 'import' && key !== 'library';
  if (demo && !table) blocks.unshift(['Metric', 'Value']);
  const period = key === 'realtime' || key === 'realtimePages' ? 'Last ' + realtimeMinutes + ' minutes' : reportData.rangeLabel(range);
  const rows = blocks.map((row, index) => demo ? [...row, ...(index === 0 ? ['Data source', 'Period'] : ['Demo data', period])] : row);
  const csv = rows.map(row => row.map(enclose).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = key + (demo ? '-demo' : '') + '.csv';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function applyRange(next) {
  range = next;
  reportData.saveRange(next);
  renderHistorical();
  main.querySelector('.date-pill').focus({ preventScroll: true });
}

function customRange() {
  const max = reportData.isoDay(reportData.today());
  const dialog = simpleModal('Custom date range', `<div class="field-grid">
    <label class="field">Start date<input type="date" data-range-start max="${max}" value="${reportData.isoDay(range.start)}"></label>
    <label class="field">End date<input type="date" data-range-end max="${max}" value="${reportData.isoDay(range.end)}"></label>
    <p class="field full" role="alert" data-range-error></p></div>`, [
    { label: 'Cancel', action: close => close() },
    { label: 'Apply range', primary: true, action: (close, el) => {
      const next = reportData.custom(el.querySelector('[data-range-start]').value, el.querySelector('[data-range-end]').value, range.compare);
      if (!next) {
        el.querySelector('[data-range-error]').textContent = 'Choose a valid range of up to 366 days ending today or earlier.';
        return;
      }
      close();
      applyRange(next);
    } },
  ]);
  dialog.querySelector('[data-range-start]').focus();
}

function dateControlActions() {
  if (key === 'import' || key === 'library') return [];
  return [
    { label: 'About the data', action: () => simpleModal('Demo data',
      '<p>These simulated metrics are for the Nicoo Furniture Hub demo. They do not represent measured website traffic.</p>',
      [{ label: 'Close', primary: true, action: close => close() }]) },
    { label: 'Refresh report', action: () => {
      if (key === 'realtime' || key === 'realtimePages') renderRealtime();
      else { range = reportData.selectedRange(); renderHistorical(); }
    } },
  ];
}

function bind() {
  main.querySelector('[data-share]').onclick = shareCurrent;
  const more = main.querySelector('[data-more]');
  more.onclick = () => reportMenu(more, 'Report actions', [
    { label: 'Share report', action: shareCurrent },
    { label: 'Download CSV', action: exportCurrentTable },
    { label: 'Print / Save as PDF', action: () => window.print() },
    ...dateControlActions(),
  ]);
  const date = main.querySelector('.date-pill');
  if (!date) return;
  const comparePeriod = main.querySelector('[data-compare-period]');
  if (comparePeriod) comparePeriod.onclick = () => reportMenu(comparePeriod, 'Comparison', [{
    label: 'Compare to previous period', selected: range.compare,
    action: () => applyRange({ ...range, compare: !range.compare }),
  }]);
  date.onclick = () => {
    if (key === 'realtime' || key === 'realtimePages') {
      reportMenu(date, 'Realtime window', [5, 30, 60].map(minutes => ({
        label: 'Last ' + minutes + ' minutes', selected: realtimeMinutes === minutes, action: () => {
          realtimeMinutes = minutes;
          store.setItem('gaRealtimeWindow', String(minutes));
          renderRealtime();
          main.querySelector('.date-pill').focus({ preventScroll: true });
        },
      })));
      return;
    }
    reportMenu(date, 'Date range', [
      ...reportData.presets.map(days => ({
        label: 'Last ' + days + ' days', selected: range.days === days, action: () => applyRange(reportData.last(days, range.compare)),
      })),
      { label: 'Compare to previous period', selected: range.compare, action: () => applyRange({ ...range, compare: !range.compare }) },
      { label: 'Custom range…', selected: range.days === null, action: customRange },
    ]);
  };
}

function content(title, html, mode) {
  main.innerHTML = head(title, mode) + '<div class="content report-content">' + html + '</div>';
  bind();
}
function kpi(label, value, extra = '', attribute = '') {
  return `<div class="kpi"><small>${label}</small><strong ${attribute} data-export="${esc(label)}" data-value="${esc(value)}">${value}</strong>${extra}</div>`;
}
function card(title, body, width = 6, link = '', cls = '') {
  return `<section class="card ${cls}" style="grid-column:span ${width}"><h2>${title}</h2>${body}${link}</section>`;
}
function link(href, text) { return `<a class="report-link" href="${href}">${text} →</a>`; }
function grid(cards) { return '<div class="grid report-grid">' + cards.join('') + '</div>'; }
function group(report, name, metric) { return ranked(report.groups[name], metric); }

function bars(rows, metric, label = row => row.label) {
  const max = Math.max(1, ...rows.map(row => row[metric]));
  return `<div class="report-bars">${rows.map(row => {
    const name = label(row);
    return `<div class="report-bar-row" data-row-name="${esc(name)}" data-row-value="${row[metric]}">
      <span>${esc(name)}</span><span class="report-bar-track" aria-hidden="true"><span style="width:${row[metric] / max * 100}%"></span></span>
      <b data-export="${esc(name)}" data-value="${number(row[metric])}">${number(row[metric])}</b></div>`;
  }).join('')}</div>`;
}

function table(dimension, columns, rows, totals = null, options = {}) {
  return `<div class="ga-table-wrap report-table"${options.primary ? ' data-report-primary' : ''}>
    ${options.search === false ? '' : '<div class="table-tools"><input class="table-search" type="search" placeholder="Search…" aria-label="Search report table"><span data-row-count class="right"></span></div>'}
    <div class="report-table-scroll"><table class="ga-table"><thead><tr><th scope="col">${dimension}</th>
    ${columns.map((label, index) => `<th scope="col"${index === 0 && options.sorted ? ' aria-sort="descending"' : ''}>${label}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(row => '<tr>' + row.map((value, index) => index === 0 ? '<th scope="row">' + value + '</th>' : '<td>' + value + '</td>').join('') + '</tr>').join('')}</tbody>
    ${totals ? '<tfoot><tr><th scope="row">Total</th>' + totals.map(value => '<td>' + value + '</td>').join('') + '</tr></tfoot>' : ''}</table></div></div>`;
}

function bindTables() {
  main.querySelectorAll('.table-search').forEach(input => {
    const wrap = input.closest('.ga-table-wrap');
    const rows = [...wrap.querySelectorAll('tbody tr')];
    const count = wrap.querySelector('[data-row-count]');
    function filter() {
      const query = input.value.trim().toLowerCase();
      let visible = 0;
      rows.forEach(row => { row.hidden = !row.textContent.toLowerCase().includes(query); visible += Number(!row.hidden); });
      count.textContent = visible + ' of ' + rows.length + ' rows';
    }
    input.addEventListener('input', filter);
    filter();
  });
}

function chart(points, metric, alternative = '') {
  const hasComparison = points.some(p => typeof p.previous === 'number');
  const max = Math.max(1, ...points.map(p => Math.max(p.value, p.previous ?? 0)));
  const stepMagnitude = 10 ** Math.floor(Math.log10(max / 4));
  const step = Math.ceil(max / 4 / stepMagnitude) * stepMagnitude;
  const upper = step * 4;
  const left = 53, right = 694, top = 12, bottom = 144;
  const x = i => points.length === 1 ? right : left + (right - left) * i / (points.length - 1);
  const y = value => bottom - (bottom - top) * value / upper;
  const path = name => points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(2)} ${y(p[name]).toFixed(2)}`).join(' ');
  const numTicks = Math.min(points.length, points.length <= 7 ? 7 : 8);
  const shownPoints = new Set(Array.from({ length: numTicks }, (_, i) => Math.round(i * (points.length - 1) / Math.max(1, numTicks - 1))));
  const label = metricNames[metric];
  const fmt = value => metricFormat(metric, value);
  return `<div class="report-chart"><svg viewBox="0 0 713 171" role="img" aria-label="${label} over time">
    ${Array.from({ length: 5 }, (_, i) => `<line x1="${left}" x2="${right}" y1="${y(i * step)}" y2="${y(i * step)}" class="report-gridline"/>
      <text x="${left - 8}" y="${y(i * step) + 4}" text-anchor="end">${fmt(i * step)}</text>`).join('')}
    ${hasComparison ? `<path class="report-series report-series-previous" d="${path('previous')}"/>` : ''}
    <path class="report-series" d="${path('value')}"/>
    ${points.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.value)}" r="${points.length === 1 ? '4' : '2.6'}" class="report-point"><title>${p.label} · ${label}: ${fmt(p.value)}${hasComparison ? ' · ' + (alternative || 'Previous period') + ': ' + fmt(p.previous) : ''}</title></circle>${shownPoints.has(i) ? '<text class="report-date-tick" x="' + x(i) + '" y="163" text-anchor="' + (i === 0 && i !== points.length - 1 ? 'start' : i === points.length - 1 ? 'end' : 'middle') + '">' + p.label + '</text>' : ''}`).join('')}
    ${points.length === 1 && hasComparison ? `<circle cx="${right}" cy="${y(points[0].previous)}" r="3" class="report-point-previous"/>` : ''}
    </svg><div class="report-legend"><span><i></i>${label}</span>
    ${hasComparison ? '<span><i></i>' + (alternative || 'Previous period') + '</span>' : ''}</div></div>`;
}

function getSeries(metric, grain = 'day', compare = range.compare) {
  const cacheKey = [metric, grain, compare].join('|');
  if (!seriesCache.has(cacheKey)) {
    seriesCache.set(cacheKey, reportData.series(range, metric, grain, compare ? reportData.previous(range) : null));
  }
  return seriesCache.get(cacheKey);
}

function trend(metric, grain) { return chart(getSeries(metric, grain), metric); }

let snapshotMetric = ({
  'Total users': 'users', 'New users': 'newUsers', 'Engaged sessions': 'engaged', 'Average engagement time': 'avgEngagement',
})[store.getItem('nicooGaMetric')] || 'users';

function snapshot() {
  const metrics = ['users', 'newUsers', 'engaged', 'avgEngagement'];
  const buttons = metrics.map(metric => {
    const value = metricValue(current, metric);
    const change = comparison && changeText(value, metricValue(comparison, metric));
    return `<button type="button" class="report-metric ${snapshotMetric === metric ? 'active' : ''}" data-snapshot-metric="${metric}" aria-pressed="${snapshotMetric === metric}">
      <span>${metricNames[metric]}</span><strong data-stat="${metric}" data-export="${metricNames[metric]}" data-value="${metricFormat(metric, value)}">${metricFormat(metric, value)}</strong>
      ${change ? '<small class="' + (change.startsWith('-') ? 'report-down' : 'report-up') + '">' + change + '</small>' : ''}</button>`;
  }).join('');
  const countries = group(current, 'country', 'users').slice(0, 7);
  const channelRows = group(current, 'channel', 'sessions').map(row => [
    esc(row.label), '<span data-export="' + esc(row.label + ' sessions') + '" data-value="' + number(row.sessions) + '">' + number(row.sessions) + '</span>', ...(comparison ? [changeText(row.sessions, comparison.groups.channel.find(r => r.label === row.label)?.sessions)] : []),
  ]);
  const snapshot = `<div class="report-metrics">${buttons}</div><div data-snapshot-chart>${trend(snapshotMetric)}</div>`;
  const geography = '<div class="report-country-layout"><img src="ga-world-map.webp" alt="Map highlighting African countries">' + bars(countries, 'users') + '</div>';
  content('Reports snapshot', grid([
    card('Activity over time', snapshot, 7),
    card('Active users by Country', geography, 5, link('Demographic details_ Country.html', 'View countries')),
    card('New users by first channel', bars(group(current, 'firstChannel', 'newUsers'), 'newUsers'), 4),
    card('Sessions by channel', table('Channel', ['Sessions', ...(comparison ? ['Change'] : [])], channelRows, null, { search: false, sorted: true }), 4, link('Traffic acquisition.html', 'View traffic acquisition')),
    card('Views by Page title', bars(group(current, 'page', 'views'), 'views', row => pageNames[row.label]), 4, link('Pages and screens.html', 'View pages and screens'), 'report-page-bars'),
  ]));
  main.querySelectorAll('[data-snapshot-metric]').forEach(button => button.onclick = () => {
    snapshotMetric = button.dataset.snapshotMetric;
    store.setItem('nicooGaMetric', metricNames[snapshotMetric]);
    main.querySelectorAll('[data-snapshot-metric]').forEach(el => {
      el.classList.toggle('active', el === button);
      el.setAttribute('aria-pressed', String(el === button));
    });
    main.querySelector('[data-snapshot-chart]').innerHTML = trend(snapshotMetric);
  });
}

function details(title, dimension, columns, rows, totals, cards = []) {
  content(title, (cards.length ? grid(cards) : '') + table(dimension, columns, rows, totals, { sorted: true, primary: true }));
  bindTables();
}

function demographics() {
  const values = row => [number(row.users), number(row.newUsers), number(row.engaged),
    percent(ratio(row.engaged, row.sessions)), ratio(row.engaged, row.users).toFixed(2), time(ratio(row.seconds, row.users))];
  details('Demographic details: Country', 'Country',
    ['Active users', 'New users', 'Engaged sessions', 'Engagement rate', 'Engaged sessions per user', 'Average engagement time per user'],
    group(current, 'country', 'users').map(row => [esc(row.label), ...values(row)]), values(current));
}

function acquisition() {
  const values = row => [number(row.sessions), number(row.engaged), percent(ratio(row.engaged, row.sessions)),
    time(ratio(row.seconds, row.sessions)), number(row.views)];
  const rows = group(current, 'channel', 'sessions').map(row => [esc(row.label), ...values(row)]);
  details('Traffic acquisition', 'Session primary channel', ['Sessions', 'Engaged sessions', 'Engagement rate', 'Average engagement time per session', 'Views'], rows, values(current),
    [card('Sessions over time', trend('sessions'), 7), card('Sessions by channel', bars(group(current, 'channel', 'sessions'), 'sessions'), 5)]);
}

function techDetails() {
  const values = row => [number(row.users), number(row.newUsers), number(row.engaged),
    percent(ratio(row.engaged, row.sessions)), time(ratio(row.seconds, row.users))];
  const rows = group(current, 'device', 'users');
  details('Tech details: Device category', 'Device category', ['Active users', 'New users', 'Engaged sessions', 'Engagement rate', 'Average engagement time per user'],
    rows.map(row => [esc(row.label), ...values(row)]), values(current),
    [card('Active users over time', trend('users'), 7), card('Active users by device', bars(rows, 'users'), 5)]);
}

function pagesPage() {
  const values = row => [number(row.views), number(row.users), ratio(row.views, row.users).toFixed(2), time(ratio(row.seconds, row.users))];
  const rows = group(current, 'page', 'views');
  details('Pages and screens', 'Page title and screen class', ['Views', 'Active users', 'Views per active user', 'Average engagement time per user'],
    rows.map(row => [esc(pageNames[row.label]), ...values(row)]), values(current),
    [card('Views over time', trend('views'), 7), card('Views by Page title', bars(rows, 'views', row => pageNames[row.label]), 5, '', 'report-page-bars')]);
}

function eventsPage() {
  const values = row => [number(row.count), number(row.users), ratio(row.count, row.users).toFixed(2)];
  const rows = group(current, 'event', 'count');
  details('Events: Event name', 'Event name', ['Event count', 'Total users', 'Event count per user', 'Total revenue'],
    rows.map(row => [`<button type="button" class="event-link report-text-button" data-event="${row.label}">${row.label}</button>`, ...values(row), 'KES 0.00']),
    [...values(current), 'KES 0.00'], [card('Event count over time', trend('count'), 12)]);
  main.querySelectorAll('[data-event]').forEach(button => button.onclick = () => {
    const row = rows.find(item => item.label === button.dataset.event);
    simpleModal('Event: ' + row.label, '<p>Demo data · ' + reportData.rangeLabel(range) + '</p><div class="report-metrics">' +
      kpi('Event count', number(row.count)) + kpi('Total users', number(row.users)) + kpi('Events per user', ratio(row.count, row.users).toFixed(2)) + '</div>',
      [{ label: 'Close', primary: true, action: close => close() }]);
  });
}

function userOverview() {
  const realtime = reportData.realtime(realtimeMinutes);
  content('User attributes overview', grid([
    card('Active users by Country', bars(group(current, 'country', 'users'), 'users'), 6, link('Demographic details_ Country.html', 'View countries')),
    card('Active users in last ' + realtimeMinutes + ' minutes', kpi('Active users', number(realtime.users)) + minuteBars(realtime.minuteUsers), 6, link('Realtime overview.html', 'View realtime')),
    card('Active users by City', bars(group(current, 'city', 'users').slice(0, 10), 'users'), 4),
    card('Active users by Age', bars(group(current, 'age', 'users'), 'users'), 4),
    card('Active users by Language', bars(group(current, 'language', 'users'), 'users'), 4, link('Audiences.html', 'View audiences')),
  ]));
}

function techOverview() {
  content('Tech overview', grid([
    card('Active users by Browser', bars(group(current, 'browser', 'users'), 'users')),
    card('Active users by device', bars(group(current, 'device', 'users'), 'users'), 6, link('Tech details_ Device category.html', 'View device categories')),
    card('Active users by screen resolution', bars(group(current, 'resolution', 'users'), 'users')),
    card('Active users by app version', '<p class="sub">No app version data for this website.</p>'),
  ]));
}

function objective(isLead) {
  const events = current.groups.event;
  const formCount = name => number(events.find(row => row.label === name).count);
  const outcomes = isLead ? '<div class="report-metrics">' + kpi('Form starts', formCount('form_start')) + kpi('Form submissions', formCount('form_submit')) + '</div>' :
    '<div class="report-metrics">' + kpi('Checkout page views', number(current.groups.page.find(row => row.label === 'Checkout').views)) + '</div><p class="sub">No purchase events recorded in this demo.</p>';
  content(isLead ? 'Generate leads' : 'Drive sales', grid([
    card('Sessions by channel', bars(group(current, 'channel', 'sessions'), 'sessions'), 6, link('Traffic acquisition.html', 'View traffic acquisition')),
    card(isLead ? 'Lead events' : 'Purchase activity', outcomes),
    card('New users by first channel', bars(group(current, 'firstChannel', 'newUsers'), 'newUsers')),
    card('Landing pages', bars(group(current, 'page', 'landing'), 'landing', row => pageNames[row.label]), 6, '', 'report-page-bars'),
  ]));
}

function behavior() {
  content('Understand web and/or app performance', grid([
    card('Views over time', trend('views'), 7),
    card('Views by Page title', bars(group(current, 'page', 'views'), 'views', row => pageNames[row.label]), 5, '', 'report-page-bars'),
    card('Event count by Event name', bars(group(current, 'event', 'count'), 'count')),
    card('Active users over time', trend('users')),
  ]));
}

function engagement() {
  content('Engagement overview', grid([
    card('Average engagement time per active user', kpi('Average engagement time', time(ratio(current.seconds, current.users))) + trend('avgEngagement'), 7),
    card('Views by Page title', bars(group(current, 'page', 'views'), 'views', row => pageNames[row.label]), 5, '', 'report-page-bars'),
    card('Event count by Event name', bars(group(current, 'event', 'count'), 'count')),
    card('Active users by Country', bars(group(current, 'country', 'users'), 'users'), 6, link('Demographic details_ Country.html', 'View countries')),
  ]));
}

function campaigns() {
  const cohorts = reportData.cohorts(range).map(row => [row.label, ...row.periods.map(value => value === null ? '—' : percent(value))]);
  const counts = [30, 7, 1].map(days => {
    const visibleDays = Math.min(days, range.end - range.start + 1);
    const data = reportData.summarize(reportData.last(visibleDays, false, range.end));
    return kpi('Last ' + visibleDays + (visibleDays === 1 ? ' day' : ' days'), number(data.users));
  });
  content('Reports snapshot with campaigns and cohorts', grid([
    card('Sessions by channel', bars(group(current, 'channel', 'sessions'), 'sessions'), 6, link('Traffic acquisition.html', 'View traffic acquisition')),
    card('Active users by Country', bars(group(current, 'country', 'users'), 'users'), 6, link('Demographic details_ Country.html', 'View countries')),
    card('User activity over time', '<div class="report-metrics">' + [...new Set(counts)].join('') + '</div>' + trend('users'), 7),
    card('User activity by cohort', table('First visit', Array.from({ length: 6 }, (_, i) => 'Week ' + i), cohorts, null, { search: false }), 5),
  ]));
}

const audienceMetrics = { users: 'Users', newUsers: 'New users', sessions: 'Sessions', views: 'Pageviews' };
const audienceDimensions = { country: 'Country', city: 'City', language: 'Language', browser: 'Browser', system: 'Operating system', provider: 'Service provider' };
let audienceMetric = 'users';
let audienceComparison = '';
let audienceGrain = 'day';
const oldAudienceDimension = store.getItem('audDim')?.toLowerCase();
let audienceDimension = Object.keys(audienceDimensions).find(key => audienceDimensions[key].toLowerCase() === oldAudienceDimension) || 'country';

function audiences() {
  const options = (items, value) => Object.entries(items).map(([key, title]) => `<option value="${key}"${key === value ? ' selected' : ''}>${title}</option>`).join('');
  const basicMetrics = Object.keys(audienceMetrics).map(metric => kpi(audienceMetrics[metric], number(current[metric]), '', 'data-stat="' + metric + '"'));
  const metrics = basicMetrics.concat([
    kpi('Sessions per user', ratio(current.sessions, current.users).toFixed(2)),
    kpi('Pages per session', ratio(current.views, current.sessions).toFixed(2)),
    kpi('Average engagement time per session', time(ratio(current.seconds, current.sessions))),
    kpi('Bounce rate', percent(ratio(current.sessions - current.engaged, current.sessions))),
  ]);
  const newShare = ratio(current.newUsers, current.users);
  content('Audiences', grid([
    card('Audience activity', `<div class="report-controls">
      <label>Metric <select data-audience-metric>${options(audienceMetrics, audienceMetric)}</select></label>
      <label>Compare metric <select data-audience-compare><option value="">Previous period setting</option>${options(audienceMetrics, audienceComparison)}</select></label>
      <label>Interval <select data-audience-grain>${options({ hour: 'Hour of day', day: 'Day', week: 'Week', month: '30-day intervals' }, audienceGrain)}</select></label>
      </div><div data-audience-chart></div><div class="report-metrics">${metrics.join('')}</div>`, 12),
    card('Visitor mix', `<div class="report-metrics">${kpi('New visitors', percent(newShare))}${kpi('Returning visitors', percent(1 - newShare))}</div>`, 4),
    card('Audience breakdown', `<div class="report-controls"><label>Dimension <select data-audience-dimension>${options(audienceDimensions, audienceDimension)}</select></label></div><div data-audience-breakdown></div>`, 8),
  ]));
  function drawChart() {
    let points = getSeries(audienceMetric, audienceGrain, !audienceComparison && range.compare);
    if (audienceComparison) {
      const other = getSeries(audienceComparison, audienceGrain, false);
      points = points.map((point, i) => ({ ...point, previous: other[i].value }));
    }
    main.querySelector('[data-audience-chart]').innerHTML = chart(points, audienceMetric, audienceMetrics[audienceComparison]);
  }
  function drawBreakdown() {
    const rows = group(current, audienceDimension, 'users');
    main.querySelector('[data-audience-breakdown]').innerHTML = table(audienceDimensions[audienceDimension],
      ['Active users', 'Share of active users'], rows.map(row => [esc(row.label), number(row.users), percent(ratio(row.users, current.users))]),
      [number(current.users), '100.0%'], { sorted: true, primary: true });
    bindTables();
  }
  main.querySelector('[data-audience-metric]').onchange = event => { audienceMetric = event.target.value; drawChart(); };
  main.querySelector('[data-audience-compare]').onchange = event => { audienceComparison = event.target.value; drawChart(); };
  main.querySelector('[data-audience-grain]').onchange = event => { audienceGrain = event.target.value; drawChart(); };
  main.querySelector('[data-audience-dimension]').onchange = event => {
    audienceDimension = event.target.value;
    store.setItem('audDim', audienceDimensions[audienceDimension]);
    drawBreakdown();
  };
  drawChart();
  drawBreakdown();
}

function minuteBars(values) {
  const max = Math.max(1, ...values);
  return '<div class="minute-bars" aria-label="Active users by minute">' +
    values.map((value, index) => `<i style="height:${value / max * 100}%" title="${values.length - 1 - index} minutes ago: ${value}"></i>`).join('') + '</div>';
}
function renderRealtime() {
  const report = reportData.realtime(realtimeMinutes);
  const activity = kpi('Active users', number(report.users), '', 'data-stat="users"') + minuteBars(report.minuteUsers);
  if (key === 'realtimePages') {
    const rows = group(report, 'page', 'views').map(row => [esc(pageNames[row.label]), number(row.views), number(row.users)]);
    content('Realtime pages', grid([
      card('Users per minute', activity, 8),
      card('Page views', kpi('Views', number(report.views), '', 'data-stat="views"'), 4),
    ]) + table('Page title', ['Views', 'Active users'], rows, [number(report.views), number(report.users)], { sorted: true, primary: true }), 'realtime');
    bindTables();
    return;
  }
  content('Realtime overview', grid([
    card('Users per minute', activity, 7),
    card('Active users by Country', bars(group(report, 'country', 'users').filter(row => row.users), 'users'), 5),
    card('Active users by first source', bars(group(report, 'source', 'users'), 'users'), 4),
    card('Views by Page title', bars(group(report, 'page', 'views'), 'views', row => pageNames[row.label]), 4, '', 'report-page-bars'),
    card('Event count', bars(group(report, 'event', 'count'), 'count'), 4),
  ]), 'realtime');
}

const renderers = {
  reports: snapshot, demographics, acquisition, tech: techDetails, techOverview, audiences, campaigns,
  pages: pagesPage, events: eventsPage, leads: () => objective(true), sales: () => objective(false),
  behavior, engagement, userOverview,
};

function renderHistorical() {
  current = reportData.summarize(range);
  comparison = range.compare && reportData.summarize(reportData.previous(range));
  seriesCache = new Map();
  renderers[key]();
}
function importPage(){
  const TYPES={
    'CSV':{desc:'Upload a .csv or .tsv file',fields:[['name','Data source name','Nicoo campaign costs'],['file','Campaign file','file'],['schedule','Import schedule','select:Manual|Daily|Weekly']]},
    'Google Sheets':{desc:'Connect a Google Sheets campaign table',fields:[['name','Data source name','Campaign sheet'],['sheetUrl','Google Sheets URL','https://docs.google.com/spreadsheets/...'],['range','Sheet / range','Campaigns!A:I'],['schedule','Import schedule','select:Daily|Weekly|Manual']]},
    'BigQuery':{desc:'Read campaign data from a BigQuery table',fields:[['name','Data source name','Campaign BigQuery'],['project','Project ID','my-project'],['dataset','Dataset','marketing'],['table','Table','campaign_costs'],['schedule','Import schedule','select:Daily|Weekly|Manual']]},
    'Amazon S3':{desc:'Import a CSV/TSV object from Amazon S3',fields:[['name','Data source name','Campaign S3'],['bucket','Bucket','my-campaign-data'],['object','Object path','imports/campaigns.csv'],['region','AWS region','eu-west-1'],['access','Access key ID','AKIA...'],['schedule','Import schedule','select:Daily|Weekly|Manual']]},
    'PostgreSQL':{desc:'Read campaign data from a PostgreSQL table',fields:[['name','Data source name','Campaign PostgreSQL'],['host','Host','db.example.com'],['port','Port','5432'],['database','Database','analytics'],['table','Schema.table','public.campaign_costs'],['username','Username','analytics_reader'],['password','Password','password'],['schedule','Import schedule','select:Daily|Weekly|Manual']]},
    'SFTP':{desc:'Import a CSV/TSV file over SFTP',fields:[['name','Data source name','Campaign SFTP'],['host','Host','sftp.example.com'],['port','Port','22'],['username','Username','analytics'],['password','Password','password'],['path','File path','/exports/campaigns.csv'],['schedule','Import schedule','select:Daily|Weekly|Manual']]}
  };
  const sourceKey='gaCampaignSourcesV2',historyKey='gaCampaignImportHistoryV2';
  const read=(k)=>{try{return JSON.parse(localStorage.getItem(k)||'[]')}catch{return[]}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
  const when=()=>new Date().toLocaleString([], {month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'});
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const baseHeaders=['utm_id','utm_campaign','utm_source','utm_medium','date','impressions','clicks','cost','currency'];
  const validateHeaders=(headers)=>{
    const h=headers.map(x=>String(x).trim().toLowerCase());
    const errors=[],warnings=[];
    ['utm_source','utm_medium','date'].forEach(x=>{if(!h.includes(x))errors.push('Missing required field: '+x)});
    if(!['impressions','clicks','cost'].some(x=>h.includes(x)))errors.push('Include at least one metric: impressions, clicks, or cost');
    if(h.includes('cost')&&!h.includes('currency'))warnings.push('Cost is present without a currency column. A static currency will be required.');
    if(!h.includes('utm_id'))warnings.push('utm_id is recommended for more reliable campaign matching.');
    if(!h.includes('utm_campaign'))warnings.push('utm_campaign is recommended for readable campaign names.');
    return {errors,warnings};
  };

  function historyHtml(history){
    if(!history.length)return '<div class="empty"><div><div class="empty-icon">▤</div><b>No import history</b><div class="sub">Validation runs will appear here.</div></div></div>';
    return '<table class="ga-table"><thead><tr><th>Run</th><th>Data source</th><th>Source</th><th>Rows</th><th>Errors</th><th>Status</th></tr></thead><tbody>'+
      history.slice(0,12).map(h=>'<tr><td>'+esc(h.time)+'</td><td>'+esc(h.sourceName)+'</td><td>'+esc(h.type)+'</td><td>'+esc(h.rows)+'</td><td>'+esc(h.errors)+'</td><td><span class="history-status '+(h.status==='Success'?'ok':h.status==='Running'?'running':'bad')+'">'+(h.status==='Success'?'●':'●')+' '+esc(h.status)+'</span></td></tr>').join('')+
      '</tbody></table>';
  }

  function render(){
    const sources=read(sourceKey),history=read(historyKey),latest=sources[0];
    const counts=Object.fromEntries(Object.keys(TYPES).map(t=>[t,sources.filter(s=>s.type===t).length]));
    const sourceCards=Object.entries(TYPES).map(([type,m])=>
      '<button class="source-pill" data-source="'+esc(type)+'"><b>'+esc(type)+'</b><small>'+esc(m.desc)+(counts[type]?' · '+counts[type]+' connected':'')+'</small></button>'
    ).join('');
    const status=latest
      ? '<div class="import-status"><div class="status-orb">✓</div><div class="status-copy"><b>'+esc(latest.name)+'</b><div class="status-meta">'+esc(latest.type)+' · '+esc(latest.schedule||'Manual')+'<br>Last validated '+esc(latest.lastValidated)+'</div><span class="status">✓ Ready for import</span></div></div>'+
        '<div class="source-summary"><div><strong>Campaign schema</strong><small>'+latest.headers.length+' mapped fields · '+(latest.rows||0)+' sampled rows</small></div><span class="source-badge">'+esc(latest.type)+'</span></div>'+
        '<div class="import-actions"><button class="primary" data-run="'+latest.id+'">Run validation</button><button class="btn-secondary" data-edit="'+latest.id+'">Edit</button><button class="btn-danger" data-delete="'+latest.id+'">Delete</button></div>'
      : '<div class="empty"><div><div class="empty-icon">⇧</div><b>No campaign data imports configured</b><div class="sub">Create a data source to validate campaign fields before importing.</div><button class="empty-action" data-create style="margin-top:14px">Create data source</button></div></div>';
    main.innerHTML=head('Campaign data import validation', 'management')+
      '<div class="content"><div class="import-panel"><div class="card"><h3>Campaign data sources</h3><div class="sub">Connect an import source to validate campaign data before it is joined with Analytics.</div><div class="source-list" style="margin-top:16px">'+sourceCards+'</div></div>'+
      '<div class="card"><h3>Validation status</h3>'+status+'</div></div>'+
      '<div class="ga-table-wrap" style="margin-top:14px"><div class="table-tools"><b>Import history</b><span class="right">Recent runs · '+history.length+' runs</span></div>'+historyHtml(history)+'</div></div>';
    bind();
    main.querySelector('[data-create]')?.addEventListener('click',()=>openWizard());
    main.querySelectorAll('[data-source]').forEach(b=>b.addEventListener('click',()=>openWizard(b.dataset.source)));
    main.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>openWizard('',b.dataset.edit)));
    main.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>{
      const list=read(sourceKey),s=list.find(x=>x.id===b.dataset.delete);
      if(!s)return;
      if(confirm('Delete '+s.name+'?')){write(sourceKey,list.filter(x=>x.id!==s.id));GAToast('Data source deleted');render()}
    }));
    main.querySelectorAll('[data-run]').forEach(b=>b.addEventListener('click',()=>runValidation(b.dataset.run)));
  }

  function fieldsFor(type,values={}){
    return TYPES[type].fields.map(([key,label,kind])=>{
      if(kind==='file')return '<div class="field full"><label>'+label+'</label><input type="file" data-field="'+key+'" accept=".csv,.tsv,text/csv,text/tab-separated-values"><small class="muted" data-file-note>'+(values.fileName?esc(values.fileName):'CSV or TSV with a header row')+'</small></div>';
      if(kind.startsWith('select:')){
        const opts=kind.slice(7).split('|');
        return '<div class="field"><label>'+label+'</label><select data-field="'+key+'">'+opts.map(o=>'<option '+((values[key]||'')===o?'selected':'')+'>'+o+'</option>').join('')+'</select></div>';
      }
      const pass=key==='password'?'password':'text';
      return '<div class="field '+(['sheetUrl','object','table','path'].includes(key)?'full':'')+'"><label>'+label+'</label><input type="'+pass+'" data-field="'+key+'" value="'+esc(values[key]||'')+'" placeholder="'+esc(kind)+'"></div>';
    }).join('');
  }

  function openWizard(preselected='',editId=''){
    const sources=read(sourceKey),editing=sources.find(x=>x.id===editId);
    const st={step:1,type:preselected||editing?.type||'',values:{...(editing?.config||{}),name:editing?.name||''},headers:editing?.headers?.slice()||[],rows:editing?.rows||0,fileName:editing?.config?.fileName||'',editId};
    const back=document.createElement('div');back.className='import-modal-backdrop';document.body.appendChild(back);
    const close=()=>back.remove();

    function collect(){
      back.querySelectorAll('[data-field]').forEach(el=>{
        if(el.type==='file')return;
        st.values[el.dataset.field]=el.value.trim();
      });
    }
    function body(){
      if(st.step===1)return '<h3 style="margin:0 0 6px">Choose an import source</h3><div class="sub" style="margin-bottom:14px">Campaign data import can connect to a file, sheet, warehouse, database, or secure file server.</div><div class="import-source-grid">'+Object.entries(TYPES).map(([t,m])=>'<button class="import-source-choice '+(st.type===t?'selected':'')+'" data-choice="'+esc(t)+'">'+esc(t)+'<small>'+esc(m.desc)+'</small></button>').join('')+'</div>';
      if(st.step===2)return '<h3 style="margin:0 0 6px">Configure '+esc(st.type)+'</h3><div class="sub" style="margin-bottom:14px">Enter the connection details Analytics would use to read your campaign data.</div><div class="field-grid">'+fieldsFor(st.type,{...st.values,fileName:st.fileName})+'</div>';
      const check=validateHeaders(st.headers.length?st.headers:baseHeaders);
      const rows=(st.headers.length?st.headers:baseHeaders).map(h=>'<div class="schema-row"><span>'+esc(h)+'</span><span>'+esc(h)+'</span><span class="'+(check.errors.some(e=>e.includes(h))?'schema-warn':'schema-ok')+'">'+(check.errors.some(e=>e.includes(h))?'Check':'Mapped')+'</span></div>').join('');
      return '<h3 style="margin:0 0 6px">Review field mapping</h3><div class="sub">Campaign source, medium and date are required. At least one campaign metric must be included.</div><div class="schema-box"><div class="schema-row head"><span>Source field</span><span>Analytics field</span><span>Status</span></div>'+rows+'</div>'+
        (check.errors.length?'<div style="margin-top:12px;color:#d93025;font-size:12px"><b>Fix before saving:</b><br>'+check.errors.map(esc).join('<br>')+'</div>':'')+
        (check.warnings.length?'<div style="margin-top:10px;color:#b06000;font-size:12px"><b>Recommendations:</b><br>'+check.warnings.map(esc).join('<br>')+'</div>':'');
    }
    function draw(){
      back.innerHTML='<div class="import-modal"><div class="import-modal-head"><h2>'+(st.editId?'Edit':'Create')+' campaign data source</h2><button class="import-modal-close">×</button></div><div class="import-steps"><i class="import-step on"></i><i class="import-step '+(st.step>=2?'on':'')+'"></i><i class="import-step '+(st.step>=3?'on':'')+'"></i></div><div class="import-modal-body">'+body()+'</div><div class="import-modal-foot">'+(st.step>1?'<button class="btn-secondary" data-back>Back</button>':'')+'<button class="btn-secondary" data-cancel>Cancel</button><button class="primary" data-next>'+(st.step===3?'Validate & save':'Next')+'</button></div></div>';
      back.querySelector('.import-modal-close').onclick=close;back.querySelector('[data-cancel]').onclick=close;
      back.querySelector('[data-back]')?.addEventListener('click',()=>{collect();st.step--;draw()});
      back.querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>{st.type=b.dataset.choice;draw()}));
      const file=back.querySelector('[data-field="file"]');
      if(file)file.addEventListener('change',()=>{
        const picked=file.files?.[0];if(!picked)return;
        st.fileName=picked.name;st.values.fileName=picked.name;
        const reader=new FileReader();
        reader.onload=()=>{
          const text=String(reader.result||'');
          const first=(text.split(/\r?\n/)[0]||'').trim();
          const sep=first.includes('\t')?'\t':',';
          st.headers=first.split(sep).map(x=>x.trim().replace(/^"|"$/g,'')).filter(Boolean);
          st.rows=Math.max(0,text.split(/\r?\n/).filter(Boolean).length-1);
          const note=back.querySelector('[data-file-note]');if(note)note.textContent=picked.name+' · '+st.rows+' data rows';
        };
        reader.readAsText(picked);
      });
      back.querySelector('[data-next]').onclick=()=>{
        collect();
        if(st.step===1){if(!st.type){GAToast('Choose a data source');return}st.step=2;draw();return}
        if(st.step===2){
          if(!st.values.name){GAToast('Enter a data source name');return}
          if(st.type==='CSV'&&!st.fileName&&!st.editId){GAToast('Choose a CSV or TSV file');return}
          const required={ 'Google Sheets':['sheetUrl','range'],'BigQuery':['project','dataset','table'],'Amazon S3':['bucket','object','region'],'PostgreSQL':['host','database','table','username'],'SFTP':['host','username','path'] }[st.type]||[];
          if(required.some(k=>!st.values[k])){GAToast('Complete the required connection fields');return}
          if(!st.headers.length)st.headers=baseHeaders.slice();
          st.step=3;draw();return;
        }
        const check=validateHeaders(st.headers);
        if(check.errors.length){GAToast('Schema has '+check.errors.length+' blocking issue'+(check.errors.length>1?'s':''));return}
        validateAndSave();
      };
    }
    function validateAndSave(){
      const modal=back.querySelector('.import-modal-body');
      const foot=back.querySelector('.import-modal-foot');
      foot.innerHTML='<button class="btn-secondary" disabled>Validating…</button>';
      const steps=['Connecting to '+st.type,'Reading column headers','Validating campaign schema','Checking campaign keys'];
      modal.innerHTML='<h3 style="margin:0">Validating data source</h3><div class="validation-log">'+steps.map((s,i)=>'<div data-v="'+i+'"><i class="'+(i===0?'spin':'')+'">'+(i===0?'↻':'')+'</i><span>'+esc(s)+'</span></div>').join('')+'</div>';
      let i=0;
      const tick=()=>{
        const row=modal.querySelector('[data-v="'+i+'"]');if(row){row.querySelector('i').className='';row.querySelector('i').textContent='✓'}
        i++;
        if(i<steps.length){const n=modal.querySelector('[data-v="'+i+'"] i');n.className='spin';n.textContent='↻';setTimeout(tick,360);return}
        setTimeout(()=>{
          const list=read(sourceKey),old=list.find(x=>x.id===st.editId);
          const item={id:old?.id||uid(),type:st.type,name:st.values.name,config:{...st.values,fileName:st.fileName},schedule:st.values.schedule||'Manual',status:'Ready',headers:st.headers,lastValidated:when(),rows:st.rows||old?.rows||24};
          const next=[item,...list.filter(x=>x.id!==item.id)];write(sourceKey,next);
          const hist=read(historyKey);hist.unshift({id:uid(),sourceId:item.id,sourceName:item.name,type:item.type,time:item.lastValidated,status:'Success',rows:item.rows,errors:0});write(historyKey,hist.slice(0,50));
          close();GAToast('Data source validated and saved');render();
        },420);
      };
      setTimeout(tick,360);
    }
    draw();
  }

  function runValidation(id){
    const list=read(sourceKey),s=list.find(x=>x.id===id);if(!s)return;
    window.GAProgress?.start();GAToast('Validating '+s.name+'…');
    setTimeout(()=>{
      s.lastValidated=when();write(sourceKey,[s,...list.filter(x=>x.id!==id)]);
      const hist=read(historyKey);hist.unshift({id:uid(),sourceId:s.id,sourceName:s.name,type:s.type,time:s.lastValidated,status:'Success',rows:s.rows||24,errors:0});write(historyKey,hist.slice(0,50));
      window.GAProgress?.done();GAToast('Validation successful');render();
    },900);
  }

  render();
}
function library(){
  const collectionKey='gaCustomCollectionsV1',reportKey='gaCustomReportsV1';
  const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'[]')}catch{return[]}};
  const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const customCollections=read(collectionKey),customReports=read(reportKey);
  const customCollectionCards=customCollections.map(x=>'<div class="library-card"><div class="collection-title"><h3>'+esc(x.name)+'</h3><span class="published">✓ Custom</span></div><div class="collection-items">'+esc(x.description||'Custom collection')+'</div></div>').join('');
  const customReportLines=customReports.length?customReports.map(x=>'<div style="padding:5px 0;border-bottom:1px solid #eee">'+esc(x.name)+' <span class="muted">· '+esc(x.type)+'</span></div>').join(''):'<div class="empty" style="min-height:110px"><div>No custom reports yet</div></div>';
  main.innerHTML=head('Library', 'management')+
    '<div class="content"><div class="lib-toolbar"><h2>Collections</h2><button class="primary" data-new-collection>Create new collection</button></div>'+
    '<div class="library-grid"><div class="library-card"><div class="collection-title"><h3>Business objectives</h3><span class="published">✓ Published</span></div><div class="collection-items">Generate leads<br>Drive sales<br>Understand web and/or app performance<br>View user engagement and retention</div></div>'+
    '<div class="library-card"><div class="collection-title"><h3>User</h3><span class="published">✓ Published</span></div><div class="collection-items">User attributes overview<br>Demographic details<br>Audiences<br>Tech overview<br>Tech details</div></div>'+
    '<div class="library-card"><div class="collection-title"><h3>App developer</h3><span class="published">✓ Published</span></div><div class="collection-items">Reports snapshot<br>Realtime overview<br>Realtime pages<br>Events<br>Pages and screens</div></div>'+customCollectionCards+'</div>'+
    '<div class="lib-toolbar" style="margin-top:24px"><h2>Reports</h2><button class="primary" data-new-report>Create new report</button></div>'+
    '<div class="library-grid"><div class="library-card"><h3>Detail reports</h3><div class="collection-items">Events<br>Pages and screens<br>Demographic details<br>Audiences<br>Tech details<br>Traffic acquisition</div></div>'+
    '<div class="library-card"><h3>Overview reports</h3><div class="collection-items">Reports snapshot<br>Realtime overview<br>Engagement overview<br>User attributes overview<br>Tech overview</div></div>'+
    '<div class="library-card"><h3>Custom reports</h3><div class="collection-items">'+customReportLines+'</div></div></div></div>';
  bind();
  document.querySelector('[data-new-collection]').onclick=()=>simpleModal('Create collection','<div class="field-grid"><div class="field full"><label>Collection name</label><input id="libCollectionName" placeholder="e.g. Marketing"></div><div class="field full"><label>Description</label><textarea id="libCollectionDesc" placeholder="What reports belong in this collection?"></textarea></div></div>',[
    {label:'Cancel',action:c=>c()},
    {label:'Create',primary:true,action:(close,bg)=>{const name=bg.querySelector('#libCollectionName').value.trim();if(!name){GAToast('Enter a collection name');return}const arr=read(collectionKey);arr.push({id:Date.now(),name,description:bg.querySelector('#libCollectionDesc').value.trim()});save(collectionKey,arr);close();GAToast('Collection created');library()}}
  ]);
  document.querySelector('[data-new-report]').onclick=()=>simpleModal('Create report','<div class="field-grid"><div class="field full"><label>Report name</label><input id="libReportName" placeholder="e.g. Campaign performance"></div><div class="field"><label>Report type</label><select id="libReportType"><option>Detail report</option><option>Overview report</option></select></div></div>',[
    {label:'Cancel',action:c=>c()},
    {label:'Create',primary:true,action:(close,bg)=>{const name=bg.querySelector('#libReportName').value.trim();if(!name){GAToast('Enter a report name');return}const arr=read(reportKey);arr.push({id:Date.now(),name,type:bg.querySelector('#libReportType').value});save(reportKey,arr);close();GAToast('Report created');library()}}
  ]);
}

if (key === 'import') importPage();
else if (key === 'library') library();
else if (key === 'realtime' || key === 'realtimePages') {
  renderRealtime();
  let minute = Math.floor(Date.now() / 60_000);
  setInterval(() => {
    const next = Math.floor(Date.now() / 60_000);
    if (next === minute || document.hidden || document.querySelector('.report-menu') ||
      main.contains(document.activeElement)) return;
    minute = next;
    renderRealtime();
  }, 2000);
}
else if (renderers[key]) {
  renderHistorical();
  const syncRange = () => {
    const selected = reportData.selectedRange();
    if (selected.start === range.start && selected.end === range.end &&
      selected.days === range.days && selected.compare === range.compare) return;
    range = selected;
    renderHistorical();
  };
  addEventListener('pageshow', syncRange);
  addEventListener('storage', syncRange);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) syncRange(); });
}
})();
