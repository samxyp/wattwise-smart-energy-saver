/* WattWise Smart Energy Saver
   Daily and weekly limits represent estimated electricity COST in naira.
   Energy calculations are estimates, not readings from a physical meter. */
"use strict";

// Short helper: $ (like jQuery's $) finds the first HTML element matching a CSS selector.
const $ = (selector) => document.querySelector(selector);
const STORAGE_KEYS = {
  appliances: "wattwise.appliances.v2",
  tariff: "wattwise.tariff.v2",
  dailyLimit: "wattwise.dailyLimit.v1",
  weeklyLimit: "wattwise.weeklyLimit.v1"
};
const palette = ["#D4AF37", "#F3C623", "#6EA8FE", "#7BDCB5", "#B9A2FF", "#FF9F7A", "#56CFE1", "#F28AB2"];
let applianceList = loadJSON(STORAGE_KEYS.appliances, []);
if (!Array.isArray(applianceList)) applianceList = [];
let nextId = Math.max(0, ...applianceList.map(item => Number(item.id) || 0)) + 1;
let chart = null;
let editingId = null;
let toastTimer = null;
let previousTotals = { daily: 0, weekly: 0 };
let lastFocusedElement = null;

const form = $("#applianceForm");
const rows = $("#applianceRows");
const modal = $("#limitModal");

// Read saved browser data. JSON.parse converts stored text back into JavaScript data.
// If storage is empty or unreadable, return the supplied safe default.
function loadJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}
// Save data in this browser only; this is not a cloud database or meter connection.
// JSON.stringify converts arrays/objects into text that localStorage can store.
function saveJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { showToast("Browser storage is unavailable. Your changes may not persist after closing the page."); }
}
function numberFormat(value, digits = 2) {
  return new Intl.NumberFormat("en-NG", { maximumFractionDigits: digits }).format(Number.isFinite(value) ? value : 0);
}
function naira(value) {
  return "₦" + numberFormat(value, 2);
}
function getTariff() {
  const inputValue = Number($("#tariff").value);
  return Number.isFinite(inputValue) && inputValue >= 0 ? inputValue : 0;
}
// Estimate daily energy: watts × quantity × hours ÷ 1,000 = kWh per day.
function energyPerDay(item) {
  return (Number(item.watts) * Number(item.quantity) * Number(item.hours)) / 1000;
}
// Convert a daily estimate into a day, 7-day week, or 30-day month estimate.
function energyFor(item, period = $("#period").value) {
  const days = period === "day" ? 1 : period === "week" ? 7 : 30;
  return energyPerDay(item) * days;
}
// Add the estimated energy from every appliance for the chosen period.
function totalEnergy(period = $("#period").value) {
  return applianceList.reduce((sum, item) => sum + energyFor(item, period), 0);
}
// Estimated naira cost = estimated kWh × the tariff entered by the user.
function totalCost(period = $("#period").value) {
  return totalEnergy(period) * getTariff();
}
function getLimits() {
  const daily = Number($("#dailyLimit").value);
  const weekly = Number($("#weeklyLimit").value);
  return {
    daily: Number.isFinite(daily) && daily > 0 ? daily : 0,
    weekly: Number.isFinite(weekly) && weekly > 0 ? weekly : 0
  };
}
// Escape user-entered text before inserting it into HTML, reducing HTML injection risk.
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}
function getIcon(name) {
  const value = name.toLowerCase();
  if (/fan/.test(value)) return "✺";
  if (/bulb|light|lamp/.test(value)) return "☼";
  if (/fridge|refrigerator|freezer/.test(value)) return "▣";
  if (/tv|television|monitor/.test(value)) return "▱";
  if (/iron/.test(value)) return "♨";
  if (/ac|air condition/.test(value)) return "❄";
  if (/kettle|boil/.test(value)) return "♨";
  if (/pump/.test(value)) return "↟";
  return "⚡";
}
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}
function persistAppliances() { saveJSON(STORAGE_KEYS.appliances, applianceList); }
// Calculate current daily/weekly estimates and whether either saved budget is exceeded.
function currentLimitState() {
  const limits = getLimits();
  const daily = totalCost("day");
  const weekly = totalCost("week");
  return {
    daily, weekly, limits,
    dailyExceeded: limits.daily > 0 && daily > limits.daily,
    weeklyExceeded: limits.weekly > 0 && weekly > limits.weekly
  };
}
// Compare the previous totals with the new totals and alert only when a limit is crossed
// or the amount over an already-breached limit increases.
function checkLimitCrossing(before, cause = "entry") {
  const after = currentLimitState();
  const breaches = [];
  if (after.dailyExceeded && (!before.dailyExceeded || after.daily > before.daily + 0.000001)) {
    breaches.push({ period: "daily", total: after.daily, limit: after.limits.daily, over: after.daily - after.limits.daily });
  }
  if (after.weeklyExceeded && (!before.weeklyExceeded || after.weekly > before.weekly + 0.000001)) {
    breaches.push({ period: "weekly", total: after.weekly, limit: after.limits.weekly, over: after.weekly - after.limits.weekly });
  }
  if (breaches.length) {
    openLimitModal(breaches, cause);
    highlightBreaches(breaches.map(item => item.period));
  }
  previousTotals = { daily: after.daily, weekly: after.weekly };
}
function openLimitModal(breaches, cause) {
  lastFocusedElement = document.activeElement;
  const periods = breaches.map(item => item.period);
  const labels = periods.length === 2 ? "Daily and weekly limits" : `${periods[0][0].toUpperCase()}${periods[0].slice(1)} limit`;
  $("#modalTitle").textContent = periods.length === 2 ? "Both Limits Exceeded!" : "Limit Exceeded!";
  $("#modalDescription").textContent = cause === "settings"
    ? "Your saved limits are lower than your current estimated electricity costs."
    : "This update pushed your estimated electricity cost beyond the limit shown below.";
  $("#modalDetails").innerHTML = breaches.map(item => `
    <div class="modal-detail">
      <strong>${item.period === "daily" ? "☀ Daily limit exceeded" : "▦ Weekly limit exceeded"}</strong>
      <span>Estimated total: ${naira(item.total)} · Limit: ${naira(item.limit)}</span>
      <span><b>Over by ${naira(item.over)}</b></span>
    </div>`).join("");
  modal.hidden = false;
  document.body.classList.add("modal-open");
  $("#acknowledgeModal").focus();
}
function closeLimitModal() {
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") lastFocusedElement.focus();
}
function highlightBreaches(periods) {
  const map = { daily: $("#dailyLimitCard"), weekly: $("#weeklyLimitCard") };
  periods.forEach(period => {
    const card = map[period];
    card.classList.remove("pulse");
    void card.offsetWidth;
    card.classList.add("pulse");
  });
}
function renderLimitCards() {
  const state = currentLimitState();
  const { daily, weekly, limits } = state;
  $("#dailyTotal").textContent = naira(daily);
  $("#weeklyTotal").textContent = naira(weekly);
  $("#dailyLimitDisplay").textContent = limits.daily ? naira(limits.daily) : "Not set";
  $("#weeklyLimitDisplay").textContent = limits.weekly ? naira(limits.weekly) : "Not set";

  const configs = [
    { period: "daily", total: daily, limit: limits.daily, card: $("#dailyLimitCard"), status: $("#dailyStatus"), progress: $("#dailyProgress"), caption: $("#dailyLimitCaption") },
    { period: "weekly", total: weekly, limit: limits.weekly, card: $("#weeklyLimitCard"), status: $("#weeklyStatus"), progress: $("#weeklyProgress"), caption: $("#weeklyLimitCaption") }
  ];
  configs.forEach(item => {
    const exceeded = item.limit > 0 && item.total > item.limit;
    const ratio = item.limit > 0 ? item.total / item.limit * 100 : 0;
    item.card.classList.toggle("exceeded", exceeded);
    item.status.classList.toggle("exceeded", exceeded);
    item.status.textContent = item.limit <= 0 ? "Not set" : exceeded ? "Over limit" : ratio >= 80 ? "Near limit" : "Within limit";
    item.progress.style.width = `${Math.min(100, ratio)}%`;
    item.caption.textContent = item.limit <= 0
      ? `Enter a ${item.period} limit above to track your estimate.`
      : exceeded
        ? `Over your ${item.period} limit by ${naira(item.total - item.limit)}.`
        : `${numberFormat(Math.max(0, 100 - ratio), 1)}% of your ${item.period} budget remains.`;
  });
}
// Main dashboard refresh: update summary numbers, progress bars, table, chart, tips and limits.
// This is called after appliance/settings changes so the displayed values stay in sync.
function render() {
  const tariff = getTariff();
  const monthlyKwh = totalEnergy("month");
  const monthlyCost = monthlyKwh * tariff;
  const count = applianceList.length;
  $("#monthlyKwh").innerHTML = `${numberFormat(monthlyKwh, 2)} <small>kWh</small>`;
  $("#monthlyCost").textContent = naira(monthlyCost);
  $("#applianceCount").textContent = numberFormat(count, 0);
  $("#potentialSavings").textContent = naira(monthlyCost * .1);
  $("#energyProgress").style.width = `${Math.min(100, monthlyKwh / 500 * 100)}%`;
  $("#costProgress").style.width = `${Math.min(100, monthlyCost / 50000 * 100)}%`;
  $("#applianceProgress").style.width = `${Math.min(100, count / 10 * 100)}%`;
  $("#savingsProgress").style.width = `${Math.min(100, monthlyCost * .1 / 5000 * 100)}%`;
  $("#impactKwh").textContent = `${numberFormat(totalEnergy(), 2)} kWh`;
  $("#impactCost").textContent = naira(totalCost());
  $("#tableSummary").textContent = `${count} appliance${count === 1 ? "" : "s"} added`;
  renderRows();
  renderChart();
  renderTips();
  renderLimitCards();
}
// Rebuild the appliance table from the current array. Edit/Delete buttons are wired below.
function renderRows() {
  if (!applianceList.length) {
    rows.innerHTML = `<tr class="empty-row"><td colspan="7"><div class="empty-state"><span>▤</span><strong>No appliances added yet</strong><p>Add an appliance above or load sample data to explore the dashboard.</p></div></td></tr>`;
    return;
  }
  rows.innerHTML = applianceList.map(item => {
    const energy = energyFor(item, "month");
    const cost = energy * getTariff();
    return `<tr>
      <td><div class="appliance-cell"><span class="appliance-avatar">${getIcon(item.name)}</span><span><span class="appliance-name">${escapeHtml(item.name)}</span><span class="appliance-kind">Household appliance</span></span></div></td>
      <td>${numberFormat(item.watts, 2)} W</td><td>${item.quantity}</td><td>${numberFormat(item.hours, 1)} h</td>
      <td><span class="energy-chip">${numberFormat(energy, 2)} kWh</span></td><td class="cost-cell">${naira(cost)}</td>
      <td><div class="action-group"><button class="edit-btn" data-edit="${item.id}" type="button" aria-label="Edit ${escapeHtml(item.name)}">Edit</button><button class="delete-btn" data-remove="${item.id}" type="button" aria-label="Remove ${escapeHtml(item.name)}">×</button></div></td>
    </tr>`;
  }).join("");
  rows.querySelectorAll("[data-edit]").forEach(button => button.addEventListener("click", () => startEdit(Number(button.dataset.edit))));
  rows.querySelectorAll("[data-remove]").forEach(button => button.addEventListener("click", () => removeAppliance(Number(button.dataset.remove))));
}
// Draw a doughnut chart using Chart.js. Each slice is an appliance's estimated energy.
// If Chart.js is unavailable (for example, offline), the rest of the app still works.
function renderChart() {
  const canvas = $("#energyChart");
  const legend = $("#chartLegend");
  if (typeof Chart === "undefined") {
    $("#chartTotal").textContent = numberFormat(totalEnergy(), 1);
    legend.innerHTML = `<p class="field-note">Chart library could not load. Calculations and appliance list still work; connect to the internet and refresh to load the chart.</p>`;
    return;
  }
  const sorted = [...applianceList].sort((a, b) => energyFor(b) - energyFor(a));
  const labels = sorted.map(item => item.name);
  const values = sorted.map(item => Number(energyFor(item).toFixed(3)));
  const colors = sorted.map((_, index) => palette[index % palette.length]);
  if (chart) chart.destroy();
  chart = new Chart(canvas, {
    type: "doughnut",
    data: { labels, datasets: [{ data: values.length ? values : [1], backgroundColor: values.length ? colors : ["rgba(203,213,225,.12)"], borderWidth: 2, borderColor: "#112240", hoverOffset: 6 }] },
    options: {
      responsive: true, maintainAspectRatio: true, cutout: "76%",
      plugins: { legend: { display: false }, tooltip: { enabled: values.length > 0, callbacks: { label: context => `${context.label}: ${numberFormat(context.raw, 2)} kWh` } } }
    }
  });
  $("#chartTotal").textContent = numberFormat(totalEnergy(), 2);
  legend.innerHTML = sorted.slice(0, 6).map((item, index) => `
    <div class="legend-item"><span class="legend-dot" style="background:${colors[index]}"></span><span class="legend-label">${escapeHtml(item.name)}</span><span class="legend-value">${numberFormat(energyFor(item), 1)} kWh</span></div>`).join("");
  if (!sorted.length) legend.innerHTML = `<div class="legend-item"><span class="legend-dot" style="background:rgba(203,213,225,.3)"></span><span class="legend-label">No data yet</span><span class="legend-value">0 kWh</span></div>`;
}
// Create simple energy-saving suggestions based on the appliances entered by the user.
function renderTips() {
  if (!applianceList.length) {
    $("#tipList").innerHTML = `
      <div class="tip-item"><span class="tip-number">01</span><div><strong>Start with your biggest users</strong><p>Add appliances to see which ones account for the most estimated consumption.</p></div></div>
      <div class="tip-item"><span class="tip-number">02</span><div><strong>Switch off idle devices</strong><p>Turn off lights, fans and electronics when they are not needed.</p></div></div>
      <div class="tip-item"><span class="tip-number">03</span><div><strong>Choose efficient appliances</strong><p>LED lighting and energy-efficient appliances can reduce electricity demand.</p></div></div>`;
    return;
  }
  const sorted = [...applianceList].sort((a, b) => energyPerDay(b) - energyPerDay(a));
  const top = sorted[0];
  const hoursTip = top.hours > 6 ? `Your ${escapeHtml(top.name)} is estimated to run ${numberFormat(top.hours, 1)} hours daily. Review whether that runtime can be reduced.` : `Your ${escapeHtml(top.name)} is currently your largest estimated daily energy user.`;
  $("#tipList").innerHTML = `
    <div class="tip-item"><span class="tip-number">01</span><div><strong>Review your biggest energy user</strong><p>${hoursTip}</p></div></div>
    <div class="tip-item"><span class="tip-number">02</span><div><strong>Use your limit alerts</strong><p>Set realistic daily and weekly cost limits, then check which appliance changes help you stay within budget.</p></div></div>
    <div class="tip-item"><span class="tip-number">03</span><div><strong>Make small changes consistently</strong><p>Switch off unused devices and choose efficient appliances where practical.</p></div></div>`;
}
function startEdit(id) {
  const item = applianceList.find(entry => entry.id === id);
  if (!item) return;
  editingId = id;
  $("#applianceName").value = item.name;
  $("#watts").value = item.watts;
  $("#quantity").value = item.quantity;
  $("#hours").value = item.hours;
  $("#submitAppliance").textContent = "Save appliance changes";
  $("#cancelEdit").classList.remove("hidden");
  $("#formMessage").textContent = `Editing ${item.name}. Save changes to update your totals.`;
  $("#appliance-form-section").scrollIntoView({ behavior: "smooth", block: "start" });
  $("#applianceName").focus({ preventScroll: true });
}
function resetApplianceForm() {
  editingId = null;
  form.reset();
  $("#quantity").value = "1";
  $("#hours").value = "8";
  $("#tariff").value = String(loadJSON(STORAGE_KEYS.tariff, 100));
  $("#submitAppliance").textContent = "＋ Add to energy estimate";
  $("#cancelEdit").classList.add("hidden");
  $("#formMessage").textContent = "";
}
function removeAppliance(id) {
  const before = currentLimitState();
  const index = applianceList.findIndex(item => item.id === id);
  if (index < 0) return;
  const [removed] = applianceList.splice(index, 1);
  if (editingId === id) resetApplianceForm();
  persistAppliances();
  render();
  previousTotals = { daily: totalCost("day"), weekly: totalCost("week") };
  showToast(`${removed.name} removed from your estimate.`);
}
function validAppliance(name, watts, quantity, hours) {
  return Boolean(name) && Number.isFinite(watts) && watts > 0 && watts <= 100000 &&
    Number.isInteger(quantity) && quantity >= 1 && quantity <= 100 &&
    Number.isFinite(hours) && hours > 0 && hours <= 24;
}

// Handle Add/Update appliance form submission without reloading the webpage.
form.addEventListener("submit", event => {
  event.preventDefault();
  const name = $("#applianceName").value.trim();
  const watts = Number($("#watts").value);
  const quantity = Number($("#quantity").value);
  const hours = Number($("#hours").value);
  if (!validAppliance(name, watts, quantity, hours)) {
    $("#formMessage").textContent = "Enter a name, positive wattage, quantity from 1–100 and daily usage above 0 up to 24 hours.";
    showToast("Please check the appliance details and try again.");
    return;
  }
  const before = currentLimitState();
  const wasEditing = editingId !== null;
  if (editingId !== null) {
    const index = applianceList.findIndex(item => item.id === editingId);
    if (index >= 0) applianceList[index] = { ...applianceList[index], name, watts, quantity, hours };
  } else {
    applianceList.push({ id: nextId++, name, watts, quantity, hours });
  }
  persistAppliances();
  resetApplianceForm();
  render();
  checkLimitCrossing(before, "entry");
  showToast(`${name} ${wasEditing ? "updated in" : "added to"} your energy estimate.`);
});

$("#tariff").addEventListener("change", () => {
  const before = { daily: previousTotals.daily, weekly: previousTotals.weekly,
    dailyExceeded: getLimits().daily > 0 && previousTotals.daily > getLimits().daily,
    weeklyExceeded: getLimits().weekly > 0 && previousTotals.weekly > getLimits().weekly };
  const value = Number($("#tariff").value);
  if (!Number.isFinite(value) || value < 0 || value > 1000000) {
    showToast("Enter a valid tariff of ₦0 or more.");
    $("#tariff").value = String(loadJSON(STORAGE_KEYS.tariff, 100));
    return;
  }
  saveJSON(STORAGE_KEYS.tariff, value);
  render();
  checkLimitCrossing(before, "entry");
});
$("#tariff").addEventListener("input", () => {
  // Recalculate live while typing; crossing alerts are evaluated on change/blur.
  render();
});
$("#period").addEventListener("change", render);
$("#refreshChart").addEventListener("click", () => { renderChart(); showToast("Energy breakdown refreshed."); });
$("#clearAll").addEventListener("click", () => {
  if (!applianceList.length) { showToast("Your appliance list is already empty."); return; }
  applianceList = [];
  persistAppliances();
  render();
  previousTotals = { daily: 0, weekly: 0 };
  showToast("All appliances cleared.");
});
// Demo helper: replace the list with example household appliances so the dashboard is easy to test.
$("#loadSample").addEventListener("click", () => {
  const before = currentLimitState();
  const sample = [
    { name: "Standing fan", watts: 75, quantity: 2, hours: 8 },
    { name: "LED bulbs", watts: 10, quantity: 6, hours: 6 },
    { name: "Refrigerator", watts: 150, quantity: 1, hours: 10 },
    { name: "Television", watts: 100, quantity: 1, hours: 5 },
    { name: "Electric iron", watts: 1000, quantity: 1, hours: 0.5 }
  ];
  applianceList = sample.map(item => ({ id: nextId++, ...item }));
  persistAppliances();
  render();
  checkLimitCrossing(before, "entry");
  showToast("Sample appliances loaded. Edit them to match your home.");
});
$("#limitsForm").addEventListener("submit", event => {
  event.preventDefault();
  const daily = Number($("#dailyLimit").value);
  const weekly = Number($("#weeklyLimit").value);
  if (!Number.isFinite(daily) || daily < 0 || !Number.isFinite(weekly) || weekly < 0) {
    showToast("Enter valid daily and weekly limits. Use 0 to disable a limit.");
    return;
  }
  const before = currentLimitState();
  saveJSON(STORAGE_KEYS.dailyLimit, daily);
  saveJSON(STORAGE_KEYS.weeklyLimit, weekly);
  render();
  const state = currentLimitState();
  const breaches = [];
  if (daily > 0 && state.daily > daily) breaches.push({ period: "daily", total: state.daily, limit: daily, over: state.daily - daily });
  if (weekly > 0 && state.weekly > weekly) breaches.push({ period: "weekly", total: state.weekly, limit: weekly, over: state.weekly - weekly });
  if (breaches.length) {
    openLimitModal(breaches, "settings");
    highlightBreaches(breaches.map(item => item.period));
  } else {
    showToast("Daily and weekly limits saved in this browser.");
  }
  previousTotals = { daily: state.daily, weekly: state.weekly };
});
$("#cancelEdit").addEventListener("click", resetApplianceForm);
$("#menuToggle").addEventListener("click", () => {
  const open = $("#sidebar").classList.toggle("open");
  $("#menuToggle").setAttribute("aria-expanded", String(open));
});
document.querySelectorAll(".nav-link").forEach(link => link.addEventListener("click", () => {
  document.querySelectorAll(".nav-link").forEach(item => item.classList.remove("active"));
  link.classList.add("active");
  $("#sidebar").classList.remove("open");
  $("#menuToggle").setAttribute("aria-expanded", "false");
}));
$("#acknowledgeModal").addEventListener("click", closeLimitModal);
modal.addEventListener("click", event => { if (event.target === modal) closeLimitModal(); });
document.addEventListener("keydown", event => { if (event.key === "Escape" && !modal.hidden) closeLimitModal(); });

// The meter panel is an explainer only. This button deliberately does not claim to connect hardware.
$("#checkMeterConnection").addEventListener("click", () => {
  $("#meterActionMessage").textContent = "No hardware is connected in this school demo. To go live, first identify the meter model/protocol and use an approved API or gateway. For individual appliances, add compatible smart plugs or circuit sub-meters.";
  showToast("Connection options displayed — no meter was connected.");
});

// Hide the branded entrance screen after about one second, then leave the dashboard ready to use.
window.setTimeout(() => {
  const splash = $("#splashScreen");
  if (splash) splash.classList.add("is-hidden");
}, 1000);

/* Restore persisted settings and appliance list from this browser. */
$("#tariff").value = String(loadJSON(STORAGE_KEYS.tariff, 100));
const savedDaily = loadJSON(STORAGE_KEYS.dailyLimit, "");
const savedWeekly = loadJSON(STORAGE_KEYS.weeklyLimit, "");
$("#dailyLimit").value = savedDaily === "" ? "" : String(savedDaily);
$("#weeklyLimit").value = savedWeekly === "" ? "" : String(savedWeekly);
previousTotals = { daily: totalCost("day"), weekly: totalCost("week") };
render();
