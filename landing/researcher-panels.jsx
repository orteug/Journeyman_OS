// The Researcher — window shell, flywheel indicator, and the three panels.
// Dumb presentational components: parents pass already-resolved content
// (sliced terminal lines, brief entries, plan object) so both the static
// composite and the live hero can drive the same surfaces.

// density multiplier — scales the breathing room, not the type.
function densMul(d) { return ({ cozy: 0.82, comfortable: 1, airy: 1.22 })[d] || 1; }

// stage → { activeId, running }
function stageState(stage) {
  if (stage === 'idle') return { activeId: 'filter', running: false };
  return { activeId: stage, running: true };
}

// ───────────────────────── macOS traffic lights ─────────────────────────
function TrafficLights() {
  const dot = (c) => ({
    width: 12, height: 12, borderRadius: '50%', background: c,
    boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.25)',
  });
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <span style={dot('#FF5F57')} />
      <span style={dot('#FEBC2E')} />
      <span style={dot('#28C840')} />
    </div>
  );
}

// The mark — an italic serif "R." colophon, echoing the Praeceptor "P."
function ResearcherMark({ size = 30 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 7,
      background: 'var(--accent-fill)', border: '0.5px solid var(--accent-line)',
      display: 'flex', alignItems: 'baseline', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontWeight: 400,
        fontSize: size * 0.56, color: 'var(--accent)', lineHeight: 1,
        transform: 'translateY(2px)', letterSpacing: '-0.02em',
      }}>J.</span>
    </div>
  );
}

// ───────────────────────── Flywheel stage indicator ─────────────────────────
function StageIndicator({ activeId, running }) {
  const activeIdx = STAGES.findIndex((s) => s.id === activeId);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {STAGES.map((s, i) => {
        const isActive = i === activeIdx;
        const isDone = i < activeIdx;
        const color = isActive ? 'var(--accent-bright)'
          : isDone ? 'var(--t2)' : 'var(--t4)';
        return (
          <React.Fragment key={s.id}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 12px', borderRadius: 7,
              background: isActive ? 'var(--accent-fill)' : 'transparent',
              border: isActive ? '0.5px solid var(--accent-line)' : '0.5px solid transparent',
              position: 'relative', flexShrink: 0, whiteSpace: 'nowrap',
            }}>
              {/* dot / state glyph */}
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: isActive ? 'var(--accent-bright)' : isDone ? 'var(--t2)' : 'transparent',
                border: isDone || isActive ? 'none' : '1px solid var(--t4)',
                boxShadow: isActive && running ? '0 0 10px var(--accent-glow)' : 'none',
                flexShrink: 0,
              }} />
              <span style={{
                fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.16em',
                textTransform: 'uppercase', color, fontWeight: isActive ? 500 : 400,
                whiteSpace: 'nowrap',
              }}>{s.label}</span>
              {isActive && running && (
                <span style={{
                  fontFamily: 'var(--ff-mono)', fontSize: 8.5, letterSpacing: '0.12em',
                  color: 'var(--accent)', opacity: 0.8, flexShrink: 0,
                }}>● live</span>
              )}
            </div>
            {i < STAGES.length - 1 && (
              <svg width="20" height="10" viewBox="0 0 20 10" style={{ flexShrink: 0, opacity: 0.7 }}>
                <path d="M2 5h13M12 2l4 3-4 3" fill="none"
                  stroke={i < activeIdx ? 'var(--t3)' : 'var(--line-strong)'}
                  strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </React.Fragment>
        );
      })}
      {/* loop-closes return marker */}
      <div title="the loop closes" style={{ display: 'flex', alignItems: 'center', marginLeft: 6, opacity: 0.5 }}>
        <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
          <path d="M3 13c0-6 5-9 14-9M14 1l3 3-3 3" stroke="var(--line-strong)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

// ───────────────────────── Terminal (left) ─────────────────────────
function TermLine({ kind, text }) {
  const mono = { fontFamily: 'var(--ff-mono)', fontSize: 12.5, lineHeight: 1.62, whiteSpace: 'pre-wrap', wordBreak: 'break-word' };
  if (kind === 'gap') return <div style={{ height: 9 }} />;
  if (kind === 'cursor') {
    return (
      <div style={{ ...mono, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--term-dim)' }}>
        <span>$</span>
        <span className="rsh-caret" style={{ display: 'inline-block', width: 7.5, height: 15, background: 'var(--term-warn)' }} />
      </div>
    );
  }
  if (kind === 'cmd') {
    return (
      <div style={mono}>
        <span style={{ color: 'var(--term-dim)' }}>$ </span>
        <span style={{ color: 'var(--term-text)' }}>{text}</span>
      </div>
    );
  }
  if (kind === 'handoff') {
    return (
      <div style={{ ...mono, color: 'var(--accent-bright)', padding: '3px 0 3px 9px', margin: '3px 0', borderLeft: '2px solid var(--accent-line)', letterSpacing: '0.02em' }}>
        {text}
      </div>
    );
  }
  if (kind === 'cost') {
    const [a, b] = text.split('·');
    return (
      <div style={{ ...mono, color: 'var(--term-faint)' }}>
        <span style={{ color: 'var(--term-dim)' }}>{a}</span>
        {b && <>· <span style={{ color: 'var(--term-warn)', opacity: 0.85 }}>{b.trim()}</span></>}
      </div>
    );
  }
  if (kind === 'score') {
    // indented signal score line — highlight the tier suffix
    const m = text.match(/(→\s*T\d)\s*$/);
    return (
      <div style={{ ...mono, color: 'var(--term-dim)' }}>
        {m ? <>{text.slice(0, m.index)}<span style={{ color: 'var(--accent)' }}>{m[1]}</span></> : text}
      </div>
    );
  }
  const colorMap = {
    sys: 'var(--term-key)', out: 'var(--term-text)', dim: 'var(--term-faint)',
    ok: 'var(--term-ok)', warn: 'var(--term-warn)', bad: 'var(--term-bad)', path: 'var(--term-path)',
  };
  return <div style={{ ...mono, color: colorMap[kind] || 'var(--term-text)' }}>{text}</div>;
}

function TerminalPanel({ lines, cost, pad }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--term-bg)' }}>
      {/* panel chrome */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `${Math.round(11 * pad)}px ${Math.round(18 * pad)}px`,
        borderBottom: '0.5px solid var(--line)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--term-ok)' }} />
          <span className="t-meta" style={{ color: 'var(--t3)', fontSize: 9.5 }}>run_pipeline.py</span>
        </div>
        <span className="t-meta" style={{ color: 'var(--t4)', fontSize: 9.5 }}>operator-signal</span>
      </div>
      {/* stream */}
      <div style={{ flex: 1, overflow: 'hidden', padding: `${Math.round(16 * pad)}px ${Math.round(18 * pad)}px`, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div>
          {lines.map((l, i) => <TermLine key={i} kind={l[0]} text={l[1]} />)}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── Engagement state (center) ─────────────────────────
function Field({ label, children, mono, accent, pad }) {
  return (
    <div style={{ padding: `${Math.round(14 * pad)}px 0`, borderBottom: '0.5px solid var(--line)' }}>
      <div className="t-meta" style={{ color: 'var(--t3)', fontSize: 9.5, marginBottom: 7 }}>{label}</div>
      <div style={{
        fontFamily: mono ? 'var(--ff-mono)' : 'var(--ff-body)',
        fontSize: mono ? 12.5 : 14.5, lineHeight: 1.5,
        color: accent ? 'var(--accent)' : 'var(--t1)', fontWeight: 400,
        letterSpacing: mono ? '0.01em' : '0em',
      }}>{children}</div>
    </div>
  );
}

function EngagementPanel({ stage, pad }) {
  const plan = ENGAGEMENT.plan[stage];
  const next = ENGAGEMENT.nextAction[stage];
  const toneColor = { ok: 'var(--good)', warn: 'var(--accent-bright)', bad: 'var(--bad)' }[plan.tone];
  const writing = stage === 'develop';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface)' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `${Math.round(11 * pad)}px ${Math.round(20 * pad)}px`,
        borderBottom: '0.5px solid var(--line)',
      }}>
        <span className="t-meta" style={{ color: 'var(--t3)', fontSize: 9.5 }}>Engagement state</span>
        <span className="t-mono" style={{ color: 'var(--t3)', fontSize: 10.5 }}>{ENGAGEMENT.ref}</span>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', padding: `${Math.round(6 * pad)}px ${Math.round(20 * pad)}px ${Math.round(20 * pad)}px` }}>
        {/* domain headline */}
        <div style={{ padding: `${Math.round(16 * pad)}px 0 ${Math.round(14 * pad)}px`, borderBottom: '0.5px solid var(--line)' }}>
          <div className="t-meta" style={{ color: 'var(--t3)', fontSize: 9.5, marginBottom: 9 }}>Domain</div>
          <div className="t-display" style={{ fontSize: 27, color: 'var(--t1)', fontWeight: 300, lineHeight: 1.08 }}>{ENGAGEMENT.domain}</div>
          <div style={{ fontFamily: 'var(--ff-body)', fontSize: 12.5, color: 'var(--t2)', marginTop: 8, lineHeight: 1.45 }}>{ENGAGEMENT.role}</div>
        </div>

        <Field label="Decision" pad={pad}>{ENGAGEMENT.decision}</Field>
        <Field label="Problem · restated" pad={pad}>
          <span style={{ color: 'var(--t2)' }}>{ENGAGEMENT.problem}</span>
        </Field>

        {/* plan status */}
        <div style={{ padding: `${Math.round(15 * pad)}px 0`, borderBottom: '0.5px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 9 }}>
            <span className="t-meta" style={{ color: 'var(--t3)', fontSize: 9.5, whiteSpace: 'nowrap' }}>Plan · {ENGAGEMENT.horizon}</span>
            <span style={{
              fontFamily: 'var(--ff-mono)', fontSize: 9.5, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: toneColor, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: toneColor }} />
              {plan.status}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 300, fontSize: 30, color: 'var(--t1)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              Day {plan.day}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--ff-body)', fontSize: 13.5, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                {plan.title}
                {writing && <span className="rsh-pulse" style={{ fontFamily: 'var(--ff-mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--accent)' }}>writing…</span>}
              </div>
              <div className="t-mono" style={{ fontSize: 10.5, color: 'var(--t3)', marginTop: 3 }}>{plan.milestone}</div>
            </div>
          </div>
        </div>

        {/* next action */}
        <div style={{ paddingTop: `${Math.round(15 * pad)}px` }}>
          <div className="t-meta" style={{ color: 'var(--accent)', fontSize: 9.5, marginBottom: 8 }}>▸ Next action</div>
          <div style={{
            fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontWeight: 300,
            fontSize: 17, lineHeight: 1.42, color: 'var(--t1)',
          }}>{next}</div>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── Mentor Brief (right) — light paper ─────────────────────────
const FRICTION = {
  capability: { label: 'Capability', tone: 'var(--paper-accent)' },
  decision:   { label: 'Decision',   tone: 'var(--paper-ink2)' },
  execution:  { label: 'Execution',  tone: 'var(--paper-ink3)' },
};

function BriefCard({ entry, pad }) {
  const f = FRICTION[entry.type];
  const high = entry.type === 'capability';
  const med = entry.type === 'decision';
  return (
    <div className={entry.fresh ? 'rsh-fadein' : ''} style={{
      background: high ? 'var(--paper-sunk)' : 'transparent',
      border: high ? '0.5px solid var(--paper-line2)' : '0.5px solid var(--paper-line)',
      borderLeft: high ? '2.5px solid var(--paper-accent)' : (med ? '2px solid var(--paper-line2)' : '0.5px solid var(--paper-line)'),
      borderRadius: 4,
      padding: high ? `${Math.round(15 * pad)}px ${Math.round(16 * pad)}px` : `${Math.round(11 * pad)}px ${Math.round(14 * pad)}px`,
      marginBottom: Math.round(10 * pad),
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: high ? 9 : 6 }}>
        <span style={{
          fontFamily: 'var(--ff-mono)', fontSize: high ? 9.5 : 8.5, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: f.tone, fontWeight: high ? 600 : 500,
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          {high && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--paper-accent)' }} />}
          {f.label} friction
        </span>
        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 9, color: 'var(--paper-ink3)' }}>{entry.date}</span>
      </div>
      <div style={{
        fontFamily: 'var(--ff-display)', fontWeight: high ? 400 : 400,
        fontSize: high ? 17 : (med ? 14.5 : 13), lineHeight: 1.22,
        color: 'var(--paper-ink)', letterSpacing: '-0.01em', marginBottom: high ? 8 : 5,
      }}>{entry.head}</div>
      <div style={{
        fontFamily: 'var(--ff-body)', fontSize: high ? 12.5 : 11.5, lineHeight: 1.5,
        color: high ? 'var(--paper-ink2)' : 'var(--paper-ink3)',
      }}>{entry.body}</div>
      {entry.fresh && (
        <div style={{ marginTop: 10, fontFamily: 'var(--ff-mono)', fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--paper-accent)' }}>
          [ MENTOR_BRIEF_UPDATE ] · just now
        </div>
      )}
    </div>
  );
}

function MentorBriefPanel({ entries, pad }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--paper)' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `${Math.round(13 * pad)}px ${Math.round(18 * pad)}px`,
        borderBottom: '0.5px solid var(--paper-line2)', background: 'var(--paper-lift)',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontWeight: 400, fontSize: 19, color: 'var(--paper-ink)', letterSpacing: '-0.01em' }}>Mentor Brief</div>
        </div>
        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--paper-ink3)' }}>
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', padding: `${Math.round(16 * pad)}px ${Math.round(16 * pad)}px` }}>
        {entries.map((e) => <BriefCard key={e.id} entry={e} pad={pad} />)}
      </div>
    </div>
  );
}

// ───────────────────────── Window shell ─────────────────────────
// Composes macOS chrome + identity/flywheel header + three panels.
// Props can be overridden so the live hero can feed sliced/animated content.
function ResearcherWindow({
  theme = 'evening', stage = 'idle', width = 1360, height = 880, density = 'comfortable',
  termLines, briefEntries,
}) {
  const pad = densMul(density);
  const { activeId, running } = stageState(stage);
  const lines = termLines || TERM[stage];
  const entries = briefEntries || (stage === 'execute' ? [BRIEF_FRESH, ...BRIEF_BASE] : BRIEF_BASE);
  const clock = { morning: '07:14', evening: '19:08', night: '23:40' }[theme] || '07:14';
  const sessionLabel = { morning: 'Morning session', evening: 'Evening session', night: 'Night session' }[theme] || 'Morning session';

  return (
    <div data-theme={theme} style={{
      width, height, background: 'var(--bg)', color: 'var(--t1)',
      fontFamily: 'var(--ff-body)', display: 'flex', flexDirection: 'column',
      WebkitFontSmoothing: 'antialiased', overflow: 'hidden',
    }}>
      {/* macOS title bar */}
      <div style={{
        height: 40, flexShrink: 0, display: 'flex', alignItems: 'center',
        padding: '0 16px', background: 'var(--bg-lift)', borderBottom: '0.5px solid var(--line)',
        position: 'relative',
      }}>
        <TrafficLights />
        <div style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.06em', color: 'var(--t3)' }}>
            Journeyman OS
          </span>
        </div>
      </div>

      {/* identity + flywheel header */}
      <div style={{ flexShrink: 0, padding: `${Math.round(16 * pad)}px ${Math.round(22 * pad)}px ${Math.round(15 * pad)}px`, borderBottom: '0.5px solid var(--line)', background: 'var(--bg-lift)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: Math.round(15 * pad) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <ResearcherMark size={32} />
            <div>
              <div className="t-display" style={{ fontSize: 21, color: 'var(--t1)', fontWeight: 300, lineHeight: 1.05 }}>Journeyman OS</div>
              <div className="t-meta" style={{ color: 'var(--t3)', fontSize: 9.5, marginTop: 3 }}>The Researcher · Filter Stage</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="t-meta" style={{ color: 'var(--accent)', fontSize: 9.5, whiteSpace: 'nowrap' }}>{sessionLabel}</div>
            <div style={{ fontFamily: 'var(--ff-display)', fontWeight: 300, fontSize: 22, color: 'var(--t1)', letterSpacing: '-0.02em', lineHeight: 1, marginTop: 3 }}>{clock}</div>
          </div>
        </div>
        <StageIndicator activeId={activeId} running={running} />
      </div>

      {/* three panels */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div style={{ flexBasis: '40%', minWidth: 0 }}><TerminalPanel lines={lines} pad={pad} /></div>
        <div style={{ width: 0.5, background: 'var(--line)' }} />
        <div style={{ flexBasis: '32%', minWidth: 0 }}><EngagementPanel stage={stage} pad={pad} /></div>
        <div style={{ width: 0.5, background: 'var(--paper-line2)' }} />
        <div style={{ flexBasis: '28%', minWidth: 0 }}><MentorBriefPanel entries={entries} pad={pad} /></div>
      </div>
    </div>
  );
}

Object.assign(window, {
  TrafficLights, ResearcherMark, StageIndicator,
  TermLine, TerminalPanel, EngagementPanel, MentorBriefPanel, BriefCard,
  ResearcherWindow, densMul, stageState,
});
