import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
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

// --- 타입 정의 (변경 없음) ---
type Schedule = {
  code: string;
  title: string;
  startHour: number;
  endHour: number;
  maxHoursPerParticipant: number;
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

const Container = styled.div`
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 24px;
`;

const PageHeader = styled.div`
  margin-bottom: 24px;
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
  padding: 0; /* 모든 셀에 padding 0 */
  min-width: 60px; /* 필요하다면 명시적으로 고정 */
  width: 100%;
  height: 30px; /* 모든 셀 높이도 고정 */
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

const getSlotStyle = (state: '0' | '1' | 'B' | string) => {
  switch (state) {
    case '1': return css` background-color: rgba(232,245,233,0.7); color: #2e7d32;`; // 가능
    case '0': return css` background-color: rgba(255,235,238,0.7); color: #c62828;`; // 불가능
    case 'B': return css` background-color: rgba(255,253,231,0.7); color: #f57f17;`; // 버퍼
    default: return css` background-color: rgba(209,236,241,0.7); color: #0c5460; font-weight: 600;`; // 배정됨
  }
};

// 기존 SlotCell의 높이/width 중복 정의 제거!
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

// --- 컴포넌트 ---

function ScheduleDetail() {
  const { code } = useParams<{ code: string }>();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [participantName, setParticipantName] = useState("");
  const [availabilityBits, setAvailabilityBits] = useState("");

  const [considerLectureGap, setConsiderLectureGap] = useState(true);
  const [applyTravelTimeBuffer, setApplyTravelTimeBuffer] = useState(false);

  const isDragging = useRef(false);
  const [dragStartValue, setDragStartValue] = useState<boolean | null>(null);

  const fetchAvailabilities = async () => {
    if (!code) return;
    try {
      const availRes = await api.get(`/api/schedules/${code}/availability`);
      setAvailabilities(availRes.data.data || []);
    } catch (err) {
      console.error("가능한 시간을 가져오는데 실패했습니다:", err);
    }
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

  const handleAvailabilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantName || !availabilityBits) {
      alert("근무자 이름과 가능한 이름을 입력해주세요.");
      return;
    }

    let submissionBits = availabilityBits;
    if (applyTravelTimeBuffer && schedule) {
      const hoursPerDay = schedule.endHour - schedule.startHour;
      const slotsPerDay = hoursPerDay * 2;
      const bitsArray = availabilityBits.split('');
      const originalBits = [...bitsArray];

      for (let i = 0; i < originalBits.length; i++) {
        if (originalBits[i] === '0') {
          const currentDay = Math.floor(i / slotsPerDay);
          const prevIndex = i - 1;
          if (prevIndex >= 0 && Math.floor(prevIndex / slotsPerDay) === currentDay) {
            bitsArray[prevIndex] = '0';
          }
          const nextIndex = i + 1;
          if (nextIndex < originalBits.length && Math.floor(nextIndex / slotsPerDay) === currentDay) {
            bitsArray[nextIndex] = '0';
          }
        }
      }
      submissionBits = bitsArray.join('');
    }

    try {
      await api.post(`/api/schedules/${code}/availability`, {
        participantName,
        availabilityBinary: submissionBits,
      });
      alert("시간이 성공적으로 제출되었습니다!");
      await fetchAvailabilities();
      handleNewAvailability();
    } catch (err) {
      alert("시간 제출에 실패했습니다.");
    }
  };

  const handleOptimize = async () => {
    if (!code) return;
    try {
      const query = `considerLectureGap=${considerLectureGap}`;
      const res = await api.get(`/api/schedules/${code}/optimize?${query}`);
      setAssignments(res.data.data || []);
    } catch (err) {
      alert("일정 최적화에 실패했습니다.");
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

  const displayBits = useMemo(() => {
    if (!applyTravelTimeBuffer || !schedule) return availabilityBits;
    const hoursPerDay = schedule.endHour - schedule.startHour;
    const slotsPerDay = hoursPerDay * 2;
    const displayArray = availabilityBits.split('');

    for (let i = 0; i < availabilityBits.length; i++) {
      if (availabilityBits[i] === '0') {
        const currentDay = Math.floor(i / slotsPerDay);
        const prevIndex = i - 1;
        if (prevIndex >= 0 && Math.floor(prevIndex / slotsPerDay) === currentDay && availabilityBits[prevIndex] === '1') {
          displayArray[prevIndex] = 'B';
        }
        const nextIndex = i + 1;
        if (nextIndex < availabilityBits.length && Math.floor(nextIndex / slotsPerDay) === currentDay && availabilityBits[nextIndex] === '1') {
          displayArray[nextIndex] = 'B';
        }
      }
    }
    return displayArray.join('');
  }, [availabilityBits, applyTravelTimeBuffer, schedule]);

  const renderAvailabilityGrid = (currentSchedule: Schedule, bits: string, isInputGrid: boolean = false) => {
    const days = ["월", "화", "수", "목", "금"];
    const hours = Array.from({ length: currentSchedule.endHour - currentSchedule.startHour }, (_, i) => currentSchedule.startHour + i);
    const bitsToRender = isInputGrid ? displayBits : bits;

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

                    // 마지막 열/행인지 체크
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

  const renderAssignments = (currentSchedule: Schedule) => {
    if (!assignments.length) return null;
    const days = ["월", "화", "수", "목", "금"];
    const hours = Array.from(
      { length: currentSchedule.endHour - currentSchedule.startHour },
      (_, i) => currentSchedule.startHour + i
    );
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
                  const assignment = assignments.find(
                    (a) =>
                      a.slot.day === dayIndex &&
                      a.slot.hourIndex === hourIndex
                  );
                  return (
                    <GridSlotCell
                      key={dayIndex}
                      state={assignment?.assignee ?? "0"}
                      isInput={false}
                      isLastCol={isLastCol}
                      isLastRow={isLastRow}
                      style={{
                        height: "60px",
                        whiteSpace: "normal",
                        padding: "4px",
                      }}
                    >
                      {assignment?.assignee || "미배정"}
                    </GridSlotCell>
                  );
                })}
              </React.Fragment>
            ))}
          </GridContainer>
        </GridWrapper>
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
        <PageHeader>
          <PageTitle>{schedule.title}</PageTitle>
          <PageSubtitle>
            시간 범위: {schedule.startHour}:00 - {schedule.endHour}:00 / 참여자당 최대{" "}
            {schedule.maxHoursPerParticipant}시간
          </PageSubtitle>
        </PageHeader>

        <Section>
          <SectionTitle>가능한 일정 입력</SectionTitle>
          <form onSubmit={handleAvailabilitySubmit}>
            <Input
              type="text"
              placeholder="참여자 이름"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              required
              style={{ marginBottom: "16px" }}
            />
            <CheckboxLabel style={{ marginBottom: "20px" }}>
              <input
                type="checkbox"
                checked={applyTravelTimeBuffer}
                onChange={(e) => setApplyTravelTimeBuffer(e.target.checked)}
              />
              이동 시간 고려 (불가능한 시간 전후로 버퍼 추가)
            </CheckboxLabel>

            {renderAvailabilityGrid(schedule, availabilityBits, true)}

            <ButtonGroup>
              <Button primary type="submit">
                가능한 일정 제출
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
                      e.stopPropagation();  // 삭제버튼만 클릭되면 버블링 막기!
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
          <CheckboxLabel style={{ marginBottom: "20px" }}>
            <input
              type="checkbox"
              checked={considerLectureGap}
              onChange={(e) => setConsiderLectureGap(e.target.checked)}
            />
            수업이 있는 날에 근무를 우선 배정
          </CheckboxLabel>
          <Button primary onClick={handleOptimize}>
            일정 최적화
          </Button>
        </Section>

        {renderAssignments(schedule)}
      </Container>
    </>
  );
}

export default ScheduleDetail;