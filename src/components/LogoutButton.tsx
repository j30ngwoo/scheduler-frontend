import axios from "axios";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    const accessToken = localStorage.getItem("access_token");
    try {
      await axios.post("/api/auth/logout", null, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true
      });
    } catch (e) {}
    localStorage.removeItem("access_token");
    navigate("/login");
  };
  return <button onClick={handleLogout}>로그아웃</button>;
}
export default LogoutButton;
