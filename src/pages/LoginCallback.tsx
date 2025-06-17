import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function LoginCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("accessToken");

    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
      navigate("/schedules");
    } else {
      alert("로그인 실패 또는 accessToken 누락!");
      navigate("/login");
    }
  }, [location, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>로그인 중입니다...</h2>
    </div>
  );
}
export default LoginCallback;
