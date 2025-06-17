import { useEffect, useState } from "react";
import api from "../lib/api";
import LogoutButton from "../components/LogoutButton";

type Schedule = {
  code: string;
  title: string;
  startDate: string;
  endDate: string;
};

function ScheduleList() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    api
      .get("/api/schedules")
      .then((res) => {
        setSchedules(res.data.data || []);
      })
      .catch((err) => {
        // 401 등은 인터셉터에서 처리됨
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = () => setShowForm(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/schedules", { title, startDate, endDate });
      alert("시간표가 생성되었습니다!");
      setShowForm(false);
      window.location.reload();
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ScheduleList;
