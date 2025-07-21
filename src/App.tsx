import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import LoginCallback from "./pages/LoginCallback";
import ScheduleList from "./pages/ScheduleList";
import ScheduleDetail from "./pages/ScheduleDetail"; // 새로 추가할 컴포넌트

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/callback" element={<LoginCallback />} />
        <Route path="/schedules" element={<ScheduleList />} />
        <Route path="/schedules/:code" element={<ScheduleDetail />} /> {/* 추가된 라우트 */}
      </Routes>
    </BrowserRouter>
  );
}
export default App;
