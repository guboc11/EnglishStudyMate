# PLAN_CONTENT3 — 이미지 생성 + Supabase Storage 업로드

**전제조건:** SUPABASE1 완료 + CONTENT1 완료 (+ CONTENT2 완료 권장)
**후속 플랜:** 없음

---

## 목적

`scripts/generate-images-batch.js`를 수정해 step2/step3 이미지를 생성한 후
Supabase Storage 버킷에 자동 업로드한다.

---

## 수정 파일 목록

| 파일 | 작업 |
|------|------|
| `scripts/generate-images-batch.js` | 수정 (Storage 업로드 로직 추가) |

---

## 환경변수 확인

`scripts/.env`에 아래 항목이 있어야 한다:
```
GEMINI_API_KEY=...
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Supabase Storage 버킷 설정

- 버킷명: `images`
- 경로 규칙: `images/{bundleId}/{step}.png`
  - 예: `images/a-birds-eye-view_abc12345/step2.png`
- 공개 읽기: 버킷을 Public으로 설정하거나 Policy 설정

Supabase Dashboard → Storage → `images` 버킷 생성 (없으면 신규):
```
Bucket name: images
Public: true
```

---

## 수정 내용 명세

### `scripts/generate-images-batch.js`

**현재 동작:**
1. `listBundlesWithoutImages()` → 이미지 없는 번들 목록 수집
2. 각 번들별 Gemini Image API 호출 → base64 이미지 생성
3. 로컬 파일 저장 (또는 저장 안 함)

**수정 후 동작:**
1. `listBundlesWithoutImages()` → 이미지 없는 번들 목록 수집
2. 각 번들별 step2, step3 순서로:
   a. Gemini Image API 호출 → base64 이미지 수신
   b. base64 → Buffer 변환
   c. `uploadImage(bundleId, step, buffer, 'image/png')` 호출
   d. 업로드 성공 → 로그: `[✓] {bundleId}/{step} 업로드 완료`
   e. 업로드 실패 → 로그: `[✗] {bundleId}/{step} 실패: {error}` (계속 진행)
3. 전체 완료 후 집계 출력:
   ```
   step2: 성공 {n}개, 실패 {m}개
   step3: 성공 {n}개, 실패 {m}개
   ```

---

## 이미지 생성 API 파라미터 (참조)

Gemini Image 호출 시 전달하는 프롬프트 구성:
- expression: 표현 문자열
- story: step2 또는 step3 스토리 텍스트
- pageKey: 'step2' | 'step3'

기존 `scripts/lib/geminiImage.js` (또는 유사 파일)의 함수 재사용.

---

## 실행 방법

```bash
cd scripts
node generate-images-batch.js
```

2,000개 × 2 step = 4,000개 이미지 기준 소요 시간: 수 시간 (rate limit에 따라 다름)
야간 배치 실행 권장.

---

## 검증

1. Supabase Dashboard → Storage → `images` 버킷
2. `{bundleId}/step2.png`, `{bundleId}/step3.png` 파일 확인
3. 파일 클릭 → 이미지 미리보기 정상 확인
4. 앱에서 imageUrl이 Supabase Storage URL로 반환되는지 확인
