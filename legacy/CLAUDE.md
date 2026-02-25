# EnglishStudyMate — CLAUDE.md

## 프로젝트 개요
영어 표현 맥락 학습 앱. 번역 암기 대신 AI 생성 스토리/이미지로 반복 맥락 노출.
구현 상세, 로드맵, 타입 명세 → `PLAN.md` 참고.

## 아키텍처
- **콘텐츠 파이프라인**: 오프라인 배치 생성 → Supabase 저장 → 앱 조회 (실시간 AI 호출 없음)
- **Mobile**: React Native + Expo (`Product/apps/mobile`)
- **Backend**: Node.js + Express (`Product/apps/backend`) — Supabase 조회 API 제공
- **DB**: Supabase (PostgreSQL + Storage)
- **AI (배치 전용)**: Gemini 2.0 Flash (텍스트), Gemini 2.5 Flash Image (이미지)

## 폴더 구조
```
EnglishStudyMate/
├── CLAUDE.md
├── PLAN.md              # 구현 계획 및 상세 명세
├── Foundation/          # 미션/전략/원칙 문서
├── Execution/Plans/     # 제품 스펙
├── Product/
│   ├── apps/
│   │   ├── mobile/      # Expo 앱
│   │   └── backend/     # Express API
│   └── docs/            # 기술 스펙
└── scripts/             # 콘텐츠 배치 생성 CLI 도구
```

## 개발 실행

```bash
# 백엔드
cd Product/apps/backend && pnpm start

# 모바일 앱
cd Product/apps/mobile && pnpm start
```

## 콘텐츠 파이프라인

```bash
cd scripts
node generate-content-batch.js   # 스토리/의미 생성
node generate-images-batch.js    # 이미지 생성 → Supabase Storage
node validate-content.js         # 품질 검증
node upload-bundles.js           # 로컬 번들 → Supabase DB 업로드
```

## 환경변수

**`Product/apps/backend/.env`**
```
GEMINI_API_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
ALLOWED_ORIGINS=http://localhost:8081
```

**`scripts/.env`**
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

**필수 행동 규칙**
- 코드 수정 전 반드시 해당 파일 Read
- 새 파일 생성 최소화 — 기존 파일 편집 우선
- 배치 스크립트 실행 전 `scripts/.env` 확인 요청
- Supabase 스키마 변경은 `supabase/migrations/` 에 SQL 파일로 관리
- 커밋은 명시적 요청 시에만

**판단 및 명세 규칙**
- 논리적 공백이 있거나 결정해야 할 사항이 있으면 섣불리 판단하지 않고 반드시 먼저 질문할 것
- 파일명·함수명·파라미터 타입·리턴 타입까지 명세가 완전히 작성된 후에만 코드 작성 가능
