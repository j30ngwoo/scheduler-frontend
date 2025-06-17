import { useNavigate } from "react-router-dom";
import api from "../lib/api";

function LogoutButton() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout", {}, { withCredentials: true });
    } catch (e) {}
    localStorage.removeItem("access_token");
    navigate("/login");
  };
  return <button onClick={handleLogout}>로그아웃</button>;
}
export default LogoutButton;
