# -*- coding: utf-8 -*-
"""
WANI 이력서 PDF 생성 스크립트 — assets/resume_wani.pdf 를 다시 만듭니다.

사이트 내용(js/data.js)을 수정했다면 이 파일의 내용도 맞춰 수정한 뒤 실행하세요:
    pip install reportlab koreanize-matplotlib
    python scripts/make_resume.py
"""
import os, glob
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor

# ---------- 한글 폰트 (koreanize-matplotlib에 번들된 나눔고딕 사용) ----------
def find_fonts():
    try:
        import koreanize_matplotlib
        d = os.path.join(os.path.dirname(koreanize_matplotlib.__file__), "fonts")
        return (os.path.join(d, "NanumGothic.ttf"),
                os.path.join(d, "NanumGothicBold.ttf"),
                os.path.join(d, "NanumGothicExtraBold.ttf"))
    except ImportError:
        pass
    hits = glob.glob("/usr/share/fonts/**/NanumGothic*.ttf", recursive=True)
    if hits:
        base = os.path.dirname(hits[0])
        return (os.path.join(base, "NanumGothic.ttf"),
                os.path.join(base, "NanumGothicBold.ttf"),
                os.path.join(base, "NanumGothicExtraBold.ttf"))
    raise SystemExit("한글 폰트를 찾지 못했습니다. `pip install koreanize-matplotlib` 후 다시 실행하세요.")

NG, NGB, NGX = find_fonts()
pdfmetrics.registerFont(TTFont("NG", NG))
pdfmetrics.registerFont(TTFont("NGB", NGB))
pdfmetrics.registerFont(TTFont("NGX", NGX))

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "resume_wani.pdf")
W, H = A4
c = canvas.Canvas(OUT, pagesize=A4)
c.setTitle("김창완 (wani) — Resume")
c.setAuthor("Changwan Kim")

INK = HexColor("#111116"); GREY = HexColor("#555560")
LIME = HexColor("#7aa800"); CYAN = HexColor("#0090a8")
ML, MR = 46, W - 46
y = H - 56

c.setFont("NGX", 24); c.setFillColor(INK)
c.drawString(ML, y, "김창완  KIM CHANGWAN")
c.setFont("NGB", 11); c.setFillColor(CYAN)
c.drawRightString(MR, y, "wani · @toowani")
y -= 17
c.setFont("NG", 9.5); c.setFillColor(GREY)
c.drawString(ML, y, "땅(학업)과 물(음악), 두 세계를 오가는 개발자 × 아티스트 — half on land, half in water")
y -= 14
c.drawString(ML, y, "changwan@gm.gist.ac.kr  ·  kcw9151@gmail.com  ·  github.com/toowani  ·  youtube.com/@toowani")
y -= 12
c.setStrokeColor(INK); c.setLineWidth(1.4); c.line(ML, y, MR, y)

def section(title, color):
    global y
    y -= 24
    c.setFont("NGX", 12); c.setFillColor(color)
    c.drawString(ML, y, title)
    y -= 6
    c.setStrokeColor(color); c.setLineWidth(0.8); c.line(ML, y, ML + 34, y)
    y -= 14

def item(head, tail, body_lines):
    global y
    c.setFont("NGB", 10); c.setFillColor(INK)
    c.drawString(ML, y, head)
    c.setFont("NG", 8.5); c.setFillColor(GREY)
    c.drawRightString(MR, y, tail)
    y -= 12.5
    c.setFont("NG", 9)
    for ln in body_lines:
        c.drawString(ML + 10, y, ln); y -= 11.5
    y -= 4.5

section("EDUCATION — 학력", INK)
item("광주과학기술원(GIST) 전기전자컴퓨터공학과 · 학사 3학년", "2022.03 –",
     ["전체 평점 3.92 / 4.5 (직전학기 4.15) · 총 90학점 이수"])
item("UC Berkeley Summer Session (학점교류 · 진행 중)", "2026.06 – 2026.08",
     ["CS70 Discrete Mathematics & Probability · CS188 Artificial Intelligence"])
item("대한민국 공군 만기전역", "2024.03 – 2025.12",
     ["제1전투비행단 단본부 인사행정처 · 병장 (특기: 인사교육)"])

section("DEV — 땅 위의 나", LIME)
item("Google ML Bootcamp 4기", "2023.09 – 11",
     ["Deep Learning Specialization 5개 코스 수료(90%+) · Kaggle 대회 참여"])
item("KAIST 몰입캠프 <프로그래밍과 스타트업>", "2023.06 – 07",
     ["4주간 4개 프로젝트 — Android / Node.js+MongoDB / React+WebSocket / Unity 리듬게임"])
item("W.A.N.I. Project — 사운드 디자인과 프로그래밍 (A+)", "2026",
     ["JUCE VST3로 FL Studio↔TouchDesigner 실시간 연동(OSC) · MediaPipe 웹 비주얼라이저",
      "AI 타입비트 검색: Demucs 보컬 분리 + PANNs 임베딩 + ChromaDB 유사도 검색"])
item("창업 — CRAVE 기술팀 대표 · 편한가슴 기술팀", "2022 – 2023",
     ["캐리어 운반 전동 스쿠터 MVP 제작 · NeRF 기반 3D 사이즈 측정 연구(I-Corps 2022)"])

section("ARTIST — 물 속의 나", CYAN)
item("Vortex Crack — 광주음악창작소 뮤지션지원사업", "2026 – (진행 중)",
     ["광주 지역 공동 1위 성적 선정 · 앨범 제작/홍보 지원 프로젝트 진행 중"])
item("EP 「상상univ. Winiv Music Project Pt.7 IGNITION」 발매", "2023.03",
     ["GIST 힙합 동아리 IGNITION 대표로 총괄 — 기획·녹음·믹싱·마스터링·유통, 3곡 전 플랫폼 발매"])
item("Gisplay — 자작 음원 + 뮤직비디오 6편", "2022.04 – 11",
     ["FL Studio 작곡·녹음·믹싱 · Final Cut Pro 편집 · 유튜브/인스타그램 공개"])
item("DB드림리더 3기 × 대학내일 콘텐츠크루", "2026.03 – 2027.02",
     ["세대 간 거리감 해소 3단계 기획 봉사 · 봉사/장학재단 홍보 유튜브 콘텐츠 제작"])

c.setFont("NG", 8); c.setFillColor(GREY)
c.drawCentredString(W / 2, 34, "포트폴리오 웹사이트에서 전체 활동·성적표를 볼 수 있습니다 — @toowani, \"too + wani, 완전 나답게\"")
c.save()
print("saved:", os.path.abspath(OUT))
