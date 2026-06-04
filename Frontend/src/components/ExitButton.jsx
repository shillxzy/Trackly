import { useNavigate, useLocation } from "react-router-dom";
import { useT } from "../translations/LanguageContext";

export default function ExitButton({ to }) {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();

  const handleExit = () => {
    if (to) {
      navigate(to);
      return;
    }

    const alwaysHome = ["/profile", "/settings"];
    if (alwaysHome.includes(location.pathname)) {
      navigate("/home");
      return;
    }

    const lastPath = sessionStorage.getItem("lastPath");
    if (lastPath && lastPath !== location.pathname) {
      navigate(lastPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "flex-start", margin: "5px 0 28px 0" }}>
      <button className="exit-btn" onClick={handleExit}>
        &#8592; {t("exit")}
      </button>
    </div>
  );
}
