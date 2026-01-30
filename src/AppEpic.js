import { useState, useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import './AppEpic.css';

// Epic Starfield with nebula colors
function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let stars = [];
    let nebulas = [];
    let mouseX = 0;
    let mouseY = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
      initNebulas();
    };

    const initStars = () => {
      stars = Array.from({ length: 80 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1500,
        size: Math.random() * 2.5,
        color: ['#fff', '#4ecdc4', '#a855f7', '#f472b6', '#fbbf24'][Math.floor(Math.random() * 5)],
      }));
    };

    const initNebulas = () => {
      nebulas = Array.from({ length: 2 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 100 + Math.random() * 200,
        color: ['rgba(78, 205, 196, 0.03)', 'rgba(168, 85, 247, 0.03)', 'rgba(244, 114, 182, 0.03)'][Math.floor(Math.random() * 3)],
        speed: 0.2 + Math.random() * 0.3,
      }));
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(5, 5, 20, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw nebulas
      nebulas.forEach(nebula => {
        nebula.x += nebula.speed;
        nebula.y += nebula.speed * 0.5;
        if (nebula.x > canvas.width + nebula.radius) nebula.x = -nebula.radius;
        if (nebula.y > canvas.height + nebula.radius) nebula.y = -nebula.radius;

        const gradient = ctx.createRadialGradient(nebula.x, nebula.y, 0, nebula.x, nebula.y, nebula.radius);
        gradient.addColorStop(0, nebula.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(nebula.x - nebula.radius, nebula.y - nebula.radius, nebula.radius * 2, nebula.radius * 2);
      });

      const centerX = canvas.width / 2 + (mouseX - canvas.width / 2) * 0.1;
      const centerY = canvas.height / 2 + (mouseY - canvas.height / 2) * 0.1;

      stars.forEach(star => {
        star.z -= 2;
        if (star.z <= 0) {
          star.z = 1500;
          star.x = Math.random() * canvas.width;
          star.y = Math.random() * canvas.height;
        }

        const scale = 1500 / star.z;
        const x = (star.x - centerX) * scale + centerX;
        const y = (star.y - centerY) * scale + centerY;
        const size = star.size * scale * 0.5;

        if (x >= -50 && x <= canvas.width + 50 && y >= -50 && y <= canvas.height + 50) {
          const opacity = Math.min(1, (1500 - star.z) / 700);

          // Star glow
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
          gradient.addColorStop(0, star.color);
          gradient.addColorStop(0.5, star.color.replace(')', `, ${opacity * 0.5})`).replace('rgb', 'rgba'));
          gradient.addColorStop(1, 'transparent');

          ctx.beginPath();
          ctx.arc(x, y, size * 3, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();

          // Star trail
          const trailLength = star.z < 500 ? (500 - star.z) / 10 : 0;
          if (trailLength > 0) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - (x - centerX) * trailLength * 0.01, y - (y - centerY) * trailLength * 0.01);
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
            ctx.lineWidth = size * 0.5;
            ctx.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="starfield" />;
}

// Meteor shower
function MeteorShower() {
  const [meteors, setMeteors] = useState([]);

  useEffect(() => {
    const createMeteor = () => {
      const id = Date.now() + Math.random();
      const meteor = {
        id,
        x: Math.random() * 100,
        y: -10,
        speed: 2 + Math.random() * 3,
        size: 2 + Math.random() * 4,
        angle: 35 + Math.random() * 20,
      };
      setMeteors(prev => [...prev.slice(-5), meteor]);
      setTimeout(() => setMeteors(prev => prev.filter(m => m.id !== id)), 2000);
    };

    const interval = setInterval(createMeteor, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="meteor-shower">
      {meteors.map(m => (
        <div
          key={m.id}
          className="meteor"
          style={{
            left: `${m.x}%`,
            '--angle': `${m.angle}deg`,
            '--speed': `${m.speed}s`,
            '--size': `${m.size}px`,
          }}
        />
      ))}
    </div>
  );
}

// Floating particles around mouse
function MouseParticles() {
  const [particles, setParticles] = useState([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      if (Math.random() > 0.92) {
        const id = Date.now() + Math.random();
        setParticles(prev => [...prev.slice(-8), {
          id,
          x: e.clientX + (Math.random() - 0.5) * 40,
          y: e.clientY + (Math.random() - 0.5) * 40,
          size: 3 + Math.random() * 6,
          color: ['#4ecdc4', '#a855f7', '#f472b6', '#fbbf24'][Math.floor(Math.random() * 4)],
        }]);
        setTimeout(() => setParticles(prev => prev.filter(p => p.id !== id)), 1000);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="mouse-particles">
      {particles.map(p => (
        <div
          key={p.id}
          className="mouse-particle"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: p.color,
          }}
        />
      ))}
    </div>
  );
}

// Glitch text effect
function GlitchText({ children, className }) {
  return (
    <div className={`glitch-container ${className}`}>
      <span className="glitch-text" data-text={children}>{children}</span>
    </div>
  );
}

// Floating icons
function FloatingIcons() {
  const icons = ['🏠', '🔑', '⭐', '✨'];

  return (
    <div className="floating-icons">
      {icons.map((icon, i) => (
        <span
          key={i}
          className="floating-icon"
          style={{
            left: `${10 + (i * 12)}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${4 + Math.random() * 4}s`,
          }}
        >
          {icon}
        </span>
      ))}
    </div>
  );
}

// Ripple effect on click
function RippleEffect() {
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    const handleClick = (e) => {
      const id = Date.now();
      setRipples(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 1000);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="ripple-container">
      {ripples.map(r => (
        <div key={r.id} className="ripple" style={{ left: r.x, top: r.y }} />
      ))}
    </div>
  );
}

// Scroll reveal section
function ScrollSection({ children, className, delay = 0 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`scroll-section ${className} ${isVisible ? 'visible' : ''}`}>
      {children}
    </div>
  );
}

// Epic countdown digit
function EpicDigit({ value, label, index, digits = 2 }) {
  const digitRef = useRef(null);

  return (
    <div className="epic-digit" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="digit-card">
        <div className="digit-value" ref={digitRef}>
          {String(value).padStart(digits, '0')}
        </div>
        <div className="digit-reflection">
          {String(value).padStart(digits, '0')}
        </div>
      </div>
      <div className="digit-label">{label}</div>
      <div className="digit-glow" />
    </div>
  );
}

// 3D House
function House3D() {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientY / window.innerHeight - 0.5) * 20;
      const y = (e.clientX / window.innerWidth - 0.5) * 20;
      setRotation({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="house-3d-container">
      <div
        className="house-3d"
        style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
      >
        <div className="house-face house-front">
          <div className="house-door" />
          <div className="house-window left" />
          <div className="house-window right" />
        </div>
        <div className="house-face house-roof" />
        <div className="house-face house-left" />
        <div className="house-face house-right" />
        <div className="house-chimney" />
      </div>
      <div className="house-shadow" />
      <div className="house-particles">
        {[...Array(10)].map((_, i) => (
          <span key={i} className="house-particle" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  );
}

// Progress bar with animation
function EpicProgress({ progress }) {
  return (
    <div className="epic-progress">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }}>
          <div className="progress-glow" />
          <div className="progress-particles">
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
        <div className="progress-markers">
          {[0, 25, 50, 75, 100].map(mark => (
            <div key={mark} className={`marker ${progress >= mark ? 'active' : ''}`} style={{ left: `${mark}%` }} />
          ))}
        </div>
      </div>
      <div className="progress-label">
        <span className="progress-percent">{progress.toFixed(10)}%</span>
        <span className="progress-text">JOURNEY COMPLETE</span>
      </div>
    </div>
  );
}

function AppEpic() {
  const [lang, setLang] = useState(() => localStorage.getItem('grave-countdown-lang') || 'nl');
  const [isDayMode, setIsDayMode] = useState(() => localStorage.getItem('grave-countdown-daymode') === 'true');
  const [scrollY, setScrollY] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    localStorage.setItem('grave-countdown-lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('grave-countdown-daymode', isDayMode);
  }, [isDayMode]);

  useEffect(() => {
    setLoaded(true);

    // Epic intro animation
    const tl = gsap.timeline({ delay: 0.5 });
    tl.fromTo('.hero-title', { y: 100, opacity: 0, scale: 0.5 }, { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'elastic.out(1, 0.5)' })
      .fromTo('.hero-subtitle', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.5')
      .fromTo('.epic-digit', { y: 80, opacity: 0, rotateX: -90 }, { y: 0, opacity: 1, rotateX: 0, duration: 0.8, stagger: 0.1, ease: 'back.out(2)' }, '-=0.3')
      .fromTo('.house-3d-container', { scale: 0, opacity: 0, rotateY: 180 }, { scale: 1, opacity: 1, rotateY: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)' }, '-=0.5')
      .fromTo('.epic-progress', { width: 0, opacity: 0 }, { width: '100%', opacity: 1, duration: 1, ease: 'power3.out' }, '-=0.5');

    return () => tl.kill();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tr = useMemo(() => ({
    nl: {
      title: 'Lil, Sam & Tommie',
      subtitle: 'REIS NAAR BRABOLAND',
      date: '12 FEBRUARI 2026',
      months: 'MND', weeks: 'WKN', days: 'DGN', hours: 'UUR', minutes: 'MIN', seconds: 'SEC', ms: 'MS',
      daysLeft: 'dagen te gaan',
      daysPassed: 'dagen voltooid',
      progress: 'van de reis',
    },
    en: {
      title: 'Lil, Sam & Tommie',
      subtitle: 'JOURNEY TO BRABOLAND',
      date: 'FEBRUARY 12, 2026',
      months: 'MTH', weeks: 'WKS', days: 'DYS', hours: 'HRS', minutes: 'MIN', seconds: 'SEC', ms: 'MS',
      daysLeft: 'days to go',
      daysPassed: 'days complete',
      progress: 'of journey',
    }
  }), []);

  const t = useMemo(() => tr[lang], [tr, lang]);

  const targetDate = useMemo(() => new Date('2026-02-12T11:00:00'), []);
  const startDate = useMemo(() => new Date('2025-08-15'), []);

  const [time, setTime] = useState({ months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, ms: 0, totalDays: 0, daysPassed: 0, progress: 0 });

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const total = (targetDate - startDate) / 864e5;
      const elapsed = Math.max(0, (now - startDate) / 864e5);
      const progress = Math.min(100, (elapsed / total) * 100);
      const totalDays = Math.max(0, Math.ceil((targetDate - now) / 864e5));

      if (targetDate <= now) {
        setTime({ months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, ms: 0, totalDays: 0, daysPassed: Math.floor(elapsed), progress: 100 });
        return;
      }

      let months = 0, temp = new Date(now);
      while (temp < targetDate) {
        const next = new Date(temp); next.setMonth(next.getMonth() + 1);
        if (next <= targetDate) { months++; temp = next; } else break;
      }

      let weeks = 0;
      const afterM = new Date(now); afterM.setMonth(afterM.getMonth() + months);
      while (afterM < targetDate) {
        const next = new Date(afterM); next.setDate(next.getDate() + 7);
        if (next <= targetDate) { weeks++; afterM.setDate(afterM.getDate() + 7); } else break;
      }

      const afterW = new Date(afterM);
      const days = Math.floor((targetDate - afterW) / 864e5);
      const afterD = new Date(afterW); afterD.setDate(afterD.getDate() + days);
      const hours = Math.floor((targetDate - afterD) / 36e5);
      const afterH = new Date(afterD); afterH.setHours(afterH.getHours() + hours);
      const minutes = Math.floor((targetDate - afterH) / 6e4);
      const afterMin = new Date(afterH); afterMin.setMinutes(afterMin.getMinutes() + minutes);
      const seconds = Math.floor((targetDate - afterMin) / 1000);
      const afterSec = new Date(afterMin); afterSec.setSeconds(afterSec.getSeconds() + seconds);
      const ms = Math.floor(targetDate - afterSec);

      setTime({ months, weeks, days: Math.max(0, days), hours: Math.max(0, hours), minutes: Math.max(0, minutes), seconds: Math.max(0, seconds), ms: Math.max(0, ms), totalDays, daysPassed: Math.floor(elapsed), progress });
    };

    calc();
    const i = setInterval(calc, 100);
    return () => clearInterval(i);
  }, [targetDate, startDate]);

  return (
    <div className={`app ${loaded ? 'loaded' : ''} ${isDayMode ? 'day-mode' : ''}`}>
      {!isDayMode && <Starfield />}
      {!isDayMode && <MeteorShower />}
      <MouseParticles />
      <RippleEffect />
      {!isDayMode && <FloatingIcons />}

      <div className="scroll-progress-bar" style={{ transform: `scaleX(${scrollY / (document.documentElement.scrollHeight - window.innerHeight) || 0})` }} />

      <button className="daynight-toggle" onClick={() => setIsDayMode(!isDayMode)}>
        {isDayMode ? '🌙' : '☀️'}
      </button>

      <div className="lang-toggle">
        <button className={lang === 'nl' ? 'active' : ''} onClick={() => setLang('nl')}>NL</button>
        <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
      </div>

      <section className="hero">
        <div className="hero-content">
          <GlitchText className="hero-title">{t.title}</GlitchText>
          <h2 className="hero-subtitle">{t.subtitle}</h2>

          <div className="countdown-epic">
            <EpicDigit value={time.months} label={t.months} index={0} />
            <span className="countdown-sep">:</span>
            <EpicDigit value={time.weeks} label={t.weeks} index={1} />
            <span className="countdown-sep">:</span>
            <EpicDigit value={time.days} label={t.days} index={2} />
            <span className="countdown-sep">:</span>
            <EpicDigit value={time.hours} label={t.hours} index={3} />
            <span className="countdown-sep">:</span>
            <EpicDigit value={time.minutes} label={t.minutes} index={4} />
            <span className="countdown-sep">:</span>
            <EpicDigit value={time.seconds} label={t.seconds} index={5} />
            <span className="countdown-sep">:</span>
            <EpicDigit value={Math.floor(time.ms / 10)} label={t.ms} index={6} />
          </div>

          <House3D />

          <div className="destination-badge">
            <span className="badge-icon">🔑</span>
            <span className="badge-text">{t.date}</span>
          </div>
        </div>

        <div className="scroll-indicator">
          <div className="scroll-mouse">
            <div className="scroll-wheel" />
          </div>
          <span>SCROLL</span>
        </div>
      </section>

      <ScrollSection className="stats-section" delay={200}>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🚀</div>
            <div className="stat-value">{time.totalDays}</div>
            <div className="stat-label">{t.daysLeft}</div>
          </div>
          <div className="stat-card featured">
            <div className="stat-icon">✨</div>
            <div className="stat-value">{time.progress.toFixed(10)}%</div>
            <div className="stat-label">{t.progress}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">{time.daysPassed}</div>
            <div className="stat-label">{t.daysPassed}</div>
          </div>
        </div>

        <EpicProgress progress={time.progress} />
      </ScrollSection>

      <ScrollSection className="journey-section" delay={400}>
        <div className="journey-visual">
          <div className="journey-line">
            <div className="journey-progress" style={{ height: `${time.progress}%` }} />
          </div>
          <div className="journey-start">
            <span className="journey-dot" />
            <span className="journey-label">START<br/>Aug 2025</span>
          </div>
          <div className="journey-current" style={{ top: `${time.progress}%` }}>
            <span className="current-pulse" />
            <span className="current-dot" />
            <span className="current-label">NOW</span>
          </div>
          <div className="journey-end">
            <span className="journey-dot end" />
            <span className="journey-label">🏠 BRABOLAND<br/>Feb 2026</span>
          </div>
        </div>
      </ScrollSection>

      <footer className="footer">
        <div className="footer-content">
          <span className="footer-emoji">🏠</span>
          <p>See you in Braboland!</p>
        </div>
      </footer>
    </div>
  );
}

export default AppEpic;
