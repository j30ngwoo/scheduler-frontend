function Login() {
  const handleKakaoLogin = () => {
    // 배포/개발 환경 상관없이 /api 경로 사용 (vite/nginx 프록시로 해결)
    window.location.href = "/api/auth/kakao/login";
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>시간표 서비스</h1>
      <button
        style={{
          background: "#FEE500",
          border: "none",
          borderRadius: "8px",
          padding: "12px 24px",
          fontWeight: "bold",
          fontSize: "16px",
          cursor: "pointer",
        }}
        onClick={handleKakaoLogin}
      >
        카카오로 로그인
      </button>
    </div>
  );
}
export default Login;
