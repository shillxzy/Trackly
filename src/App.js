import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import Loading from "./components/Loading";
import ProfilePage from "./pages/ProfilePage";

function PageWrapper({ children }) {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      {loading && <Loading />}
      {children}
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
        </Routes>
      </PageWrapper>
    </Router>
  );
}

export default App;
