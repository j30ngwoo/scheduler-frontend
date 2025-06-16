import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    // accessToken 있으면 스케줄로 바로 이동
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      navigate("/schedules");
    }
  }, [navigate]);

  const handleKakaoLogin = () => {
    window.location.href = "/api/auth/kakao/login";
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>상근 시간표 최적화 Tool🔨</h1>
      <img
        src="/kakao_login_large_wide.png"
        alt="카카오 로그인"
        style={{
          width: "370px",
          cursor: "pointer",
          marginTop: "32px",
        }}
        onClick={handleKakaoLogin}
      />
    </div>
  );
}

export default Login;
