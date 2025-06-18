import { useEffect, useState } from "react";
import api from "../lib/api";
import LogoutButton from "../components/LogoutButton";

type Schedule = {
  code: string;
  title: string;
  startHour: number; // LocalTime의 시
  endHour: number;
  maxHoursPerParticipant: number;
};

function ScheduleList() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  // 기본값 12 ~ 17시
  const [startHour, setStartHour] = useState(12);
  const [endHour, setEndHour] = useState(17);
  const [maxHours, setMaxHours] = useState(5);

  useEffect(() => {
    api
      .get("/api/schedules")
      .then((res) => setSchedules(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = () => {
    setTitle("");
    setStartHour(12);
    setEndHour(17);
    setMaxHours(5);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (startHour >= endHour) {
      alert("시작 시간이 종료 시간보다 빠를 수 없습니다.");
      return;
    }
    if (maxHours < 1) {
      alert("최대 가능 시간은 1 이상이어야 합니다.");
      return;
    }

    try {
      await api.post("/api/schedules", {
        title,
        startHour,
        endHour,
        maxHoursPerParticipant: maxHours,
      });
      alert("시간표가 생성되었습니다!");
      setShowForm(false);
      window.location.reload();
    } catch (err) {
      alert("생성 실패!");
    }
  };

  if (loading) return <div style={{ textAlign: "center" }}>불러오는 중...</div>;

  // 시 증감 버튼 유틸
  const numberButton = (value: number, setter: (v: number) => void, min: number, max: number) => (
    <>
      <button type="button" onClick={() => setter(Math.max(min, value - 1))} style={btnStyle}>–</button>
      <span style={{ width: 28, textAlign: "center", fontSize: 18, display: "inline-block" }}>{value}</span>
      <button type="button" onClick={() => setter(Math.min(max, value + 1))} style={btnStyle}>+</button>
    </>
  );

  const btnStyle = {
    width: 28, height: 28, borderRadius: "50%", border: "1px solid #888",
    fontSize: 16, background: "#fafafa", margin: "0 2px"
  };

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
              style={{ width: "90%" }}
            />
          </div>
          <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <span>시작 시간</span>
            {numberButton(startHour, setStartHour, 0, 23)}
            <span style={{ margin: "0 12px" }}>~ 종료 시간</span>
            {numberButton(endHour, setEndHour, 0, 23)}
          </div>
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <span>참가자별 최대 가능 시간</span>
            {numberButton(maxHours, setMaxHours, 1, 24)}
            <span>시간</span>
          </div>
          <button type="submit" style={{ marginTop: 16 }}>
            생성
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            style={{ marginLeft: 8, marginTop: 16 }}
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
                {s.startHour}:00 ~ {s.endHour}:00 (참가자별 최대 {s.maxHoursPerParticipant}시간)
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ScheduleList;
