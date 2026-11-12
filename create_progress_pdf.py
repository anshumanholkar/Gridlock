import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, HRFlowable
)

pdf_path = "/Users/anshumanholkar/Desktop/GRIDLOCK_Prototype_Progress_Report.pdf"
doc = SimpleDocTemplate(
    pdf_path,
    pagesize=letter,
    leftMargin=36,
    rightMargin=36,
    topMargin=36,
    bottomMargin=36
)

styles = getSampleStyleSheet()

# Custom styles
title_style = ParagraphStyle(
    'DocTitle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=26,
    leading=30,
    textColor=colors.HexColor('#E5A93C'),
    alignment=1
)

sub_style = ParagraphStyle(
    'DocSub',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=13,
    leading=16,
    textColor=colors.HexColor('#D1D5DB'),
    alignment=1
)

meta_style = ParagraphStyle(
    'DocMeta',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=10,
    leading=14,
    textColor=colors.HexColor('#9CA3AF'),
    alignment=1
)

link_style = ParagraphStyle(
    'DocLink',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=11,
    leading=15,
    textColor=colors.HexColor('#2563EB'),
    alignment=1
)

h1_style = ParagraphStyle(
    'H1',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=16,
    leading=20,
    textColor=colors.HexColor('#111827'),
    spaceBefore=8,
    spaceAfter=6
)

h2_style = ParagraphStyle(
    'H2',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=12,
    leading=16,
    textColor=colors.HexColor('#D97706'),
    spaceBefore=6,
    spaceAfter=4
)

body_style = ParagraphStyle(
    'Body',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=9.5,
    leading=13.5,
    textColor=colors.HexColor('#374151'),
    spaceAfter=5
)

bullet_style = ParagraphStyle(
    'Bullet',
    parent=body_style,
    leftIndent=14,
    spaceAfter=4
)

caption_style = ParagraphStyle(
    'Caption',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=8.5,
    leading=11,
    textColor=colors.HexColor('#4B5563'),
    alignment=1
)

story = []

# --- PAGE 1: COVER & EXECUTIVE SUMMARY ---
story.append(Paragraph("⚡ GRIDLOCK — Plan. Focus. Grow.", title_style))
story.append(Spacer(1, 4))
story.append(Paragraph("Autonomous Discipline Protocol & AI Accountability Mobile Architecture", sub_style))
story.append(Spacer(1, 6))
story.append(Paragraph("<b>Author / Developer:</b> Anshuman Holkar &nbsp;|&nbsp; <b>Project:</b> Mobile App Prototype MVP", meta_style))
story.append(Spacer(1, 10))

# Interactive Links Card (Highlighted)
link_data = [
    [Paragraph("<b>🌐 Live Working Web Prototype:</b> <a href='https://anshumanholkar.github.io/Gridlock/'><u>https://anshumanholkar.github.io/Gridlock/</u></a><br/><i>(Runs directly in any web or mobile browser with zero install required)</i>", body_style)],
    [Paragraph("<b>📦 GitHub Source Repository:</b> <a href='https://github.com/anshumanholkar/Gridlock'><u>https://github.com/anshumanholkar/Gridlock</u></a><br/><i>(Complete TypeScript codebase, architecture diagrams, commit history, and CI test pipeline)</i>", body_style)]
]
link_table = Table(link_data, colWidths=[540])
link_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FEF3C7')),
    ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor('#F59E0B')),
    ('PADDING', (0,0), (-1,-1), 8),
    ('BOTTOMPADDING', (0,0), (-1,-1), 8),
]))
story.append(link_table)
story.append(Spacer(1, 12))

# Executive Answer to the Prompt
story.append(Paragraph("📌 Prototype Progress: What Has Been Built So Far", h1_style))
story.append(Paragraph(
    "In response to the prototype progress submission, <b>GRIDLOCK</b> has advanced from initial conceptual wireframes into a <b>fully functional, interactive Cross-Platform MVP</b> (React Native, TypeScript, Expo SDK 58) integrated with Google Gemini 1.5 Flash AI and Supabase Cloud.",
    body_style
))
story.append(Spacer(1, 6))

story.append(Paragraph("1. Wireframes & UX Architecture (100% Completed)", h2_style))
story.append(Paragraph("• Designed an <b>Obsidian Luxury Dark Aesthetic</b> with high-contrast amber/champagne accents, breathing space, and sleek rounded cards.", bullet_style))
story.append(Paragraph("• Established 4 core protocol pillars: <b>⚡ HQ Command Center</b>, <b>🧭 Suggestor</b>, <b>⏱️ Training Barracks</b>, and <b>📊 Squad Analytics</b>.", bullet_style))
story.append(Paragraph("• Structured seamless distraction-free bottom navigation and a quick-access operative dossier modal in the top bar.", bullet_style))

story.append(Paragraph("2. Clickable / Interactive Mockups & Theme Engine (100% Completed)", h2_style))
story.append(Paragraph("• <b>Hardware-Calibrated 6-Palette Dynamic Theme Engine</b>: Real-time instantaneous palette switching across <i>Obsidian Amber Gold</i>, <i>Midnight Acid Lime</i>, <i>Electric Blue</i>, <i>Cyber Cyan</i>, <i>Crimson Fury</i>, and <i>Stealth Monochrome</i>.", bullet_style))
story.append(Paragraph("• Interactive pull-to-refresh gestures, segmented control filter pills, modal drawers, and responsive form validation.", bullet_style))

story.append(Paragraph("3. Core Functional MVP Features (100% Completed)", h2_style))
story.append(Paragraph("• <b>Zero Unverified Quotas Engine</b>: Photo proof capture audited by Google Gemini Vision with confidence scoring and audit logs.", bullet_style))
story.append(Paragraph("• <b>AI Coach Vance</b>: Contextual problem-solver that diagnoses fatigue, procrastination, trading tilt, and prescribed immediate 3-step action protocols.", bullet_style))
story.append(Paragraph("• <b>AI Learning Roadmap Suggestor</b>: Autonomous curriculum builder generating phase-by-phase learning steps, curated authoritative sources, and 1-tap daily task sync.", bullet_style))
story.append(Paragraph("• <b>Squad Performance Architecture</b>: 5-member squad code system, live performance comparison bar charts, weekly 00:00 XP reset economics, and privacy controls.", bullet_style))

story.append(PageBreak())

# --- PAGE 2: HQ COMMAND CENTER & AI COACH VANCE ---
story.append(Paragraph("📱 Module 1: HQ Command Center & AI Coach Vance", h1_style))
story.append(Paragraph(
    "The HQ Command Center operates on the <b>'Zero Unverified Quotas'</b> philosophy. Operatives cannot simply check off tasks; they must provide visual proof audited by Gemini Vision before the midnight lockout deadline.",
    body_style
))
story.append(Spacer(1, 6))

img_hq = "/Users/anshumanholkar/Desktop/gridlock-app/docs/screenshots/01_hq_dashboard.png"
img_vance = "/Users/anshumanholkar/Desktop/gridlock-app/docs/screenshots/08_ai_coach_vance.png"

showcase_data_1 = [
    [
        Image(img_hq, width=190, height=422),
        Image(img_vance, width=190, height=422)
    ],
    [
        Paragraph("<b>Screen 1: HQ Dashboard</b><br/>Lockout countdown, circular progress ring, Today's Top 3 priority mandates & quick stats.", caption_style),
        Paragraph("<b>Screen 2: AI Coach Vance Chatbot</b><br/>Multi-intent problem diagnostic offering tactical action protocols for fatigue and tilt.", caption_style)
    ]
]
t1 = Table(showcase_data_1, colWidths=[270, 270])
t1.setStyle(TableStyle([
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
]))
story.append(t1)

story.append(PageBreak())

# --- PAGE 3: AI ROADMAP & TRAINING BARRACKS ---
story.append(Paragraph("🧭 Module 2: AI Roadmap Suggestor & Training Barracks", h1_style))
story.append(Paragraph(
    "Operatives can input any skill or subject to generate an authoritative curriculum, then execute focus sessions via the Proctor Study Timer, Topic-Adaptive Quiz Playground, or Pomodoro Lockout.",
    body_style
))
story.append(Spacer(1, 6))

img_sugg = "/Users/anshumanholkar/Desktop/gridlock-app/docs/screenshots/04_roadmap_suggestor.png"
img_train = "/Users/anshumanholkar/Desktop/gridlock-app/docs/screenshots/05_training_barracks.png"

showcase_data_2 = [
    [
        Image(img_sugg, width=190, height=422),
        Image(img_train, width=190, height=422)
    ],
    [
        Paragraph("<b>Screen 3: Learning Roadmap Suggestor</b><br/>Generates phased learning roadmap, trusted books/courses, and 1-tap task sync to HQ.", caption_style),
        Paragraph("<b>Screen 4: Training & Execution Barracks</b><br/>Camera study proctor, 4-mode 20Q adaptive quiz playground, and Pomodoro focus lockout.", caption_style)
    ]
]
t2 = Table(showcase_data_2, colWidths=[270, 270])
t2.setStyle(TableStyle([
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
]))
story.append(t2)

story.append(PageBreak())

# --- PAGE 4: SQUAD LEADERBOARD, PROFILE & THEMES ---
story.append(Paragraph("📊 Module 3: Squad Performance, Profile & Themes", h1_style))
story.append(Paragraph(
    "Squad mechanics foster peer competition with live comparison graphs, weekly reset points, achievement honor badges, and 6 interchangeable tactical palettes.",
    body_style
))
story.append(Spacer(1, 6))

img_squad = "/Users/anshumanholkar/Desktop/gridlock-app/docs/screenshots/06_squad_leaderboard.png"
img_prof = "/Users/anshumanholkar/Desktop/gridlock-app/docs/screenshots/03_profile_dossier.png"

showcase_data_3 = [
    [
        Image(img_squad, width=190, height=422),
        Image(img_prof, width=190, height=422)
    ],
    [
        Paragraph("<b>Screen 5: Squad Performance Graph</b><br/>Multi-metric team comparison (XP, Daily Tasks, Streak) and privacy protection settings.", caption_style),
        Paragraph("<b>Screen 6: Operative Dossier (Profile)</b><br/>'Your Growth' daily trend chart, permanent career XP, and milestone honor badges.", caption_style)
    ]
]
t3 = Table(showcase_data_3, colWidths=[270, 270])
t3.setStyle(TableStyle([
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
]))
story.append(t3)

story.append(PageBreak())

# --- PAGE 5: TECHNICAL SPECIFICATIONS & EVALUATOR INSTRUCTIONS ---
story.append(Paragraph("⚙️ Technical Architecture & Evaluation Guide", h1_style))
story.append(Spacer(1, 4))

tech_data = [
    [Paragraph("<b>Component</b>", meta_style), Paragraph("<b>Technology</b>", meta_style), Paragraph("<b>Implementation Details</b>", meta_style)],
    [Paragraph("Mobile Framework", body_style), Paragraph("React Native 0.88 + Expo 58", body_style), Paragraph("Cross-platform native architecture (Android, iOS & Web export)", body_style)],
    [Paragraph("Language", body_style), Paragraph("TypeScript 5 (Strict)", body_style), Paragraph("Strict type models for tasks, profiles, squads, and themes", body_style)],
    [Paragraph("AI Vision & NLP", body_style), Paragraph("Google Gemini 1.5 Flash", body_style), Paragraph("Real-time multimodal proof auditing and problem diagnosis", body_style)],
    [Paragraph("Cloud & Database", body_style), Paragraph("Supabase PostgreSQL", body_style), Paragraph("Squad data sync, leaderboard ranking, and remote backup", body_style)],
    [Paragraph("Local Persistence", body_style), Paragraph("AsyncStorage", body_style), Paragraph("Device-level encrypted multi-account hardware storage", body_style)],
]
t_tech = Table(tech_data, colWidths=[120, 150, 270])
t_tech.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F3F4F6')),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#D1D5DB')),
    ('PADDING', (0,0), (-1,-1), 6),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
]))
story.append(t_tech)
story.append(Spacer(1, 14))

story.append(Paragraph("🧪 How Evaluators Can Test the Prototype", h2_style))
story.append(Paragraph("<b>Option A: Web Browser (Instant, 0 Install)</b><br/>Open <u><a href='https://anshumanholkar.github.io/Gridlock/'>https://anshumanholkar.github.io/Gridlock/</a></u> in Chrome, Safari, or Edge to test the live interactive app directly.", bullet_style))
story.append(Paragraph("<b>Option B: Mobile Device via Expo Go</b><br/>Clone the GitHub repo (<code>git clone https://github.com/anshumanholkar/Gridlock</code>), run <code>npm install && npx expo start</code>, and scan the terminal QR code using the Expo Go mobile app.", bullet_style))
story.append(Paragraph("<b>Option C: GitHub Inspection</b><br/>Browse full source code, test workflows, and issue tracking at <u><a href='https://github.com/anshumanholkar/Gridlock'>https://github.com/anshumanholkar/Gridlock</a></u>.", bullet_style))

story.append(Spacer(1, 14))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#E5A93C'), spaceBefore=6, spaceAfter=8))
story.append(Paragraph("<b>GRIDLOCK Prototype Progress Report</b> &nbsp;|&nbsp; Developed by <b>Anshuman Holkar</b> &nbsp;|&nbsp; Ready for Academic Evaluation", meta_style))

doc.build(story)
print("PDF Generated successfully at:", pdf_path)
