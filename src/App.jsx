import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Badge, Label, Input, Select } from './components/ui.jsx';
import {
  MODES,
  legDuration,
  transferGap,
  gapLevel,
  gapLabel,
  tripStats,
  leaveByTime,
  formatMinutes,
  formatDuration,
  validateLeg,
  tripSummaryText,
  newId,
} from './lib/trip.js';
import { SAMPLE_TRIPS } from './data/samples.js';

const STORAGE_KEY = 'pophop-trips-v1';
const MODE_TONE = { Bus: 'coral', Train: 'grape', Walk: 'mint', Ride: 'tang', Ferry: 'sky', Flight: 'grape' };
const GAP_TONE = { comfortable: 'mint', tight: 'tang', risky: 'coral', missed: 'coral', unknown: 'lilac' };

function loadTrips() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SAMPLE_TRIPS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return SAMPLE_TRIPS;
    return parsed;
  } catch {
    return SAMPLE_TRIPS;
  }
}

const EMPTY_LEG = { mode: 'Bus', from: '', to: '', depart: '07:00', arrive: '08:00', note: '' };

export default function App() {
  const [trips, setTrips] = useState(loadTrips);
  const [activeId, setActiveId] = useState(() => loadTrips()[0]?.id);
  const [draft, setDraft] = useState(EMPTY_LEG);
  const [errors, setErrors] = useState([]);
  const [tripName, setTripName] = useState('');
  const [followMode, setFollowMode] = useState(false);
  const [done, setDone] = useState({});
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    } catch {
      // storage full or blocked, keep working in memory
    }
  }, [trips]);

  const active = trips.find((t) => t.id === activeId) || trips[0];
  const stats = useMemo(() => tripStats(active?.legs || []), [active]);
  const leaveBy = active?.legs?.length
    ? leaveByTime(active.legs[0].depart, active.toStation ?? 20, active.buffer ?? 10)
    : null;
  const doneCount = (active?.legs || []).filter((leg) => done[leg.id]).length;
  const progress = active?.legs?.length ? Math.round((doneCount / active.legs.length) * 100) : 0;

  function updateTrip(patch) {
    setTrips((prev) => prev.map((t) => (t.id === active.id ? { ...t, ...patch } : t)));
  }

  function addLeg(event) {
    event.preventDefault();
    const found = validateLeg(draft);
    setErrors(found);
    if (found.length > 0) return;
    const leg = { ...draft, id: newId(), from: draft.from.trim(), to: draft.to.trim(), note: draft.note.trim() };
    updateTrip({ legs: [...(active.legs || []), leg] });
    setDraft({ ...EMPTY_LEG, from: leg.to, depart: leg.arrive });
  }

  function removeLeg(id) {
    updateTrip({ legs: (active.legs || []).filter((leg) => leg.id !== id) });
  }

  function createTrip(event) {
    event.preventDefault();
    const name = tripName.trim() || 'My new trip';
    const trip = { id: newId(), name, toStation: 20, buffer: 10, legs: [] };
    setTrips((prev) => [...prev, trip]);
    setActiveId(trip.id);
    setTripName('');
    setFollowMode(false);
  }

  function duplicateTrip() {
    const copy = {
      ...active,
      id: newId(),
      name: `${active.name} (copy)`,
      legs: (active.legs || []).map((leg) => ({ ...leg, id: newId() })),
    };
    setTrips((prev) => [...prev, copy]);
    setActiveId(copy.id);
  }

  function deleteTrip(id) {
    setTrips((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (next.length === 0) return SAMPLE_TRIPS;
      if (activeId === id) setActiveId(next[0].id);
      return next;
    });
    setConfirmDelete(null);
  }

  async function copyPlan() {
    try {
      await navigator.clipboard.writeText(tripSummaryText(active));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (!active) return <p className="p-8 font-bold">No trips yet.</p>;

  return (
    <div className="min-h-screen">
      <header className="dot-grid border-b-2 border-ink bg-white">
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-8">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="tang" className="-rotate-2">Everyday trips, made clear</Badge>
            <Badge tone="lilac" className="rotate-1">Works offline</Badge>
            <Badge tone="blush" className="-rotate-1">No sign up needed</Badge>
          </div>
          <h1 className="mt-4 text-5xl font-extrabold leading-none tracking-tight sm:text-6xl">
            Pop<span className="text-coral">Hop</span>
          </h1>
          <p className="mt-3 max-w-2xl text-lg font-semibold text-ink/80">
            Turn a confusing multi-stop trip into big, clear step cards. See every transfer, spot the risky ones, and know exactly when to leave home.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="coral" onClick={() => document.getElementById('builder')?.scrollIntoView({ behavior: 'smooth' })}>
              Plan my trip
            </Button>
            <Button variant="white" onClick={() => setFollowMode((v) => !v)} aria-pressed={followMode}>
              {followMode ? 'Exit follow mode' : 'Follow along mode'}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[380px_1fr]">
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-extrabold">Your trips</h2>
            <p className="mt-1 text-sm font-semibold text-ink/70">Saved on this device. Pick one to see its step cards.</p>
            <div className="mt-4 space-y-2" role="listbox" aria-label="Saved trips">
              {trips.map((trip) => (
                <button
                  key={trip.id}
                  role="option"
                  aria-selected={trip.id === active.id}
                  onClick={() => { setActiveId(trip.id); setFollowMode(false); }}
                  className={`w-full rounded-2xl border-2 border-ink px-4 py-3 text-left font-extrabold shadow-chunkSm ${trip.id === active.id ? 'bg-grape text-white' : 'bg-white text-ink'}`}
                >
                  {trip.name}
                  <span className={`block text-xs font-bold ${trip.id === active.id ? 'text-white/80' : 'text-ink/60'}`}>
                    {(trip.legs || []).length} steps
                  </span>
                </button>
              ))}
            </div>
            <form onSubmit={createTrip} className="mt-5">
              <Label htmlFor="trip-name">New trip name</Label>
              <div className="flex gap-2">
                <Input id="trip-name" value={tripName} onChange={(e) => setTripName(e.target.value)} placeholder="School run, market day..." />
                <Button type="submit" variant="tang">Add</Button>
              </div>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="white" onClick={duplicateTrip}>Duplicate</Button>
              {confirmDelete === active.id ? (
                <>
                  <Button variant="coral" onClick={() => deleteTrip(active.id)}>Yes, delete</Button>
                  <Button variant="white" onClick={() => setConfirmDelete(null)}>Keep it</Button>
                </>
              ) : (
                <Button variant="white" onClick={() => setConfirmDelete(active.id)}>Delete trip</Button>
              )}
            </div>
          </Card>

          <Card className="bg-blush" >
            <h2 className="text-xl font-extrabold">Leave home by</h2>
            <p className="mt-1 text-sm font-semibold text-ink/70">
              We work backwards from your first departure, plus the trip to the stop and a safety buffer.
            </p>
            <p className="mt-3 text-5xl font-extrabold text-coral">{formatMinutes(leaveBy)}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="to-station">Minutes to stop</Label>
                <Input id="to-station" type="number" min="0" max="240" value={active.toStation ?? 20}
                  onChange={(e) => updateTrip({ toStation: Number(e.target.value) })} />
              </div>
              <div>
                <Label htmlFor="buffer">Buffer minutes</Label>
                <Input id="buffer" type="number" min="0" max="120" value={active.buffer ?? 10}
                  onChange={(e) => updateTrip({ buffer: Number(e.target.value) })} />
              </div>
            </div>
          </Card>

          <Card>
            <h2 id="builder" className="text-xl font-extrabold">Add a step</h2>
            <p className="mt-1 text-sm font-semibold text-ink/70">One ride or walk at a time. PopHop checks the gaps between steps for you.</p>
            {errors.length > 0 && (
              <div role="alert" className="mt-3 rounded-2xl border-2 border-ink bg-white p-3">
                {errors.map((err) => <p key={err} className="text-sm font-bold text-coral">{err}</p>)}
              </div>
            )}
            <form onSubmit={addLeg} className="mt-4 space-y-3">
              <div>
                <Label htmlFor="mode">How are you moving?</Label>
                <Select id="mode" value={draft.mode} onChange={(e) => setDraft({ ...draft, mode: e.target.value })}>
                  {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                </Select>
              </div>
              <div>
                <Label htmlFor="from">From</Label>
                <Input id="from" value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })} placeholder="Bida motor park" />
              </div>
              <div>
                <Label htmlFor="to">To</Label>
                <Input id="to" value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} placeholder="Minna park" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="depart">Leaves at</Label>
                  <Input id="depart" type="time" value={draft.depart} onChange={(e) => setDraft({ ...draft, depart: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="arrive">Arrives at</Label>
                  <Input id="arrive" type="time" value={draft.arrive} onChange={(e) => setDraft({ ...draft, arrive: e.target.value })} />
                </div>
              </div>
              <div>
                <Label htmlFor="note">Note (optional)</Label>
                <Input id="note" value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} placeholder="Keep ticket handy" />
              </div>
              <Button type="submit" variant="coral" className="w-full">Add this step</Button>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-lilac">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-extrabold">{active.name}</h2>
                <p className="mt-1 font-semibold text-ink/70">
                  {stats.legCount} steps. Total {formatDuration(stats.totalMinutes)}. Travel {formatDuration(stats.travelMinutes)}, waiting {formatDuration(stats.waitingMinutes)}.
                </p>
              </div>
              <Badge tone={stats.riskyCount > 0 ? 'coral' : 'mint'}>
                {stats.riskyCount > 0 ? `${stats.riskyCount} risky transfer${stats.riskyCount > 1 ? 's' : ''}` : 'All transfers look safe'}
              </Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border-2 border-ink bg-white p-3 text-center">
                <p className="text-2xl font-extrabold">{formatDuration(stats.travelMinutes)}</p>
                <p className="text-xs font-extrabold uppercase text-ink/60">Moving</p>
              </div>
              <div className="rounded-2xl border-2 border-ink bg-white p-3 text-center">
                <p className="text-2xl font-extrabold">{formatDuration(stats.waitingMinutes)}</p>
                <p className="text-xs font-extrabold uppercase text-ink/60">Waiting</p>
              </div>
              <div className="rounded-2xl border-2 border-ink bg-white p-3 text-center">
                <p className="text-2xl font-extrabold">{formatDuration(stats.longestWaitMinutes)}</p>
                <p className="text-xs font-extrabold uppercase text-ink/60">Longest wait</p>
              </div>
              <div className="rounded-2xl border-2 border-ink bg-white p-3 text-center">
                <p className="text-2xl font-extrabold">{formatMinutes(leaveBy)}</p>
                <p className="text-xs font-extrabold uppercase text-ink/60">Leave home</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="grape" onClick={copyPlan}>{copied ? 'Copied - paste it anywhere' : 'Copy plan as text'}</Button>
              <Button variant="white" onClick={() => window.print()}>Print step cards</Button>
            </div>
          </Card>

          {followMode && (
            <Card className="bg-tang">
              <h2 className="text-xl font-extrabold">Follow along</h2>
              <p className="mt-1 font-semibold text-ink/80">Tick each step as you finish it. {doneCount} of {(active.legs || []).length} done.</p>
              <div className="mt-3 h-5 overflow-hidden rounded-full border-2 border-ink bg-white" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
                <div className="h-full bg-mint" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-sm font-extrabold">{progress}% of the trip done</p>
            </Card>
          )}

          <div className="space-y-4">
            {(active.legs || []).length === 0 && (
              <Card>
                <h2 className="text-xl font-extrabold">No steps yet</h2>
                <p className="mt-1 font-semibold text-ink/70">Add your first ride or walk with the form. Your step cards will appear here.</p>
              </Card>
            )}
            {(active.legs || []).map((leg, index) => {
              const next = (active.legs || [])[index + 1];
              const gap = next ? transferGap(leg, next) : null;
              const level = gapLevel(gap);
              const isDone = Boolean(done[leg.id]);
              return (
                <div key={leg.id}>
                  <Card className={isDone ? 'bg-mint/10' : ''}>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={MODE_TONE[leg.mode] || 'lilac'}>Step {index + 1} - {leg.mode}</Badge>
                      <Badge tone="white">{leg.depart} to {leg.arrive}</Badge>
                      <Badge tone="blush">{formatDuration(legDuration(leg))}</Badge>
                    </div>
                    <h3 className="mt-3 text-2xl font-extrabold leading-tight">{leg.from} to {leg.to}</h3>
                    {leg.note && <p className="mt-1 font-semibold text-ink/70">{leg.note}</p>}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {followMode && (
                        <Button variant={isDone ? 'mint' : 'white'} onClick={() => setDone((d) => ({ ...d, [leg.id]: !d[leg.id] }))}>
                          {isDone ? 'Done - tap to undo' : 'Mark as done'}
                        </Button>
                      )}
                      <Button variant="white" onClick={() => removeLeg(leg.id)}>Remove step</Button>
                    </div>
                  </Card>
                  {next && (
                    <div className="flex justify-center py-1">
                      <Badge tone={GAP_TONE[level]} className="text-sm">
                        Transfer {formatDuration(gap)} - {gapLabel(level)}
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Card>
            <h2 className="text-xl font-extrabold">How to read the transfer badges</h2>
            <ul className="mt-3 space-y-2 font-semibold text-ink/80">
              <li><Badge tone="mint">Comfortable</Badge> 20 minutes or more. Relax, you have time.</li>
              <li><Badge tone="tang">Tight - hurry</Badge> 8 to 19 minutes. Keep moving, no long stops.</li>
              <li><Badge tone="coral">Risky - very short</Badge> Under 8 minutes. Consider an earlier first ride.</li>
              <li><Badge tone="coral">Missed connection</Badge> The next ride leaves before you arrive. Change the times.</li>
            </ul>
          </Card>
        </div>
      </main>

      <footer className="border-t-2 border-ink bg-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6">
          <p className="font-extrabold">PopHop - clear steps for confusing trips.</p>
          <p className="text-sm font-semibold text-white/70">Built by Ibrahim Yahaya. Your trips stay on this device.</p>
        </div>
      </footer>
    </div>
  );
}
