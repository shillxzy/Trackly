import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect,  useRef, useState } from "react";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import Loading from "./components/Loading";
import ProfilePage from "./pages/ProfilePage";
import HabitPage from "./pages/HabitPage";
import HabitCreatePage from "./pages/HabitCreatePage";
import FocusSessionPage from "./pages/FocusSesstionPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import HabitAboutPage from "./pages/HabitAboutPage";
import HabitEditPage from "./pages/HabitEditPage";


function PageWrapper({ children }) {
  const location = useLocation();
  const prevPathRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prevPathRef.current && location.pathname !== "/profile") {
      sessionStorage.setItem("lastPath", prevPathRef.current);
    }

    prevPathRef.current = location.pathname;

    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      {children}
      {loading && <Loading />}
    </>
  );
}

function App() {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsAuth(!!token);
  }, []);

  if (isAuth === null) return <Loading />; 

  return (
    <Router>
      <PageWrapper>
        <Routes>

          <Route
            path="/"
            element={isAuth ? <Navigate to="/home" /> : <Navigate to="/login" />}
          />

          <Route
            path="/login"
            element={isAuth ? <Navigate to="/home" /> : <LoginPage setIsAuth={setIsAuth} />}
          />

          <Route
            path="/register"
            element={isAuth ? <Navigate to="/home" /> : <RegisterPage />}
          />

          <Route
            path="/home"
            element={isAuth ? <HomePage setIsAuth={setIsAuth} /> : <Navigate to="/login" />}
          />

          <Route
            path="/profile"
            element={isAuth ? <ProfilePage setIsAuth={setIsAuth} /> : <Navigate to="/login" />}
          />

          <Route
            path="/habits"
            element={isAuth ? <HabitPage setIsAuth={setIsAuth} /> : <Navigate to="/login" />}
          />

          <Route
            path="/habits/create"
            element={isAuth ? <HabitCreatePage setIsAuth={setIsAuth} /> : <Navigate to="/login" />}
          />

          <Route
            path="/habits/about/:id"
            element={isAuth ? <HabitAboutPage setIsAuth={setIsAuth} /> : <Navigate to="/login" />}
          />

          <Route
            path="/habits/edit/:id"
            element={isAuth ? <HabitEditPage setIsAuth={setIsAuth} /> : <Navigate to="/login" />}
          />

          <Route
            path="/focus-session"
            element={isAuth ? <FocusSessionPage setIsAuth={setIsAuth} /> : <Navigate to="/login" />}
          />

          <Route
            path="/analytics"
            element={isAuth ? <AnalyticsPage setIsAuth={setIsAuth} /> : <Navigate to="/login" />}
          />


        </Routes>
      </PageWrapper>
    </Router>
  );
}

export default App;
