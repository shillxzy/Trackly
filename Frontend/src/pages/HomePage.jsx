import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";
import "../styles/HabitPage.css";

import { getHabits } from "../services/habits";
import { getHabitCompletions, createHabitCompletion } from "../services/habitCompletions";
import { getProfile } from "../services/users";
import { createFocusSession } from "../services/focusSessions";

import HomeLogo from "../assets/HomeLogo.png";
import Avatar from "../components/Avatar";
import dashboard_icon from "../assets/dashboard_icon.png";
import habits_icon from "../assets/habits_icon.png";
import focussession_icon from "../assets/focussession_icon.png";
import analytics_icon from "../assets/analytics_icon.png";
import logout_icon from "../assets/logout_icon.png";

import HabitsCompletedChart from "../components/charts/HabitsCompletedChart";
import WeeklyProgressChart from "../components/charts/WeeklyProgressChart";
import FocusTimeChart from "../components/charts/FocusTimeChart";

const FOCUS_DURATION = 25 * 60;
const DAY_MASK = { 0: 64, 1: 1, 2: 2, 3: 4, 4: 8, 5: 16, 6: 32 };

export default function HomePage({ setIsAuth }) {
  const navigate = useNavigate();

  const [user, setUser]           = useState(null);
  const [habits, setHabits]       = useState([]);
  const [completions, setCompletions] = useState([]);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [focusTime, setFocusTime] = useState(FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // ── Load ─────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    // Спочатку показуємо кеш — відчуття миттєвості
    const cached = {
      profile:     localStorage.getItem("profile"),
      habits:      localStorage.getItem("habits"),
      completions: localStorage.getItem("completions"),
    };
    if (cached.profile)     setUser(JSON.parse(cached.profile));
    if (cached.habits)      setHabits(JSON.parse(cached.habits));
    if (cached.completions) setCompletions(JSON.parse(cached.completions));

    try {
      // Паралельні запити — швидше
      const [profile, habitsData, completionsData] = await Promise.all([
        getProfile(),
        getHabits(),
        getHabitCompletions(),
      ]);
      setUser(profile);
      setHabits(habitsData);
      setCompletions(completionsData);
      localStorage.setItem("profile",     JSON.stringify(profile));
      localStorage.setItem("habits",      JSON.stringify(habitsData));
      localStorage.setItem("completions", JSON.stringify(completionsData));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Focus timer ───────────────────────────────────────────
  useEffect(() => {
    if (!isRunning) return;
    if (focusTime === 0) { handleStop(); return; }
    const t = setInterval(() => setFocusTime(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [isRunning, focusTime]);

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleStart = () => { setHasStarted(true); setIsRunning(true); };
  const handlePause = () => setIsRunning(false);

  const handleStop = async () => {
    setIsRunning(false);
    setHasStarted(false);
    const spent = FOCUS_DURATION - focusTime;
    const mins  = Math.max(1, Math.round(spent / 60));
    const endedAt   = new Date();
    const startedAt = new Date(endedAt - spent * 1000);
    try {
      await createFocusSession({
        started_at: startedAt.toISOString(),
        ended_at:   endedAt.toISOString(),
        planned_duration_minutes: Math.round(FOCUS_DURATION / 60),
        actual_duration_minutes:  mins,
        status: "completed",
      });
    } catch (e) { console.error(e); }
    setFocusTime(FOCUS_DURATION);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setIsAuth(false);
    navigate("/login");
  };

  // ── Habits helpers ────────────────────────────────────────
  const today     = new Date().toISOString().split("T")[0];
  const todayMask = DAY_MASK[new Date().getDay()];

  const isScheduledToday = (h) => {
    const s = h.schedules;
    return s && s.length > 0 && (s[0].day_of_week & todayMask) !== 0;
  };

  const isCompleted = (id) =>
    completions.some(c => c.habit === id && c.completed_at === today);

  const todayHabits     = habits.filter(h => isScheduledToday(h) && !isCompleted(h.id));
  const doneToday       = habits.filter(h => isScheduledToday(h) &&  isCompleted(h.id)).length;
  const totalToday      = habits.filter(h => isScheduledToday(h)).length;
  const streak          = user?.streak_days || 0;

  const streakMsg = () => {
    if (streak === 0)  return "Start your streak today!";
    if (streak < 3)    return "Great start — keep going!";
    if (streak < 7)    return "Building momentum! 💪";
    if (streak < 30)   return "Impressive consistency!";
    return "Legendary streak! 🏆";
  };

  const markHabitDone = async (habitId) => {
    if (isCompleted(habitId)) return;
    try {
      await createHabitCompletion({ habit: habitId, completed_at: today });
      // Оновлюємо completions + профіль (streak перерахований на бекенді)
      const [updatedCompletions, updatedProfile] = await Promise.all([
        getHabitCompletions(),
        getProfile(),
      ]);
      setCompletions(updatedCompletions);
      setUser(updatedProfile);
      localStorage.setItem("completions", JSON.stringify(updatedCompletions));
      localStorage.setItem("profile",     JSON.stringify(updatedProfile));
    } catch (e) { console.error(e); }
  };

  // ── Sidebar (shared) ──────────────────────────────────────
  const Sidebar = () => (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="logo-container">
          <img src={HomeLogo} alt="Trackly Logo" className="logo-img" />
        </div>
        <hr className="sidebar-divider" />
        <nav className="nav-menu">
          <button className="nav-item active" onClick={() => navigate("/home")}>
            <img src={dashboard_icon} alt="" className="nav-icon" /> Dashboard
          </button>
          <button className="nav-item" onClick={() => navigate("/habits")}>
            <img src={habits_icon} alt="" className="nav-icon" /> Habits
          </button>
          <button className="nav-item" onClick={() => navigate("/focus-session")}>
            <img src={focussession_icon} alt="" className="nav-icon" /> Focus Session
          </button>
          <button className="nav-item" onClick={() => navigate("/analytics")}>
            <img src={analytics_icon} alt="" className="nav-icon" /> Analytics
          </button>
        </nav>
      </div>
      <div className="sidebar-bottom">
        <hr className="sidebar-divider" />
        <button className="logout-btn" onClick={handleLogout}>
          <img src={logout_icon} alt="" className="nav-icon" /> Log out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="home-container">
      <Sidebar />

      <main className="main">
        {/* ── Topbar ── */}
        <div className="topbar">
          <div>
            <h1>Welcome back, {user?.username || "User"}!</h1>
            <p>Here is your progress today!</p>
          </div>
          <div className="profile-wrapper">
            <Avatar
              src={user?.avatar}
              username={user?.username || "User"}
              className="profile-icon"
              onClick={() => setMenuOpen(o => !o)}
            />
            {menuOpen && (
              <div className="profile-menu">
                <button onClick={() => navigate("/profile")}>Profile</button>
                <hr className="menu-divider" />
                <button onClick={() => navigate("/settings")}>Settings</button>
                <hr className="menu-divider" />
                <button className="logout-item" onClick={handleLogout}>Log out</button>
              </div>
            )}
          </div>
        </div>

        {/* ── Row 1: Streak + Tasks + Focus ── */}
<div className="dashboard-row">

  {/* Streak card */}
  <div className="streak-card">
    <div className="streak-badge">
      <span className="streak-fire">🔥</span>
      <div className="streak-number">{streak}</div>
      <div className="streak-label">Day Streak</div>
    </div>
    
    <p className="streak-msg">{streakMsg()}</p>

    <div className="streak-progress-wrap">
      <div
        className="streak-progress-bar"
        style={{ width: `${Math.min((streak % 7) / 7 * 100, 100)}%` }}
      />
    </div>
    <div className="streak-hint">
      {streak > 0 && streak % 7 === 0
        ? "Weekly goal reached! 🏅"
        : `${7 - (streak % 7)} days to weekly goal`}
    </div>

    <div className="streak-today-stat">
      <span className="stat-done">{doneToday}</span>
      <span className="stat-sep">/</span>
      <span className="stat-total">{totalToday}</span>
      <span className="stat-label">&nbsp;done today</span>
    </div>
  </div>

  {/* Today's tasks */}
  <div className="tasks-card">
    <div className="tasks-header">
      <div className="tasks-header-left">
        <h2>Today&#39;s Tasks</h2>
        {totalToday > 0 && (
          <span className="tasks-count">{doneToday}/{totalToday} done</span>
        )}
      </div>
      <button className="add-task-btn" onClick={() => navigate("/habits/create")}>
        + New
      </button>
    </div>

    {totalToday > 0 && (
      <div className="tasks-progress-wrap">
        <div
          className="tasks-progress-fill"
          style={{ width: `${(doneToday / totalToday) * 100}%` }}
        />
      </div>
    )}

    <div className="tasks-content-wrapper">
      {totalToday === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <p className="empty-msg">No habits scheduled for today.</p>
          <button className="empty-create-btn" onClick={() => navigate("/habits/create")}>
            Create a habit
          </button>
        </div>
      )}
      {totalToday > 0 && todayHabits.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">🎉</span>
          <p className="empty-msg">All done for today!</p>
          <p className="empty-sub">Great work keeping the streak alive.</p>
        </div>
      )}

      <div className="tasks-scroll">
        {todayHabits.map(habit => (
          <div key={habit.id} className="habit-card">
            <div className="habit-info">
              <div className="habit-title">{habit.name}</div>
              {habit.description && (
                <div className="habit-desc">{habit.description}</div>
              )}
            </div>
            <button
              className="habit-done-btn"
              onClick={() => markHabitDone(habit.id)}
            >
              Done
            </button>
          </div>
        ))}
        {habits.filter(h => isScheduledToday(h) && isCompleted(h.id)).map(habit => (
          <div key={habit.id} className="habit-card habit-card-done">
            <div className="habit-info">
              <div className="habit-title habit-title-done">{habit.name}</div>
            </div>
            <span className="habit-check-icon">✓</span>
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* Focus Card (Повертаємо її на місце!) */}
  <div className="dash-focus-card">
    <h2>Focus Session</h2>
    <div className="dash-timer">{fmt(focusTime)}</div>
    <div className="focus-actions">
      {!isRunning ? (
        <button className="dash-focus-btn" onClick={handleStart}>
          {hasStarted ? "Resume" : "Start"}
        </button>
      ) : (
        <button className="dash-focus-btn" onClick={handlePause}>Pause</button>
      )}
      {hasStarted && (
        <button className="dash-focus-btn dash-focus-btn-stop" onClick={handleStop}>
          Stop
        </button>
      )}
    </div>
    <p className="focus-hint">Keep your focus sharp</p>
  </div>

</div>

        {/* ── Row 2: Charts ── */}
        <div className="charts-row">
          <WeeklyProgressChart completions={completions} />
          <HabitsCompletedChart habits={habits} completions={completions} />
          <FocusTimeChart focusSessions={[]} />
        </div>

      </main>
    </div>
  );
}
