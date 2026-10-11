# 프로젝트 아키텍처 및 작업 규칙

## 1. 디렉토리 구조
- `/frontend`: Next.js 14+ (App Router, Tailwind CSS, TypeScript)
- `/backend`: Python FastAPI (Python 3.11, Pytest)

## 2. 검증 커맨드 (작업 완료 전 반드시 실행)
- 프론트엔드 검증: `cd frontend && npm run build`
- 백엔드 검증: `cd backend && pytest`

## 3. 코딩 표준
- Backend 응답은 항상 표준 JSON 포맷(`{"status": "success", "data": ...}`)을 준수합니다.
- 새로운 라이브러리 추가 시 `requirements.txt` 또는 `package.json`에 명시해야 합니다.
