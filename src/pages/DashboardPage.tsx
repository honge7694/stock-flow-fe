import { Link } from 'react-router-dom';

export function DashboardPage() {
  return (
    <section className="dashboard-page">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">LEARNING WORKSPACE</p>
          <h1>대시보드</h1>
          <p>관심 종목과 생성된 리포트를 학습 흐름에 맞춰 관리합니다.</p>
        </div>
        <Link className="primary-link-button" to="/reports/new">
          리포트 생성
        </Link>
      </div>

      <div className="dashboard-grid">
        <article className="overview-card overview-card-accent">
          <span className="card-label">다음 작업</span>
          <h2>관심 종목에서 리포트를 시작하세요</h2>
          <p>종목을 먼저 저장해두면 이름을 보고 선택한 뒤, 같은 조건으로 교육용 리포트를 만들 수 있습니다.</p>
          <Link className="text-link" to="/stocks">
            관심 종목 관리
          </Link>
        </article>
        <article className="overview-card">
          <span className="card-label">보유 분석</span>
          <strong>보유 포지션 학습</strong>
          <p>수량과 평균 단가를 입력해 평가 상태와 차트 지표를 교육용으로 정리합니다.</p>
          <Link className="text-link" to="/portfolio-analyses/new">
            보유 분석 만들기
          </Link>
        </article>
        <article className="overview-card">
          <span className="card-label">리포트</span>
          <strong>최근 리포트 확인</strong>
          <p>완료된 리포트와 실패한 요청을 한 화면에서 확인합니다.</p>
          <Link className="text-link" to="/reports">
            리포트 목록
          </Link>
        </article>
        <article className="overview-card">
          <span className="card-label">안내</span>
          <strong>교육용 데이터 요약</strong>
          <p>과거 가격, 거래량, SMA, RSI, MACD를 학습 목적으로 정리합니다.</p>
          <Link className="text-link" to="/glossary">
            용어집 보기
          </Link>
        </article>
      </div>
    </section>
  );
}
