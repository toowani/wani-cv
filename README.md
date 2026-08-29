# WANI.SYS — half on land, half in water

악어(wani)처럼 땅(학업)과 물(음악) 두 세계를 오가는 컨셉의 글리치 포트폴리오(이력서/CV). 순수 HTML/CSS/JS로 빌드 도구 없이 GitHub Pages에 바로 배포됩니다. 모든 핸들: @toowani.

`cv.toowani.com`에서 서비스됩니다. 프로젝트 허브(`toowani.com`)는 별도 저장소(`toowani.github.io`)입니다.

## 파일 구조

```
index.html          페이지 뼈대 (부팅 오버레이 / HUD / 랜딩 / 콘텐츠 영역)
css/style.css       스타일 전체 (모드별 네온 팔레트, 글리치, 반응형, FX 레벨)
js/data.js          ★ 콘텐츠 데이터 — 이 파일만 고치면 내용이 바뀝니다
js/engine.js        배경 캔버스 엔진 (매트릭스/파티클/스펙트럼 + Web Audio 분석)
js/main.js          부팅 시퀀스, 모드/언어/FX 전환, 스크롤 연출
assets/audio/       track.mp3 를 넣으면 오디오 반응형 비주얼 활성화
```

## 이력서 PDF 재생성

`assets/resume_wani.pdf`는 `scripts/make_resume.py`로 생성됩니다. 사이트 내용(js/data.js)을 수정했다면 스크립트도 맞춰 고친 뒤 재실행하세요:

```
pip install reportlab koreanize-matplotlib
python scripts/make_resume.py
```

## 도메인

`index.html`의 og:url·JSON-LD url, `robots.txt`의 Sitemap 주소, `sitemap.xml`의 loc은 모두 `https://cv.toowani.com/`로 설정되어 있습니다. 저장소 Settings → Pages → Custom domain에 `cv.toowani.com`을 입력하고, Cloudflare DNS에 해당 CNAME 레코드를 추가하면 배포됩니다.

## 이스터에그

홈 화면에서 좌측 상단 WANI.SYS 로고를 빠르게 3번 클릭 → 악어 미로 게임 「WANI MAZE」 (매 판 랜덤 미로, 칩튠 BGM, 최고점수 저장)

## 콘텐츠 교체 방법

`js/data.js`를 열어 `[교체]` / `[replace]` 표시가 있는 값을 실제 내용으로 바꾸면 됩니다. 모든 텍스트는 `{ ko: "...", en: "..." }` 형태로 한국어/영어를 같이 가집니다. 링크 URL(`your-id` 부분)도 잊지 말고 교체하세요.

## 로컬에서 보기

브라우저에서 `index.html`을 바로 열어도 되지만, 오디오 기능까지 확인하려면 간단한 서버로 여세요:

```
python3 -m http.server 8000
# → http://localhost:8000
```

## GitHub Pages 배포

1. GitHub에 새 저장소 생성 (예: `wani-portfolio` 또는 `<username>.github.io`)
2. 이 폴더 전체를 push:
   ```
   git init
   git add .
   git commit -m "launch WANI.SYS"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   ```
3. 저장소 Settings → Pages → Source를 `main` 브랜치 `/ (root)`로 설정
4. Settings → Pages → Custom domain에 `cv.toowani.com` 입력, Cloudflare DNS에 CNAME 레코드 추가 후 접속 가능

빌드 과정이 없으므로 GitHub Actions는 필요 없습니다.

## 기능 요약

- **수면 분할 랜딩**: 화면 위쪽=땅(DEV_WANI, 라임/앰버), 아래쪽=물(ARTIST_WANI, 시안/딥블루). 중앙의 수면 웨이브가 마우스에 반응해 출렁이고, ASCII 악어가 수면에 걸쳐 있음. 각 영역 클릭으로 모드 진입, 우측 상단 ⇄ 버튼으로 전환, 로고 클릭 시 랜딩 복귀
- **마우스 중심 인터랙션**: 파티클 떼가 물고기처럼 커서를 따라 유영. 떨어지는 모션 없음
- **중앙정렬 레이아웃**: 섹션 제목·카드·타임라인·링크 모두 중앙 기준 (터미널 박스 내부 텍스트만 가독성 위해 좌측)
- **KO/EN**: 우측 상단 버튼으로 언어 전환 (선택은 저장됨)
- **오디오 반응**: `assets/audio/track.mp3` 존재 시 ▶ AUDIO로 재생 → 파티클 속도·스펙트럼 바·수면 파고가 실제 음악 진폭/주파수에 반응. 파일이 없으면 잔잔한 기본 애니메이션
- **FX 레벨**: FX:HIGH → LOW → OFF 순환. LOW는 노이즈 제거·파티클 감소, OFF는 모든 모션 정지. `prefers-reduced-motion` 사용자는 자동으로 OFF 시작
- **성능**: 단일 rAF 루프, DPR 1.5 상한, 탭 비활성 시 정지, 파티클 수 화면 크기 비례
