#!/usr/bin/env node
// Generates src/data/winExpectancy.json
// Key: "{inning}_{half}_{outs}_{baseState}_{runDiff}"
// Value: home team win probability (0–1)
//
// Method:
//   Start with the Tango Tiger end-of-half-inning WE table (0 outs, empty bases)
//   extended to ±6 run differential via linear extrapolation.
//   Adjust effective run differential using the RE24 matrix (2010-2015 Retrosheet)
//   for the current base state and out count, then interpolate the base table.
//
// For the top half:  awaySide is batting → their RE reduces the home advantage
//   effectiveDiff = runDiff − RE[baseState][outs]
// For the bottom half: homeSide is batting → their RE increases the home advantage
//   effectiveDiff = runDiff + RE[baseState][outs]

// ── Base WE table ──────────────────────────────────────────────────────────
// 13 values per row: runDiff −6 through +6 (index 0 = −6, index 12 = +6)
// Source: Tango Tiger 2010-2015; ±6 values via linear extrapolation, clamped
const WE_BASE = {
  '1_top':    [0.062,0.112,0.162,0.226,0.306,0.399,0.500,0.601,0.694,0.774,0.838,0.888,0.938],
  '1_bottom': [0.072,0.128,0.184,0.255,0.342,0.442,0.547,0.649,0.739,0.814,0.871,0.914,0.957],
  '2_top':    [0.051,0.099,0.147,0.212,0.294,0.392,0.500,0.608,0.706,0.788,0.853,0.901,0.949],
  '2_bottom': [0.059,0.114,0.169,0.241,0.331,0.437,0.550,0.660,0.754,0.830,0.886,0.926,0.966],
  '3_top':    [0.040,0.086,0.132,0.195,0.279,0.383,0.500,0.617,0.721,0.805,0.868,0.914,0.960],
  '3_bottom': [0.046,0.099,0.152,0.224,0.317,0.430,0.554,0.673,0.772,0.848,0.902,0.939,0.976],
  '4_top':    [0.028,0.071,0.114,0.176,0.262,0.371,0.500,0.629,0.738,0.824,0.886,0.929,0.972],
  '4_bottom': [0.033,0.083,0.133,0.203,0.300,0.421,0.559,0.690,0.793,0.868,0.919,0.952,0.985],
  '5_top':    [0.019,0.057,0.095,0.154,0.239,0.356,0.500,0.644,0.761,0.846,0.905,0.943,0.981],
  '5_bottom': [0.023,0.067,0.111,0.179,0.277,0.407,0.565,0.713,0.820,0.892,0.937,0.965,0.993],
  '6_top':    [0.010,0.042,0.074,0.128,0.211,0.333,0.500,0.667,0.789,0.872,0.926,0.958,0.990],
  '6_bottom': [0.012,0.050,0.088,0.151,0.248,0.387,0.574,0.746,0.852,0.918,0.956,0.977,0.998],
  '7_top':    [0.003,0.028,0.053,0.098,0.176,0.300,0.500,0.700,0.824,0.902,0.947,0.972,0.997],
  '7_bottom': [0.002,0.033,0.064,0.118,0.209,0.354,0.586,0.794,0.893,0.946,0.974,0.988,0.999],
  '8_top':    [0.001,0.015,0.032,0.065,0.130,0.247,0.500,0.753,0.870,0.935,0.968,0.985,0.999],
  '8_bottom': [0.001,0.018,0.039,0.079,0.156,0.297,0.605,0.871,0.942,0.975,0.989,0.996,0.999],
  '9_top':    [0.001,0.005,0.013,0.031,0.071,0.158,0.500,0.842,0.929,0.969,0.987,0.995,0.999],
  // 9_bottom positive: home team has last-licks advantage; if home leads in B9 game is nearly over
  '9_bottom': [0.001,0.007,0.016,0.038,0.087,0.194,0.634,0.980,0.991,0.996,0.998,0.999,0.999],
};

// ── RE24 matrix ────────────────────────────────────────────────────────────
// Expected additional runs from current base state × out count
// baseState: "first|second|third" as binary (e.g. "100" = runner on 1st only)
// Source: Tango Tiger / Retrosheet 2010-2015
const RE = {
  '000': [0.461, 0.243, 0.095],
  '100': [0.831, 0.489, 0.214],
  '010': [1.068, 0.671, 0.305],
  '001': [1.380, 0.884, 0.387],
  '110': [1.380, 0.884, 0.387],
  '101': [1.693, 1.094, 0.502],
  '011': [1.978, 1.275, 0.575],
  '111': [2.292, 1.502, 0.758],
};

// ── Lookup with linear interpolation ──────────────────────────────────────
function lookupBase(baseKey, effectiveDiff) {
  const row = WE_BASE[baseKey];
  if (!row) return 0.5;
  const clamped = Math.max(-6, Math.min(6, effectiveDiff));
  const lo = Math.floor(clamped);
  const hi = Math.ceil(clamped);
  const frac = clamped - lo;
  const loVal = row[Math.max(0, Math.min(12, lo + 6))];
  const hiVal = row[Math.max(0, Math.min(12, hi + 6))];
  const result = loVal + frac * (hiVal - loVal);
  return Math.max(0.001, Math.min(0.999, result));
}

// ── Generate table ─────────────────────────────────────────────────────────
const table = {};
const BASE_STATES = ['000','100','010','001','110','101','011','111'];

// RE at the baseline state (start of half-inning: 0 outs, empty bases)
const RE_BASELINE = RE['000'][0]; // 0.461

for (let inn = 1; inn <= 9; inn++) {
  for (const half of ['top', 'bottom']) {
    const baseKey = `${inn}_${half}`;
    for (let outs = 0; outs <= 2; outs++) {
      for (const bs of BASE_STATES) {
        for (let rd = -6; rd <= 6; rd++) {
          // Marginal RE vs the baseline state the WE_BASE table is anchored to
          const adj = RE[bs][outs] - RE_BASELINE;
          const effectiveDiff = half === 'top' ? rd - adj : rd + adj;
          const we = lookupBase(baseKey, effectiveDiff);
          table[`${inn}_${half}_${outs}_${bs}_${rd}`] = Math.round(we * 1000) / 1000;
        }
      }
    }
  }
}

process.stdout.write(JSON.stringify(table) + '\n');
process.stderr.write(`Generated ${Object.keys(table).length} entries\n`);
