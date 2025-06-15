function Login() {
  const handleKakaoLogin = () => {
    // 배포/개발 환경 상관없이 /api 경로 사용 (vite/nginx 프록시로 해결)
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
