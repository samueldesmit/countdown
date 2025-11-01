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

  // Calculate the start date (when countdown began - 15 augustus 2025)
  const startDate = useMemo(() => {
    const date = new Date('2025-08-15');
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  // Calculate total days in the journey
  const totalDaysInJourney = useMemo(() => {
    return Math.ceil((targetDate - startDate) / (1000 * 60 * 60 * 24));
  }, [targetDate, startDate]);

  // Calculate days remaining from preview date
  const daysRemaining = useMemo(() => {
    return Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
  }, [targetDate, today]);

  // Calculate days passed (from start to preview date)
  const daysPassed = useMemo(() => {
    return Math.max(0, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));
  }, [today, startDate]);

  // Calculate remaining time accurately (months, weeks, days, hours, minutes)
  const [timeRemaining, setTimeRemaining] = useState({
    months: 0,
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      
      if (targetDate <= now) {
        setTimeRemaining({ months: 0, weeks: 0, days: 0, hours: 0, minutes: 0 });
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

      setTimeRemaining({ 
        months, 
        weeks, 
        days: Math.max(0, days), 
        hours: Math.max(0, hours),
        minutes: Math.max(0, minutes)
      });
    };

    // Update immediately
    calculateTimeRemaining();

    // Update every second for minutes precision
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  // Calculate journey progress (0 to ~85% to account for home position)
  const journeyProgress = useMemo(() => {
    if (totalDaysInJourney === 0) return 85;
    // Progress up to 85% so truck reaches the home (which is positioned at ~85-90% from left)
    return Math.min(85, (daysPassed / totalDaysInJourney) * 85);
  }, [daysPassed, totalDaysInJourney]);

  // Generate all dates from start date to target date
  const dates = useMemo(() => {
    const datesArray = [];
    
    for (let i = 0; i < totalDaysInJourney; i++) {
      const dateToAdd = new Date(startDate);
      dateToAdd.setDate(startDate.getDate() + i);
      datesArray.push({
        date: new Date(dateToAdd),
        dayNumber: i + 1,
      });
    }
    
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
    <div className="App">
      <header className="App-header">
        <h1>Aftelling tot 12 februari 2026</h1>
        <p className="subtitle">Bijna krijgen de sleutels van Andoornweg 19, ons nieuwe huis 🏠</p>
        
        {/* Apartment to Home Animation */}
        <div className="journey-animation">
          <div className="road">
            <div className="road-line"></div>
            <div className="apartment-start">
              <svg className="apartment" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                {/* Apartment building structure */}
                <rect x="20" y="20" width="60" height="75" fill="#888" stroke="#555" strokeWidth="2"/>
                {/* Windows - multiple floors */}
                <rect x="28" y="30" width="8" height="10" fill="#87ceeb"/>
                <rect x="40" y="30" width="8" height="10" fill="#87ceeb"/>
                <rect x="52" y="30" width="8" height="10" fill="#ffd700"/>
                <rect x="64" y="30" width="8" height="10" fill="#87ceeb"/>
                {/* Second floor */}
                <rect x="28" y="45" width="8" height="10" fill="#87ceeb"/>
                <rect x="40" y="45" width="8" height="10" fill="#87ceeb"/>
                <rect x="52" y="45" width="8" height="10" fill="#87ceeb"/>
                <rect x="64" y="45" width="8" height="10" fill="#ffd700"/>
                {/* Third floor */}
                <rect x="28" y="60" width="8" height="10" fill="#87ceeb"/>
                <rect x="40" y="60" width="8" height="10" fill="#ffd700"/>
                <rect x="52" y="60" width="8" height="10" fill="#87ceeb"/>
                <rect x="64" y="60" width="8" height="10" fill="#87ceeb"/>
                {/* Door */}
                <rect x="42" y="75" width="16" height="20" fill="#8b4513"/>
                {/* Balcony */}
                <rect x="25" y="35" width="50" height="5" fill="#666"/>
              </svg>
            </div>
            <div className="truck-container" style={{ left: `${journeyProgress}%` }}>
              <svg className="truck" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
                {/* Truck body */}
                <rect x="10" y="25" width="50" height="25" fill="#4a90e2" rx="2"/>
                {/* Truck cabin */}
                <rect x="60" y="30" width="20" height="20" fill="#357abd" rx="2"/>
                {/* Windows */}
                <rect x="63" y="33" width="6" height="6" fill="#87ceeb"/>
                <rect x="70" y="33" width="6" height="6" fill="#87ceeb"/>
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
                <rect x="30" y="48" width="8" height="8" fill="#87ceeb"/>
                <rect x="62" y="48" width="8" height="8" fill="#87ceeb"/>
              </svg>
            </div>
            <div className="keys-icon" style={{ opacity: daysRemaining === 0 ? 1 : 0 }}>
              🔑
            </div>
          </div>
        </div>

        <div className="countdown-info">
          <p className="time-item" style={{ marginBottom: '1.5rem' }}>resterend</p>
          <div className="time-remaining">
            <p className="time-item">{timeRemaining.months} {timeRemaining.months === 1 ? 'maand' : 'maanden'}</p>
            <p className="time-item">{timeRemaining.weeks} {timeRemaining.weeks === 1 ? 'week' : 'weken'}</p>
            <p className="time-item">{timeRemaining.days} {timeRemaining.days === 1 ? 'dag' : 'dagen'}</p>
            <p className="time-item">{timeRemaining.hours} {timeRemaining.hours === 1 ? 'uur' : 'uren'}</p>
            <p className="time-item">{timeRemaining.minutes} {timeRemaining.minutes === 1 ? 'minuut' : 'minuten'}</p>
          </div>
          <p className="crossed-info">{daysPassed} dagen afgestreept</p>
        </div>
        
        <div className="dates-grid">
          {dates.map((item, index) => {
            const isCrossedOff = index < daysPassed;
            return (
              <div
                key={index}
                className={`date-item ${isCrossedOff ? 'crossed-off' : ''}`}
              >
                <div className="date-day">Dag {item.dayNumber}</div>
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
