import { useState, useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import Tree from './Tree';
import './AppClassic.css';
import siteContent from './content/siteContent.json';

function AppClassic() {
  // Language state with persistence
  const [lang, setLang] = useState(() => localStorage.getItem('grave-countdown-lang') || 'nl');
  useEffect(() => {
    localStorage.setItem('grave-countdown-lang', lang);
  }, [lang]);

  // Simple i18n dictionary with pluralization helpers
  // Titles and itsTime are loaded from CMS content
  const tr = useMemo(() => ({
    nl: {
      title: siteContent.nl.title,
      itsTime: siteContent.nl.itsTime,
      remaining: (n) => `resterend ${n} ${n === 1 ? 'dag' : 'dagen'}`,
      unitMonths: (n) => `${n} ${n === 1 ? 'maand' : 'maanden'}`,
      unitWeeks: (n) => `${n} ${n === 1 ? 'week' : 'weken'}`,
      unitDays: (n) => `${n} ${n === 1 ? 'dag' : 'dagen'}`,
      unitHours: (n) => `${n} ${n === 1 ? 'uur' : 'uren'}`,
      unitMinutes: (n) => `${n} ${n === 1 ? 'minuut' : 'minuten'}`,
      unitSeconds: (n) => `${n} ${n === 1 ? 'seconde' : 'seconden'}`,
      crossed: (n) => `${n} dagen verstreken`,
      dateDayPrefix: (n) => (n > 0 ? `nog ${n} ${n === 1 ? 'dag' : 'dagen'}` : ''),
      dayNames: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
      monthNames: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
      langLabelNL: 'NL',
      langLabelEN: 'EN'
    },
    en: {
      title: siteContent.en.title,
      itsTime: siteContent.en.itsTime,
      remaining: (n) => `remaining ${n} ${n === 1 ? 'day' : 'days'}`,
      unitMonths: (n) => `${n} ${n === 1 ? 'month' : 'months'}`,
      unitWeeks: (n) => `${n} ${n === 1 ? 'week' : 'weeks'}`,
      unitDays: (n) => `${n} ${n === 1 ? 'day' : 'days'}`,
      unitHours: (n) => `${n} ${n === 1 ? 'hour' : 'hours'}`,
      unitMinutes: (n) => `${n} ${n === 1 ? 'minute' : 'minutes'}`,
      unitSeconds: (n) => `${n} ${n === 1 ? 'second' : 'seconds'}`,
      crossed: (n) => `${n} days elapsed`,
      dateDayPrefix: (n) => (n > 0 ? `${n} ${n === 1 ? 'day' : 'days'} left` : ''),
      dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      langLabelNL: 'NL',
      langLabelEN: 'EN'
    }
  }), []);

  const t = useMemo(() => tr[lang], [tr, lang]);
  
  // Target date from CMS content
  const targetDate = useMemo(() => {
    const date = new Date(siteContent.targetDate);
    return date;
  }, []);

  // Calculate the actual current date (when countdown started)
  const actualToday = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const today = useMemo(() => {
    return actualToday;
  }, [actualToday]);

  // Calculate the start date from CMS content
  const startDate = useMemo(() => {
    const date = new Date(siteContent.startDate);
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  // Calculate total days in the journey (from 15 augustus to 12 februari)
  const totalDaysInJourney = useMemo(() => {
    return Math.ceil((targetDate - startDate) / (1000 * 60 * 60 * 24));
  }, [targetDate, startDate]);

  // Calculate days remaining from today to targetDate
  // Match the display logic in the calendar (item.dayNumber - 1)
  const daysRemaining = useMemo(() => {
    const diff = (targetDate - today) / (1000 * 60 * 60 * 24);
    const days = Math.ceil(diff);
    // Match calendar display: displayDay = item.dayNumber - 1
    // So we need to subtract 1 from the calculated remaining days
    return Math.max(1, days - 1);
  }, [targetDate, today]);

  // Check if we've reached or passed the target date
  const isTargetDateReached = useMemo(() => {
    return today >= targetDate;
  }, [today, targetDate]);

  // Dark mode state - default based on time of day
  // Light mode: 8:00 - 18:00, Dark mode: outside those hours
  const getDefaultDarkMode = () => {
    const now = new Date();
    const hours = now.getHours();
    return hours < 8 || hours >= 18;
  };

  const [isDarkMode, setIsDarkMode] = useState(getDefaultDarkMode);
  const datesGridRef = useRef(null);
  const countdownInfoRef = useRef(null);
  const [showDog, setShowDog] = useState(false);
  const [dogKey, setDogKey] = useState(0);

  // Calculate days passed (from start to preview date)
  const daysPassed = useMemo(() => {
    return Math.max(0, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));
  }, [today, startDate]);

  // Calculate remaining time accurately (months, weeks, days, hours, minutes, seconds)
  const [timeRemaining, setTimeRemaining] = useState({
    months: 0,
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      
      if (targetDate <= now) {
        setTimeRemaining({ months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      // Calculate months remaining
      let months = 0;
      let tempDate = new Date(now);
      while (tempDate < targetDate) {
        const nextMonth = new Date(tempDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        if (nextMonth <= targetDate) {
          months++;
          tempDate = nextMonth;
        } else {
          break;
        }
      }

      // Calculate weeks remaining (after months)
      let weeks = 0;
      const afterMonths = new Date(now);
      afterMonths.setMonth(afterMonths.getMonth() + months);
      
      while (afterMonths < targetDate) {
        const nextWeek = new Date(afterMonths);
        nextWeek.setDate(nextWeek.getDate() + 7);
        if (nextWeek <= targetDate) {
          weeks++;
          afterMonths.setDate(afterMonths.getDate() + 7);
        } else {
          break;
        }
      }

      // Calculate days remaining (after months and weeks)
      const afterWeeks = new Date(afterMonths);
      const days = Math.floor((targetDate - afterWeeks) / (1000 * 60 * 60 * 24));

      // Calculate hours remaining (after months, weeks, and days)
      const afterDays = new Date(afterWeeks);
      afterDays.setDate(afterDays.getDate() + days);
      const hours = Math.floor((targetDate - afterDays) / (1000 * 60 * 60));

      // Calculate minutes remaining (after months, weeks, days, and hours)
      const afterHours = new Date(afterDays);
      afterHours.setHours(afterHours.getHours() + hours);
      const minutes = Math.floor((targetDate - afterHours) / (1000 * 60));

      // Calculate seconds remaining (after months, weeks, days, hours, and minutes)
      const afterMinutes = new Date(afterHours);
      afterMinutes.setMinutes(afterMinutes.getMinutes() + minutes);
      const seconds = Math.floor((targetDate - afterMinutes) / 1000);

      setTimeRemaining({ 
        months, 
        weeks, 
        days: Math.max(0, days), 
        hours: Math.max(0, hours),
        minutes: Math.max(0, minutes),
        seconds: Math.max(0, seconds)
      });
    };

    // Update immediately
    calculateTimeRemaining();

    // Update every second for minutes precision
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  // Removed columnsPerRow calculation - no longer needed after GSAP animations removed

  // Cool GSAP entrance animation on initial load
  useEffect(() => {
    if (!countdownInfoRef.current) return;
    
    const timeItems = countdownInfoRef.current.querySelectorAll('.time-item');
    const crossedInfo = countdownInfoRef.current.querySelector('.crossed-info');
    
    if (timeItems.length === 0) return;
    
    // Set initial state - items hidden and transformed
    gsap.set([timeItems, crossedInfo], {
      opacity: 0,
      y: 50,
      rotationX: -90,
      scale: 0.5,
      filter: 'blur(10px)'
    });
    
    // Create timeline for staggered entrance
    const tl = gsap.timeline({ delay: 0.5 });
    
    // Animate each time item with different delays and directions
    timeItems.forEach((item, index) => {
      const delay = index * 0.1;
      const rotationY = (index % 2 === 0) ? -360 : 360; // Alternate rotation direction
      
      tl.to(item, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        rotationY: rotationY,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1,
        ease: 'back.out(1.7)'
      }, delay);
    });
    
    // Animate crossed info after time items
    if (crossedInfo) {
      tl.to(crossedInfo, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.8,
        ease: 'power3.out'
      }, timeItems.length * 0.1 + 0.2);
    }
    
    return () => {
      tl.kill();
    };
  }, []);

  // Dog appearance loop: runs from apartment to house every 5 seconds
  useEffect(() => {
    let cancelled = false;
    let intervalId;
    
    const triggerDog = () => {
      if (cancelled) return;
      setShowDog(false); // Reset first
      setTimeout(() => {
        if (cancelled) return;
        setShowDog(true);
        setDogKey(prev => prev + 1); // Force re-render to restart animation
      }, 10);
    };
    
    // Start immediately, then repeat every 5 seconds
    triggerDog();
    intervalId = setInterval(triggerDog, 10000);
    
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  // Calculate journey progress (0 to ~85% to account for home position)
  // Progress based on days passed from today
  const journeyProgress = useMemo(() => {
    if (totalDaysInJourney === 0) return 85;
    // Calculate days passed from startDate (today) - this will be 0 initially
    const elapsedDays = Math.max(0, Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24)));
    // Progress up to 85% so truck reaches the home (which is positioned at ~85-90% from left)
    return Math.min(85, (elapsedDays / totalDaysInJourney) * 85);
  }, [startDate, totalDaysInJourney]);

  // Tree configurations - only animate half of them for performance
  const treesConfig = useMemo(() => [
    // Round trees - left side
    { variant: 'round', className: 'tree-left-1', animated: true },
    { variant: 'round', className: 'tree-left-2', animated: false },
    { variant: 'round', className: 'tree-left-3', animated: true },
    { variant: 'round', className: 'tree-left-4', animated: false },
    { variant: 'round', className: 'tree-left-5', animated: true },
    { variant: 'round', className: 'tree-left-6', animated: false },
    // Round trees - right side
    { variant: 'round', className: 'tree-right-1', animated: true },
    { variant: 'round', className: 'tree-right-2', animated: false },
    { variant: 'round', className: 'tree-right-3', animated: true },
    { variant: 'round', className: 'tree-right-4', animated: false },
    { variant: 'round', className: 'tree-right-5', animated: true },
    { variant: 'round', className: 'tree-right-6', animated: false },
    // Round trees - top
    { variant: 'round', className: 'tree-top-left-1', animated: true },
    { variant: 'round', className: 'tree-top-right-1', animated: false },
    { variant: 'round', className: 'tree-top-left-2', animated: true },
    { variant: 'round', className: 'tree-top-right-2', animated: false },
    // Alt trees - left
    { variant: 'alt', className: 'tree-left-alt-1', animated: true },
    { variant: 'alt', className: 'tree-left-alt-2', animated: false },
    // Alt trees - right
    { variant: 'alt', className: 'tree-right-alt-1', animated: true },
    { variant: 'alt', className: 'tree-right-alt-2', animated: false },
    // Alt trees - top
    { variant: 'alt', className: 'tree-top-alt-left-1', animated: true },
    { variant: 'alt', className: 'tree-top-alt-right-1', animated: false },
    { variant: 'alt', className: 'tree-top-alt-left-2', animated: true },
    { variant: 'alt', className: 'tree-top-alt-right-2', animated: false },
  ], []);

  // Generate all dates from start date to target date
  // Dag 182 = 15 augustus (start), Dag 1 = 12 februari (end)
  // Show in normal order: day 1 to day 182
  const dates = useMemo(() => {
    const datesArray = [];
    
    for (let i = 0; i < totalDaysInJourney; i++) {
      const dateToAdd = new Date(startDate);
      dateToAdd.setDate(startDate.getDate() + i);
      // DayNumber counts down: first day (15 aug) is 182, last day (12 feb) is 1
      const dayNumber = totalDaysInJourney - i;
      datesArray.push({
        date: new Date(dateToAdd),
        dayNumber: dayNumber,
      });
    }
    
    // Return in normal order (day 1 to day 182)
    return datesArray;
  }, [startDate, totalDaysInJourney]);

  // GSAP animations removed for better performance - date items are always visible

  // Format date name
  const formatDateName = (date) => {
    const dayName = t.dayNames[date.getDay()];
    const monthName = t.monthNames[date.getMonth()];
    const day = date.getDate();
    return `${dayName}, ${day} ${monthName}`;
  };

  // Initialize and update crossed off items based on days passed
  useEffect(() => {
    // For preview mode, use daysPassed directly (no localStorage needed)
    // For actual mode, check localStorage
    const storageKey = 'grave-countdown-crossed';
    const lastUpdateKey = 'grave-countdown-last-update';
    
    // Get today's date string for comparison
    const todayString = today.toDateString();
    const lastUpdateString = localStorage.getItem(lastUpdateKey);
    
    // If we're in preview mode (today !== actualToday), no localStorage needed
    if (today.getTime() !== actualToday.getTime()) {
      return;
    }
    
    // Otherwise, use localStorage logic
    let currentCrossedCount = parseInt(localStorage.getItem(storageKey) || '0', 10);
    
    // If it's a new day, cross off one more item
    if (lastUpdateString !== todayString) {
      // Make sure we don't cross off more than the total days
      const newCrossedCount = Math.min(currentCrossedCount + 1, totalDaysInJourney);
      currentCrossedCount = newCrossedCount;
      localStorage.setItem(storageKey, newCrossedCount.toString());
      localStorage.setItem(lastUpdateKey, todayString);
    }
  }, [daysRemaining, today, actualToday, daysPassed, totalDaysInJourney]);

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
      <header className={`App-header ${isDarkMode ? 'dark-mode' : ''}`}>
        {/* Dark Mode Toggle */}
        <button 
          className="dark-mode-toggle"
          onClick={() => setIsDarkMode(!isDarkMode)}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        {/* Language Switch - top right */}
        <div className="lang-switch" role="group" aria-label="Language switch">
          <button
            className={`lang-btn ${lang === 'nl' ? 'active' : ''}`}
            onClick={() => setLang('nl')}
          >{t.langLabelNL}</button>
          <span className="lang-sep">|</span>
          <button
            className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
            onClick={() => setLang('en')}
          >{t.langLabelEN}</button>
        </div>
        <h1>{t.title}</h1>        
        {/* Apartment to Home Animation */}
        <div className="journey-animation">
          <div className="road">
            <div className="road-line"></div>
            {/* Trees along the road - optimized with component */}
            {treesConfig.map((tree, index) => (
              <Tree 
                key={index}
                variant={tree.variant}
                className={tree.className}
                animated={tree.animated}
              />
            ))}
            <div className="apartment-start">
              <svg className="apartment" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                {/* Apartment building structure */}
                <rect x="20" y="20" width="60" height="75" fill="#888" stroke="#555" strokeWidth="2"/>
                {/* Windows - multiple floors */}
                <rect x="28" y="30" width="8" height="10" fill="#e8d5b7"/>
                <rect x="40" y="30" width="8" height="10" fill="#e8d5b7"/>
                <rect x="52" y="30" width="8" height="10" fill="#ffd700"/>
                <rect x="64" y="30" width="8" height="10" fill="#e8d5b7"/>
                {/* Second floor */}
                <rect x="28" y="45" width="8" height="10" fill="#e8d5b7"/>
                <rect x="40" y="45" width="8" height="10" fill="#e8d5b7"/>
                <rect x="52" y="45" width="8" height="10" fill="#e8d5b7"/>
                <rect x="64" y="45" width="8" height="10" fill="#ffd700"/>
                {/* Third floor */}
                <rect x="28" y="60" width="8" height="10" fill="#e8d5b7"/>
                <rect x="40" y="60" width="8" height="10" fill="#ffd700"/>
                <rect x="52" y="60" width="8" height="10" fill="#e8d5b7"/>
                <rect x="64" y="60" width="8" height="10" fill="#e8d5b7"/>
                {/* Door */}
                <rect x="42" y="75" width="16" height="20" fill="#8b4513"/>
                {/* Balcony */}
                <rect x="25" y="35" width="50" height="5" fill="#666"/>
              </svg>
            </div>
            <div className="truck-container" style={{ left: `${journeyProgress}%` }}>
              <svg className="truck" viewBox="0 0 150 60" xmlns="http://www.w3.org/2000/svg">
                {/* Truck body */}
                <rect x="10" y="25" width="50" height="25" fill="#d97757" rx="2"/>
                {/* Truck cabin */}
                <rect x="60" y="30" width="20" height="20" fill="#a67c52" rx="2"/>
                {/* Windows */}
                <rect x="63" y="33" width="6" height="6" fill="#e8d5b7"/>
                <rect x="70" y="33" width="6" height="6" fill="#e8d5b7"/>
                {/* Wheels - grouped for animation */}
                <g className="wheel wheel-1">
                  <circle cx="25" cy="50" r="6" fill="#2c2c2c"/>
                  <circle cx="25" cy="50" r="3" fill="#666"/>
                </g>
                <g className="wheel wheel-2">
                  <circle cx="50" cy="50" r="6" fill="#2c2c2c"/>
                  <circle cx="50" cy="50" r="3" fill="#666"/>
                </g>
                {/* Headlights - visible in light mode (back) */}
                <circle cx="10" cy="37" r="2" fill="#ffd700"/>
                {/* Headlights for dark mode - animated glow effect at FRONT of truck */}
                <g className="headlights">
                  <defs>
                    <linearGradient id="lightBeamGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ffffaa" stopOpacity="0.7"/>
                      <stop offset="50%" stopColor="#ffffaa" stopOpacity="0.4"/>
                      <stop offset="100%" stopColor="#ffffaa" stopOpacity="0"/>
                    </linearGradient>
                    <linearGradient id="lightBeamGradient1-inner" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#fff8dc" stopOpacity="0.6"/>
                      <stop offset="50%" stopColor="#fff8dc" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#fff8dc" stopOpacity="0"/>
                    </linearGradient>
                    <radialGradient id="headlightGlow1" cx="50%" cy="50%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="1"/>
                      <stop offset="100%" stopColor="#ffffaa" stopOpacity="0"/>
                    </radialGradient>
                  </defs>
                  {/* Light beams extending forward from left headlight */}
                  <ellipse className="headlight-beam beam-outer beam-left" cx="115" cy="38" rx="28" ry="9" fill="url(#lightBeamGradient1)" opacity="0"/>
                  <ellipse className="headlight-beam beam-inner beam-left" cx="112" cy="38" rx="20" ry="6" fill="url(#lightBeamGradient1-inner)" opacity="0"/>
                  {/* Light beams extending forward from right headlight */}
                  <ellipse className="headlight-beam beam-outer beam-right" cx="115" cy="44" rx="28" ry="9" fill="url(#lightBeamGradient1)" opacity="0"/>
                  <ellipse className="headlight-beam beam-inner beam-right" cx="112" cy="44" rx="20" ry="6" fill="url(#lightBeamGradient1-inner)" opacity="0"/>
                  {/* Actual headlight bulbs at front */}
                  <circle className="headlight headlight-left" cx="80" cy="38" r="3.5" fill="url(#headlightGlow1)" opacity="0"/>
                  <circle className="headlight headlight-right" cx="80" cy="44" r="3.5" fill="url(#headlightGlow1)" opacity="0"/>
                </g>
              </svg>
            </div>
            <div className="truck-container truck-2" style={{ left: `${Math.max(0, journeyProgress - 5)}%` }}>
              <svg className="truck truck-2-svg" viewBox="0 0 150 60" xmlns="http://www.w3.org/2000/svg">
                {/* Truck body */}
                <rect x="10" y="25" width="50" height="25" fill="#c5896b" rx="2"/>
                {/* Truck cabin */}
                <rect x="60" y="30" width="20" height="20" fill="#8b6f47" rx="2"/>
                {/* Windows */}
                <rect x="63" y="33" width="6" height="6" fill="#e8d5b7"/>
                <rect x="70" y="33" width="6" height="6" fill="#e8d5b7"/>
                {/* Wheels - grouped for animation */}
                <g className="wheel wheel-1">
                  <circle cx="25" cy="50" r="6" fill="#2c2c2c"/>
                  <circle cx="25" cy="50" r="3" fill="#666"/>
                </g>
                <g className="wheel wheel-2">
                  <circle cx="50" cy="50" r="6" fill="#2c2c2c"/>
                  <circle cx="50" cy="50" r="3" fill="#666"/>
                </g>
                {/* Headlights - visible in light mode (back) */}
                <circle cx="10" cy="37" r="2" fill="#ffd700"/>
                {/* Headlights for dark mode - animated glow effect at FRONT of truck */}
                <g className="headlights">
                  <defs>
                    <linearGradient id="lightBeamGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ffffaa" stopOpacity="0.7"/>
                      <stop offset="50%" stopColor="#ffffaa" stopOpacity="0.4"/>
                      <stop offset="100%" stopColor="#ffffaa" stopOpacity="0"/>
                    </linearGradient>
                    <linearGradient id="lightBeamGradient2-inner" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#fff8dc" stopOpacity="0.6"/>
                      <stop offset="50%" stopColor="#fff8dc" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#fff8dc" stopOpacity="0"/>
                    </linearGradient>
                    <radialGradient id="headlightGlow2" cx="50%" cy="50%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="1"/>
                      <stop offset="100%" stopColor="#ffffaa" stopOpacity="0"/>
                    </radialGradient>
                  </defs>
                  {/* Light beams extending forward from left headlight */}
                  <ellipse className="headlight-beam beam-outer beam-left" cx="115" cy="38" rx="28" ry="9" fill="url(#lightBeamGradient2)" opacity="0"/>
                  <ellipse className="headlight-beam beam-inner beam-left" cx="112" cy="38" rx="20" ry="6" fill="url(#lightBeamGradient2-inner)" opacity="0"/>
                  {/* Light beams extending forward from right headlight */}
                  <ellipse className="headlight-beam beam-outer beam-right" cx="115" cy="44" rx="28" ry="9" fill="url(#lightBeamGradient2)" opacity="0"/>
                  <ellipse className="headlight-beam beam-inner beam-right" cx="112" cy="44" rx="20" ry="6" fill="url(#lightBeamGradient2-inner)" opacity="0"/>
                  {/* Actual headlight bulbs at front */}
                  <circle className="headlight headlight-left" cx="80" cy="38" r="3.5" fill="url(#headlightGlow2)" opacity="0"/>
                  <circle className="headlight headlight-right" cx="80" cy="44" r="3.5" fill="url(#headlightGlow2)" opacity="0"/>
                </g>
              </svg>
            </div>
            <div className="home-destination">
              <svg className="home" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                {/* House roof */}
                <polygon points="50,10 20,40 80,40" fill="#d32f2f"/>
                {/* House body */}
                <rect x="25" y="40" width="50" height="45" fill="#fff" stroke="#333" strokeWidth="2"/>
                {/* Door */}
                <rect x="42" y="60" width="16" height="25" fill="#8b4513"/>
                <circle cx="54" cy="72" r="1" fill="#ffd700"/>
                {/* Windows */}
                <rect x="30" y="48" width="8" height="8" fill="#e8d5b7"/>
                <rect x="62" y="48" width="8" height="8" fill="#e8d5b7"/>
              </svg>
            </div>
            <div className="keys-icon" style={{ opacity: daysRemaining === 0 ? 1 : 0 }}>
              🔑
            </div>
            {showDog && (
              <span key={dogKey} className="dog-emoji" aria-hidden="true" role="img">🐶</span>
            )}
          </div>
        </div>

        <div className="countdown-info" ref={countdownInfoRef}>
          {isTargetDateReached ? (
            <p className="time-item" style={{ marginBottom: '1.5rem', minWidth: '250px', textAlign: 'center' }}>{t.itsTime}</p>
          ) : (
            <>
              <p className="time-item" style={{ marginBottom: '1.5rem', minWidth: '250px', textAlign: 'center' }}>{t.remaining(daysRemaining)}</p>
              <div className="time-remaining">
                <p className="time-item">{t.unitMonths(timeRemaining.months)}</p>
                <p className="time-item">{t.unitWeeks(timeRemaining.weeks)}</p>
                <p className="time-item">{t.unitDays(timeRemaining.days)}</p>
                <p className="time-item">{t.unitHours(timeRemaining.hours)}</p>
                <p className="time-item">{t.unitMinutes(timeRemaining.minutes)}</p>
                <p className="time-item">{t.unitSeconds(timeRemaining.seconds)}</p>
              </div>
              <p className="crossed-info">{t.crossed(daysPassed)}</p>
            </>
          )}
        </div>
        
        <div className="dates-grid" ref={datesGridRef}>
          {dates.map((item, index) => {
            // Days that have already passed should be crossed off
            // If daysPassed = 50, then days 182, 181, ..., 133 are in the past (should be crossed)
            // Days with dayNumber > (totalDaysInJourney - daysPassed) should be crossed off
            const isCrossedOff = item.dayNumber > (totalDaysInJourney - daysPassed);
            
            // Check if this date is today (half crossed off)
            const itemDate = new Date(item.date);
            itemDate.setHours(0, 0, 0, 0);
            const todayOnly = new Date(today);
            todayOnly.setHours(0, 0, 0, 0);
            const isToday = itemDate.getTime() === todayOnly.getTime();
            
            // Check if this date is the target date (12 februari)
            const targetDateOnly = new Date(targetDate);
            targetDateOnly.setHours(0, 0, 0, 0);
            const isTargetDate = itemDate.getTime() === targetDateOnly.getTime();
            
            // If today, always show as half-crossed-off, not fully crossed-off
            const shouldBeHalfCrossed = isToday && !isTargetDate;
            const shouldBeFullyCrossed = isCrossedOff && !isToday;
            
            // Check if this date is 24 or 25 December (for special animations in dark mode)
            const isDec24 = itemDate.getMonth() === 11 && itemDate.getDate() === 24; // month 11 = december
            const isDec25 = itemDate.getMonth() === 11 && itemDate.getDate() === 25;
            const isChristmas = isDec24 || isDec25;
            
            return (
              <div
                key={index}
                className={`date-item ${shouldBeFullyCrossed ? 'crossed-off' : ''} ${shouldBeHalfCrossed ? 'half-crossed-off' : ''} ${isChristmas ? 'christmas-date' : ''}`}
              >
                <div className="date-day">
                  {isTargetDate ? t.itsTime : (() => {
                    const displayDay = item.dayNumber - 1;
                    return t.dateDayPrefix(displayDay);
                  })()}
                </div>
                <div className="date-name">{formatDateName(item.date)}</div>
              </div>
            );
          })}
        </div>
      </header>
    </div>
  );
}

export default AppClassic;
