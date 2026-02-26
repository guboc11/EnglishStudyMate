# 마케팅 플랜 — Korean World 시장 반응 검증

> **이 문서의 목적**
> 제품을 완성하기 전에 "팔릴 수 있는가"를 확인하는 최소한의 행동 계획.
> 돈과 팀 없이, 빠르게, 진짜 사람들의 반응을 이끌어내기 위한 단계별 액션 플랜.
>
> **작성일**: 2026-02-27
> **현재 상태**: 랜딩 페이지 + v2 프로토타입 완성, Formspree 이메일 수집 연결됨

---

## Google Analytics 지금 달아야 하나?

**결론: 지금 달아야 한다. 내일 첫 게시물 올리기 전에.**

이유는 단순해. 내일부터 사람들을 랜딩 페이지로 보낼 건데,
아무 측정 도구 없이 보내면 "몇 명이 봤는지"만 알고 끝이다.
GA4(Google Analytics 4)를 달면 알 수 있는 것들:

- 몇 명이 들어왔고, 어디서 왔고 (Reddit? Twitter? 직접 검색?)
- 얼마나 오래 머물렀는지
- 어느 섹션에서 떠났는지 (랜딩 최적화에 필수)
- 프로토타입 버튼을 눌렀는지

이 데이터가 나중에 Hashed VibeLabs 지원이나 창업 지원 피치에서
**"전환율 X%, 평균 체류 X분"** 숫자로 쓰인다.

**설정 시간**: 약 30분
**비용**: 무료

> 설정 순서 (간단 요약):
> 1. analytics.google.com 접속 → 계정 + 속성 생성 (속성명: Korean World)
> 2. 측정 ID 발급 (G-XXXXXXXXXX 형태)
> 3. `landing-pages/index.html` 또는 Vite 설정에 스크립트 추가
> 4. 배포 후 실시간 탭에서 접속 확인

---

## 오늘 밤 할 것 딱 하나

**Google Analytics 4 세팅 + 배포**

마케팅 시작 전에 측정 도구를 먼저 달아야 한다.
내일부터 올리는 모든 게시물의 효과를 측정할 수 있어야 하니까.
자기 전에 이것만 해두면 내일 행동이 훨씬 의미 있어진다.

---

## Tier 1 — 필수, 이번 주 안에

이 중 하나라도 안 하면 반응을 볼 수 없다.

---

### 1. Reddit 게시물 (가장 중요)

**왜**: 한국어 학습자가 가장 많이 모여있는 곳. 진짜 타겟이 지금 거기 있다.

**올릴 커뮤니티**

| 서브레딧 | 멤버 수 | 특징 |
|---|---|---|
| r/Korean | 35만+ | 한국어 학습자 핵심 커뮤니티 |
| r/learnkorean | 15만+ | 입문자 많음 |
| r/languagelearning | 100만+ | 더 넓은 언어 학습자 커뮤니티 |

**어떻게 올리나**

직접 홍보 글은 스팸으로 걸린다. 이 형식이 훨씬 효과적이다:

```
제목: I built an immersive Korean learning experience where you
      "arrive in Korea" knowing nothing — want honest feedback?

내용:
I've been frustrated that every Korean learning app feels like
homework — drills, points, streaks — but never actually
prepares you for real conversations.

So I built something different: you arrive in a world where
everyone speaks Korean. No subtitles. No English menus.
You need to get a job, pay rent, and make friends —
all in Korean.

The AI characters have real personalities. If you ignore them,
they leave. Your boss calls you in Korean.

It's a prototype right now. I'd love honest feedback from
people actually learning Korean.

[링크]

What do you think? Is this something you'd actually use?
```

> **핵심 포인트**: "피드백 원한다"는 프레임이 중요하다.
> "사세요"가 아니라 "써보고 의견 주세요"가 훨씬 반응이 좋다.
> 사람들은 자기 의견을 말하고 싶어한다.

---

### 2. Twitter / X 게시물

**왜**: K-팝·K-드라마 팬 커뮤니티가 X에 크게 있다. 바이럴 가능성도 있다.

**형식**: 짧고 강렬하게. 프로토타입 화면 캡처 1-2장 첨부.

```
You just arrived in a world where everyone speaks Korean.
No subtitles. No English menus. No shortcuts.

Get a job. Pay rent. Make friends.
All in Korean.

This is how I think Korean should be learned 🇰🇷

[링크] — feedback welcome, still building

#LearnKorean #Kpop #Kdrama #languagelearning
```

**해시태그 전략**: #LearnKorean #Kpop #Kdrama #languagelearning #Korean

---

### 3. Product Hunt "Coming Soon" 등록

> **Product Hunt**: 새로운 앱·서비스를 공유하는 플랫폼.
> 여기 등록하면 "관심 있어요" 구독자를 모을 수 있고,
> 정식 출시 때 알림을 받게 된다.
> 런칭 당일 랭킹에 따라 수천 명 노출도 가능.

지금 당장 "Coming Soon" 페이지를 등록해두면
**런칭 전부터 구독자**를 모을 수 있다.
이 숫자 자체가 투자자·지원서에 쓰이는 트랙션이다.

> 등록 경로: producthunt.com → "Submit" → "Upcoming"

---

### 4. IndieHackers 게시물

> **IndieHackers**: 1인 창업자·소규모 팀이 자신의 프로젝트를 공유하는 커뮤니티.
> "나 이거 만들고 있어요, 반응 어떠세요?" 형식의 글이 잘 받아들여진다.
> 창업 관련 커뮤니티라 피드백 품질도 높다.

Reddit이 "타겟 유저"를 향한 거라면,
IndieHackers는 "같은 처지의 창업자들"로부터 피드백과 조언을 받는 곳.

---

## Tier 2 — 추가, 2주 안에

기본 반응이 확인되면 다음 단계로 이동.

---

### 5. TikTok / Instagram Reels 짧은 영상

지금 이 앱을 가장 좋아할 사람들이 어디 있냐면 **K-드라마 팬 TikTok**이다.
텍스트 게시물보다 영상이 훨씬 빠르게 퍼진다.

**영상 아이디어 (30초)**
- 화면 레코딩으로 랜딩 페이지 + 채팅 프로토타입 데모
- 내레이션: "What if learning Korean felt like actually living in Korea?"
- 끝에 링크 표시

**별도 장비 불필요**. 폰으로 화면 녹화 + 자막만으로 충분.

---

### 6. 한국어 학습 Discord 서버들

Reddit 다음으로 큰 커뮤니티. 직접 채팅방에 링크 올리기보다
서버 내 `#projects` 또는 `#share-your-work` 채널에 올리는 게 자연스럽다.

주요 서버: Korean Study Group, Language Learning Discord 등

---

### 7. LinkedIn 게시물 (Hashed VibeLabs 지원 연결)

> Hashed VibeLabs 지원을 고려한다면, LinkedIn이 특히 중요하다.
> 한국 스타트업 생태계 관계자들이 LinkedIn에서 활동한다.

**형식**: 개인 스토리 + 서비스 소개 + 링크

```
I've been learning Korean for a while, and every app
I tried felt like homework — not real Korean.

So I built something different...
[스토리 + 링크]

Would love to connect with anyone in the Korean
ed-tech or language learning space.
```

---

## 무엇을 측정할 것인가

반응을 "느낌"으로 측정하면 안 된다. 숫자로 봐야 한다.

| 지표 | 측정 방법 | 의미 |
|---|---|---|
| 랜딩 페이지 방문자 수 | Google Analytics | 관심이 있는가 |
| 평균 체류 시간 | Google Analytics | 읽고 있는가 (30초 이상이면 좋음) |
| 이메일 등록 수 | Formspree 대시보드 | 돈 낼 의향이 있는가 |
| 방문 → 이메일 전환율 | 방문자 / 이메일 수 | 설득력이 있는가 (1-3%면 보통, 5%+ 좋음) |
| 프로토타입 클릭률 | GA 이벤트 추적 | 체험하러 들어가는가 |
| Reddit 댓글 / 업보트 | Reddit 직접 확인 | 공감하는가 |

> **전환율 (Conversion Rate)**: 방문자 중 실제로 원하는 행동(이메일 등록, 구매)을 한 비율.
> 100명 방문 → 3명 이메일 등록이면 전환율 3%.

---

## 핵심 메시지 — 어디서나 일관되게

어느 플랫폼에 올리든, 이 메시지를 중심으로:

> **"Duolingo teaches you Korean. This makes you live in it."**

한국어로 쓸 때:
> **"앱으로 배우지 말고, 세계에서 살아라."**

**무조건 피해야 할 말들**:
- "혁신적인 AI 언어 학습 플랫폼" → 너무 뻔하다
- "최첨단 기술" → 아무도 신경 안 쓴다
- "빠르게 한국어 마스터" → 다들 하는 말이다

**써야 할 말들**:
- 구체적인 시나리오 ("당신의 상사가 한국어로 전화를 겁니다")
- 감정적 공감 ("Duolingo 3개월 했는데 드라마 아직도 못 알아들어요?")
- 솔직함 ("아직 만들고 있어요, 피드백 원해요")

---

## 오늘 밤 → 내일 → 이번 주 체크리스트

```
오늘 밤
□ Google Analytics 4 계정 생성 + 측정 ID 발급
□ 랜딩 페이지에 GA 스크립트 추가 + 배포
□ GA 실시간 탭에서 본인 접속 확인

내일 오전
□ Reddit r/Korean 게시물 작성 + 올리기
□ Reddit r/learnkorean 게시물 올리기 (내용 조금 다르게)
□ Twitter/X 게시물 올리기 (스크린샷 첨부)

내일 오후
□ Product Hunt Coming Soon 등록
□ IndieHackers 게시물

이번 주 안에
□ 댓글/반응 모두 답변 (커뮤니티 신뢰 쌓기)
□ 첫 이메일 등록자 수 확인
□ GA 데이터 첫 리뷰 (어디서 왔는가, 얼마나 머물렀는가)

2주 안에 (반응 있을 경우)
□ TikTok/Reels 데모 영상 1개
□ LinkedIn 게시물
□ 한국어 Discord 서버들
```

---

## 반응 기준 — 언제 "됐다"고 볼 것인가

| 반응 수준 | 기준 | 다음 행동 |
|---|---|---|
| 🔴 반응 없음 | 이메일 0-2개, 댓글 없음 | 메시지 바꿔서 다시 시도 |
| 🟡 약한 반응 | 이메일 3-10개, 긍정적 댓글 | 타겟·메시지 조정 후 계속 |
| 🟢 반응 있음 | 이메일 10-30개, "언제 출시해요?" | 지금 방향 맞음, 밀어붙이기 |
| 🚀 강한 반응 | 이메일 30개+, 바이럴 조짐 | 즉시 Product Hunt 풀 론칭 준비 |

> **중요**: 반응이 없어도 실패가 아니다. 메시지가 틀린 것이다.
> 타겟, 채널, 문구를 바꿔서 다시 시도하면 된다.
> 반응이 나올 때까지 반복하는 게 초기 마케팅의 전부다.
