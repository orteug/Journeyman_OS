// The Researcher — Loom cover plate + section labels + state lightbox.
// All colors are theme variables so the cover and gallery chrome re-theme
// with the time of day (light bone in morning → coffee-black at night).

// Museum-style section label: mono index + serif caption. (Gallery chrome.)
function PlateLabel({ index, kicker, title, note }) {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ width: 28, height: 0.5, background: 'var(--accent-line)' }} />
        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--accent)' }}>
          {index} · {kicker}
        </span>
        <span style={{ width: 28, height: 0.5, background: 'var(--accent-line)' }} />
      </div>
      <h2 style={{
        fontFamily: 'var(--ff-display)', fontWeight: 300, fontStyle: 'italic',
        fontSize: 34, color: 'var(--page-ink)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1,
      }}>{title}</h2>
      {note && (
        <p style={{
          fontFamily: 'var(--ff-body)', fontSize: 14.5, lineHeight: 1.6, color: 'var(--page-ink2)',
          margin: '14px auto 0', maxWidth: 580,
        }}>{note}</p>
      )}
    </div>
  );
}

// The flywheel as a quiet diagram (sits on the cover's window-room surface).
function FlywheelDiagram() {
  const nodes = ['Source', 'Filter', 'Develop', 'Execute', 'Calibrate'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, flexWrap: 'wrap' }}>
      {nodes.map((n, i) => (
        <React.Fragment key={n}>
          <span style={{
            fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: i === nodes.length - 1 ? 'var(--t2)' : 'var(--t1)',
          }}>{n}</span>
          {i < nodes.length - 1 && (
            <svg width="34" height="10" viewBox="0 0 34 10" style={{ margin: '0 10px' }}>
              <path d="M2 5h26M25 2l4 3-4 3" fill="none" stroke="var(--accent-line)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </React.Fragment>
      ))}
      {/* loop-closes glyph — sits flush after Calibrate */}
      <span style={{
        fontFamily: 'var(--ff-mono)', fontSize: 13, color: 'var(--t4)',
        marginLeft: 14, letterSpacing: 0, lineHeight: 1,
      }}>↺</span>
    </div>
  );
}

function CoverPlate({ theme = 'morning' }) {
  const register = { morning: 'Morning · 07:14', evening: 'Evening · 19:08', night: 'Night · 23:40' }[theme];
  return (
    <div data-theme={theme} style={{
      position: 'relative', minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '80px 24px', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 50% 30%, transparent 42%, var(--cover-shade) 100%)', pointerEvents: 'none' }} />
      {/* corner registration marks */}
      {[['18px','18px'],['18px','','18px'],['','18px','','18px'],['','','18px','18px']].map((p,i)=>(
        <div key={i} style={{ position:'absolute', top:p[0]||'auto', left:p[1]||'auto', right:p[2]||'auto', bottom:p[3]||'auto', width:16, height:16,
          borderTop: i<2?'0.5px solid var(--line-strong)':'none', borderBottom:i>=2?'0.5px solid var(--line-strong)':'none',
          borderLeft:(i%2===0)?'0.5px solid var(--line-strong)':'none', borderRight:(i%2===1)?'0.5px solid var(--line-strong)':'none' }} />
      ))}

      <div style={{ position: 'relative', textAlign: 'center', maxWidth: 880 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 34 }}>
          <ResearcherMark size={56} />
        </div>

        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 11, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 24 }}>
          Journeyman OS
        </div>

        <h1 style={{
          fontFamily: 'var(--ff-display)', fontWeight: 300, fontSize: 92, lineHeight: 0.98,
          color: 'var(--t1)', margin: 0, letterSpacing: '-0.035em',
        }}>
          The <span style={{ fontStyle: 'italic' }}>Researcher</span>
        </h1>

        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--t3)', marginTop: 18 }}>
          Filter Stage · Engagement Intelligence
        </div>

        <p style={{
          fontFamily: 'var(--ff-display)', fontStyle: 'italic', fontWeight: 300,
          fontSize: 23, lineHeight: 1.5, color: 'var(--t2)', margin: '24px auto 0', maxWidth: 620,
        }}>
          The stage that sources the signal, briefs the operator,
          plans the engagement, and remembers where they struggle.
        </p>

        <div style={{ margin: '46px 0 40px' }}>
          <FlywheelDiagram />
        </div>

        <div style={{
          display: 'flex', justifyContent: 'center', gap: 0,
          borderTop: '0.5px solid var(--line-strong)',
          paddingTop: 20, marginTop: 6,
        }}>
          {[
            ['Surface', 'Electron · macOS'],
            ['Engagement', 'ENG-0440'],
            ['Register', register],
          ].map(([k, v], i) => (
            <div key={k} style={{ padding: '0 28px', borderLeft: i ? '0.5px solid var(--line)' : 'none', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--t3)', marginBottom: 5 }}>{k}</div>
              <div style={{ fontFamily: 'var(--ff-body)', fontSize: 13, color: 'var(--t2)' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--ff-mono)', fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--t3)' }}>
          scroll to enter the room ↓
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CoverPlate, PlateLabel, FlywheelDiagram });
