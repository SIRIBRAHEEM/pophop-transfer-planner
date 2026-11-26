export const MODES = ['Bus', 'Train', 'Walk', 'Ride', 'Ferry', 'Flight'];

export function parseTime(value) {
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function formatMinutes(total) {
  if (total === null || total === undefined || Number.isNaN(total)) return '--:--';
  const wrapped = ((total % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatDuration(minutes) {
  if (minutes === null || minutes === undefined || Number.isNaN(minutes)) return '-';
  const sign = minutes < 0 ? '-' : '';
  const abs = Math.abs(Math.round(minutes));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h === 0) return `${sign}${m} min`;
  if (m === 0) return `${sign}${h} hr`;
  return `${sign}${h} hr ${m} min`;
}

export function legDuration(leg) {
  const dep = parseTime(leg.depart);
  const arr = parseTime(leg.arrive);
  if (dep === null || arr === null) return null;
  let diff = arr - dep;
  if (diff < 0) diff += 1440;
  return diff;
}

export function transferGap(prevLeg, nextLeg) {
  const arr = parseTime(prevLeg.arrive);
  const dep = parseTime(nextLeg.depart);
  if (arr === null || dep === null) return null;
  let gap = dep - arr;
  if (gap < -720) gap += 1440;
  return gap;
}

export function gapLevel(gap) {
  if (gap === null || gap === undefined) return 'unknown';
  if (gap < 0) return 'missed';
  if (gap < 8) return 'risky';
  if (gap < 20) return 'tight';
  return 'comfortable';
}

export function gapLabel(level) {
  const labels = {
    comfortable: 'Comfortable',
    tight: 'Tight - hurry',
    risky: 'Risky - very short',
    missed: 'Missed connection',
    unknown: 'Check times',
  };
  return labels[level] || labels.unknown;
}

export function tripStats(legs) {
  const clean = (legs || []).filter(Boolean);
  let travel = 0;
  let waiting = 0;
  let longestWait = 0;
  let riskyCount = 0;
  clean.forEach((leg, index) => {
    const d = legDuration(leg);
    if (d !== null) travel += d;
    if (index > 0) {
      const gap = transferGap(clean[index - 1], leg);
      if (gap !== null) {
        if (gap > 0) waiting += gap;
        if (gap > longestWait) longestWait = gap;
        const level = gapLevel(gap);
        if (level === 'risky' || level === 'missed') riskyCount += 1;
      }
    }
  });
  const firstDep = clean.length ? parseTime(clean[0].depart) : null;
  const lastArr = clean.length ? parseTime(clean[clean.length - 1].arrive) : null;
  let total = null;
  if (firstDep !== null && lastArr !== null) {
    total = lastArr - firstDep;
    if (total < 0) total += 1440;
  }
  return {
    legCount: clean.length,
    travelMinutes: travel,
    waitingMinutes: waiting,
    longestWaitMinutes: longestWait,
    riskyCount,
    totalMinutes: total,
    firstDepart: firstDep,
    lastArrive: lastArr,
  };
}

export function leaveByTime(firstDepart, minutesToStation, bufferMinutes = 10) {
  const dep = parseTime(firstDepart);
  if (dep === null) return null;
  const travel = Number(minutesToStation) || 0;
  const buffer = Number(bufferMinutes) || 0;
  return dep - travel - buffer;
}

export function validateLeg(leg) {
  const errors = [];
  if (!leg.from || !leg.from.trim()) errors.push('Start place is missing.');
  if (!leg.to || !leg.to.trim()) errors.push('End place is missing.');
  if (parseTime(leg.depart) === null) errors.push('Departure time must look like 07:30.');
  if (parseTime(leg.arrive) === null) errors.push('Arrival time must look like 09:15.');
  if (leg.from && leg.to && leg.from.trim().toLowerCase() === leg.to.trim().toLowerCase()) {
    errors.push('Start and end places are the same.');
  }
  return errors;
}

export function tripSummaryText(trip) {
  const lines = [`${trip.name} - PopHop plan`];
  (trip.legs || []).forEach((leg, index) => {
    lines.push(`${index + 1}. ${leg.mode} ${leg.from} to ${leg.to}, ${leg.depart} to ${leg.arrive} (${formatDuration(legDuration(leg))})`);
    const next = (trip.legs || [])[index + 1];
    if (next) {
      const gap = transferGap(leg, next);
      lines.push(`   Transfer: ${formatDuration(gap)} - ${gapLabel(gapLevel(gap))}`);
    }
  });
  const stats = tripStats(trip.legs || []);
  lines.push(`Total trip: ${formatDuration(stats.totalMinutes)}. Travel ${formatDuration(stats.travelMinutes)}, waiting ${formatDuration(stats.waitingMinutes)}.`);
  return lines.join('\n');
}

export function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
