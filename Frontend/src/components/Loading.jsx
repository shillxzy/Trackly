import "../styles/Loading.css";
import loadingGif from "../assets/Loading.gif";

export default function Loading() {
  return (
    <div className="loading-wrapper">
      <img 
        src={loadingGif}
        alt="Loading..." 
        className="loading-gif"
      />
    </div>
  );
}
