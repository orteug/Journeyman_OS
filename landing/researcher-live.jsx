// The Researcher — live hero window.
// Runs the flywheel on a timeline: SOURCE → FILTER → DEVELOP → EXECUTE, the
// terminal streaming line-by-line, the stage indicator advancing, the engagement
// panel re-planning, and the Mentor Brief card fading in under live pressure.
// Driven by playbackSpeed + a scrub control (jump to any stage).
//
// Restraint per brief: no flashing, no urgency. Lines appear at a measured
// cadence; the only motion is the caret, a soft pulse on "writing…", and one
// fade-in for the surfaced card.

const PLAY_STAGES = ['source', 'filter', 'develop', 'execute'];

// Build a flat timeline of { stage, lines:[...uptoN] } steps so scrubbing is exact.
function buildTimeline() {
  const steps = [];
  PLAY_STAGES.forEach((stage) => {
    const all = TERM[stage];
    // reveal line by line; group trailing gap/cursor with previous content line
    for (let n = 1; n <= all.length; n++) {
      const kind = all[n - 1][0];
      if (kind === 'gap') continue; // don't spend a beat on blank lines
      steps.push({ stage, count: n });
    }
  });
  return steps;
}

function LiveHero({ theme, density, accent, typeVoice }) {
  const timeline = React.useMemo(buildTimeline, []);
  const [idx, setIdx] = React.useState(() => {
    const saved = Number(localStorage.getItem('rsh_live_idx'));
    return Number.isFinite(saved) && saved > 0 && saved < timeline.length ? saved : 0;
  });
  const [playing, setPlaying] = React.useState(false);
  const speedRef = React.useRef(1);
  speedRef.current = ({ slow: 0.6, measured: 1, brisk: 1.7 })[typeof window.__rshSpeed === 'string' ? window.__rshSpeed : 'measured'] || 1;

  // persist position
  React.useEffect(() => { localStorage.setItem('rsh_live_idx', String(idx)); }, [idx]);

  // advance loop
  React.useEffect(() => {
    if (!playing) return undefined;
    if (idx >= timeline.length - 1) { setPlaying(false); return undefined; }
    const cur = timeline[idx];
    const nxt = timeline[idx + 1];
    const line = TERM[cur.stage][cur.count - 1];
    const kind = line ? line[0] : 'out';
    // cadence: handoffs and stage changes hold longer; cost/score lines quick
    let base = 520;
    if (kind === 'handoff') base = 1050;
    else if (kind === 'sys' || kind === 'cmd') base = 760;
    else if (kind === 'cost' || kind === 'score' || kind === 'dim') base = 360;
    if (nxt && nxt.stage !== cur.stage) base += 700; // breath between stages
    const t = setTimeout(() => setIdx((i) => Math.min(i + 1, timeline.length - 1)), base / speedRef.current);
    return () => clearTimeout(t);
  }, [playing, idx, timeline]);

  const cur = timeline[idx];
  const stage = cur.stage;
  const lines = TERM[stage].slice(0, cur.count);
  const atEnd = idx >= timeline.length - 1;

  // brief entries: fresh card appears once EXECUTE has emitted the update line
  const reachedUpdate = stage === 'execute' && cur.count >= 12;
  const entries = reachedUpdate ? [BRIEF_FRESH, ...BRIEF_BASE] : BRIEF_BASE;

  // scrub to a stage start
  function jumpTo(targetStage) {
    const at = timeline.findIndex((s) => s.stage === targetStage);
    if (at >= 0) { setIdx(at); setPlaying(false); }
  }
  function restart() { setIdx(0); setPlaying(true); }

  return (
    <div>
      {/* the window */}
      <DesktopFrame>
        <ResearcherWindow
          theme={theme} stage={stage} density={density}
          width={1360} height={880}
          termLines={lines} briefEntries={entries}
        />
      </DesktopFrame>

      {/* transport — sits OUTSIDE the scaled window, in gallery chrome */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 18, marginTop: 18,
        padding: '13px 20px', borderRadius: 10,
        background: 'var(--bg-lift)', border: '0.5px solid var(--line)',
      }}>
        <button onClick={() => (atEnd ? restart() : setPlaying((p) => !p))} style={transportBtn(true)}>
          {atEnd ? '↺ Replay' : playing ? '❚❚ Pause' : '▶ Play the flywheel'}
        </button>
        {/* stage scrubber */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {PLAY_STAGES.map((s) => {
            const on = s === stage;
            return (
              <button key={s} onClick={() => jumpTo(s)} style={{
                fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
                padding: '7px 12px', borderRadius: 6, cursor: 'pointer',
                color: on ? 'var(--accent-bright)' : 'var(--t3)',
                background: on ? 'var(--accent-fill)' : 'transparent',
                border: on ? '0.5px solid var(--accent-line)' : '0.5px solid transparent',
              }}>{s}</button>
            );
          })}
        </div>
        {/* progress hairline */}
        <div style={{ flex: 1, height: 2, background: 'var(--line)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${(idx / (timeline.length - 1)) * 100}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s ease' }} />
        </div>
        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 10, color: 'var(--t3)', whiteSpace: 'nowrap' }}>
          {String(idx + 1).padStart(2, '0')} / {timeline.length}
        </span>
      </div>
    </div>
  );
}

function transportBtn() {
  return {
    fontFamily: 'var(--ff-body)', fontSize: 13, fontWeight: 500,
    padding: '9px 18px', borderRadius: 7, cursor: 'pointer', whiteSpace: 'nowrap',
    color: 'var(--accent-ink)', background: 'var(--accent)', border: 'none', letterSpacing: '0.01em',
  };
}

// Desktop frame: drops a soft shadow + screen bezel so the window reads as
// a real app floating on the canvas.
function DesktopFrame({ children }) {
  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 40px 100px -30px rgba(0,0,0,0.55), 0 8px 30px -10px rgba(0,0,0,0.4), 0 0 0 0.5px var(--line-strong)',
    }}>
      {children}
    </div>
  );
}

Object.assign(window, { LiveHero, DesktopFrame, PLAY_STAGES });
