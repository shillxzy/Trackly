import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";
import "../styles/HabitPage.css";

import { getHabits } from "../services/habits";
import { getHabitSchedules } from "../services/habitSchedules";
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

export default function HomePage({ setIsAuth }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const [focusTime, setFocusTime] = useState(FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const cachedProfile = localStorage.getItem("profile");
      const cachedHabits = localStorage.getItem("habits");
      const cachedCompletions = localStorage.getItem("completions");

      if (cachedProfile && cachedHabits && cachedCompletions) {
        setUser(JSON.parse(cachedProfile));
        setHabits(JSON.parse(cachedHabits));
        setCompletions(JSON.parse(cachedCompletions));
        return;
      }

      const [profile, habitsData, schedulesData, completionsData] =
  await Promise.all([
    getProfile(),
    getHabits(),
    getHabitSchedules(),
    getHabitCompletions(),
  ]);

      const habitsWithSchedules = habitsData.map((habit) => {
        const schedule = schedulesData.find((s) => s.habit === habit.id);
        return { ...habit, schedule };
      });

      setUser(profile);
      setHabits(habitsWithSchedules);
      setCompletions(completionsData);

      localStorage.setItem("profile", JSON.stringify(profile));
      localStorage.setItem("habits", JSON.stringify(habitsWithSchedules));
      localStorage.setItem("completions", JSON.stringify(completionsData));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    let timer;
    if (isRunning && focusTime > 0) {
      timer = setInterval(() => setFocusTime((prev) => prev - 1), 1000);
    }
    if (focusTime === 0 && isRunning) {
      handleStop();
    }
    return () => clearInterval(timer);
  }, [isRunning, focusTime]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleStart = () => {
    setHasStarted(true);
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);

  const handleStop = async () => {
    setIsRunning(false);
    setHasStarted(false);

    const spentSeconds = FOCUS_DURATION - focusTime;
    const spentMinutes = Math.max(1, Math.round(spentSeconds / 60));

    if (spentMinutes > 0) {
      const endedAt = new Date();
      const startedAt = new Date(endedAt.getTime() - spentSeconds * 1000);

      const payload = {
        started_at: startedAt.toISOString(),
        ended_at: endedAt.toISOString(),
        planned_duration_minutes: Math.round(FOCUS_DURATION / 60),
        actual_duration_minutes: spentMinutes,
        status: "completed",
      };

      try {
        await createFocusSession(payload);
      } catch (e) {
        console.error("Failed to create focus session:", e);
        if (e.message.includes("Session expired")) navigate("/login");
      }
    }

    setFocusTime(FOCUS_DURATION);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setIsAuth(false);
    navigate("/login");
  };

  const today = new Date().toISOString().split("T")[0];
  const todayWeekDay = new Date().getDay();
  const dayMap = { 0: 64, 1: 1, 2: 2, 3: 4, 4: 8, 5: 16, 6: 32 };
  const todayMask = dayMap[todayWeekDay];

  const isHabitScheduledToday = (habit) => {
    if (!habit.schedule) return false;
    const schedule = Array.isArray(habit.schedule) ? habit.schedule[0] : habit.schedule;
    return (schedule.day_of_week & todayMask) !== 0;
  };

  const todayHabits = habits.filter(
    (habit) => isHabitScheduledToday(habit) && !completions.some((c) => c.habit === habit.id && c.completed_at === today)
  );

  const completedTodayHabits = habits.filter(
    (habit) => isHabitScheduledToday(habit) && completions.some((c) => c.habit === habit.id && c.completed_at === today)
  );

  const markHabitDone = async (habitId) => {
    try {
      const alreadyCompleted = completions.some((c) => c.habit === habitId && c.completed_at === today);
      if (alreadyCompleted) return;

      await createHabitCompletion({ habit: habitId, completed_at: today });

      const updatedCompletions = await getHabitCompletions();
      setCompletions(updatedCompletions);
      localStorage.setItem("completions", JSON.stringify(updatedCompletions));
    } catch (e) {
      console.error("Failed to mark habit done", e);
    }
  };

  return (
    <div className="home-container">
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

      <main className="main">
        <div className="topbar">
          <div>
            <h1>Welcome back, {user?.username || "User"}!</h1>
            <p>Here is your progress today!</p>
          </div>

          <div className="profile-wrapper">
            <Avatar src={user?.avatar} username={user?.username || "User"} className="profile-icon" onClick={() => setMenuOpen(!menuOpen)} />
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

        <div className="content-grid">
          {/* Today Tasks */}
          <div className="tasks-section">
            <h2>Today’s Tasks</h2>
            {todayHabits.length === 0 && <p>No tasks scheduled for today.</p>}
            {todayHabits.map((habit) => (
              <div key={habit.id} className="habit-card">
                <div className="habit-info">
                  <div className="habit-title">{habit.name}</div>
                  <div className="habit-desc">{habit.description}</div>
                </div>
                <div className="habit-actions">
                  <button className="habit-done-btn" onClick={() => markHabitDone(habit.id)}>Mark as done</button>
                </div>
              </div>
            ))}
          </div>

          {/* Focus Session */}
          <div className="focus-section">
            <h2>Focus Session</h2>
            <div className="timer">{formatTime(focusTime)}</div>
            {!hasStarted ? (
              <button className="focus-btn" onClick={handleStart}>Start Focus Session</button>
            ) : (
              <div style={{ display: "flex", gap: "12px" }}>
                <button className="focus-btn" onClick={handlePause}>Pause</button>
                <button className="focus-btn" onClick={handleStop}>Stop</button>
              </div>
            )}
          </div>

          {/* Charts */}
          <div className="weekly-section">
            <WeeklyProgressChart completions={completions} />
          </div>

          <div className="wide">
            <HabitsCompletedChart habits={habits} completions={completions} />
          </div>

          <div className="wide">
            <FocusTimeChart focusSessions={[]} />
          </div>
        </div>
      </main>
    </div>
  );
}
