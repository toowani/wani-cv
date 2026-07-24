/* ============================================================
   WANI.SYS — CONTENT DATA
   이 파일만 수정하면 사이트의 모든 콘텐츠가 바뀝니다.
   각 항목은 { ko: "...", en: "..." } 형태로 한국어/영어를 함께 가집니다.
   모든 핸들: @toowani (too + wani — "완전 나답게")
   ============================================================ */

const SITE_DATA = {

  /* ---------- UI 라벨 ---------- */
  ui: {
    ko: {
      switchMode: "모드 전환",
      landingEyebrow: "// KIM CHANGWAN — GIST EECS × ELECTRONIC MUSIC",
      devCardDesc: "GIST 전기전자컴퓨터공학 — ML/DL · AI 연구",
      artistCardDesc: "힙합 베이스 전자음악 · 하이퍼팝 프로듀서",
      enter: "[ ENTER ]",
      landTag: "▲ DEV",
      waterTag: "▼ MUSIC",
      footerNote: "이 사이트는 GitHub Pages에서 구동됩니다",
      audioHint: "상단 <b>▶ AUDIO</b> — 자작 트랙 재생. 배경 비주얼이 오디오 신호에 반응.",
      landingId: "김창완 KIM CHANGWAN · GIST 전기전자컴퓨터공학 · @toowani",
      waniNote: "<b>wani</b> [와니]<br>① 일본어로 '악어(わに, ワニ)'.<br>② 김창완의 별명 — 이름의 '완'에서.<br>③ 땅과 물을 오가는 악어처럼, 개발과 음악을 오간다.",
      crossToArtist: "음악 작업 보기 — ART_WANI",
      crossToDev: "개발·연구 보기 — R&D_WANI",
      crossDive: "▼ ARTIST MODE",
      crossSurface: "▲ DEV MODE",
      mapHint: "[ <b>WANI</b>를 누르면 → LIFE MAP ]",
      jyLand: "▲ DEV",
      jyWater: "▼ MUSIC · VISUAL",
      jyHint: "스크롤 ↓ 2022 → NOW",
      jyStart: "START · 2022",
      jyNow: "NOW",
    },
    en: {
      switchMode: "SWITCH MODE",
      landingEyebrow: "// KIM CHANGWAN — GIST EECS × ELECTRONIC MUSIC",
      devCardDesc: "GIST EECS — ML/DL · AI research",
      artistCardDesc: "hip-hop bass electronic · hyperpop producer",
      enter: "[ ENTER ]",
      landTag: "▲ DEV",
      waterTag: "▼ MUSIC",
      footerNote: "This site runs on GitHub Pages",
      audioHint: "Top <b>▶ AUDIO</b> — plays an original track. Background visuals react to the audio signal.",
      landingId: "KIM CHANGWAN · GIST EECS · @toowani",
      waniNote: "<b>wani</b> [wǎ:ni]<br>① Japanese for 'crocodile' (わに, ワニ).<br>② Changwan's nickname — from the 'wan' in his name.<br>③ Like a crocodile crossing land and water, he crosses research and music.",
      crossToArtist: "Music work — ART_WANI",
      crossToDev: "Dev & research — R&D_WANI",
      crossDive: "▼ ARTIST MODE",
      crossSurface: "▲ DEV MODE",
      mapHint: "[ TAP <b>WANI</b> → LIFE MAP ]",
      jyLand: "▲ DEV",
      jyWater: "▼ MUSIC · VISUAL",
      jyHint: "SCROLL ↓ 2022 → NOW",
      jyStart: "START · 2022",
      jyNow: "NOW",
    },
  },

  /* ---------- 티커 문구 ---------- */
  ticker: {
    dev:    "R&D_WANI :: GIST EECS :: ML/DL · AI RESEARCH :: KAIST → UC BERKELEY :: @toowani :: ",
    artist: "ART_WANI :: HIPHOP BASS · HYPERPOP :: VORTEX CRACK — IN PROGRESS :: @toowani :: ",
    journey: "LIFE.MAP :: 2022 → NOW :: DEV × MUSIC :: @toowani :: ",
    none:   "WANI.SYS :: GIST EECS × ELECTRONIC MUSIC :: SELECT MODE :: @toowani :: ",
  },

  /* ============================================================
     DEV MODE — 땅 위의 wani (학업)
     ============================================================ */
  dev: {
    intro: {
      ko: [
        "$ whoami",
        "김창완 — GIST 전기전자컴퓨터공학과 3학년",
        "$ cat interests.txt",
        "ML/DL · AI 연구 · 오디오 AI",
        "$ echo $HANDLE",
        "@toowani  <span class='dim'># 모든 플랫폼 동일 핸들</span>",
      ],
      en: [
        "$ whoami",
        "Changwan Kim — Junior, EECS @ GIST",
        "$ cat interests.txt",
        "ML/DL · AI research · audio AI",
        "$ echo $HANDLE",
        "@toowani  <span class='dim'># same handle everywhere</span>",
      ],
    },

    sections: [
      {
        id: "exchange",
        title: { ko: "학점교류", en: "EXCHANGE" },
        ghost: "EXCHANGE",
        type: "list",
        items: [
          {
            year: { ko: "2026.06 – 08 · 진행 중", en: "2026.06 – 08 · in progress" },
            title: { ko: "UC Berkeley 학점교류", en: "UC Berkeley Exchange" },
            sub: "Berkeley, CA · 8 weeks",
            desc: {
              ko: "여름 학기 8주 과정으로 CS70(이산수학·확률)과 CS188(인공지능)을 수강 중.",
              en: "8-week summer session — currently taking CS70 (Discrete Math & Probability) and CS188 (Artificial Intelligence).",
            },
            tags: ["CS70", "CS188", "AI"],
          },
          {
            year: "2023.06 – 07",
            title: { ko: "KAIST 몰입캠프", en: "KAIST Immersion Camp" },
            sub: { ko: "프로그래밍과 스타트업 · 4 weeks", en: "Programming & Startup · 4 weeks" },
            desc: {
              ko: "4주간 매주 새로운 기술 스택으로 총 4개 프로젝트 완수 — Android/Java 연락처·갤러리 앱, Node.js+MongoDB 익명 게시판 '몰브리타임'(Google OAuth 2.0), React+WebSocket 캠퍼스 지도 서비스, Unity/C# 리듬게임 'Feel My Rhythm'.",
              en: "Shipped 4 projects in 4 weeks, each with a new stack — Android/Java contacts & gallery app, Node.js+MongoDB anonymous board 'Molbritime' (Google OAuth 2.0), React+WebSocket campus map with live chat, and Unity/C# rhythm game 'Feel My Rhythm'.",
            },
            tags: ["Android", "Node.js", "React", "Unity"],
          },
        ],
      },
      {
        id: "coursework",
        title: { ko: "핵심 과목", en: "COURSEWORK" },
        ghost: "MAP",
        type: "timeline",
        items: [
          {
            year: "1-1",
            title: { ko: "2022 · 봄학기", en: "2022 · Spring" },
            desc: { ko: "미적분학과 응용", en: "Calculus and Applications" },
          },
          {
            year: "1-2",
            title: { ko: "2022 · 가을학기", en: "2022 · Fall" },
            desc: {
              ko: "컴퓨터 음악 만들기 · 컴퓨터 프로그래밍 · 다변수해석학과 응용 · AI와 나 · 수학의 위대한 순간들 - AI",
              en: "Making Computer Music · Computer Programming · Multivariable Calculus and Applications · AI and Me · Great Moments in Mathematics — AI",
            },
          },
          {
            year: "2-1",
            title: { ko: "2023 · 봄학기", en: "2023 · Spring" },
            desc: {
              ko: "자료 구조 · 디지털 설계 · 선형대수학과 응용 · 문명과 수학",
              en: "Data Structures · Digital Design · Linear Algebra and Applications · Civilization and Mathematics",
            },
          },
          {
            year: "2-여름",
            title: { ko: "2023 · 여름학기 (KAIST 학점교류)", en: "2023 · Summer (KAIST Exchange)" },
            desc: { ko: "KAIST 몰입캠프 — 프로그래밍과 스타트업", en: "KAIST Immersion Camp — Programming & Startup" },
          },
          {
            year: "2-2",
            title: { ko: "2023 · 가을학기", en: "2023 · Fall" },
            desc: {
              ko: "디지털 유니버스 콜로퀴움 · 알고리즘 개론 · (MOOC) 기계학습을 위한 수학: 선형대수학 · (MOOC) 알고리즘 기반 논리적 사고(기초·심화) · (MOOC) 프론트엔드 웹 개발",
              en: "Digital Universe Colloquium · Introduction to Algorithms · (MOOC) Math for ML: Linear Algebra · (MOOC) Algorithmic Logical Thinking (Basic & Advanced) · (MOOC) Frontend Web Development",
            },
          },
          {
            year: "GAP",
            title: { ko: "2024.03 – 2025.12", en: "2024.03 – 2025.12" },
            desc: { ko: "대한민국 공군 복무 (만기전역) — 휴학", en: "ROK Air Force service (honorable discharge) — academic leave" },
          },
          {
            year: "3-1",
            title: { ko: "2026 · 봄학기", en: "2026 · Spring" },
            desc: {
              ko: "딥러닝 · 사운드 디자인과 프로그래밍 · 기초공학수학 Ⅰ · 컴퓨터 시스템 이론 및 실험 · 오토마타 이론",
              en: "Deep Learning · Sound Design and Programming · Engineering Mathematics I · Computer Systems Theory and Lab · Automata Theory",
            },
          },
          {
            year: "3-여름",
            title: { ko: "2026 · 여름학기 (UC Berkeley 학점교류 · 진행 중)", en: "2026 · Summer (UC Berkeley Exchange · in progress)" },
            desc: { ko: "CS70 이산수학 · CS188 인공지능", en: "CS70 Discrete Mathematics · CS188 Artificial Intelligence" },
          },
        ],
      },
      {
        id: "ml",
        title: { ko: "AI / ML", en: "AI / ML" },
        ghost: "MACHINE",
        type: "list",
        items: [
          {
            year: "2023.09 – 11",
            title: { ko: "Google ML Bootcamp 4기", en: "Google ML Bootcamp #4" },
            sub: "Google for Developers",
            desc: {
              ko: "구글 머신러닝 부트캠프 4기 선발. 이론 교육·실습·커뮤니티가 집약된 3개월 과정으로, Kaggle 대회에서 실데이터를 다루고 모각코·스터디 그룹에서 동료들과 협업하며 ML 실무 역량을 쌓음.",
              en: "Selected for Google ML Bootcamp #4 — a 3-month program of theory, practice and community. Competed on Kaggle with real data and collaborated in study groups.",
            },
            tags: ["TensorFlow", "Kaggle"],
          },
          {
            year: "2023.09 – 10",
            title: { ko: "Deep Learning Specialization 수료", en: "Deep Learning Specialization" },
            sub: "DeepLearning.AI · Coursera",
            desc: {
              ko: "앤드류 응 교수의 딥러닝 특화과정 5개 코스 전 과정 수료(대부분 90% 이상). 심층 신경망 구축, 하이퍼파라미터 튜닝, CNN 이미지 처리, RNN/LSTM 시퀀스 모델까지 직접 구현.",
              en: "Completed all 5 courses of Andrew Ng's specialization (90%+ in most). Built deep networks, tuned hyperparameters, and implemented CNNs and RNN/LSTM sequence models.",
            },
            tags: ["CNN", "RNN/LSTM", "Coursera"],
            link: { url: "https://coursera.org/verify/specialization/XFZNKQJ38BYF", label: { ko: "수료증 확인", en: "Verify certificate" } },
          },
        ],
      },
      {
        id: "startup",
        title: { ko: "창업", en: "STARTUP" },
        ghost: "BUILD",
        type: "list",
        items: [
          {
            year: "2023.05 – 11",
            title: { ko: "CRAVE — 기술팀 대표", en: "CRAVE — Tech Lead" },
            sub: { ko: "창업동아리", en: "Startup club" },
            desc: {
              ko: "공항 이용객을 위한 '캐리어 운반 전동 스쿠터'를 설계하고 MVP 제작. 비개발자를 위한 드래그 앤 드롭 '포트폴리오 웹페이지 커스텀 서비스'를 기획하고 개발 정기스터디를 운영.",
              en: "Designed and built an MVP of a luggage-carrying electric scooter for airports, and planned a drag-and-drop portfolio-website builder for non-developers while running a dev study group.",
            },
            tags: ["Hardware", "MVP", "Web"],
          },
          {
            year: "2022.06 – 2023.05",
            title: { ko: "편한가슴 — 기술팀", en: "Pyeonhangaseum — Tech" },
            sub: { ko: "사용자 맞춤 보정 속옷", en: "Custom-fit underwear startup" },
            desc: {
              ko: "획일화된 속옷 사이즈 문제를 풀기 위해 NeRF 기반 정밀 3D 사이즈 측정 기법을 연구. '2022 아이코어(I-Corps)' 사업 참가, 모두의연구소와 '3D-Reconstruction Lab'을 운영하며 논문 스터디 병행.",
              en: "Researched NeRF-based precise 3D body measurement to fix one-size-fits-all underwear. Joined I-Corps 2022 and ran a '3D-Reconstruction Lab' paper study with Modulabs.",
            },
            tags: ["NeRF", "3D Vision", "I-Corps"],
          },
        ],
      },
      {
        id: "projects",
        title: { ko: "프로젝트", en: "PROJECTS" },
        ghost: "MAKE",
        type: "list",
        items: [
          {
            year: { ko: "2026 봄학기", en: "2026 Spring" },
            title: { ko: "W.A.N.I. Project", en: "W.A.N.I. Project" },
            sub: { ko: "사운드 디자인과 프로그래밍 (CT5104)", en: "Sound Design & Programming (CT5104)" },
            desc: {
              ko: "Wider Audio Network Insights — 음악을 만들고·보이게 하고·분석하는 3부작. FL Studio와 TouchDesigner를 JUCE VST3 플러그인의 UDP/OSC 통신으로 실시간 연동해 오디오 반응 비주얼을 구현하고, 웹 버전(Canvas·Web Audio·MediaPipe 손 제스처 인식)으로 이식. 마지막으로 레퍼런스 곡과 비슷한 비트를 찾는 '타입비트 디깅 프로그램'을 개발 — Demucs v4 보컬 분리, -14LUFS 정규화, PANNs 임베딩을 ChromaDB(HNSW) 코사인 유사도로 검색 (Streamlit + FastAPI).",
              en: "Wider Audio Network Insights — make, visualize and analyze music. Linked FL Studio to TouchDesigner in real time via a JUCE VST3 plugin over UDP/OSC for audio-reactive visuals, ported it to the web (Canvas, Web Audio, MediaPipe hand gestures), then built a 'type-beat digging program' that finds beats similar to a reference track — Demucs v4 vocal separation, -14LUFS normalization, PANNs embeddings searched by cosine similarity in ChromaDB/HNSW (Streamlit + FastAPI).",
            },
            tags: ["TouchDesigner", "JUCE", "MediaPipe", "PANNs", "ChromaDB"],
          },
          {
            year: "2022.09 – 12",
            title: { ko: "비판적디자인 프로젝트", en: "Critical Design Project" },
            sub: { ko: "팀 '내이름은코난탐정이'", en: "Team 'My Name Is Detective Conan'" },
            desc: {
              ko: "소외된 사용자를 위한 3D 제작 프로젝트 — 손을 쓰지 않고 신발을 신게 돕는 'Free-hand 구두주걱'과, 시각장애 학생이 만져서 배우는 '교육용 온대저기압 촉각 모형'을 설계·제작.",
              en: "3D fabrication for overlooked users — a hands-free shoehorn for people with limited mobility, and a tactile extratropical-cyclone model for visually impaired students.",
            },
            tags: ["3D Printing", "Accessibility"],
          },
        ],
      },
      {
        id: "activities",
        title: { ko: "활동", en: "ACTIVITIES" },
        ghost: "ACTIVITY",
        type: "list",
        items: [
          {
            year: "2022.03 – 2023.02",
            title: { ko: "GIST 전산동아리 WING — AI 분과 부원", en: "GIST Computing Club WING — AI Division Member" },
            sub: { ko: "AI 정기스터디", en: "Regular AI study group" },
          },
          {
            year: "2022.09.03",
            title: { ko: "GIST 미니 해커톤 대회 드론 조교", en: "GIST Mini Hackathon — Drone TA" },
          },
          {
            year: "2022.10.28 – 29",
            title: { ko: "GIST AI+IoT Makeathon 본선 참가", en: "GIST AI+IoT Makeathon — Finalist" },
            sub: { ko: "주제: 심리 안정을 위한 감정분석 인형", en: "Theme: emotion-analysis plush toy for psychological comfort" },
          },
          {
            year: "2023.06.03 – 04",
            title: { ko: "GIST 꿈꾸는 아이 AI 새싹캠프 드론 조교", en: "GIST 'Dreaming Kids' AI Sprout Camp — Drone TA" },
          },
          {
            year: "2023.08.26",
            title: { ko: "GIST 미니 해커톤 대회 드론 조교", en: "GIST Mini Hackathon — Drone TA" },
          },
        ],
      },
      {
        id: "service",
        title: { ko: "복무 & 봉사", en: "SERVICE.LOG" },
        ghost: "DUTY",
        type: "timeline",
        items: [
          {
            year: "2024.03 – 2025.12",
            title: { ko: "대한민국 공군 만기전역", en: "ROK Air Force — Honorable Discharge" },
            desc: {
              ko: "제1전투비행단 단본부 인사행정처 · 병장 · 특기: 인사교육",
              en: "1st Fighter Wing HQ, Personnel Administration · Sergeant · Specialty: HR & Education",
            },
          },
          {
            year: "2023.08 – 10",
            title: { ko: "국립광주과학관 자원봉사 60시간", en: "Gwangju National Science Museum — 60h Volunteer" },
            desc: {
              ko: "관람객 안내·응대 담당. 어린이부터 전문가까지 눈높이에 맞춘 소통으로 과학 전시 경험을 지원.",
              en: "Visitor guidance & support — adapting explanations from kids to experts across the exhibitions.",
            },
          },
        ],
      },
      {
        id: "dev-links",
        title: { ko: "링크", en: "LINKS" },
        ghost: "CONNECT",
        type: "links",
        note: {
          ko: "모든 플랫폼 동일 핸들: @toowani<br>contact: <b>changwan@gm.gist.ac.kr</b> · kcw9151@gmail.com",
          en: "Same handle everywhere: @toowani<br>contact: <b>changwan@gm.gist.ac.kr</b> · kcw9151@gmail.com",
        },
        items: [
          { label: "GITHUB",   url: "https://github.com/toowani" },
          { label: "LINKEDIN", url: "https://linkedin.com/in/toowani" },
          { label: "EMAIL",    url: "mailto:changwan@gm.gist.ac.kr" },
          { label: "RESUME.PDF", url: "assets/resume_wani.pdf" },
        ],
      },
    ],
  },

  /* ============================================================
     ARTIST MODE — 물 속의 wani (음악)
     ============================================================ */
  artist: {
    intro: {
      ko: [
        "$ play wani.wav",
        "wani — 힙합 베이스 전자음악 · 하이퍼팝 프로듀서.",
        "FL Studio 기반. 작곡·사운드 디자인·믹스/마스터 전 과정 직접 작업.",
        "$ echo $HANDLE",
        "@toowani  <span class='dim'># 모든 플랫폼 동일 핸들</span>",
      ],
      en: [
        "$ play wani.wav",
        "wani — hip-hop bass electronic · hyperpop producer.",
        "FL Studio based. Composition, sound design, mix/master — all in-house.",
        "$ echo $HANDLE",
        "@toowani  <span class='dim'># same handle everywhere</span>",
      ],
    },

    sections: [
      {
        id: "releases",
        title: { ko: "발매 & 프로젝트", en: "RELEASES" },
        ghost: "SOUND",
        type: "tracks",
        items: [
          {
            year: { ko: "2026 – · 진행 중", en: "2026 – · in progress" },
            title: { ko: "P4L — Vortex Crack", en: "P4L — Vortex Crack" },
            sub: { ko: "P4L 정규 1집 · 광주음악창작소 뮤지션 제작지원사업", en: "P4L's debut LP · Gwangju Music Creation Center Musician Program" },
            desc: {
              ko: "10인조 힙합 크루 P4L의 정규 1집(총 9곡). 2026 광주음악창작소 뮤지션 제작지원사업에 광주 지역 공동 1위 성적으로 선정되어 앨범 제작과 타이틀곡 포함 뮤직비디오 3편 제작 지원을 받아 진행 중. 작곡·작사·편곡으로 참여.",
              en: "Debut 9-track LP from 10-member hip-hop crew P4L. Selected (tied 1st in the Gwangju region) for the 2026 Gwangju Music Creation Center musician support program — album production and 3 music videos (incl. the title track) in progress. Contributing composition, lyrics and arrangement.",
            },
            tags: ["Album", "WIP", "1st Place", "P4L"],
          },
          {
            year: "2023.03",
            title: { ko: "상상univ. 전남 Winiv music Project Part.7 IGNITION", en: "Sangsang univ. Winiv Music Project Pt.7 IGNITION" },
            sub: { ko: "EP · 3 tracks · 전 음원 플랫폼 발매", en: "EP · 3 tracks · on all streaming platforms" },
            desc: {
              ko: "GIST 힙합 동아리 이그니션 대표로 외부 기업 상상univ.와의 음원 발매 프로젝트를 총괄. 광주음악창작소 시설에서 기획–녹음–믹싱–마스터링–유통까지 전 과정을 경험하고 3곡 EP를 정식 발매.",
              en: "Led the release project with Sangsang univ. as president of GIST hip-hop club IGNITION — planning, recording, mixing, mastering and distribution at Gwangju Music Creation Center. 3-track EP on all streaming platforms.",
            },
            tags: ["EP", "Released"],
            link: { url: "https://www.youtube.com/@toowani", label: { ko: "듣기", en: "Listen" } },
          },
        ],
      },
      {
        id: "crew",
        title: { ko: "크루", en: "CREW" },
        ghost: "CREW",
        type: "tracks",
        items: [
          {
            year: "2022 –",
            title: { ko: "IGNITION", en: "IGNITION" },
            sub: { ko: "GIST 힙합 음악 동아리 · 대표", en: "GIST hip-hop music club · President" },
            desc: {
              ko: "동아리 대표로서 외부 기업·유관 기관과의 협업을 이끌고, 취미를 넘어 상업적 결과물(정식 음원 발매)로 연결하는 프로젝트들을 주도.",
              en: "As president, drove collaborations with companies and institutions — turning club activity into commercially released music.",
            },
            tags: ["Crew", "Leader"],
          },
          {
            year: "2025.09 –",
            title: { ko: "P4L (Party For Life)", en: "P4L (Party For Life)" },
            sub: { ko: "10인조 힙합 크루 · 보컬·작곡·작사·편곡", en: "10-member hip-hop crew · vocals, composition & lyrics" },
            desc: {
              ko: "2025년 9월 결성한 10인조 힙합 크루. 비트 메이킹부터 작사·녹음·믹싱까지 전 과정을 크루 내부에서 직접 제작하며, 강렬한 EDM 힙합부터 서정적인 트랙까지 폭넓은 스펙트럼을 추구. 다크 미니멀리즘 비주얼 정체성 아래 정규 1집 'VORTEX CRACK'(9곡)을 준비 중이며 보컬·작곡·작사·편곡으로 참여.",
              en: "10-member hip-hop crew formed in September 2025. Produces everything in-house — beat-making, lyrics, recording and mixing — spanning high-energy EDM hip-hop to lyrical, atmospheric tracks. Building a dark-minimalist visual identity while preparing debut LP 'VORTEX CRACK' (9 tracks); contributing vocals, composition, lyrics and arrangement.",
            },
            tags: ["Crew", "Hip-hop", "EDM"],
          },
        ],
      },
      {
        id: "content",
        title: { ko: "영상 & 콘텐츠", en: "VISUAL & CONTENT" },
        ghost: "VISUAL",
        type: "tracks",
        items: [
          {
            year: "2026",
            title: { ko: "W.A.N.I. Project", en: "W.A.N.I. Project" },
            sub: { ko: "Wider Audio Network Insights", en: "Wider Audio Network Insights" },
            desc: {
              ko: "제작–시각화–분석 3부 구성. FL Studio·Serum 사운드 디자인과 믹스/마스터, TouchDesigner 오디오 반응 비주얼 및 손 제스처 웹 비주얼라이저, 레퍼런스 곡 기반 타입비트 검색 프로그램. '사운드 디자인과 프로그래밍' 수업 프로젝트로 진행.",
              en: "Three parts: production, visualization, analysis. FL Studio & Serum sound design with mix/master, TouchDesigner audio-reactive visuals plus a hand-gesture web visualizer, and a reference-based type-beat search program. A class project for 'Sound Design & Programming'.",
            },
            tags: ["FL Studio", "TouchDesigner", "AI Digging"],
          },
          {
            year: "2026.04 – 11",
            title: { ko: "GIST 무한도전 프로젝트 × P4L: Podcast For Life", en: "GIST Challenge Project × P4L: Podcast For Life" },
            sub: { ko: "GIST 무한도전 프로젝트(11기) · 대표 — 총괄·기획·진행(MC)", en: "GIST Challenge Project (11th) · Team Lead — direction, planning & MC" },
            desc: {
              ko: "GIST 재학생(3·4학년)과 졸업생 선배들의 꾸미지 않은 대화를 담은 팟캐스트 영상 시리즈. 6인 팀의 대표로 콘텐츠 방향 설정·에피소드 기획·대화 진행(MC)을 맡아 도서관·분수대·강의실 등 캠퍼스 곳곳에서 대본 없이 촬영하고, 에피소드별 메시지를 담은 자작곡을 FL Studio로 제작해 함께 공개. 월 1편 이상 발행을 목표로 진행 중.",
              en: "A podcast video series of unscripted conversations with GIST upperclassmen and alumni. As lead of a 6-person team, directing content strategy, episode planning and hosting (MC) — filming without a script around campus (library, fountain, lecture halls) and producing an original song for each episode's message in FL Studio. Targeting at least one episode a month.",
            },
            tags: ["Podcast", "MC", "FL Studio", "Video"],
          },
          {
            year: "2022.04 – 11",
            title: { ko: "GIST 무한도전 프로젝트 × Gisplay", en: "GIST Challenge Project × Gisplay" },
            sub: { ko: "자작 음원 + 뮤직비디오 6편", en: "Original tracks + 6 music videos" },
            desc: {
              ko: "Logic·FL Studio로 힙합 비트에 직접 쓴 가사를 녹음·믹싱하고, 스토리보드부터 Final Cut Pro 편집까지 뮤직비디오를 자체 제작. 'MIC KILLER' 포함 6곡을 유튜브·인스타그램에 공개, 수천 회 조회 기록.",
              en: "Wrote, recorded and mixed original tracks in Logic & FL Studio, then self-produced music videos from storyboard to Final Cut Pro. Released 6 videos incl. 'MIC KILLER' on YouTube & Instagram — thousands of views.",
            },
            tags: ["FL Studio", "Final Cut", "MV"],
            link: { url: "https://www.youtube.com/@toowani", label: { ko: "보기", en: "Watch" } },
          },
          {
            year: "2026.03 – 2027.02",
            title: { ko: "DB드림리더 3기 × 대학내일 콘텐츠크루", en: "DB Dream Leader #3 × Univ Tomorrow Content Crew" },
            sub: { ko: "DB김준기문화재단 장학생 · DREAMLABS 유튜브 콘텐츠 담당", en: "DB Kim Jun-ki Foundation scholar · DREAMLABS YouTube content" },
            desc: {
              ko: "DB김준기문화재단 'DB드림리더 3기' 장학생으로 팀 '오메전라조잉'에서 유튜브 콘텐츠를 담당. 노년과 아동 세대 간 편견·거리감 해소를 미션으로, 지역아동센터·노인복지회관에서 3단계 기획 봉사(세대 이해 봉사 → 합동 화분심기·요리 활동 → 운동회형 세대 만남의 장)를 진행하고, 활동과 장학재단을 알리는 유튜브 콘텐츠를 대학내일과 함께 제작.",
              en: "DB Kim Jun-ki Foundation 'Dream Leader #3' scholar, running YouTube content for team 'Ome-Jeollajoing'. Mission: bridging the gap between seniors and children — a 3-phase service program (understanding both generations → joint gardening & cooking → a sports-day style intergenerational meetup) at local children's centers and a senior welfare center, plus YouTube content about it all, produced with Univ Tomorrow.",
            },
            tags: ["YouTube", "Scholarship", "DREAMLABS"],
          },
        ],
      },
      {
        id: "artist-links",
        title: { ko: "링크", en: "LINKS" },
        ghost: "SIGNAL",
        type: "links",
        note: {
          ko: "모든 플랫폼 동일 핸들: @toowani<br>contact: <b>changwan@gm.gist.ac.kr</b> · kcw9151@gmail.com",
          en: "Same handle everywhere: @toowani<br>contact: <b>changwan@gm.gist.ac.kr</b> · kcw9151@gmail.com",
        },
        items: [
          { label: "YOUTUBE",    url: "https://www.youtube.com/@toowani" },
          { label: "INSTAGRAM",  url: "https://instagram.com/toowani" },
          { label: "SOUNDCLOUD", url: "https://soundcloud.com/toowani" },
          { label: "EMAIL",      url: "mailto:changwan@gm.gist.ac.kr" },
        ],
      },
    ],
  },
};
