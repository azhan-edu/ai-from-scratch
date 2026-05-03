// Pocket Pet Companion — Shared Components
// CatSprite, StatBar, ActionBtn

const CatSprite = ({ emotion = 'happy', stage = 0 }) => {
  const [blink, setBlink] = React.useState(false);

  React.useEffect(() => {
    let t;
    const schedule = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => { setBlink(false); schedule(); }, 140);
      }, 2800 + Math.random() * 2400);
    };
    schedule();
    return () => clearTimeout(t);
  }, []);

  const bodyColor = stage === 2 ? '#c8a87a' : stage === 1 ? '#dbbf96' : '#f0dcc8';
  const earInner  = '#f7aac8';
  const eyeCol    = '#1a0e28';
  const scale     = stage === 0 ? 0.76 : stage === 1 ? 0.88 : 1.0;
  const eyeRy     = blink ? 1.2 : emotion === 'sleepy' ? 2.8 : (emotion === 'sad' || emotion === 'hungry') ? 5 : 7;
  const showShine = !blink && emotion !== 'sleepy' && emotion !== 'sick';

  const Mouth = () => {
    if (emotion === 'happy')
      return <path d="M50,61 Q58,67 66,61" stroke="#b86060" strokeWidth="2" fill="none" strokeLinecap="round"/>;
    if (emotion === 'sad' || emotion === 'hungry')
      return <path d="M50,65 Q58,61 66,65" stroke="#b86060" strokeWidth="2" fill="none" strokeLinecap="round"/>;
    if (emotion === 'sick')
      return <path d="M48,64 Q58,58 68,64" stroke="#70b050" strokeWidth="2" fill="none" strokeLinecap="round"/>;
    return <path d="M51,62 Q58,64 65,62" stroke="#b86060" strokeWidth="2" fill="none" strokeLinecap="round"/>;
  };

  const tint = emotion === 'sick' ? 'sepia(0.4) hue-rotate(90deg) saturate(0.8)' : 'none';

  return (
    <svg viewBox="0 0 120 120" width={Math.round(120 * scale)} height={Math.round(120 * scale)}
      style={{ filter: tint, overflow: 'visible', display: 'block' }}>
      {/* Tail */}
      <path d="M82,102 Q110,86 104,62" stroke={bodyColor} strokeWidth="11" fill="none" strokeLinecap="round"/>
      {/* Body */}
      <ellipse cx="58" cy="96" rx="33" ry="24" fill={bodyColor}/>
      {/* Belly */}
      <ellipse cx="58" cy="100" rx="19" ry="14" fill={earInner} opacity="0.32"/>
      {/* Head */}
      <circle cx="58" cy="50" r="33" fill={bodyColor}/>
      {/* Ears */}
      <polygon points="28,26 20,4 46,18" fill={bodyColor}/>
      <polygon points="88,26 96,4 70,18" fill={bodyColor}/>
      <polygon points="30,24 25,8 44,18" fill={earInner}/>
      <polygon points="86,24 91,8 72,18" fill={earInner}/>
      {/* Eyes */}
      {emotion === 'sick' ? (
        <>
          <text x="35" y="54" fontSize="15" fill={eyeCol} fontWeight="bold">×</text>
          <text x="63" y="54" fontSize="15" fill={eyeCol} fontWeight="bold">×</text>
        </>
      ) : (
        <>
          <ellipse cx="44" cy="47" rx="8" ry={eyeRy} fill={eyeCol}/>
          <ellipse cx="72" cy="47" rx="8" ry={eyeRy} fill={eyeCol}/>
          {showShine && <>
            <circle cx="46.5" cy="43" r="2.8" fill="white" opacity="0.85"/>
            <circle cx="74.5" cy="43" r="2.8" fill="white" opacity="0.85"/>
          </>}
        </>
      )}
      {/* Nose */}
      <ellipse cx="58" cy="56" rx="3.5" ry="2.5" fill={earInner}/>
      {/* Mouth */}
      <Mouth/>
      {/* Whiskers */}
      <line x1="18" y1="52" x2="46" y2="55" stroke="#b8a8c8" strokeWidth="1.1" opacity="0.45"/>
      <line x1="18" y1="59" x2="46" y2="58" stroke="#b8a8c8" strokeWidth="1.1" opacity="0.45"/>
      <line x1="98" y1="52" x2="70" y2="55" stroke="#b8a8c8" strokeWidth="1.1" opacity="0.45"/>
      <line x1="98" y1="59" x2="70" y2="58" stroke="#b8a8c8" strokeWidth="1.1" opacity="0.45"/>
      {/* Sleepy zzz */}
      {emotion === 'sleepy' && (
        <text x="88" y="28" fontSize="13" fill="#818cf8" fontWeight="800"
          style={{ animation: 'pulse 2s ease-in-out infinite' }}>zzz</text>
      )}
      {/* Hungry drool */}
      {emotion === 'hungry' && (
        <ellipse cx="54" cy="70" rx="3" ry="5" fill="#a8d8f0" opacity="0.6"
          style={{ animation: 'pulse 1.4s ease-in-out infinite' }}/>
      )}
    </svg>
  );
};

const StatBar = ({ label, value, color, icon }) => {
  const pct = Math.max(0, Math.min(100, value));
  const barColor = pct < 20 ? '#ef4444' : pct < 40 ? '#f59e0b' : color;
  return (
    <div style={{ marginBottom: 11 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5,
        fontSize: 12, color: '#7b72a8', fontWeight: 700, letterSpacing: 0.3 }}>
        <span>{icon} {label}</span>
        <span style={{ color: barColor, minWidth: 36, textAlign: 'right' }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ background: '#0f0d1e', borderRadius: 8, height: 8, overflow: 'hidden',
        boxShadow: 'inset 0 1px 3px #00000060' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
          borderRadius: 8,
          transition: 'width 0.55s ease, background 0.3s',
          boxShadow: `0 0 6px ${barColor}60`,
        }}/>
      </div>
    </div>
  );
};

const ActionBtn = ({ icon, label, onClick, disabled, color }) => {
  const [pressed, setPressed] = React.useState(false);
  const c = color || '#a78bfa';
  const handleClick = () => {
    if (disabled) return;
    setPressed(true);
    setTimeout(() => setPressed(false), 180);
    onClick();
  };
  return (
    <button onClick={handleClick} style={{
      background: pressed ? `${c}28` : disabled ? '#13111e' : `${c}10`,
      border: `1.5px solid ${disabled ? '#22203a' : pressed ? c : `${c}60`}`,
      color: disabled ? '#2e2a48' : c,
      borderRadius: 14,
      padding: '10px 4px 8px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
      fontSize: 11, fontWeight: 700, fontFamily: 'Nunito, sans-serif',
      flex: 1, minWidth: 54,
      transform: pressed ? 'scale(0.9)' : 'scale(1)',
      transition: 'all 0.12s ease',
      userSelect: 'none',
    }}>
      <span style={{ fontSize: 21 }}>{icon}</span>
      {label}
    </button>
  );
};

Object.assign(window, { CatSprite, StatBar, ActionBtn });
