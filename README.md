# EnglishStudyMate

인지/기억/학습 원리에 기반한 영어 표현 학습 서비스를 만드는 프로젝트다. 현재는 문서 중심으로 방향성과 초기 설계만 정의된 상태이며, 곧 `Product/`에서 실제 구현을 시작한다.

## Current State
- Direction(미션/원칙) 문서 완료
- Strategy(Goal/Focus/Success Metrics) 문서 완료
- Operating Model 초안 정리(Planner/Developer/Workers 협업)
- UI 제품/기술 스펙 정의(`Execution/Plans/UI_PROTO_SPEC.md`, `Product/docs/UI_PROTO_TECH_SPEC.md`)
- 코드/앱/백엔드 구현은 아직 시작 전

## Architecture Decisions (MVP)
- UI: React Native + Expo
- Backend: Go(추후 연결); 초기 단계에서는 필요 시점까지 보류
- AI Generation: OpenAI API Key 사용
- Data 공급 전략: 인터페이스 우선 → 1단계 파일 기반 mock provider → 2단계 파일 백엔드 → 3단계 Go API 교체. UI는 동일 함수 계약을 사용해 API 전환 시 변경 최소화.

## Collaboration Model
- Planner (AI): 목표·의존성 정의, 작업 티켓 작성/정렬, 스케줄 관리
- Developer (human, senior): 기술 의사결정, 티켓 수행/분배, 품질 책임
- Workers (AI, 2명): 주니어 개발자로 병렬 구현/리팩토링/테스트
- 사이클: Planner가 티켓·순서 제시 → Developer가 수행/분배 → Workers 병렬 작업 → Developer 통합/리뷰 → Planner에 진행/리스크 보고 후 보드 재정렬

## Folder Guide (현재 존재하는 항목 기준)
- `Foundation/`
  - `direction/`: 미션, 원칙
  - `Strategy/`: 목표/집중/비집중/지표
  - `OperatingModel/`: 협업·운영 모델(`OPERATING_MODEL.md`)
- `Execution/`
  - `Plans/`: 제품/UI 스펙 문서
- `Product/`
  - `docs/`: 제품/기술 스펙(현재 UI 프로토 테크 스펙만 존재)
  - (예정) `apps/mobile/` React Native 앱, `services/api/` Go 백엔드, `packages/` 계약·공유 모듈, `data/mock/` 파일 기반 데이터, `scripts/` 개발 스크립트

## Working Convention (Short)
1. 모든 작업은 작업 티켓으로 추적하고 의존성은 Planner가 명시한다.
2. 변경은 가급적 `Product/`에서 수행하되, 규칙/원칙 변경 시 `Foundation/`을 갱신한다.
3. 사이클마다 결과를 통합하고, 결정·리스크는 티켓 코멘트나 문서에 기록한다.

## Next Steps
- `Product/apps/mobile/`에 Expo 초기 세팅 및 화면 스캐폴드 생성
- `Product/docs/` 명세에 맞춰 파일 기반 mock provider 인터페이스 설계
- Stage 1(하드코딩) → Stage 2(파일 기반) → Stage 3(Go API 연동) 순으로 진화
