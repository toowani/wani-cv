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
      devCardDesc: "GIST 전기전자컴퓨터공학 — ML/DL · 신호처리",
      artistCardDesc: "힙합 베이스 전자음악 · 하이퍼팝 프로듀서",
      enter: "[ ENTER ]",
      landTag: "▲ DEV",
      waterTag: "▼ MUSIC",
      footerNote: "이 사이트는 GitHub Pages에서 구동됩니다",
      audioHint: "상단 <b>▶ AUDIO</b> — 자작 트랙 재생. 배경 비주얼이 오디오 신호에 반응.",
      landingId: "김창완 KIM CHANGWAN · GIST 전기전자컴퓨터공학 · @toowani",
      waniNote: "<b>wani</b> [와니] ① 일본어로 '악어(わに, ワニ)'. ② 김창완의 별명 — 이름의 '완'에서. ③ 땅과 물을 오가는 악어처럼, 개발과 음악을 오간다.",
      crossToArtist: "음악 작업 보기 — ARTIST_WANI",
      crossToDev: "개발·연구 보기 — DEV_WANI",
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
      devCardDesc: "GIST EECS — ML/DL · signal processing",
      artistCardDesc: "hip-hop bass electronic · hyperpop producer",
      enter: "[ ENTER ]",
      landTag: "▲ DEV",
      waterTag: "▼ MUSIC",
      footerNote: "This site runs on GitHub Pages",
      audioHint: "Top <b>▶ AUDIO</b> — plays an original track. Background visuals react to the audio signal.",
      landingId: "KIM CHANGWAN · GIST EECS · @toowani",
      waniNote: "<b>wani</b> [wǎ:ni] ① Japanese for 'crocodile' (わに, ワニ). ② Changwan's nickname — from the 'wan' in his name. ③ Like a crocodile crossing land and water, he crosses dev and music.",
      crossToArtist: "Music work — ARTIST_WANI",
      crossToDev: "Dev & research — DEV_WANI",
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
    dev:    "DEV_WANI :: GIST EECS :: ML/DL · SIGNAL PROCESSING :: KAIST → UC BERKELEY :: @toowani :: ",
    artist: "ARTIST_WANI :: HIPHOP BASS · HYPERPOP :: VORTEX CRACK — IN PROGRESS :: @toowani :: ",
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
        "ML/DL · 신호처리 · 오디오 AI",
        "$ echo $HANDLE",
        "@toowani  <span class='dim'># 모든 플랫폼 동일 핸들</span>",
      ],
      en: [
        "$ whoami",
        "Changwan Kim — Junior, EECS @ GIST",
        "$ cat interests.txt",
        "ML/DL · signal processing · audio AI",
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
        /* 성적표 — GIST 공식 성적증명서 기반. 과목: [코드, 국문명, 영문명, 학점, 성적] */
        id: "transcript",
        title: { ko: "성적표", en: "TRANSCRIPT" },
        ghost: "RECORD",
        type: "transcript",
        summary: {
          ko: "총 90학점 이수 · 전체 평점 3.92 / 4.5 · 직전학기 4.15 (+ UC Berkeley 6학점 진행 중)",
          en: "90 credits earned · Cumulative GPA 3.92 / 4.5 · Last semester 4.15 (+6 credits in progress at UC Berkeley)",
        },
        semesters: [
          {
            name: { ko: "2022 · 1학기", en: "2022 · Spring" },
            stat: { ko: "18학점 · 평점 3.84", en: "18 cr · GPA 3.84" },
            courses: [
              ["GS0110", "헬스", "Fitness", 0, "S"],
              ["GS1001", "미적분학과 응용", "Calculus and Applications", 3, "A0"],
              ["GS1101", "일반물리학 및 연습 I", "General Physics I", 3, "B+"],
              ["GS1111", "일반물리학 실험 I", "General Physics Lab I", 1, "A+"],
              ["GS1201", "일반화학 및 연습 I", "General Chemistry I", 3, "B0"],
              ["GS1512", "글쓰기의 기초: 학술적 글쓰기", "Academic Writing Basics", 3, "A0"],
              ["GS1901", "GIST 새내기", "GIST Freshman Seminar", 1, "S"],
              ["GS2704", "기업과 사회 Ⅰ", "Business and Society I", 3, "A+"],
              ["UC0901", "과학기술과 경제", "Science, Technology and Economy", 1, "S"],
            ],
          },
          {
            name: { ko: "2022 · 2학기", en: "2022 · Fall" },
            stat: { ko: "19학점 · 평점 3.94", en: "19 cr · GPA 3.94" },
            courses: [
              ["GS0213", "컴퓨터 음악 만들기", "Making Computer Music", 0, "S"],
              ["GS1211", "일반화학실험 Ⅰ", "General Chemistry Lab I", 1, "B0"],
              ["GS1401", "컴퓨터 프로그래밍", "Computer Programming", 3, "A0"],
              ["GS1603", "영어 Ⅰ: 발표와 토론", "English I: Presentation & Debate", 2, "A+"],
              ["GS2001", "다변수해석학과 응용", "Multivariable Calculus and Applications", 3, "B+"],
              ["GS2822", "AI와 나", "AI and Me", 2, "B+"],
              ["GS2823", "수학의 위대한 순간들 - AI", "Great Moments in Mathematics — AI", 3, "A+"],
              ["GS2833", "비판적 디자인", "Critical Design", 3, "A0"],
              ["UC0202", "창의함양", "Creativity Development", 1, "S"],
              ["UC0902", "GIST 전공탐색", "Major Exploration", 1, "S"],
            ],
          },
          {
            name: { ko: "2023 · 1학기", en: "2023 · Spring" },
            stat: { ko: "17학점 · 평점 3.61", en: "17 cr · GPA 3.61" },
            courses: [
              ["EC2202", "자료 구조", "Data Structures", 3, "A0"],
              ["EC2203", "디지털 설계", "Digital Design", 3, "A0"],
              ["GS0112", "수영", "Swimming", 0, "S"],
              ["GS2004", "선형대수학과 응용", "Linear Algebra and Applications", 3, "B+"],
              ["GS2652", "영어 II: 이공계 글쓰기 입문", "English II: Intro to Scientific Writing", 2, "B0"],
              ["GS2809", "아름다운 지구", "Beautiful Earth", 3, "B0"],
              ["GS2824", "문명과 수학", "Civilization and Mathematics", 3, "A0"],
              ["UC9331", "GIST대학 콜로퀴움", "GIST College Colloquium", 0, "S"],
            ],
          },
          {
            name: { ko: "2023 · 여름학기", en: "2023 · Summer" },
            stat: { ko: "1학점 · KAIST 학점교류", en: "1 cr · KAIST Exchange" },
            courses: [
              ["GS0700", "세미나 <몰입캠프: 프로그래밍과 스타트업> (KAIST)", "Seminar: Immersion Camp — Programming & Startup (KAIST)", 1, "S"],
            ],
          },
          {
            name: { ko: "2023 · 2학기", en: "2023 · Fall" },
            stat: { ko: "16학점 · 평점 4.16", en: "16 cr · GPA 4.16" },
            courses: [
              ["AI2002", "디지털 유니버스 콜로퀴움", "Digital Universe Colloquium", 1, "S"],
              ["EC2206", "알고리즘 개론", "Introduction to Algorithms", 3, "A+"],
              ["GS0108", "힙합댄스", "Hip-hop Dance", 0, "S"],
              ["GS1496", "(MOOC) 기계학습을 위한 수학: 선형대수학", "(MOOC) Math for ML: Linear Algebra", 1, "S"],
              ["GS2420", "(MOOC) 알고리즘 기반 논리적 사고 - 기초", "(MOOC) Algorithmic Logical Thinking — Basic", 1, "S"],
              ["GS2421", "(MOOC) 알고리즘 기반 논리적 사고 - 심화", "(MOOC) Algorithmic Logical Thinking — Advanced", 1, "S"],
              ["GS2795", "문명으로 보는 21세기", "The 21st Century through Civilization", 3, "A0"],
              ["GS2797", "꿈의 사회학", "Sociology of Dreams", 3, "A0"],
              ["GS3401", "(MOOC) 프론트엔드 웹 개발", "(MOOC) Frontend Web Development", 2, "S"],
              ["UC0201", "사회봉사", "Community Service", 1, "S"],
            ],
          },
          {
            gap: true,
            name: {
              ko: "2024.03 – 2025.12 — 대한민국 공군 복무 (만기전역)",
              en: "2024.03 – 2025.12 — ROK Air Force service (honorable discharge)",
            },
          },
          {
            name: { ko: "2026 · 1학기", en: "2026 · Spring" },
            stat: { ko: "19학점 · 평점 4.15", en: "19 cr · GPA 4.15" },
            courses: [
              ["AI5302", "딥러닝", "Deep Learning", 3, "A0"],
              ["CT5104", "사운드 디자인과 프로그래밍", "Sound Design and Programming", 3, "A+"],
              ["EC2107", "기초공학수학 Ⅰ", "Engineering Mathematics I", 3, "A+"],
              ["EC3102", "컴퓨터 시스템 이론 및 실험", "Computer Systems Theory and Lab", 4, "A0"],
              ["EC3216", "오토마타 이론", "Automata Theory", 3, "B+"],
              ["HS2544", "문화콘텐츠의 이해", "Understanding Cultural Contents", 3, "A+"],
              ["UC9331", "GIST대학 콜로퀴움", "GIST College Colloquium", 0, "S"],
            ],
          },
          {
            open: true,
            name: { ko: "2026 · 여름학기 (UC Berkeley 학점교류 · 진행 중)", en: "2026 · Summer (UC Berkeley Exchange · in progress)" },
            stat: { ko: "6학점 · Pass 처리", en: "6 cr · Pass/No Pass" },
            courses: [
              ["CS70", "이산수학 (Discrete Mathematics and Probability Theory)", "CS70 Discrete Mathematics and Probability Theory", 3, "P"],
              ["CS188", "인공지능 (Introduction to Artificial Intelligence)", "CS188 Introduction to Artificial Intelligence", 3, "P"],
            ],
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
            year: { ko: "2026 봄학기 · A+", en: "2026 Spring · A+" },
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
            title: { ko: "Vortex Crack", en: "Vortex Crack" },
            sub: { ko: "광주음악창작소 뮤지션지원사업", en: "Gwangju Music Creation Center Musician Program" },
            desc: {
              ko: "2026 광주음악창작소 뮤지션지원사업에 광주 지역 공동 1위 성적으로 선정. 앨범 제작·홍보 지원을 받아 프로젝트 'Vortex Crack' 진행 중.",
              en: "Selected (tied 1st in the Gwangju region) for the 2026 Gwangju Music Creation Center musician support program — album production & promotion support. Project 'Vortex Crack' in progress.",
            },
            tags: ["Album", "WIP", "1st Place"],
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
              ko: "제작–시각화–분석 3부 구성. FL Studio·Serum 사운드 디자인과 믹스/마스터, TouchDesigner 오디오 반응 비주얼 및 손 제스처 웹 비주얼라이저, 레퍼런스 곡 기반 타입비트 검색 프로그램. '사운드 디자인과 프로그래밍' 수업 A+.",
              en: "Three parts: production, visualization, analysis. FL Studio & Serum sound design with mix/master, TouchDesigner audio-reactive visuals plus a hand-gesture web visualizer, and a reference-based type-beat search program. A+ in 'Sound Design & Programming'.",
            },
            tags: ["FL Studio", "TouchDesigner", "AI Digging"],
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
