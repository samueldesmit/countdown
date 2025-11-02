import { useState, useEffect, useMemo } from 'react';
import './App.css';

function App() {
  const targetDate = useMemo(() => {
    const date = new Date('2026-02-12');
    date.setHours(11, 0, 0, 0);
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

  // Calculate the start date (15 augustus 2025 - dag 182)
  const startDate = useMemo(() => {
    const date = new Date('2025-08-15');
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

  // Calculate journey progress (0 to ~85% to account for home position)
  // Progress based on days passed from today
  const journeyProgress = useMemo(() => {
    if (totalDaysInJourney === 0) return 85;
    // Calculate days passed from startDate (today) - this will be 0 initially
    const elapsedDays = Math.max(0, Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24)));
    // Progress up to 85% so truck reaches the home (which is positioned at ~85-90% from left)
    return Math.min(85, (elapsedDays / totalDaysInJourney) * 85);
  }, [startDate, totalDaysInJourney]);

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

  // Format date name
  const formatDateName = (date) => {
    const dayNames = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
    const monthNames = ['januari', 'februari', 'maart', 'april', 'mei', 'juni',
      'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
    
    const dayName = dayNames[date.getDay()];
    const monthName = monthNames[date.getMonth()];
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
        <h1>Lil, Sam en Tommie verhuizen naar Braboland op 12 februari 2026</h1>        
        {/* Apartment to Home Animation */}
        <div className="journey-animation">
          <div className="road">
            <div className="road-line"></div>
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
              <svg className="truck" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
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
                {/* Headlights */}
                <circle cx="10" cy="37" r="2" fill="#ffd700"/>
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
          </div>
        </div>

        <div className="countdown-info">
          {isTargetDateReached ? (
            <p className="time-item" style={{ marginBottom: '1.5rem', minWidth: '250px', textAlign: 'center' }}>het is zover</p>
          ) : (
            <>
              <p className="time-item" style={{ marginBottom: '1.5rem', minWidth: '250px', textAlign: 'center' }}>resterend {daysRemaining} {daysRemaining === 1 ? 'dag' : 'dagen'}</p>
              <div className="time-remaining">
                <p className="time-item">{timeRemaining.months} {timeRemaining.months === 1 ? 'maand' : 'maanden'}</p>
                <p className="time-item">{timeRemaining.weeks} {timeRemaining.weeks === 1 ? 'week' : 'weken'}</p>
                <p className="time-item">{timeRemaining.days} {timeRemaining.days === 1 ? 'dag' : 'dagen'}</p>
                <p className="time-item">{timeRemaining.hours} {timeRemaining.hours === 1 ? 'uur' : 'uren'}</p>
                <p className="time-item">{timeRemaining.minutes} {timeRemaining.minutes === 1 ? 'minuut' : 'minuten'}</p>
                <p className="time-item">{timeRemaining.seconds} {timeRemaining.seconds === 1 ? 'seconde' : 'seconden'}</p>
              </div>
              <p className="crossed-info">{daysPassed} dagen verstreken</p>
            </>
          )}
        </div>
        
        <div className="dates-grid">
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
            
            return (
              <div
                key={index}
                className={`date-item ${shouldBeFullyCrossed ? 'crossed-off' : ''} ${shouldBeHalfCrossed ? 'half-crossed-off' : ''}`}
              >
                <div className="date-day">
                  {isTargetDate ? 'het is zover' : (() => {
                    const displayDay = item.dayNumber - 1;
                    return displayDay > 0 ? `nog ${displayDay} ${displayDay === 1 ? 'dag' : 'dagen'}` : '';
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

export default App;
