#!/usr/bin/env python3
"""
fetch_pitch_arsenal.py

Pulls Statcast pitch data from 2025-03-27 through today, calculates
pitch arsenal usage/velocity per pitcher, and updates the PITCH_ARSENALS
object in src/components/PitchingTab.js.
"""

import re
import datetime
import sys

try:
    import pandas as pd
    from pybaseball import statcast, cache
except ImportError as e:
    print(f"Missing dependency: {e}")
    print("Run: pip install pybaseball pandas")
    sys.exit(1)

# Enable pybaseball disk cache so re-runs don't re-download
cache.enable()

PITCH_NAME_MAP = {
    'FF': 'Four-seam Fastball',
    'SI': 'Sinker',
    'FC': 'Cutter',
    'SL': 'Slider',
    'ST': 'Sweeper',
    'CU': 'Curveball',
    'KC': 'Knuckle Curve',
    'CH': 'Changeup',
    'FS': 'Splitter',
    'SV': 'Slurve',
    'FO': 'Forkball',
    'KN': 'Knuckleball',
}

PITCHING_TAB_PATH = 'src/components/PitchingTab.js'
SEASON_START = datetime.date(2025, 3, 27)
MIN_PITCHES = 50


def convert_name(last_first: str) -> str:
    """Convert 'Last, First' → 'First Last'. Leaves already-converted names alone."""
    if ', ' in last_first:
        last, first = last_first.split(', ', 1)
        return f"{first} {last}"
    return last_first


def get_month_chunks(start: datetime.date, end: datetime.date):
    """Yield (chunk_start, chunk_end) pairs of at-most-one-month slices."""
    chunks = []
    current = start
    while current <= end:
        # First day of next month
        if current.month == 12:
            next_month_start = current.replace(year=current.year + 1, month=1, day=1)
        else:
            next_month_start = current.replace(month=current.month + 1, day=1)
        chunk_end = min(next_month_start - datetime.timedelta(days=1), end)
        chunks.append((current, chunk_end))
        current = next_month_start
    return chunks


def fetch_all_statcast(start: datetime.date, end: datetime.date) -> pd.DataFrame:
    chunks = get_month_chunks(start, end)
    frames = []
    for i, (cs, ce) in enumerate(chunks, 1):
        label = f"{cs.strftime('%b %Y')} ({cs} → {ce})"
        print(f"  [{i}/{len(chunks)}] Pulling {label} ...", flush=True)
        try:
            df = statcast(start_dt=str(cs), end_dt=str(ce))
            if df is not None and len(df) > 0:
                frames.append(df)
                print(f"         → {len(df):,} pitches cached/fetched", flush=True)
            else:
                print(f"         → no data returned", flush=True)
        except Exception as exc:
            print(f"         → ERROR: {exc}", flush=True)

    if not frames:
        return pd.DataFrame()
    return pd.concat(frames, ignore_index=True)


def build_arsenal_js(pitch_data: pd.DataFrame) -> str:
    """
    Given a DataFrame with columns:
        player_name, pitch_type, pitch_name, pct, avg_vel
    sorted by player_name asc and pct desc within each player,
    return a JS string formatted exactly like the existing PITCH_ARSENALS block.
    """
    lines = []
    for player, group in pitch_data.groupby('player_name', sort=True):
        pitches_js = ','.join(
            f"{{type:'{row.pitch_type}',"
            f"name:'{row.pitch_name}',"
            f"pct:{row.pct:.1f},"
            f"vel:{row.avg_vel:.1f}}}"
            for _, row in group.iterrows()
        )
        # Escape any single-quotes in the player name (rare but safe)
        safe_name = player.replace("'", "\\'")
        lines.append(f"  '{safe_name}': [{pitches_js}],")

    return "const PITCH_ARSENALS = {\n" + "\n".join(lines) + "\n};"


def update_pitching_tab(new_block: str) -> int:
    """
    Replace the PITCH_ARSENALS block in PitchingTab.js.
    Returns the number of replacements made (should be exactly 1).
    """
    # Matches from "const PITCH_ARSENALS = {" through the first standalone "};"
    # re.DOTALL lets .* span newlines; .*? is non-greedy so it stops at the
    # earliest \n}; — which is the closing brace of PITCH_ARSENALS, not
    # PITCH_COLORS or any other object that follows.
    pattern = re.compile(r'const PITCH_ARSENALS = \{.*?\n\};', re.DOTALL)

    with open(PITCHING_TAB_PATH, 'r', encoding='utf-8') as fh:
        original = fh.read()

    matches = pattern.findall(original)
    if len(matches) != 1:
        raise RuntimeError(
            f"Expected exactly 1 PITCH_ARSENALS block, found {len(matches)}. "
            "Aborting to avoid corrupting the file."
        )

    updated = pattern.sub(new_block, original)

    with open(PITCHING_TAB_PATH, 'w', encoding='utf-8') as fh:
        fh.write(updated)

    return len(matches)


def main():
    today = datetime.date.today()
    print(f"=== fetch_pitch_arsenal.py ===")
    print(f"Season range: {SEASON_START} → {today}")
    print(f"Minimum pitches threshold: {MIN_PITCHES}")
    print()

    print("Step 1: Fetching Statcast data (monthly chunks) …")
    df = fetch_all_statcast(SEASON_START, today)

    if df.empty:
        print("No data retrieved. Exiting.")
        sys.exit(1)

    print(f"\nStep 2: Cleaning data …")
    # Keep only rows with a valid pitch type and pitcher name
    df = df[df['pitch_type'].notna() & (df['pitch_type'].astype(str).str.strip() != '')]
    df = df[df['player_name'].notna()]
    print(f"  Rows with valid pitch_type and player_name: {len(df):,}")

    # Filter to pitchers with at least MIN_PITCHES total
    pitcher_totals = df.groupby('player_name').size()
    qualifying = pitcher_totals[pitcher_totals >= MIN_PITCHES].index
    df = df[df['player_name'].isin(qualifying)]
    print(f"  Pitchers with ≥{MIN_PITCHES} pitches: {len(qualifying)}")

    print("\nStep 3: Calculating usage % and average velocity …")
    pitch_counts = (
        df.groupby(['player_name', 'pitch_type'])
        .size()
        .reset_index(name='count')
    )
    pitch_vels = (
        df.groupby(['player_name', 'pitch_type'])['release_speed']
        .mean()
        .round(1)
        .reset_index(name='avg_vel')
    )
    pitch_vels['avg_vel'] = pitch_vels['avg_vel'].fillna(0.0)

    totals_df = (
        df.groupby('player_name')
        .size()
        .reset_index(name='total')
    )

    pitch_data = (
        pitch_counts
        .merge(pitch_vels, on=['player_name', 'pitch_type'])
        .merge(totals_df, on='player_name')
    )
    pitch_data['pct'] = (pitch_data['count'] / pitch_data['total'] * 100).round(1)

    # Map pitch type codes to full names
    pitch_data['pitch_name'] = (
        pitch_data['pitch_type']
        .map(PITCH_NAME_MAP)
        .fillna(pitch_data['pitch_type'])  # unknown codes fall back to raw code
    )

    # Convert "Last, First" → "First Last"
    pitch_data['player_name'] = pitch_data['player_name'].apply(convert_name)

    # Sort: player_name asc, pct desc within each player
    pitch_data = pitch_data.sort_values(
        ['player_name', 'pct'], ascending=[True, False]
    ).reset_index(drop=True)

    print(f"\nStep 4: Generating new PITCH_ARSENALS JS block …")
    new_block = build_arsenal_js(pitch_data)
    pitcher_count = pitch_data['player_name'].nunique()
    print(f"  {pitcher_count} pitchers included")

    print(f"\nStep 5: Updating {PITCHING_TAB_PATH} …")
    update_pitching_tab(new_block)

    print(f"\n✓ Done. {pitcher_count} pitchers written to PITCH_ARSENALS in {PITCHING_TAB_PATH}.")


if __name__ == '__main__':
    main()
