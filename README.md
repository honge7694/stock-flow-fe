# stock-flow-fe
주식 분석 리포트 fe

## Backend wake-up scheduler

백엔드 서버가 장시간 미사용 후 잠드는 환경을 고려해 GitHub Actions로 매일 오전 7시 55분(KST)에 `/healthz`를 호출합니다.

필요한 GitHub Repository Secret:

- `STOCK_FLOW_API_BASE_URL`: 배포된 백엔드 기본 URL
  - 예: `https://stock-flow-api.example.com`

스케줄러 파일:

- `.github/workflows/wake-backend.yml`

수동 실행:

- GitHub Actions > Wake backend > Run workflow
