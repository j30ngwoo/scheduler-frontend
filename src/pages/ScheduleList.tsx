import { useEffect, useState } from "react";
import axios from "axios";
import LogoutButton from "../components/LogoutButton";

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

  // 폼 모달/상태
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  // 새 시간표 생성 핸들러
  const handleCreate = () => setShowForm(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const accessToken = localStorage.getItem("access_token");
    try {
      await axios.post(
        "/api/schedules",
        { title, startDate, endDate },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      alert("시간표가 생성되었습니다!");
      setShowForm(false);
      window.location.reload(); // 간단하게 새로고침으로 목록 갱신
    } catch (err) {
      alert("생성 실패!");
    }
  };

  if (loading) return <div style={{ textAlign: "center" }}>불러오는 중...</div>;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8
      }}>
        <h2 style={{ margin: 0 }}>내 시간표 목록</h2>
        <LogoutButton />
      </div>
      <button style={{ marginBottom: 20 }} onClick={handleCreate}>
        + 새 시간표 만들기
      </button>

      {/* 새 시간표 폼 */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{ marginBottom: 20, border: "1px solid #ccc", padding: 16 }}
        >
          <div>
            <input
              placeholder="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div style={{ marginTop: 8 }}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />{" "}
            ~{" "}
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          <button type="submit" style={{ marginTop: 12 }}>
            생성
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            style={{ marginLeft: 8, marginTop: 12 }}
          >
            취소
          </button>
        </form>
      )}

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
              {/* 상세/삭제 등 추후 추가 */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ScheduleList;
