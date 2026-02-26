import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";
import "../styles/HabitPage.css";
import "../styles/FocusSession.css"

import { getHabits, deleteHabit } from "../services/habits";
import { getHabitCompletions, createHabitCompletion } from "../services/habitCompletions";
import { getProfile } from "../services/users";

import HomeLogo from "../assets/HomeLogo.png";
import Avatar from "../components/Avatar";

import dashboard_icon from "../assets/dashboard_icon.png";
import habits_icon from "../assets/habits_icon.png";
import focussession_icon from "../assets/focussession_icon.png";
import analytics_icon from "../assets/analytics_icon.png";
import logout_icon from "../assets/logout_icon.png";

export default function HabitPage({ setIsAuth }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [habitMenuOpen, setHabitMenuOpen] = useState(null); 

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const profile = await getProfile();
      const habitsData = await getHabits();
      const completionsData = await getHabitCompletions();

      setUser(profile);
      setHabits(habitsData);
      setCompletions(completionsData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    setIsAuth(false);
    navigate("/login");
  };

  const today = new Date().toISOString().split("T")[0];

const completedHabits = habits.filter((habit) =>
  completions.some(
    (c) => c.habit === habit.id && c.completed_at === today
  )
);

const todayHabits = habits.filter(
  (habit) =>
    !completions.some(
      (c) => c.habit === habit.id && c.completed_at === today
    )
);


  const handleDelete = async (habitId) => {
    if (!window.confirm("Are you sure you want to delete this habit?")) return;
    try {
      await deleteHabit(habitId);
      setHabits(habits.filter((h) => h.id !== habitId));
    } catch (e) {
      console.error("Failed to delete habit", e);
    }
  };

  const markHabitDone = async (habitId) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const alreadyCompleted = completions.some(
      (c) => c.habit === habitId && c.completed_at === today
    );

    if (alreadyCompleted) {
      console.log("Habit already marked as done today!");
      return; 
    }

    await createHabitCompletion({
      habit: habitId,
      completed_at: today
    });

    const updatedCompletions = await getHabitCompletions();
    setCompletions(updatedCompletions);

  } catch (err) {
    console.error("Failed to mark habit done", err);
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
            <button className="nav-item" onClick={() => navigate("/home")}>
              <img src={dashboard_icon} alt="" className="nav-icon" />
              Dashboard
            </button>
            <button className="nav-item active" onClick={() => navigate("/habits")}>
              <img src={habits_icon} alt="" className="nav-icon" />
              Habits
            </button>
            <button className="nav-item" onClick={() => navigate("/focus-session")}>
              <img src={focussession_icon} alt="" className="nav-icon" />
              Focus Session
            </button>
            <button className="nav-item" onClick={() => navigate("/analytics")}>
              <img src={analytics_icon} alt="" className="nav-icon" />
              Analytics
            </button>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <hr className="sidebar-divider" />
          <button className="logout-btn" onClick={handleLogout}>
            <img src={logout_icon} alt="" className="nav-icon" />
            Log out
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <h1>Habits</h1>
            <p>List of your habits!</p>
          </div>

          <div className="profile-wrapper">
            <Avatar
              src={user?.avatar}
              username={user?.username || "User"}
              className="profile-icon"
              onClick={() => setMenuOpen(!menuOpen)}
            />

            {menuOpen && (
              <div className="profile-menu">
                <button onClick={() => navigate("/profile")}>Profile</button>
                <hr className="menu-divider" />
                <button onClick={() => navigate("/settings")}>Settings</button>
                <hr className="menu-divider" />
                <button className="logout-item" onClick={handleLogout}>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="tasks-section" style={{ width: "70%" }}>
          <h2>Today’s Tasks</h2>
          <div className="habits-list">
            {todayHabits.map((habit) => (
              <div key={habit.id} className="habit-card">
                <div className="habit-info">
                  <div className="habit-title">{habit.name}</div>
                  <div className="habit-desc">{habit.description}</div>
                </div>
                <div className="habit-actions">
                  <button className="habit-done-btn" onClick={() => markHabitDone(habit.id)}>Mark as done</button>
                  <div className="habit-menu-wrapper">
                    <button
                      className="habit-details-btn"
                      onClick={() =>
                        setHabitMenuOpen(habitMenuOpen === habit.id ? null : habit.id)
                      }
                    >
                      ↓
                    </button>
                    {habitMenuOpen === habit.id && (
                      <div className="habit-dropdown-menu">
                        <button onClick={() => navigate(`/habits/about/${habit.id}`)}>
                          About
                        </button>
                        <button onClick={() => navigate(`/habits/edit/${habit.id}`)}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(habit.id)}>Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="add-habit" onClick={() => navigate("/habits/create")}>
            + Add New Habit
          </div>
        </div>

        <div className="tasks-section" style={{ width: "70%" }}>
          <h2>Completed Tasks</h2>
          <div className="habits-list">
            {completedHabits.map((habit) => (
  <div key={habit.id} className="habit-card completed-habit">
    <div className="habit-info">
      <div className="habit-title">{habit.name}</div>
      <div className="habit-desc">{habit.description}</div>
    </div>
  </div>
))}

          </div>
        </div>
      </main>
    </div>
  );
}
