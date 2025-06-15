import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import LoginCallback from "./pages/LoginCallback";
import ScheduleList from "./pages/ScheduleList";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/callback" element={<LoginCallback />} />
        <Route path="/schedules" element={<ScheduleList />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
