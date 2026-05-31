// The Researcher — main composition.
// Editorial "contact sheet" document: a Loom cover, the live instrument,
// the five states of the loop, three times of day, and multi-platform access.
// Tweaks drive theme, accent, density, type voice, and playback speed.

const { useState, useEffect } = React;

const TWEAK_DEFAULTS = {
  theme: 'morning',
  accent: 'punctuation',
  density: 'comfortable',
  typeVoice: 'serif',
  speed: 'measured',
};

// scaled static window — fits a 1360×880 window into a smaller plate slot.
function StaticPlate({ theme, stage, density, scale = 0.46, label, caption, detail, onOpen }) {
  const w = 1360, h = 880;
  return (
    <figure style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, flexShrink: 0 }}>
      <div
        onClick={onOpen}
        style={{
          width: w * scale, height: h * scale, cursor: 'zoom-in',
          borderRadius: 12 * scale, overflow: 'hidden', position: 'relative',
          boxShadow: '0 30px 70px -28px rgba(0,0,0,0.5), 0 0 0 0.5px var(--line-strong)',
        }}
      >
        <div style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <ResearcherWindow theme={theme} stage={stage} density={density} width={w} height={h} />
        </div>
      </div>
      <figcaption style={{ textAlign: 'center', maxWidth: w * scale }}>
        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 6 }}>{label}</div>
        <div style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontWeight: 300, fontSize: 17, color: 'var(--page-ink)', lineHeight: 1.3 }}>{caption}</div>
        {detail && (
          <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 9.5, letterSpacing: '0.12em', color: 'var(--page-ink3)', marginTop: 7 }}>{detail}</div>
        )}
      </figcaption>
    </figure>
  );
}

// fullscreen lightbox to inspect one state at full size
function Lightbox({ item, density, onClose }) {
  useEffect(() => {
    if (!item) return undefined;
    const k = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [item, onClose]);
  if (!item) return null;
  const [fit, setFit] = useState(1);
  useEffect(() => {
    const calc = () => setFit(Math.min((window.innerWidth - 120) / 1360, (window.innerHeight - 120) / 880, 1));
    calc(); window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(8,6,4,0.86)',
      backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 1360 * fit, height: 880 * fit, borderRadius: 12, overflow: 'hidden', boxShadow: '0 50px 120px -30px rgba(0,0,0,0.8)' }}>
        <div style={{ width: 1360, height: 880, transform: `scale(${fit})`, transformOrigin: 'top left' }}>
          <ResearcherWindow theme={item.theme} stage={item.stage} density={density} width={1360} height={880} />
        </div>
      </div>
      <button onClick={onClose} style={{
        position: 'fixed', top: 26, right: 28, fontFamily: 'var(--ff-mono)', fontSize: 11,
        letterSpacing: '0.16em', textTransform: 'uppercase', color: '#968671', background: 'transparent',
        border: '0.5px solid rgba(239,230,210,0.2)', borderRadius: 6, padding: '8px 14px', cursor: 'pointer',
      }}>esc · close</button>
    </div>
  );
}

const STATES = [
  {
    stage: 'idle', label: 'State 00',
    caption: 'At rest — the room before the session',
    detail: 'Pipeline idle · system watching for triggers',
  },
  {
    stage: 'source', label: 'State 01',
    caption: 'Source — cost ticking, signals scoring',
    detail: 'Terminal panel · pipeline output streaming live',
  },
  {
    stage: 'filter', label: 'State 02',
    caption: 'Filter — seven-step intake fires',
    detail: 'Terminal panel · domain confirmed, brief delivered',
  },
  {
    stage: 'develop', label: 'State 03',
    caption: 'Develop — PRAECEPTOR writes the plan',
    detail: 'Engagement panel · status shifts to Revising',
  },
  {
    stage: 'execute', label: 'State 04',
    caption: 'Execute — capability friction surfaces',
    detail: 'Brief panel · new card fades in at top',
  },
];

// ─────────────────────────── Multi-platform section ───────────────────────────

function PhoneFrame({ imgSrc, altText }) {
  return (
    <div style={{
      width: 260, flexShrink: 0,
      background: '#1A1A1A',
      borderRadius: 42,
      padding: '14px 10px 20px',
      boxShadow: '0 40px 80px -20px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)',
      display: 'flex', flexDirection: 'column', gap: 0,
    }}>
      {/* notch */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
        <div style={{ width: 100, height: 10, borderRadius: 99, background: '#0A0A0A' }} />
      </div>
      {/* screen */}
      <div style={{
        flex: 1, borderRadius: 28, overflow: 'hidden',
        background: '#0D0B08', minHeight: 480,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {imgSrc ? (
          <img src={imgSrc} alt={altText} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'var(--accent-fill)', border: '0.5px solid var(--accent-line)',
              display: 'flex', alignItems: 'baseline', justifyContent: 'center',
              margin: '0 auto 18px',
            }}>
              <span style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontWeight: 400, fontSize: 26, color: 'var(--accent)', transform: 'translateY(2px)' }}>P.</span>
            </div>
            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--page-ink3)', marginBottom: 10 }}>Screenshot pending</div>
            <div style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontWeight: 300, fontSize: 14, color: 'var(--page-ink2)', lineHeight: 1.4 }}>{altText}</div>
          </div>
        )}
      </div>
      {/* home bar */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
        <div style={{ width: 100, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.2)' }} />
      </div>
    </div>
  );
}

function IDEFrame({ imgSrc, altText }) {
  return (
    <div style={{
      width: 700, flexShrink: 0,
      background: '#1A1A1A',
      borderRadius: 20,
      padding: '12px 12px 18px',
      boxShadow: '0 40px 80px -20px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)',
    }}>
      {imgSrc ? (
        <div style={{ borderRadius: 10, overflow: 'hidden' }}>
          <img src={imgSrc} alt={altText} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
      ) : (
        <>
          <div style={{ borderRadius: 10, overflow: 'hidden' }}>
            <div style={{
              height: 36, background: '#1E1E1E',
              display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
                  <span key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c, boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.25)' }} />
                ))}
              </div>
            </div>
            <div style={{ height: 360, background: '#1E1E1E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: 10 }}>Screenshot pending</div>
                <div style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontWeight: 300, fontSize: 15, color: 'rgba(255,255,255,0.35)', lineHeight: 1.4, maxWidth: 320 }}>{altText}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PlatformSection({ sectionGap }) {
  return (
    <section style={{ padding: `${sectionGap}px 0 ${sectionGap * 1.3}px` }}>
      <PlateLabel
        index="IV"
        kicker="Every surface"
        title="Across the platforms you already use"
        note="The instrument runs where you work. Desktop for the full flywheel. Mobile to read briefs in motion. IDE to write against the engagement context — the system follows the operator, not the other way around."
      />

      <div style={{
        display: 'flex', gap: 52, justifyContent: 'center', alignItems: 'flex-start',
        flexWrap: 'wrap', padding: '64px 24px 0',
      }}>

        {/* iOS — Praeceptor */}
        <figure style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <PhoneFrame imgSrc="screenshots/praeceptor-ios.png" altText="The Praeceptor iOS app — voice-driven session interface" />
          <figcaption style={{ textAlign: 'center', maxWidth: 260 }}>
            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 6 }}>iOS · Praeceptor</div>
            <div style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontWeight: 300, fontSize: 16, color: 'var(--page-ink)', lineHeight: 1.3 }}>Briefs and plans — read in motion</div>
          </figcaption>
        </figure>

        {/* IDE — Claude Code in Cursor */}
        <figure style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <IDEFrame
            imgSrc="screenshots/cursor-ide.png"
            altText="Claude Code in Cursor — brief.md open, engagement context available inline"
          />
          <figcaption style={{ textAlign: 'center', maxWidth: 580 }}>
            <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 6 }}>IDE · Claude Code in Cursor</div>
            <div style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontWeight: 300, fontSize: 16, color: 'var(--page-ink)', lineHeight: 1.3 }}>Engagement context available inline — as you write</div>
          </figcaption>
        </figure>

      </div>

      {/* access note + CTA */}
      <div style={{ maxWidth: 520, margin: '52px auto 0', textAlign: 'center', padding: '0 24px' }}>
        <div style={{ width: 24, height: 0.5, background: 'var(--accent-line)', margin: '0 auto 20px' }} />
        <p style={{ fontFamily: 'var(--ff-body)', fontSize: 13.5, lineHeight: 1.65, color: 'var(--page-ink3)', margin: 0 }}>
          The Researcher writes to the file system. Every surface reads the same files.
          No sync layer. No cloud dependency. The operator's data stays on the operator's machine.
        </p>
        <p style={{ fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontWeight: 300, fontSize: 18, color: 'var(--page-ink2)', lineHeight: 1.4, margin: '28px 0 32px' }}>
          The system meets you where you are.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#" style={{
            fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--bg)', background: 'var(--accent)', border: '0.5px solid var(--accent)',
            borderRadius: 7, padding: '13px 26px', textDecoration: 'none', display: 'inline-block',
            transition: 'opacity 0.15s',
          }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.82'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >Begin — it's free</a>
          <a href="#" style={{
            fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--page-ink2)', background: 'transparent', border: '0.5px solid var(--line-strong)',
            borderRadius: 7, padding: '13px 26px', textDecoration: 'none', display: 'inline-block',
            transition: 'opacity 0.15s',
          }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.6'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >macOS App · Coming soon</a>
        </div>
      </div>
    </section>
  );
}

function StatesGallery({ theme, density, sectionGap, onOpen }) {
  const scrollRef = React.useRef(null);
  const [activeIdx, setActiveIdx] = React.useState(0);

  const PLATE_W = 1360 * 0.5 + 64; // plate width + gap

  function scrollTo(idx) {
    const el = scrollRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(STATES.length - 1, idx));
    setActiveIdx(clamped);
    el.scrollTo({ left: clamped * PLATE_W, behavior: 'smooth' });
  }

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setActiveIdx(Math.round(el.scrollLeft / PLATE_W));
  }

  const btnStyle = (disabled) => ({
    fontFamily: 'var(--ff-mono)', fontSize: 14, letterSpacing: '0.04em',
    width: 36, height: 36, borderRadius: 8, cursor: disabled ? 'default' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: disabled ? 'var(--page-ink3)' : 'var(--page-ink)',
    background: 'transparent',
    border: '0.5px solid ' + (disabled ? 'var(--page-line)' : 'var(--line-strong)'),
    opacity: disabled ? 0.35 : 1,
    transition: 'opacity 0.15s',
  });

  return (
    <section style={{ padding: `${sectionGap}px 0` }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', maxWidth: 'calc(100% - 48px)', margin: '0 auto', paddingBottom: 0 }}>
        <PlateLabel index="II" kicker="The loop" title="Five states of one turn" note="The same window, frozen at each beat of the cycle. Click any plate to bring it full size." />
        {/* nav controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, paddingBottom: 4 }}>
          <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--page-ink3)', whiteSpace: 'nowrap' }}>
            {activeIdx + 1} / {STATES.length}
          </span>
          <button style={btnStyle(activeIdx === 0)} onClick={() => scrollTo(activeIdx - 1)} disabled={activeIdx === 0}>←</button>
          <button style={btnStyle(activeIdx === STATES.length - 1)} onClick={() => scrollTo(activeIdx + 1)} disabled={activeIdx === STATES.length - 1}>→</button>
        </div>
      </div>
      <div
        ref={scrollRef}
        onScroll={onScroll}
        style={{
          display: 'flex', gap: 64, overflowX: 'auto', padding: '56px max(24px, 5vw) 24px',
          scrollSnapType: 'x mandatory', scrollbarWidth: 'none',
        }}
      >
        {STATES.map((s) => (
          <div key={s.stage} style={{ scrollSnapAlign: 'start', flexShrink: 0 }}>
            <StaticPlate
              theme={theme} stage={s.stage} density={density} scale={0.5}
              label={s.label} caption={s.caption} detail={s.detail}
              onOpen={() => onOpen(s.stage)}
            />
          </div>
        ))}
      </div>
      {/* dot strip */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
        {STATES.map((s, i) => (
          <button key={s.stage} onClick={() => scrollTo(i)} style={{
            width: i === activeIdx ? 20 : 6, height: 6, borderRadius: 99, border: 'none', padding: 0, cursor: 'pointer',
            background: i === activeIdx ? 'var(--accent)' : 'var(--line-strong)',
            transition: 'width 0.2s ease, background 0.2s ease',
          }} />
        ))}
      </div>
    </section>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [box, setBox] = useState(null);
  // expose speed to the live hero loop
  useEffect(() => { window.__rshSpeed = t.speed; }, [t.speed]);
  // type voice on body
  useEffect(() => {
    document.body.dataset.type = t.typeVoice;
    document.body.dataset.accent = t.accent;
  }, [t.typeVoice, t.accent]);

  const sectionGap = { cozy: 96, comfortable: 130, airy: 176 }[t.density];

  return (
    <div data-theme={t.theme} style={{ background: 'var(--page-bg)', minHeight: '100vh', transition: 'background 0.5s ease' }}>
      <CoverPlate theme={t.theme} />

      {/* I — the instrument running */}
      <section style={{ padding: `${sectionGap}px 0 ${sectionGap * 0.7}px` }}>
        <PlateLabel index="I" kicker="The instrument" title="Running, live" note="Press play. The flywheel turns once — signal sourced, operator briefed, plan revised, friction caught under live pressure — at the pace of a person thinking, not a machine racing." />
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 52 }}>
          <div style={{ transform: 'scale(var(--hero-fit, 1))', transformOrigin: 'top center' }}>
            <LiveHero theme={t.theme} density={t.density} accent={t.accent} typeVoice={t.typeVoice} />
          </div>
        </div>
      </section>

      {/* II — five states */}
      <StatesGallery theme={t.theme} density={t.density} sectionGap={sectionGap} onOpen={(stage) => setBox({ theme: t.theme, stage })} />

      {/* III — across the day */}
      <section style={{ padding: `${sectionGap}px 0` }}>
        <PlateLabel index="III" kicker="The register" title="The room keeps the hour" note="The instrument warms and dims with the time of day. Morning opens light — a bone study with the lamp off. Evening turns to golden hour and amber. Night is coffee-black, forest, and dim ember." />
        <div style={{ display: 'flex', gap: 56, justifyContent: 'center', flexWrap: 'wrap', padding: '56px 24px 0' }}>
          {[
            { theme: 'morning', name: 'Morning', desc: 'Bone room · walnut · forest · brass' },
            { theme: 'evening', name: 'Evening', desc: 'Golden hour · tobacco · amber' },
            { theme: 'night',   name: 'Night',   desc: 'Coffee black · forest · dim ember' },
          ].map((r) => (
            <StaticPlate
              key={r.theme} theme={r.theme} stage="filter" density={t.density} scale={0.4}
              label={r.name} caption={r.desc}
              onOpen={() => setBox({ theme: r.theme, stage: 'filter' })}
            />
          ))}
        </div>
      </section>

      {/* IV — multi-platform */}
      <PlatformSection sectionGap={sectionGap} />

      {/* colophon */}
      <footer style={{ padding: '0 24px 110px', textAlign: 'center' }}>
        <div style={{ width: 40, height: 0.5, background: 'var(--page-line)', margin: '0 auto 26px' }} />
        <ResearcherMark size={34} />
        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--page-ink3)', marginTop: 18 }}>
          Journeyman OS · The Researcher · Filter Stage · 2026
        </div>
      </footer>

      <Lightbox item={box} density={t.density} onClose={() => setBox(null)} />

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Register">
          <TweakSelect label="Time of day" value={t.theme} onChange={(v) => setTweak('theme', v)}
            options={[{ value: 'morning', label: 'Morning' }, { value: 'evening', label: 'Evening' }, { value: 'night', label: 'Night' }]} />
          <TweakRadio label="Type voice" value={t.typeVoice} onChange={(v) => setTweak('typeVoice', v)}
            options={[{ value: 'serif', label: 'Serif' }, { value: 'sans', label: 'Sans' }]} />
        </TweakSection>
        <TweakSection label="Tone">
          <TweakRadio label="Accent" value={t.accent} onChange={(v) => setTweak('accent', v)}
            options={[{ value: 'whisper', label: 'Whisper' }, { value: 'punctuation', label: 'Punct.' }, { value: 'editorial', label: 'Editorial' }]} />
          <TweakRadio label="Density" value={t.density} onChange={(v) => setTweak('density', v)}
            options={[{ value: 'cozy', label: 'Cozy' }, { value: 'comfortable', label: 'Comfort' }, { value: 'airy', label: 'Airy' }]} />
        </TweakSection>
        <TweakSection label="Playback">
          <TweakRadio label="Speed" value={t.speed} onChange={(v) => setTweak('speed', v)}
            options={[{ value: 'slow', label: 'Slow' }, { value: 'measured', label: 'Measured' }, { value: 'brisk', label: 'Brisk' }]} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
