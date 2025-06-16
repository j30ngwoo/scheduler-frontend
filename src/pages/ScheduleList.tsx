import { useEffect, useState } from "react";
import axios from "axios";

type Schedule = {
  code: string;
  title: string;
  startDate: string;
  endDate: string;
  // 필요시 다른 필드 추가
};

function ScheduleList() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      alert("로그인이 필요합니다.");
      window.location.href = "/login";
      return;
    }

    axios
      .get("/api/schedules", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        setSchedules(res.data.data || []); // ApiResponse에 data로 들어옴
      })
      .catch((err) => {
        console.error(err);
        alert("시간표 목록을 불러오지 못했습니다.");
        window.location.href = "/login";
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{textAlign: "center"}}>불러오는 중...</div>;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>내 시간표 목록</h2>
      {schedules.length === 0 ? (
        <div>등록된 시간표가 없습니다.</div>
      ) : (
        <ul>
          {schedules.map((s) => (
            <li key={s.code} style={{ marginBottom: 12 }}>
              <b>{s.title}</b>
              <div style={{ color: "#888", fontSize: 14 }}>
                {s.startDate} ~ {s.endDate}
              </div>
              {/* 추후 상세 페이지/삭제 버튼 등 추가 가능 */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ScheduleList;
