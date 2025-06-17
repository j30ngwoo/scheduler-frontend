import { useEffect, useState } from "react";
import api from "../lib/api";
import LogoutButton from "../components/LogoutButton";

type Schedule = {
  code: string;
  title: string;
  startTime: number;
  endTime: number;
};

function ScheduleList() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  // 기본값 12~17
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState(12);
  const [endTime, setEndTime] = useState(17);

  useEffect(() => {
    api
      .get("/api/schedules")
      .then((res) => {
        setSchedules(res.data.data || []);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = () => {
    setTitle("");
    setStartTime(12);
    setEndTime(17);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      Number.isNaN(startTime) ||
      Number.isNaN(endTime) ||
      startTime < 0 ||
      startTime > 24 ||
      endTime < 0 ||
      endTime > 24 ||
      startTime >= endTime
    ) {
      alert("시작/종료시간을 올바르게 입력하세요! (0~24, 시작 < 종료)");
      return;
    }
    try {
      await api.post("/api/schedules", { title, startTime, endTime });
      alert("시간표가 생성되었습니다!");
      setShowForm(false);
      window.location.reload();
    } catch (err) {
      alert("생성 실패!");
    }
  };

  // 시간 증감 함수
  const increase = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => {
    if (value < 24) setter(value + 1);
  };
  const decrease = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => {
    if (value > 0) setter(value - 1);
  };

  if (loading) return <div style={{ textAlign: "center" }}>불러오는 중...</div>;

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
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
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 12 }}>
            <span>시작 시간</span>
            <button
              type="button"
              onClick={() => decrease(setStartTime, startTime)}
              disabled={startTime <= 0}
            >
              -
            </button>
            <input
              type="number"
              min={0}
              max={24}
              value={startTime}
              onChange={(e) => setStartTime(Number(e.target.value))}
              required
              style={{ width: 60, textAlign: "center" }}
            />
            <button
              type="button"
              onClick={() => increase(setStartTime, startTime)}
              disabled={startTime >= 24}
            >
              +
            </button>
            <span>~ 종료 시간</span>
            <button
              type="button"
              onClick={() => decrease(setEndTime, endTime)}
              disabled={endTime <= 0}
            >
              -
            </button>
            <input
              type="number"
              min={0}
              max={24}
              value={endTime}
              onChange={(e) => setEndTime(Number(e.target.value))}
              required
              style={{ width: 60, textAlign: "center" }}
            />
            <button
              type="button"
              onClick={() => increase(setEndTime, endTime)}
              disabled={endTime >= 24}
            >
              +
            </button>
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
                {s.startTime} ~ {s.endTime}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ScheduleList;
