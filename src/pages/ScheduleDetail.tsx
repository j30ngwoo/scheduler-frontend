import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import styled, { createGlobalStyle, css } from "styled-components";

// --- 전역 스타일 ---
const GlobalStyle = createGlobalStyle`
  body {
    background-color: #f7f8fa;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

// --- 타입 정의 ---
type Schedule = {
  code: string;
  title: string;
  startHour: number;
  endHour: number;
  minHoursPerParticipant: number | null;
  maxHoursPerParticipant: number | null;
  participantsPerSlot: number;
};

type Availability = {
  id: number;
  participantName: string;
  availabilityBits: string;
};
type Assignment = {
  slot: { day: number; hourIndex: number; start: string; end: string };
  assignee: string;
};

// --- 스타일 컴포넌트 ---
const BackButton = styled.button`
  background: none;
  border: none;
  color: #8a8a8a;
  font-size: 26px;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 8px;
  margin-left: -6px;
  transition: color 0.2s;
  &:hover {
    color: #5a5a5a;
  }
`;
const DownloadButton = styled.button`
  margin-top: 12px;
  padding: 10px 18px;
  background: #4ca966;
  color: #fff;
  font-size: 15px;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.15s;
  &:hover { background: #357943; }
`;

const Container = styled.div`
  position: relative;
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 24px;
`;
const PageHeader = styled.div`
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;
const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
`;
const PageSubtitle = styled.p`
  font-size: 16px;
  color: #7f8c8d;
  margin: 0;
`;
const Section = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  user-select: none;
`;
const SectionTitle = styled.h3`
  font-size: 22px;
  font-weight: 600;
  color: #34495e;
  margin: 0 0 20px 0;
`;
const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 1px solid #dfe4ea;
  border-radius: 8px;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
`;
const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 15px;
  color: #34495e;
  input {
    margin-right: 8px;
    width: 16px;
    height: 16px;
  }
`;
const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;
const Button = styled.button<{ primary?: boolean; danger?: boolean }>`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  ${props => props.primary && css`
    background-color: #3498db;
    color: white;
    &:hover { background-color: #2980b9; }
  `}
  ${props => props.danger && css`
    background-color: #e74c3c;
    color: white;
    &:hover { background-color: #c0392b; }
  `}
  ${props => !props.primary && !props.danger && css`
    background-color: #ecf0f1;
    color: #34495e;
    &:hover { background-color: #bdc3c7; }
  `}
  &:active {
    transform: translateY(1px);
  }
`;
const GridWrapper = styled.div`
  overflow-x: auto;
  border: 1px solid #e0e0e0; 
  border-radius: 8px;
  overflow: hidden;
`;
const GridContainer = styled.div<{ columns: number }>`
  display: grid;
  grid-template-columns: 60px repeat(${props => props.columns}, 1fr);
  min-width: 600px;
  border-top: 1px solid #e0e0e0;
  border-left: 1px solid #e0e0e0;
  background: #e8f5e9;
`;
const GridCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  background-color: #f9fafb;
  box-sizing: border-box;
  padding: 0;
  min-width: 60px;
  width: 100%;
  height: 30px;
`;
const GridHeaderCell = styled(GridCell)`
  height: 40px;
  font-weight: 600;
  color: #34495e;
  border-right: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  box-sizing: border-box;
  padding: 0;
`;
const GridTimeCell = styled(GridCell)`
  height: 60px;
  font-weight: 600;
  color: #7f8c8d;
  border-right: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  box-sizing: border-box;
  padding: 0;
`;
const GridSlotColumn = styled.div`
  display: flex;
  flex-direction: column;
`;
const getSlotStyle = (state: '0' | '1' | 'B' | 'ASSIGNED' | string) => {
  switch (state) {
    case '1': return css` background-color: rgba(232,245,233,0.7); color: #2e7d32;`; // 가능
    case '0': return css` background-color: rgba(255,235,238,0.7); color: #c62828;`; // 불가능
    case 'B': return css` background-color: rgba(255,253,231,0.7); color: #f57f17;`; // 버퍼
    case 'ASSIGNED': return css` background-color: #d1ecf1; color: #17637c; font-weight: 700;`;
    default: return css` background-color: rgba(209,236,241,0.7); color: #0c5460; font-weight: 600;`;
  }
};
const GridSlotCell = styled(GridCell)<{
  state: string;
  isInput: boolean;
  isLastCol: boolean;
  isLastRow: boolean;
}>`
  border-right: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  ${props => props.isLastCol && "border-right: none;"}
  ${props => props.isLastRow && "border-bottom: none;"}
  cursor: ${props => props.isInput ? "pointer" : "default"};
  font-size: 11px;
  background: transparent;
  ${props => getSlotStyle(props.state)}
  &:hover {
    filter: ${props => props.isInput ? "brightness(0.95)" : "none"};
  }
`;
const ParticipantGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
`;
const ParticipantCard = styled.div`
  border: 1px solid #dfe4ea;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  transition: box-shadow 0.2s, border-color 0.2s;
  h4 {
    margin: 0 0 12px 0;
    color: #2c3e50;
    cursor: pointer;
    word-break: break-all;
  }
  &:hover {
    border-color: #3498db;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
`;
const SmallButton = styled.button`
  padding: 6px 12px;
  font-size: 13px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #c0392b;
  }
`;
const LoadingContainer = styled.div`
  text-align: center;
  padding: 80px;
  font-size: 18px;
  color: #7f8c8d;
`;

// --- 참가자별 배정 현황 표 스타일 ---
const AssignmentSummaryTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 400px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  overflow: hidden;
`;

const AssignmentSummaryTh = styled.th`
  padding: 12px;
  text-align: center;
  font-weight: 700;
  font-size: 16px;
  background: #f2f5fa;
`;

const AssignmentSummaryTd = styled.td<{ belowMin?: boolean }>`
  padding: 12px;
  text-align: center;
  background: ${({ belowMin }) => belowMin ? "#ffe5e5" : "white"};
  color: ${({ belowMin }) => belowMin ? "#c62828" : "#222"};
  font-weight: ${({ belowMin }) => belowMin ? 700 : 400};
  border-bottom: 1px solid #f0f0f0;
  white-space: pre-line;
`;

const AssignmentSummaryNameTd = styled(AssignmentSummaryTd)`
  text-align: left;
`;

const AssignmentSummaryNotice = styled.div`
  color: #c62828;
  margin-top: 10px;
  font-size: 14px;
`;

// --- slot별 배정자 리스트로 가공 ---
function groupAssignmentsBySlot(assignments: Assignment[], daysCount: number, hoursCount: number) {
  const slotAssignees: string[][][] = Array.from({ length: daysCount }, () =>
    Array.from({ length: hoursCount }, () => [])
  );
  assignments.forEach((a) => {
    const { day, hourIndex } = a.slot;
    if (
      day >= 0 &&
      day < daysCount &&
      hourIndex >= 0 &&
      hourIndex < hoursCount &&
      a.assignee
    ) {
      slotAssignees[day][hourIndex].push(a.assignee);
    }
  });
  return slotAssignees;
}


function ScheduleDetail() {
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [participantName, setParticipantName] = useState("");
  const [availabilityBits, setAvailabilityBits] = useState("");

  const [isLectureDayWorkPriority, setIsLectureDayWorkPriority] = useState(true);
  const [applyTravelTimeBufferForOptimize, setApplyTravelTimeBufferForOptimize] = useState(true);

  const isDragging = useRef(false);
  const [dragStartValue, setDragStartValue] = useState<boolean | null>(null);

  const [minHours, setMinHours] = useState(1);
  const [maxHours, setMaxHours] = useState(2);
  const [participantsPerSlot, setParticipantsPerSlot] = useState(2);

  const fetchAvailabilities = async () => {
    if (!code) return;
    try {
      const availRes = await api.get(`/api/schedules/${code}/availability`);
      setAvailabilities(availRes.data.data || []);
    } catch (err) {
      console.error("가능한 시간을 가져오는데 실패했습니다:", err);
    }
  };

  const handleDownloadOptimizedCSV = () => {
    if (!assignments.length || !schedule) return;
    const days = ["월", "화", "수", "목", "금"];
    const hours = Array.from({ length: schedule.endHour - schedule.startHour }, (_, i) => schedule.startHour + i);

    // 1. 헤더
    let csv = "시간";
    days.forEach(day => { csv += `,${day}`; });
    csv += "\n";

    // 2. slot별로 표 채우기 (각 칸은 "이름1, 이름2" 형태, 사람 이름 여러명 있으면 쉼표로 묶고, 반드시 ""로 감싸줌)
    // hours: 시간 단위(예: 12,13,14 ...)
    hours.forEach((hour, hourIndex) => {
      // 행 첫번째 칸 = 시간대 (예: "12:00-13:00")
      const start = hour;
      const end = hour + 1;
      let row = `${start}:00-${end}:00`;
      for (let dayIdx = 0; dayIdx < days.length; dayIdx++) {
        // 해당 시간/요일에 배정된 사람 이름
        const names = assignments
          .filter(a => a.slot.day === dayIdx && a.slot.hourIndex === hourIndex)
          .map(a => a.assignee)
          .sort();
        // 쉼표 구분으로 붙이고, 반드시 ""로 감싸줌(엑셀에서 한 셀로 인식)
        row += `,"${names.join(', ')}"`;
      }
      csv += row + "\n";
    });

    // blob 만들고 다운로드
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }); // BOM 붙여서 한글 깨짐 방지
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedule_optimized.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  // 초기 데이터 가져오기
  useEffect(() => {
    if (!code) {
      setError("일정 코드가 없습니다.");
      setLoading(false);
      return;
    }
    const fetchScheduleData = async () => {
      try {
        const scheduleRes = await api.get(`/api/schedules/${code}`);
        const fetchedSchedule = scheduleRes.data.data;
        setSchedule(fetchedSchedule);
        await fetchAvailabilities();
        if (fetchedSchedule) {
          const hoursPerDay = fetchedSchedule.endHour - fetchedSchedule.startHour;
          const totalBitsLength = 5 * hoursPerDay * 2;
          setAvailabilityBits("1".repeat(totalBitsLength));
        }
      } catch (err) {
        setError("일정 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchScheduleData();
    // eslint-disable-next-line
  }, [code]);

  // 참여자 이름이 변경될 때 가능한 시간 설정
  useEffect(() => {
    if (schedule && participantName) {
      const existing = availabilities.find(a => a.participantName === participantName);
      if (existing) {
        setAvailabilityBits(existing.availabilityBits);
      } else {
        const hoursPerDay = schedule.endHour - schedule.startHour;
        const totalBitsLength = 5 * hoursPerDay * 2;
        setAvailabilityBits("1".repeat(totalBitsLength));
      }
    }
  }, [participantName, schedule]);

  useEffect(() => {
    if (schedule) {
      setMinHours(schedule.minHoursPerParticipant ?? 1);
      setMaxHours(schedule.maxHoursPerParticipant ?? 2);
      setParticipantsPerSlot(schedule.participantsPerSlot ?? 2);
    }
  }, [schedule]);

  const handleAvailabilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantName || !availabilityBits) {
      alert("근무자 이름과 가능한 이름을 입력해주세요.");
      return;
    }
    try {
      await api.post(`/api/schedules/${code}/availability`, {
        participantName,
        availabilityBinary: availabilityBits,
      });
      alert("시간이 성공적으로 제출되었습니다!");
      await fetchAvailabilities();
      handleNewAvailability();
    } catch (err) {
      alert("시간 제출에 실패했습니다.");
    }
  };

  // 일정 최적화 버튼 클릭 시: 옵션 저장 → 최적화!
  const handleOptimize = async () => {
    if (!code) return;
    try {
      // 옵션 저장
      await api.put(`/api/schedules/${code}/options`, {
        minHoursPerParticipant: minHours,
        maxHoursPerParticipant: maxHours,
        participantsPerSlot,
      });
      // 최적화
      const res = await api.post(`/api/schedules/${code}/optimize`, {
        isLectureDayWorkPriority,
        applyTravelTimeBuffer: applyTravelTimeBufferForOptimize,
      });
      setAssignments(res.data.data || []);
      alert("최적화가 완료되었습니다!");
      const scheduleRes = await api.get(`/api/schedules/${code}`);
      setSchedule(scheduleRes.data.data);
    } catch (err) {
      alert("옵션 저장 또는 일정 최적화에 실패했습니다.");
    }
  };

  const handleDeleteAvailability = async (availabilityId: number) => {
    if (!code || !window.confirm("정말로 이 시간을 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/api/schedules/${code}/availability/${availabilityId}`);
      alert("시간이 삭제되었습니다.");
      await fetchAvailabilities();
    } catch (err) {
      alert("시간 삭제에 실패했습니다.");
    }
  };

  const handleEditAvailability = (avail: Availability) => {
    setParticipantName(avail.participantName);
    setAvailabilityBits(avail.availabilityBits);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewAvailability = () => {
    setParticipantName("");
    if (schedule) {
      const hoursPerDay = schedule.endHour - schedule.startHour;
      const totalBitsLength = 5 * hoursPerDay * 2;
      setAvailabilityBits("1".repeat(totalBitsLength));
    }
  };

  const toggleBit = (index: number, forceValue: boolean | null = null) => {
    const newBits = availabilityBits.split("");
    if (index >= 0 && index < newBits.length) {
      newBits[index] = forceValue !== null ? (forceValue ? "1" : "0") : (newBits[index] === "1" ? "0" : "1");
      setAvailabilityBits(newBits.join(""));
    }
  };

  const handleMouseDown = (index: number) => {
    isDragging.current = true;
    const currentValue = availabilityBits[index] === "1";
    setDragStartValue(!currentValue);
    toggleBit(index, !currentValue);
  };

  const handleMouseEnter = (index: number) => {
    if (isDragging.current && dragStartValue !== null) {
      toggleBit(index, dragStartValue);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    setDragStartValue(null);
  };

  const renderAvailabilityGrid = (currentSchedule: Schedule, bits: string, isInputGrid: boolean = false) => {
    const days = ["월", "화", "수", "목", "금"];
    const hours = Array.from({ length: currentSchedule.endHour - currentSchedule.startHour }, (_, i) => currentSchedule.startHour + i);
    const bitsToRender = bits;

    return (
      <GridWrapper>
        <GridContainer columns={days.length}>
          <GridHeaderCell />
          {days.map(day => <GridHeaderCell key={day}>{day}</GridHeaderCell>)}
          {hours.map((hour, hourIndex) => (
            <React.Fragment key={hour}>
              <GridTimeCell>{hour}:00</GridTimeCell>
              {days.map((_, dayIndex) => (
                <GridSlotColumn key={dayIndex}>
                  {[0, 1].map((_, halfHourIndex) => {
                    const bitIndex = (dayIndex * hours.length * 2) + (hourIndex * 2) + halfHourIndex;
                    const cellState = bitsToRender[bitIndex] ?? '0';
                    const isLastCol = dayIndex === days.length - 1;
                    const isLastRow =
                      hourIndex === hours.length - 1 && halfHourIndex === 1;
                    return (
                      <GridSlotCell
                        key={halfHourIndex}
                        state={cellState}
                        isInput={isInputGrid}
                        isLastCol={isLastCol}
                        isLastRow={isLastRow}
                        onMouseDown={() => isInputGrid && handleMouseDown(bitIndex)}
                        onMouseEnter={() => isInputGrid && handleMouseEnter(bitIndex)}
                      >
                        {`${hour}:${halfHourIndex === 0 ? "00" : "30"}`}
                      </GridSlotCell>
                    );
                  })}
                </GridSlotColumn>
              ))}
            </React.Fragment>
          ))}
        </GridContainer>
      </GridWrapper>
    );
  };

  // --- slot별 여러 명 표시하는 최적화 결과 그리드 ---
  const renderAssignments = (currentSchedule: Schedule) => {
    if (!assignments.length) return null;
    const days = ["월", "화", "수", "목", "금"];
    const hours = Array.from(
      { length: currentSchedule.endHour - currentSchedule.startHour },
      (_, i) => currentSchedule.startHour + i
    );
    const slotAssignees = groupAssignmentsBySlot(assignments, days.length, hours.length);

    return (
      <Section>
        <SectionTitle>최적화 결과</SectionTitle>
        <GridWrapper>
          <GridContainer columns={days.length}>
            <GridHeaderCell />
            {days.map((day) => (
              <GridHeaderCell key={day}>{day}</GridHeaderCell>
            ))}
            {hours.map((hour, hourIndex) => (
              <React.Fragment key={hour}>
                <GridTimeCell>{hour}:00</GridTimeCell>
                {days.map((_, dayIndex) => {
                  const isLastCol = dayIndex === days.length - 1;
                  const isLastRow = hourIndex === hours.length - 1;
                  const assignees = slotAssignees[dayIndex][hourIndex];
                  return (
                    <GridSlotCell
                      key={dayIndex}
                      state={assignees.length > 0 ? "ASSIGNED" : "0"}
                      isInput={false}
                      isLastCol={isLastCol}
                      isLastRow={isLastRow}
                      style={{
                        height: "60px",
                        whiteSpace: "pre-line",
                        padding: "4px",
                        fontWeight: assignees.length > 0 ? 600 : undefined,
                      }}
                    >
                      {assignees.length > 0
                        ? assignees.join("\n")
                        : "미배정"}
                    </GridSlotCell>
                  );
                })}
              </React.Fragment>
            ))}
          </GridContainer>
        </GridWrapper>
        <DownloadButton onClick={handleDownloadOptimizedCSV}>
          최적화 결과 다운로드
        </DownloadButton>
      </Section>
    );
  };

  

  // --- 참가자별 배정 현황 표 ---
  const renderAssignmentSummary = () => {
    if (!assignments.length) return null;
    const dayNames = ["월", "화", "수", "목", "금"];
    const minHours = schedule?.minHoursPerParticipant ?? 1;

    // 이름별 할당 slot 및 시간대 정리
    const participantMap: Record<string, { count: number; slots: Assignment[] }> = {};
    assignments.forEach(a => {
      if (!participantMap[a.assignee]) {
        participantMap[a.assignee] = { count: 0, slots: [] };
      }
      participantMap[a.assignee].count += 1;
      participantMap[a.assignee].slots.push(a);
    });

    // 모든 이름(혹시 할당 없는 참여자도 포함)
    const allNames = Array.from(
      new Set([
        ...assignments.map(a => a.assignee),
        ...availabilities.map(a => a.participantName)
      ])
    );

    // "월 12-13" 포맷
    function getSlotString(slot: { day: number; hourIndex: number; start: string; end: string }) {
      const day = dayNames[slot.day];
      const startHour = slot.start.split(":")[0];
      const endHour = slot.end.split(":")[0];
      return `${day} ${startHour}-${endHour}`;
    }

    return (
      <Section>
        <SectionTitle>참가자별 배정 현황</SectionTitle>
        <div style={{ overflowX: 'auto', marginBottom: 12 }}>
          <AssignmentSummaryTable>
            <thead>
              <tr>
                <AssignmentSummaryTh style={{ textAlign: "left" }}>이름</AssignmentSummaryTh>
                <AssignmentSummaryTh>배정 시간</AssignmentSummaryTh>
                <AssignmentSummaryTh>일정</AssignmentSummaryTh>
              </tr>
            </thead>
            <tbody>
              {allNames.map(name => {
                const info = participantMap[name];
                const count = info ? info.count : 0;
                const slots = info ? info.slots : [];
                const belowMin = count < minHours;

                // 요일/시간 정렬
                const slotStrs = slots
                  .sort((a, b) => {
                    if (a.slot.day !== b.slot.day) return a.slot.day - b.slot.day;
                    return parseInt(a.slot.start) - parseInt(b.slot.start);
                  })
                  .map(a => getSlotString(a.slot));

                return (
                  <tr key={name}>
                    <AssignmentSummaryNameTd belowMin={belowMin}>{name}</AssignmentSummaryNameTd>
                    <AssignmentSummaryTd belowMin={belowMin}>{count}시간</AssignmentSummaryTd>
                    <AssignmentSummaryTd belowMin={belowMin}>
                      {slotStrs.length > 0 ? slotStrs.join(", ") : "-"}
                    </AssignmentSummaryTd>
                  </tr>
                );
              })}
            </tbody>
          </AssignmentSummaryTable>
          <AssignmentSummaryNotice>
            * 배정 시간이 최저시간보다 적으면 빨간색으로 표시됩니다.
          </AssignmentSummaryNotice>
        </div>
      </Section>
    );
  };

  if (loading)
    return <LoadingContainer>일정을 불러오는 중...</LoadingContainer>;
  if (error)
    return (
      <LoadingContainer style={{ color: "#e74c3c" }}>{error}</LoadingContainer>
    );
  if (!schedule)
    return <LoadingContainer>일정을 찾을 수 없습니다.</LoadingContainer>;

  return (
    <>
      <GlobalStyle />
      <Container onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <BackButton onClick={() => navigate(-1)} aria-label="뒤로가기">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{display:"block"}} xmlns="http://www.w3.org/2000/svg">
            <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </BackButton>
        <PageHeader>
          <PageTitle>{schedule.title}</PageTitle>
          <PageSubtitle>
            {schedule.startHour}:00 - {schedule.endHour}:00
          </PageSubtitle>
        </PageHeader>

        <Section>
          <SectionTitle>참가자 일정 입력</SectionTitle>
          <form onSubmit={handleAvailabilitySubmit}>
            <Input
              type="text"
              placeholder="참여자 이름"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              required
              style={{ marginBottom: "16px" }}
            />

            {renderAvailabilityGrid(schedule, availabilityBits, true)}

            <ButtonGroup>
              <Button primary type="submit">
                참가자 일정 제출
              </Button>
              <Button type="button" onClick={handleNewAvailability}>
                초기화
              </Button>
            </ButtonGroup>
          </form>
        </Section>

        <Section>
          <SectionTitle>제출된 시간 목록</SectionTitle>
          {availabilities.length === 0 ? (
            <p style={{ color: "#7f8c8d" }}>아직 제출된 시간이 없습니다.</p>
          ) : (
            <ParticipantGrid>
              {availabilities.map((avail) => (
                <ParticipantCard
                  key={avail.id}
                  onClick={() => handleEditAvailability(avail)}
                  style={{ cursor: 'pointer' }}
                >
                  <h4 style={{ pointerEvents: 'none', userSelect: 'none' }}>
                    {avail.participantName}
                  </h4>
                  <SmallButton
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteAvailability(avail.id);
                    }}
                  >
                    삭제
                  </SmallButton>
                </ParticipantCard>
              ))}
            </ParticipantGrid>
          )}
        </Section>

        <Section>
          <SectionTitle>최적화</SectionTitle>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 16 }}>
            <label>
              참가자별 최소 가능 시간
              <select value={minHours} onChange={e => setMinHours(Number(e.target.value))} style={{ margin: "0 6px" }}>
                {[...Array(25).keys()].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              시간
            </label>
            <label>
              참가자별 최대 가능 시간
              <select value={maxHours} onChange={e => setMaxHours(Number(e.target.value))} style={{ margin: "0 6px" }}>
                {[...Array(25).keys()].slice(1).map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              시간
            </label>
            <label>
              한 슬롯당 최대 인원
              <select value={participantsPerSlot} onChange={e => setParticipantsPerSlot(Number(e.target.value))} style={{ margin: "0 6px" }}>
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}명</option>)}
              </select>
            </label>
          </div>
          <CheckboxLabel style={{ marginBottom: "12px" }}>
            <input
              type="checkbox"
              checked={applyTravelTimeBufferForOptimize}
              onChange={(e) => setApplyTravelTimeBufferForOptimize(e.target.checked)}
            />
            강의실 이동 시간 고려
          </CheckboxLabel>
          <CheckboxLabel style={{ marginBottom: "20px" }}>
            <input
              type="checkbox"
              checked={isLectureDayWorkPriority}
              onChange={(e) => setIsLectureDayWorkPriority(e.target.checked)}
            />
            수업이 있는 날에 근무를 우선 배정
          </CheckboxLabel>
          <Button primary onClick={handleOptimize}>
            일정 최적화
          </Button>
        </Section>

        {renderAssignments(schedule)}
        {renderAssignmentSummary()}
      </Container>
    </>
  );
}

export default ScheduleDetail;
