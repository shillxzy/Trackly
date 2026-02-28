// Avatar.jsx
import defaultAvatar from "../assets/default-avatar-profile-icon.png";

export default function Avatar({ src, username, className, onClick }) {
  return (
    <img
      src={src || defaultAvatar}
      alt={`${username || "User"} avatar`}
      className={className}
      onClick={onClick}
      onError={(e) => (e.currentTarget.src = defaultAvatar)}
    />
  );
}
