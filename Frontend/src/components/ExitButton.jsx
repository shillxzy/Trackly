import { useNavigate, useLocation } from "react-router-dom";

/**
 * ExitButton — кнопка "назад"
 *
 * Логіка:
 * 1. Якщо передано prop `to` — переходить туди
 * 2. Якщо ми на /profile або /settings — завжди йдемо на /home
 *    (бо ці сторінки відкриваються з будь-якого місця через меню аватара)
 * 3. Інакше — беремо lastPath з sessionStorage (збережений в App.js)
 */
export default function ExitButton({ to }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleExit = () => {
    if (to) {
      navigate(to);
      return;
    }

    // Profile і Settings завжди повертають на /home
    // бо вони відкриваються з dropdown меню, а не з конкретної сторінки
    const alwaysHome = ["/profile", "/settings"];
    if (alwaysHome.includes(location.pathname)) {
      navigate("/home");
      return;
    }

    // Для інших сторінок (HabitCreate, HabitEdit, HabitAbout) —
    // повертаємось на попередню сторінку
    const lastPath = sessionStorage.getItem("lastPath");
    if (lastPath && lastPath !== location.pathname) {
      navigate(lastPath);
    } else {
      navigate(-1); // браузерна кнопка "назад" як fallback
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "flex-start", margin: "5px 0 28px 0" }}>
      {/* FIX: виправлено зламаний символ стрілки */}
      <button className="exit-btn" onClick={handleExit}>
        &#8592; Exit
      </button>
    </div>
  );
}
