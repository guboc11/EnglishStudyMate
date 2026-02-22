# EnglishStudyMate — CLAUDE.md

## 프로젝트 개요
영어 표현 맥락 학습 앱. 번역 암기 대신 AI 생성 스토리/이미지로 반복 맥락 노출.

## 아키텍처 (현재)
- **콘텐츠 파이프라인**: 실시간 API 호출 없음. 오프라인 배치 생성 → Supabase 저장 → 앱 조회
- **Mobile**: React Native + Expo (`Product/apps/mobile`)
- **Backend**: Node.js + Express (`Product/apps/backend`) — Supabase 조회 API 제공
- **DB**: Supabase (PostgreSQL + Storage)
- **AI (배치 전용)**: Gemini 2.0 Flash (텍스트), Gemini 2.5 Flash Image (이미지)

## 폴더 구조
```
EnglishStudyMate/
├── CLAUDE.md
├── Foundation/          # 미션/전략/원칙 문서
├── Execution/Plans/     # 제품 스펙
├── Product/
│   ├── apps/
│   │   ├── mobile/      # Expo 앱
│   │   └── backend/     # Express API
│   └── docs/            # 기술 스펙
└── scripts/             # 콘텐츠 배치 생성 CLI 도구
    ├── data/
    │   └── expressions.json   # 큐레이션 표현 목록
    ├── generate-content-batch.js
    ├── generate-images-batch.js
    └── validate-content.js
```

## 개발 실행

```bash
# 백엔드
cd Product/apps/backend && pnpm start

# 모바일 앱
cd Product/apps/mobile && pnpm start
```

## 콘텐츠 파이프라인 (배치 생성)

```bash
cd scripts

# 1. 표현 목록 기반으로 스토리/의미 생성 → Supabase 저장
node generate-content-batch.js

# 2. DB 스토리 기반으로 이미지 생성 → Supabase Storage 업로드
node generate-images-batch.js

# 3. 생성된 콘텐츠 품질 검증
node validate-content.js
```

## 환경변수

**`Product/apps/backend/.env`**
```
GEMINI_API_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
ALLOWED_ORIGINS=http://localhost:8081
```

**`scripts/.env`** (배치 생성 전용)
```
GEMINI_API_KEY=...
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**`Product/apps/mobile/.env`**
```
EXPO_PUBLIC_API_BASE_URL=http://localhost:8787
```

## Claude Code 작업 규칙
- 코드 수정 전 반드시 해당 파일 Read
- 새 파일 생성 최소화 — 기존 파일 편집 우선
- 배치 스크립트 실행 전 `scripts/.env` 확인 요청
- Supabase 스키마 변경은 `supabase/migrations/` 에 SQL 파일로 관리
- 커밋은 명시적 요청 시에만
