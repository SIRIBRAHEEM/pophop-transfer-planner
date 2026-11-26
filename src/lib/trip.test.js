import { describe, it, expect } from 'vitest';
import {
  parseTime,
  formatMinutes,
  formatDuration,
  legDuration,
  transferGap,
  gapLevel,
  gapLabel,
  tripStats,
  leaveByTime,
  validateLeg,
  tripSummaryText,
} from './trip.js';

describe('parseTime', () => {
  it('parses a valid morning time', () => {
    expect(parseTime('07:30')).toBe(450);
  });
  it('parses midnight and late evening', () => {
    expect(parseTime('00:00')).toBe(0);
    expect(parseTime('23:59')).toBe(1439);
  });
  it('rejects bad formats', () => {
    expect(parseTime('7:30')).toBeNull();
    expect(parseTime('24:00')).toBeNull();
    expect(parseTime('07:60')).toBeNull();
    expect(parseTime('')).toBeNull();
    expect(parseTime(null)).toBeNull();
  });
});

describe('formatMinutes and formatDuration', () => {
  it('formats minutes as HH:MM', () => {
    expect(formatMinutes(450)).toBe('07:30');
    expect(formatMinutes(0)).toBe('00:00');
  });
  it('wraps past midnight', () => {
    expect(formatMinutes(1500)).toBe('01:00');
    expect(formatMinutes(-30)).toBe('23:30');
  });
  it('formats durations in words', () => {
    expect(formatDuration(45)).toBe('45 min');
    expect(formatDuration(60)).toBe('1 hr');
    expect(formatDuration(95)).toBe('1 hr 35 min');
  });
});

describe('legDuration', () => {
  it('computes a normal leg', () => {
    expect(legDuration({ depart: '06:35', arrive: '08:10' })).toBe(95);
  });
  it('handles an overnight leg', () => {
    expect(legDuration({ depart: '22:30', arrive: '01:15' })).toBe(165);
  });
  it('returns null for bad times', () => {
    expect(legDuration({ depart: 'x', arrive: '08:10' })).toBeNull();
  });
});

describe('transferGap and gapLevel', () => {
  it('computes a comfortable gap', () => {
    const gap = transferGap({ arrive: '08:10' }, { depart: '08:40' });
    expect(gap).toBe(30);
    expect(gapLevel(gap)).toBe('comfortable');
  });
  it('flags tight and risky gaps', () => {
    expect(gapLevel(12)).toBe('tight');
    expect(gapLevel(5)).toBe('risky');
    expect(gapLevel(0)).toBe('risky');
  });
  it('flags a missed connection', () => {
    expect(gapLevel(-10)).toBe('missed');
    expect(gapLabel('missed')).toContain('Missed');
  });
  it('labels every level', () => {
    expect(gapLabel('comfortable')).toBe('Comfortable');
    expect(gapLabel('tight')).toContain('Tight');
    expect(gapLabel('risky')).toContain('Risky');
    expect(gapLabel('unknown')).toBe('Check times');
  });
});

describe('tripStats', () => {
  const legs = [
    { mode: 'Bus', from: 'A', to: 'B', depart: '06:35', arrive: '08:10' },
    { mode: 'Bus', from: 'B', to: 'C', depart: '08:40', arrive: '11:05' },
  ];
  it('adds up travel and waiting', () => {
    const stats = tripStats(legs);
    expect(stats.legCount).toBe(2);
    expect(stats.travelMinutes).toBe(240);
    expect(stats.waitingMinutes).toBe(30);
    expect(stats.totalMinutes).toBe(270);
    expect(stats.riskyCount).toBe(0);
  });
  it('counts risky transfers', () => {
    const tight = [
      { mode: 'Bus', from: 'A', to: 'B', depart: '06:00', arrive: '07:00' },
      { mode: 'Bus', from: 'B', to: 'C', depart: '07:04', arrive: '08:00' },
    ];
    expect(tripStats(tight).riskyCount).toBe(1);
  });
  it('handles an empty trip', () => {
    const stats = tripStats([]);
    expect(stats.legCount).toBe(0);
    expect(stats.totalMinutes).toBeNull();
  });
});

describe('leaveByTime', () => {
  it('subtracts travel and buffer', () => {
    expect(leaveByTime('06:00', 25, 10)).toBe(325);
    expect(formatMinutes(leaveByTime('06:00', 25, 10))).toBe('05:25');
  });
  it('returns null for a bad departure', () => {
    expect(leaveByTime('bad', 25, 10)).toBeNull();
  });
});

describe('validateLeg', () => {
  it('accepts a complete leg', () => {
    expect(validateLeg({ from: 'Bida', to: 'Minna', depart: '06:35', arrive: '08:10' })).toEqual([]);
  });
  it('reports missing places and bad times', () => {
    const errors = validateLeg({ from: '', to: '', depart: 'x', arrive: 'y' });
    expect(errors.length).toBe(4);
  });
  it('reports same start and end', () => {
    const errors = validateLeg({ from: 'Minna', to: 'minna', depart: '06:35', arrive: '08:10' });
    expect(errors).toContain('Start and end places are the same.');
  });
});

describe('tripSummaryText', () => {
  it('writes a readable plan with transfer notes', () => {
    const text = tripSummaryText({
      name: 'Test trip',
      legs: [
        { mode: 'Bus', from: 'A', to: 'B', depart: '06:00', arrive: '07:00' },
        { mode: 'Walk', from: 'B', to: 'C', depart: '07:30', arrive: '07:45' },
      ],
    });
    expect(text).toContain('Test trip');
    expect(text).toContain('Transfer: 30 min');
    expect(text).toContain('Total trip: 1 hr 45 min');
  });
});
