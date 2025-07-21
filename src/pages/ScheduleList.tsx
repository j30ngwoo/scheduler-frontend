import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import LogoutButton from "../components/LogoutButton";
import styled, { createGlobalStyle } from "styled-components";

// 전역 스타일
const GlobalStyle = createGlobalStyle`
  body {
    background-color: #f0f2f5;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }
`;

// 타입 정의
type Schedule = {
  code: string;
  title: string;
  startHour: number;
  endHour: number;
  maxHoursPerParticipant: number;
};

// 스타일 컴포넌트
const Container = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 24px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 16px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #333;
`;

const CreateButton = styled.button`
  margin-bottom: 24px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  background-color: #1890ff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #40a9ff;
  }
`;

const Form = styled.form`
  margin-bottom: 24px;
  padding: 24px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  background-color: #fafafa;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  box-sizing: border-box;
`;

const FormRow = styled.div`
  margin-top: 18px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const Label = styled.span`
  font-size: 16px;
  color: #555;
`;

const NumberButtonContainer = styled.div`
  display: flex;
  align-items: center;
`;

const NumberButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #d9d9d9;
  font-size: 18px;
  background-color: #fff;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
  margin: 0 4px;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const NumberDisplay = styled.span`
  width: 36px;
  text-align: center;
  font-size: 18px;
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  margin-top: 24px;
  display: flex;
  gap: 12px;
`;

const SubmitButton = styled.button`
  padding: 12px 24px;
  font-size: 16px;
  color: #fff;
  background-color: #52c41a;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #73d13d;
  }
`;

const CancelButton = styled.button`
  padding: 12px 24px;
  font-size: 16px;
  color: #555;
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s, border-color 0.3s;

  &:hover {
    background-color: #f5f5f5;
    border-color: #bfbfbf;
  }
`;

const ScheduleListUl = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ScheduleListItem = styled.li`
  margin-bottom: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: box-shadow 0.3s, border-color 0.3s;
  cursor: pointer;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
    border-color: #1890ff;
  }
`;

const ScheduleInfo = styled.div`
  flex-grow: 1;
`;

const ScheduleTitle = styled.b`
  font-size: 18px;
  color: #333;
`;

const ScheduleDetails = styled.div`
  color: #888;
  font-size: 14px;
  margin-top: 4px;
`;

const DeleteButton = styled.button`
  margin-left: 16px;
  padding: 8px 16px;
  font-size: 14px;
  color: #fff;
  background-color: #ff4d4f;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #ff7875;
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #888;
`;

function ScheduleList() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  // 기본값 12 ~ 17시
  const [startHour, setStartHour] = useState(12);
  const [endHour, setEndHour] = useState(17);
  const [maxHours, setMaxHours] = useState(5);

  const fetchSchedules = async () => {
    try {
      const res = await api.get("/api/schedules");
      setSchedules(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleCreate = () => {
    setTitle("");
    setStartHour(12);
    setEndHour(17);
    setMaxHours(2);
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
      fetchSchedules();
    } catch (err) {
      alert("생성 실패!");
    }
  };

  const handleScheduleClick = (code: string) => {
    navigate(`/schedules/${code}`);
  };

  const handleDeleteSchedule = async (code: string, title: string) => {
    if (window.confirm(`'${title}' 시간표를 정말 삭제하시겠습니까?`)) {
      try {
        await api.delete(`/api/schedules/${code}`);
        alert("시간표가 삭제되었습니다!");
        fetchSchedules();
      } catch (err) {
        console.error("삭제 실패:", err);
        alert("시간표 삭제에 실패했습니다.");
      }
    }
  };

  if (loading) return <LoadingContainer>불러오는 중...</LoadingContainer>;

  const numberInput = (value: number, setter: (v: number) => void, min: number, max: number) => (
    <NumberButtonContainer>
      <NumberButton type="button" onClick={() => setter(Math.max(min, value - 1))}>–</NumberButton>
      <NumberDisplay>{value}</NumberDisplay>
      <NumberButton type="button" onClick={() => setter(Math.min(max, value + 1))}>+</NumberButton>
    </NumberButtonContainer>
  );

  return (
    <>
      <GlobalStyle />
      <Container>
        <Header>
          <Title>내 근무표 목록</Title>
          <LogoutButton />
        </Header>
        <CreateButton onClick={handleCreate}>
          + 새 근무표 만들기
        </CreateButton>

        {showForm && (
          <Form onSubmit={handleSubmit}>
            <div>
              <Input
                placeholder="근무표 제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <FormRow>
              <Label>시작 시간</Label>
              {numberInput(startHour, setStartHour, 0, 23)}
              <Label>~ 종료 시간</Label>
              {numberInput(endHour, setEndHour, 0, 23)}
            </FormRow>
            <FormRow>
              <Label>참가자별 최대 가능 시간</Label>
              {numberInput(maxHours, setMaxHours, 1, 24)}
              <Label>시간</Label>
            </FormRow>
            <ButtonGroup>
              <SubmitButton type="submit">생성</SubmitButton>
              <CancelButton type="button" onClick={() => setShowForm(false)}>
                취소
              </CancelButton>
            </ButtonGroup>
          </Form>
        )}

        {schedules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>등록된 근무표가 없습니다.</div>
        ) : (
          <ScheduleListUl>
            {schedules.map((s) => (
              <ScheduleListItem
                key={s.code}
                onClick={() => handleScheduleClick(s.code)}
              >
                <ScheduleInfo>
                  <ScheduleTitle>{s.title}</ScheduleTitle>
                  <ScheduleDetails>
                    {s.startHour}:00 ~ {s.endHour}:00 (참가자별 최대 {s.maxHoursPerParticipant}시간)
                  </ScheduleDetails>
                </ScheduleInfo>
                <DeleteButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSchedule(s.code, s.title);
                  }}
                >
                  삭제
                </DeleteButton>
              </ScheduleListItem>
            ))}
          </ScheduleListUl>
        )}
      </Container>
    </>
  );
}

export default ScheduleList;