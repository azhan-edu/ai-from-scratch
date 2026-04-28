// game-screens.jsx — All screens for Pocket Pet Companion
// Requires: CatSprite, StatBar, ActionBtn from pet-sprite.jsx

const C = {
  bg:       '#0d0c15',
  surface:  '#161428',
  elevated: '#1e1b32',
  border:   '#2a2640',
  text:     '#ede9f8',
  sub:      '#7b72a8',
  lavender: '#a78bfa',
  cyan:     '#22d3ee',
  hunger:   '#fb923c',
  sleep:    '#818cf8',
  happy:    '#34d399',
  hygiene:  '#22d3ee',
  pink:     '#f472b6',
  yellow:   '#facc15',
  red:      '#ef4444',
};

const BigBtn = ({ children, onClick, gradient, outline, color, style: s = {}, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding: '15px 20px', borderRadius: 16, fontFamily: 'Nunito, sans-serif',
    background: outline ? 'transparent' : (gradient || `linear-gradient(135deg, ${C.lavender}, #818cf8)`),
    border: outline ? `2px solid ${color || C.lavender}` : 'none',
    color: outline ? (color || C.lavender) : 'white',
    fontSize: 16, fontWeight: 800, cursor: disabled ? 'not-allowed' : 'pointer',
    width: '100%', opacity: disabled ? 0.45 : 1,
    transition: 'opacity 0.2s, transform 0.12s',
    ...s,
  }}>{children}</button>
);

// ─── WELCOME ────────────────────────────────────────────────
const WelcomeScreen = ({ onStart, onContinue, hasSave }) => (
  <div style={{
    minHeight: '100dvh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '32px 24px', gap: 32,
    background: `radial-gradient(ellipse at 50% 38%, #1e1040 0%, ${C.bg} 68%)`,
  }}>
    <div style={{ textAlign: 'center', animation: 'fadeInUp 0.6s ease' }}>
      <p style={{ fontSize: 10, letterSpacing: 4, color: C.sub, textTransform: 'uppercase', marginBottom: 10 }}>
        your tiny companion awaits
      </p>
      <h1 style={{
        fontSize: 40, fontWeight: 900, lineHeight: 1.15,
        background: `linear-gradient(135deg, ${C.lavender} 20%, ${C.cyan} 100%)`,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>Pocket Pet<br/>Companion</h1>
    </div>

    <div style={{ position: 'relative', width: 140, height: 140, display: 'flex',
      alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `radial-gradient(circle, ${C.lavender}20 0%, transparent 70%)`,
        animation: 'glow 3s ease-in-out infinite',
      }}/>
      <div style={{ fontSize: 76, animation: 'eggBounce 2.4s ease-in-out infinite',
        filter: 'drop-shadow(0 4px 16px #a78bfa50)' }}>🥚</div>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%',
      animation: 'fadeInUp 0.7s 0.15s ease both' }}>
      <BigBtn onClick={onStart}
        gradient={`linear-gradient(135deg, ${C.lavender} 0%, #818cf8 100%)`}>
        ✨ New Adventure
      </BigBtn>
      {hasSave && (
        <BigBtn onClick={onContinue} outline color={C.cyan}>
          💾 Continue Journey
        </BigBtn>
      )}
    </div>

    <p style={{ fontSize: 11, color: C.sub, opacity: 0.4, letterSpacing: 1 }}>
      Adopt · Nurture · Evolve
    </p>
  </div>
);

// ─── SELECT ─────────────────────────────────────────────────
const SelectScreen = ({ onConfirm }) => {
  const [name, setName] = React.useState('');
  const choices = [
    { label: '🐱', name: 'Cat',    available: true },
    { label: '🐲', name: 'Dragon', available: false },
    { label: '👾', name: 'Alien',  available: false },
    { label: '🐻', name: 'Bear',   available: false },
  ];
  return (
    <div style={{
      minHeight: '100dvh', padding: '52px 24px 32px',
      display: 'flex', flexDirection: 'column', gap: 24,
      background: `radial-gradient(ellipse at 50% 0%, #1e1040 0%, ${C.bg} 55%)`,
    }}>
      <div style={{ animation: 'fadeInUp 0.5s ease' }}>
        <p style={{ fontSize: 10, letterSpacing: 3.5, color: C.sub, textTransform: 'uppercase', marginBottom: 6 }}>Step 1</p>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: C.text }}>Choose a companion</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
        animation: 'fadeInUp 0.5s 0.1s ease both' }}>
        {choices.map(p => (
          <div key={p.name} style={{
            background: p.available ? `${C.lavender}12` : C.surface,
            borderRadius: 18, border: `1.5px solid ${p.available ? C.lavender : C.border}`,
            padding: '18px 10px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 8, opacity: p.available ? 1 : 0.38,
            position: 'relative',
          }}>
            <span style={{ fontSize: 38 }}>{p.label}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: p.available ? C.text : C.sub }}>{p.name}</span>
            {!p.available && (
              <span style={{ fontSize: 9, letterSpacing: 1.5, color: C.sub, textTransform: 'uppercase',
                background: C.elevated, borderRadius: 4, padding: '2px 7px' }}>soon</span>
            )}
            {p.available && (
              <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 12 }}>✓</span>
            )}
          </div>
        ))}
      </div>

      <div style={{ animation: 'fadeInUp 0.5s 0.2s ease both' }}>
        <p style={{ fontSize: 10, letterSpacing: 3.5, color: C.sub, textTransform: 'uppercase', marginBottom: 12 }}>Step 2 — Name them</p>
        <input
          type="text" value={name} maxLength={16}
          onChange={e => setName(e.target.value)}
          placeholder="Mochi, Luna, Pixel…"
          style={{
            width: '100%', padding: '14px 16px',
            background: C.elevated, borderRadius: 14, outline: 'none',
            border: `1.5px solid ${name.trim() ? C.lavender : C.border}`,
            color: C.text, fontSize: 16, fontWeight: 700,
            fontFamily: 'Nunito, sans-serif', transition: 'border-color 0.2s',
          }}
        />
      </div>

      <div style={{ marginTop: 'auto', animation: 'fadeInUp 0.5s 0.3s ease both' }}>
        <BigBtn onClick={() => onConfirm(name.trim() || 'Kitty')}>
          🐾 Adopt {name.trim() || 'your pet'}!
        </BigBtn>
      </div>
    </div>
  );
};

// ─── MAIN ────────────────────────────────────────────────────
const MainScreen = ({ pet, emotion, message, onAct, onMiniGame, onSettings, onRevive }) => {
  const STAGE_NAMES = ['Baby', 'Teen', 'Adult'];
  const ageText = pet.age < 1 ? `${Math.round(pet.age * 24)}h old` : `${pet.age.toFixed(1)}d old`;
  const xpThresh = [60, 180];
  const xpPct = pet.stage < 2 ? Math.min(100, (pet.xp / xpThresh[pet.stage]) * 100) : 100;

  const stats = [
    { label: 'Hunger',    icon: '🍔', color: C.hunger, value: pet.hunger },
    { label: 'Sleep',     icon: '💤', color: C.sleep,  value: pet.sleep },
    { label: 'Happiness', icon: '😊', color: C.happy,  value: pet.happiness },
    { label: 'Hygiene',   icon: '🛁', color: C.hygiene,value: pet.hygiene },
  ];

  const actions = [
    { id: 'feed',    icon: '🍎', label: 'Feed',  color: C.hunger },
    { id: 'sleep',   icon: '💤', label: 'Sleep', color: C.sleep },
    { id: 'bathe',   icon: '🛁', label: 'Bathe', color: C.hygiene },
    { id: 'medicine',icon: '💊', label: 'Meds',  color: C.pink },
    { id: 'study',   icon: '📚', label: 'Study', color: C.yellow },
  ];

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      padding: '0 0 20px', background: C.bg }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '48px 20px 12px' }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: C.text, lineHeight: 1 }}>{pet.name}</h2>
          <p style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>
            <span style={{ color: C.lavender, fontWeight: 700 }}>{STAGE_NAMES[pet.stage]}</span>
            {' · '}{ageText}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 9, letterSpacing: 2, color: C.sub, textTransform: 'uppercase' }}>XP</p>
            <p style={{ fontSize: 16, fontWeight: 900, color: C.lavender }}>{pet.xp}</p>
          </div>
          <button onClick={onSettings} style={{
            background: C.elevated, border: `1px solid ${C.border}`, color: C.sub,
            borderRadius: 12, width: 40, height: 40, fontSize: 17,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>⚙️</button>
        </div>
      </div>

      {/* XP progress */}
      <div style={{ padding: '0 20px 8px' }}>
        <div style={{ background: C.elevated, borderRadius: 4, height: 4, overflow: 'hidden' }}>
          <div style={{
            width: `${xpPct}%`, height: '100%',
            background: `linear-gradient(90deg, ${C.lavender}, ${C.cyan})`,
            borderRadius: 4, transition: 'width 0.6s ease',
            boxShadow: `0 0 8px ${C.lavender}60`,
          }}/>
        </div>
        <p style={{ fontSize: 10, color: C.sub, marginTop: 4, textAlign: 'right' }}>
          {pet.stage < 2 ? `${[60,180][pet.stage] - pet.xp} XP to evolve` : '✨ Fully evolved'}
        </p>
      </div>

      {/* Pet area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', position: 'relative', minHeight: 180, padding: '8px 0' }}>
        <div style={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          background: `radial-gradient(circle, ${C.lavender}14 0%, transparent 70%)`,
          animation: 'glow 4s ease-in-out infinite',
        }}/>
        <div style={{ animation: `float ${pet.alive ? '3.5s' : '0s'} ease-in-out infinite`,
          position: 'relative', zIndex: 1 }}>
          <CatSprite emotion={emotion} stage={pet.stage}/>
        </div>
        {!pet.alive && (
          <div style={{
            position: 'absolute', bottom: 8, left: 20, right: 20,
            background: `${C.red}18`, border: `1px solid ${C.red}50`,
            borderRadius: 14, padding: '10px 16px', textAlign: 'center',
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.red }}>
              😢 {pet.name} is unwell! Give some medicine!
            </p>
          </div>
        )}
        {message && pet.alive && (
          <div style={{
            position: 'absolute', bottom: 8,
            background: C.elevated, border: `1px solid ${C.border}`,
            borderRadius: 20, padding: '7px 18px',
            fontSize: 14, fontWeight: 700, color: C.text,
            animation: 'toastIn 0.2s ease', pointerEvents: 'none',
            boxShadow: '0 4px 20px #00000060',
          }}>{message}</div>
        )}
      </div>

      {/* Stats */}
      <div style={{ background: C.surface, borderRadius: '20px 20px 0 0',
        border: `1px solid ${C.border}`, borderBottom: 'none',
        padding: '16px 20px 8px', margin: '0 12px' }}>
        {stats.map(s => <StatBar key={s.label} {...s}/>)}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 7, padding: '12px 16px 10px',
        background: C.surface, margin: '0 12px', borderRadius: '0 0 20px 20px',
        border: `1px solid ${C.border}`, borderTop: `1px solid ${C.border}` }}>
        {actions.map(a => (
          <ActionBtn key={a.id} icon={a.icon} label={a.label} color={a.color}
            onClick={() => onAct(a.id)}
            disabled={!pet.alive && a.id !== 'medicine'}/>
        ))}
      </div>

      {/* Mini-game */}
      <div style={{ padding: '12px 16px 0' }}>
        <BigBtn onClick={onMiniGame} disabled={!pet.alive}
          gradient={`linear-gradient(135deg, ${C.happy}cc, #0ea5e9cc)`}
          style={{ fontSize: 14 }}>
          🎮 Play Mini-Game · earn happiness
        </BigBtn>
      </div>
    </div>
  );
};

// ─── MINI-GAME ───────────────────────────────────────────────
const MiniGameScreen = ({ onDone }) => {
  const [phase, setPhase] = React.useState('intro');
  const [score, setScore] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(20);
  const [fish, setFish] = React.useState([]);
  const timerRef = React.useRef(null);
  const spawnRef = React.useRef(null);
  const nextId = React.useRef(0);

  const start = () => {
    setPhase('playing'); setScore(0); setTimeLeft(20); setFish([]);
  };

  React.useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          clearInterval(spawnRef.current);
          setPhase('result');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    spawnRef.current = setInterval(() => {
      const id = nextId.current++;
      const x = 6 + Math.random() * 74;
      const y = 8 + Math.random() * 72;
      setFish(prev => [...prev.slice(-10), { id, x, y }]);
      setTimeout(() => setFish(prev => prev.filter(f => f.id !== id)), 1500);
    }, 680);
    return () => { clearInterval(timerRef.current); clearInterval(spawnRef.current); };
  }, [phase]);

  const timerColor = timeLeft <= 5 ? C.red : timeLeft <= 10 ? C.yellow : C.cyan;

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      padding: '48px 24px 32px', gap: 20, background: C.bg }}>

      {phase === 'intro' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 24, animation: 'fadeInUp 0.4s ease' }}>
          <div style={{ fontSize: 72, filter: 'drop-shadow(0 4px 16px #22d3ee50)' }}>🎮</div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: C.text }}>Catch the Fish!</h2>
            <p style={{ fontSize: 14, color: C.sub, marginTop: 10, lineHeight: 1.6 }}>
              Tap fish as fast as you can.<br/>
              You have <strong style={{ color: C.cyan }}>20 seconds</strong>.
            </p>
          </div>
          <BigBtn onClick={start} gradient={`linear-gradient(135deg, ${C.lavender}, ${C.cyan})`}>
            🐟 Let's Go!
          </BigBtn>
          <button onClick={() => onDone(0)} style={{ background: 'none', border: 'none',
            color: C.sub, fontSize: 13, cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
            fontWeight: 600 }}>← Back to pet</button>
        </div>
      )}

      {phase === 'playing' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ fontSize: 10, letterSpacing: 2.5, color: C.sub, textTransform: 'uppercase' }}>Caught</p>
              <p style={{ fontSize: 38, fontWeight: 900, color: C.text, lineHeight: 1 }}>{score}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 10, letterSpacing: 2.5, color: C.sub, textTransform: 'uppercase' }}>Time</p>
              <p style={{ fontSize: 38, fontWeight: 900, color: timerColor,
                lineHeight: 1, transition: 'color 0.3s' }}>{timeLeft}s</p>
            </div>
          </div>
          <div style={{ flex: 1, position: 'relative', borderRadius: 20, overflow: 'hidden',
            background: `radial-gradient(ellipse at 50% 50%, #102030 0%, ${C.surface} 100%)`,
            border: `1px solid ${C.border}`, minHeight: 300 }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.06,
              backgroundImage: 'radial-gradient(circle, #22d3ee 1px, transparent 1px)',
              backgroundSize: '24px 24px' }}/>
            {fish.map(f => (
              <button key={f.id}
                onClick={() => {
                  setFish(prev => prev.filter(x => x.id !== f.id));
                  setScore(s => s + 1);
                }}
                style={{
                  position: 'absolute', left: `${f.x}%`, top: `${f.y}%`,
                  background: 'none', border: 'none', fontSize: 34,
                  cursor: 'pointer', padding: 4,
                  transform: 'translate(-50%, -50%)',
                  animation: 'fishAppear 0.18s ease',
                  filter: 'drop-shadow(0 0 8px #22d3ee80)',
                  zIndex: 2,
                }}>🐟</button>
            ))}
          </div>
        </>
      )}

      {phase === 'result' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 24, animation: 'fadeInUp 0.4s ease' }}>
          <div style={{ fontSize: 72 }}>{score >= 12 ? '🏆' : score >= 7 ? '⭐' : '🐟'}</div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: C.sub, letterSpacing: 3, textTransform: 'uppercase' }}>You caught</p>
            <p style={{ fontSize: 64, fontWeight: 900, color: C.text, lineHeight: 1 }}>{score}</p>
            <p style={{ fontSize: 15, color: C.sub }}>fish!</p>
          </div>
          <div style={{ background: C.surface, borderRadius: 18, border: `1px solid ${C.border}`,
            padding: '16px 24px', width: '100%', textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: C.sub, textTransform: 'uppercase',
              letterSpacing: 2, marginBottom: 6 }}>Rewards</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: C.happy }}>
              +{score * 2} Happiness
            </p>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.lavender, marginTop: 4 }}>
              +{score} XP
            </p>
          </div>
          <BigBtn onClick={() => onDone(score)}>🎉 Claim Reward</BigBtn>
        </div>
      )}
    </div>
  );
};

// ─── EVOLUTION ──────────────────────────────────────────────
const EvolutionScreen = ({ pet, onDone }) => {
  const STAGE_NAMES = ['Baby', 'Teen', 'Adult'];
  const msgs = ['', 'Growing up so fast! 🌟', 'Fully evolved! 👑'];
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 28,
      background: `radial-gradient(ellipse at 50% 50%, #28105c 0%, ${C.bg} 68%)`,
      padding: '32px 24px' }}>
      <p style={{ fontSize: 11, letterSpacing: 4, color: C.lavender,
        textTransform: 'uppercase', animation: 'fadeInUp 0.5s ease' }}>
        ✨ Evolution!
      </p>
      <div style={{ position: 'relative', width: 200, height: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            position: 'absolute', inset: i * 18, borderRadius: '50%',
            border: `1.5px solid ${i === 0 ? C.lavender + '60' : i === 1 ? C.cyan + '40' : C.lavender + '20'}`,
            animation: `spin ${2.5 + i * 0.8}s linear infinite${i % 2 ? ' reverse' : ''}`,
          }}/>
        ))}
        <div style={{ animation: 'float 2s ease-in-out infinite' }}>
          <CatSprite emotion="happy" stage={pet.stage}/>
        </div>
      </div>
      <div style={{ textAlign: 'center', animation: 'fadeInUp 0.5s 0.2s ease both' }}>
        <p style={{ fontSize: 14, color: C.sub }}>{pet.name} is now a</p>
        <h2 style={{
          fontSize: 44, fontWeight: 900,
          background: `linear-gradient(135deg, ${C.lavender}, ${C.cyan})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>{STAGE_NAMES[pet.stage]}</h2>
        <p style={{ fontSize: 14, color: C.sub, marginTop: 6 }}>{msgs[pet.stage]}</p>
      </div>
      <BigBtn onClick={onDone}
        gradient={`linear-gradient(135deg, ${C.lavender}, ${C.cyan})`}
        style={{ animation: 'fadeInUp 0.5s 0.4s ease both' }}>
        Incredible! 🎊
      </BigBtn>
    </div>
  );
};

// ─── SETTINGS ───────────────────────────────────────────────
const SettingsScreen = ({ pet, onBack, onReset }) => {
  const [confirmReset, setConfirmReset] = React.useState(false);
  const STAGE_NAMES = ['Baby', 'Teen', 'Adult'];
  const ageText = pet.age < 1 ? `${Math.round(pet.age * 24)} hours` : `${pet.age.toFixed(1)} days`;
  const infoRows = [
    ['Name',  pet.name],
    ['Stage', STAGE_NAMES[pet.stage]],
    ['Age',   ageText],
    ['XP',    `${pet.xp} points`],
  ];
  return (
    <div style={{ minHeight: '100dvh', padding: '52px 24px 32px',
      display: 'flex', flexDirection: 'column', gap: 20, background: C.bg }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={onBack} style={{
          background: C.elevated, border: `1px solid ${C.border}`,
          color: C.text, borderRadius: 12, width: 40, height: 40,
          fontSize: 18, cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>←</button>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: C.text }}>Settings</h2>
      </div>

      <div style={{ background: C.surface, borderRadius: 20, border: `1px solid ${C.border}`, padding: 16 }}>
        <p style={{ fontSize: 10, letterSpacing: 3, color: C.sub,
          textTransform: 'uppercase', marginBottom: 12 }}>Companion Info</p>
        {infoRows.map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between',
            padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 13, color: C.sub }}>{k}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{ background: `${C.happy}10`, borderRadius: 16,
        border: `1px solid ${C.happy}30`, padding: '12px 16px' }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: C.happy }}>✅ Auto-saved to device</p>
        <p style={{ fontSize: 12, color: C.sub, marginTop: 4, lineHeight: 1.5 }}>
          Progress is stored locally. Closing the tab is safe.
        </p>
      </div>

      <div style={{ marginTop: 'auto' }}>
        {!confirmReset ? (
          <button onClick={() => setConfirmReset(true)} style={{
            width: '100%', padding: 14, borderRadius: 14,
            background: 'transparent', border: `1.5px solid ${C.red}50`,
            color: C.red, fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
          }}>🗑 Reset Game</button>
        ) : (
          <div style={{ background: C.surface, borderRadius: 20,
            border: `1px solid ${C.border}`, padding: 20 }}>
            <p style={{ fontSize: 14, color: C.text, textAlign: 'center', marginBottom: 16,
              lineHeight: 1.5 }}>
              This will erase <strong style={{ color: C.lavender }}>{pet.name}</strong> permanently.<br/>
              Are you sure?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmReset(false)} style={{
                flex: 1, padding: 12, borderRadius: 12, background: C.elevated,
                border: `1px solid ${C.border}`, color: C.text, fontSize: 13,
                fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
              }}>Cancel</button>
              <button onClick={onReset} style={{
                flex: 1, padding: 12, borderRadius: 12,
                background: `${C.red}18`, border: `1.5px solid ${C.red}`,
                color: C.red, fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
              }}>Yes, Reset</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { BigBtn, C, WelcomeScreen, SelectScreen, MainScreen, MiniGameScreen, EvolutionScreen, SettingsScreen });
