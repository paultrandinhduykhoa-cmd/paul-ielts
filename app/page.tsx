'use client';

import React, { useState, useEffect } from 'react';

// Dữ liệu câu hỏi
const QUESTIONS = [
  {
    id: 'q1',
    text: 'More than sixty companies took part in the trial.',
    options: ['True', 'False', 'Not Given'],
    answer: 'True',
  },
  {
    id: 'q2',
    text: 'Employees who took part had their salaries reduced.',
    options: ['True', 'False', 'Not Given'],
    answer: 'False',
  },
  {
    id: 'q3',
    text: 'The trial found that employees saved money on transport costs.',
    options: ['True', 'False', 'Not Given'],
    answer: 'Not Given',
  },
  {
    id: 'q4',
    text: 'According to the passage, "compressed focus" refers to…',
    options: [
      'A software tool used to track working hours',
      'Employees using limited time more efficiently',
      'A method for increasing employee salaries',
      'A government policy on shorter working weeks',
    ],
    answer: 'Employees using limited time more efficiently',
  },
  {
    id: 'q5',
    text: 'Researchers concluded that every company should adopt a four-day week.',
    options: ['True', 'False', 'Not Given'],
    answer: 'False',
  },
];

const DURATION = 5 * 60; // 5 phút

export default function Home() {
  // State quản lý View
  const [activeView, setActiveView] = useState<'home' | 'luyen-de' | 'about' | 'login' | 'signup' | 'reading-quiz'>('home');

  // State thông báo Form
  const [loginNoteVisible, setLoginNoteVisible] = useState(false);
  const [signupNoteVisible, setSignupNoteVisible] = useState(false);

  // State Quiz
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Hàm chuyển View
  const showView = (id: 'home' | 'luyen-de' | 'about' | 'login' | 'signup' | 'reading-quiz', anchorId?: string) => {
    setActiveView(id);
    if (anchorId) {
      setTimeout(() => {
        const el = document.getElementById(anchorId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 30);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setTimeLeft(DURATION);
    setSubmitted(false);
    setIsTimerRunning(true);
  };

  const goToQuiz = () => {
    showView('reading-quiz');
    resetQuiz();
  };

  // Đếm ngược thời gian Quiz
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0 && !submitted) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning && !submitted) {
      submitQuiz();
    }
    return () => clearInterval(timerId);
  }, [isTimerRunning, timeLeft, submitted]);

  const selectAnswer = (qid: string, opt: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qid]: opt }));
  };

  const submitQuiz = () => {
    if (submitted) return;
    setSubmitted(true);
    setIsTimerRunning(false);
  };

  const handleMockSubmit = (e: React.FormEvent, type: 'login' | 'signup') => {
    e.preventDefault();
    if (type === 'login') setLoginNoteVisible(true);
    if (type === 'signup') setSignupNoteVisible(true);
  };

  // Tính điểm & Band
  const score = QUESTIONS.reduce((acc, q) => acc + (answers[q.id] === q.answer ? 1 : 0), 0);
  const getBandInfo = (scoreVal: number, total: number) => {
    const ratio = scoreVal / total;
    if (ratio >= 1) return { band: '8.5–9.0', note: 'Xuất sắc — giữ phong độ này.' };
    if (ratio >= 0.8) return { band: '7.0–7.5', note: 'Rất tốt, chỉ còn vài điểm chặt chẽ cần sửa.' };
    if (ratio >= 0.6) return { band: '6.0–6.5', note: 'Ở mức khá, nên luyện thêm dạng True/False/Not Given.' };
    if (ratio >= 0.4) return { band: '5.0–5.5', note: 'Cần luyện thêm kỹ năng đọc lướt và đọc quét.' };
    return { band: 'Dưới 5.0', note: 'Nên bắt đầu lại từ các dạng câu cơ bản.' };
  };

  const bandResult = getBandInfo(score, QUESTIONS.length);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  const answeredCount = QUESTIONS.filter((q) => answers[q.id]).length;
  const allDone = answeredCount === QUESTIONS.length;

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@400;500;600&display=swap');

        :root {
          --bg: #F2F6FB;
          --surface: #FFFFFF;
          --ink: #1B2A41;
          --ink-soft: #56657D;
          --line: #D8E1EE;
          --blue: #2E5FA3;
          --blue-deep: #1F3E6E;
          --blue-bright: #3E7BD6;
          --red: #C4453B;
          --green: #3E8A5B;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--ink); line-height: 1.5; }
        img, svg { display: block; max-width: 100%; }
        a { color: inherit; text-decoration: none; cursor: pointer; }
        button { font-family: inherit; cursor: pointer; }
        input { font-family: inherit; }

        .wrap { max-width: 1120px; margin: 0 auto; padding: 0 24px; }

        .view { display: none; }
        .view.active { display: block; }

        /* NAV */
        header { position: sticky; top: 0; z-index: 40; background: rgba(242,246,251,0.92); backdrop-filter: blur(6px); border-bottom: 1px solid var(--line); }
        nav.wrap { display: flex; align-items: center; justify-content: space-between; height: 68px; }
        .brand { display: flex; align-items: center; gap: 10px; font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 18px; color: var(--blue-deep); }
        .brand-mark { width: 30px; height: 30px; border-radius: 8px; background: var(--blue); display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 14px; }
        .nav-links { display: flex; gap: 30px; font-size: 14.5px; color: var(--ink-soft); font-weight: 500; }
        .nav-links a:hover { color: var(--blue-deep); }
        .nav-actions { display: flex; align-items: center; gap: 14px; }
        .btn-ghost { font-size: 14px; font-weight: 600; color: var(--blue-deep); padding: 9px 4px; background: none; border: none; }
        .btn-primary { background: var(--blue); color: #fff; font-size: 14px; font-weight: 600; padding: 10px 20px; border-radius: 7px; border: none; transition: background .15s ease; }
        .btn-primary:hover { background: var(--blue-deep); }

        /* HERO */
        .hero { padding: 76px 0 64px; }
        .hero-grid { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 56px; align-items: center; }
        .eyebrow-line { display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--blue); font-weight: 600; margin-bottom: 18px; }
        .eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--red); }
        h1 { font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 44px; line-height: 1.16; color: var(--blue-deep); max-width: 15ch; }
        .hero p.lede { margin-top: 20px; font-size: 16.5px; color: var(--ink-soft); max-width: 46ch; line-height: 1.65; }
        .hero-ctas { display: flex; align-items: center; gap: 18px; margin-top: 32px; }
        .btn-large { background: var(--blue); color: #fff; font-size: 15.5px; font-weight: 700; padding: 14px 26px; border-radius: 8px; border: none; }
        .btn-large:hover { background: var(--blue-deep); }
        .link-secondary { font-size: 14.5px; font-weight: 600; color: var(--blue-deep); border-bottom: 1px solid var(--blue); padding-bottom: 2px; background: none; border-top: none; border-left: none; border-right: none; }
        .trust-row { margin-top: 34px; font-size: 13px; color: var(--ink-soft); }
        .trust-row strong { color: var(--ink); }

        .hero-visual { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 28px 26px 22px; }
        .hero-visual-label { font-size: 12.5px; color: var(--ink-soft); margin-bottom: 4px; }
        .hero-visual-title { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 16px; color: var(--ink); margin-bottom: 18px; }

        /* SECTIONS */
        .section { padding: 64px 0; }
        .section-head { max-width: 52ch; margin-bottom: 40px; }
        .section-head h2 { font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 28px; color: var(--blue-deep); }
        .section-head p { margin-top: 12px; color: var(--ink-soft); font-size: 15.5px; line-height: 1.6; }

        .feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--line); border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
        .feature-card { background: var(--surface); padding: 28px 24px; }
        .feature-icon { width: 38px; height: 38px; margin-bottom: 18px; }
        .feature-card h3 { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 16.5px; color: var(--ink); margin-bottom: 8px; }
        .feature-card p { font-size: 14px; color: var(--ink-soft); line-height: 1.6; }

        .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .step { padding-left: 22px; border-left: 2px solid var(--line); }
        .step-index { font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 13px; color: var(--blue); margin-bottom: 10px; }
        .step h3 { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 16px; color: var(--ink); margin-bottom: 8px; }
        .step p { font-size: 14px; color: var(--ink-soft); line-height: 1.6; }

        .cta-band { background: var(--blue-deep); border-radius: 16px; padding: 48px 44px; display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
        .cta-band h2 { font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 25px; color: #fff; max-width: 22ch; }
        .cta-band p { color: #B9CBE6; margin-top: 8px; font-size: 14.5px; }
        .btn-on-dark { background: #fff; color: var(--blue-deep); font-size: 15px; font-weight: 700; padding: 13px 24px; border-radius: 8px; border: none; }

        footer { padding: 40px 0 48px; border-top: 1px solid var(--line); margin-top: 20px; }
        .footer-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        .footer-brand { font-family: 'Manrope', sans-serif; font-weight: 800; color: var(--blue-deep); font-size: 15px; }
        .footer-note { font-size: 13px; color: var(--ink-soft); }

        @keyframes riseIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .hero-grid > * { animation: riseIn .5s ease both; }
        .hero-grid > *:nth-child(2) { animation-delay: .08s; }

        /* SIMPLE PAGE HEADER */
        .page-head { padding: 56px 0 8px; }
        .page-head .eyebrow-line { margin-bottom: 14px; }
        .page-head h1.page-title { font-size: 32px; max-width: none; }

        /* LUYỆN ĐỀ LIST */
        .test-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 32px; }
        .test-card { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 26px 24px; }
        .test-badge { display: inline-block; font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 20px; margin-bottom: 14px; }
        .badge-ready { background: rgba(62,138,91,0.12); color: var(--green); }
        .badge-soon { background: rgba(86,101,125,0.12); color: var(--ink-soft); }
        .test-card h3 { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 17px; margin-bottom: 8px; }
        .test-card p { font-size: 14px; color: var(--ink-soft); margin-bottom: 20px; line-height: 1.55; }
        .btn-full { width: 100%; padding: 11px 0; border-radius: 7px; border: none; font-size: 14.5px; font-weight: 600; }
        .btn-full.enabled { background: var(--blue); color: #fff; }
        .btn-full.disabled { background: #EAEFF6; color: #9AA7BB; cursor: not-allowed; }

        /* AUTH FORMS */
        .auth-shell { max-width: 400px; margin: 40px auto 80px; background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 34px 32px; }
        .auth-shell h1 { font-size: 24px; text-align: center; }
        .auth-shell > p.lede { text-align: center; margin: 10px auto 26px; font-size: 14px; }
        .field { margin-bottom: 16px; }
        .field label { display: block; font-size: 13px; font-weight: 600; color: var(--ink-soft); margin-bottom: 6px; }
        .field input { width: 100%; padding: 11px 13px; border: 1px solid var(--line); border-radius: 7px; font-size: 14.5px; background: #FBFCFE; }
        .field input:focus { outline: 2px solid var(--blue-bright); outline-offset: 1px; }
        .auth-submit { width: 100%; margin-top: 8px; }
        .form-note { display: none; margin-top: 16px; padding: 11px 13px; background: #EAF0F9; border-radius: 7px; font-size: 13px; color: var(--blue-deep); }
        .form-note.visible { display: block; }
        .auth-switch { text-align: center; margin-top: 20px; font-size: 13.5px; color: var(--ink-soft); }
        .auth-switch button { background: none; border: none; color: var(--blue-deep); font-weight: 600; font-size: 13.5px; padding: 0; }

        /* ABOUT */
        .about-body { max-width: 62ch; margin: 28px 0 60px; }
        .about-body p { color: var(--ink-soft); font-size: 15.5px; line-height: 1.7; margin-bottom: 16px; }

        /* READING QUIZ */
        .quiz-shell { max-width: 640px; margin: 36px auto 70px; }
        .quiz-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
        .quiz-title { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 19px; color: var(--blue-deep); }
        .quiz-timer { font-family: 'Inter', sans-serif; font-weight: 700; font-size: 19px; font-variant-numeric: tabular-nums; color: var(--blue); }
        .quiz-timer.low { color: var(--red); }
        .quiz-progress-track { height: 4px; background: var(--line); border-radius: 4px; margin: 14px 0 24px; overflow: hidden; }
        .quiz-progress-fill { height: 100%; background: var(--blue); transition: width 1s linear; }
        .quiz-progress-fill.low { background: var(--red); }
        .passage-card { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 20px 22px 6px; max-height: 230px; overflow-y: auto; }
        .passage-card p { font-size: 15px; line-height: 1.65; color: var(--ink); margin-bottom: 14px; }
        .quiz-questions { margin-top: 26px; display: flex; flex-direction: column; gap: 22px; }
        .q-head { display: flex; gap: 10px; margin-bottom: 10px; }
        .q-num { font-size: 13px; font-weight: 700; color: var(--blue); flex-shrink: 0; padding-top: 1px; }
        .q-text { font-size: 14.5px; color: var(--ink); }
        .q-options { display: flex; flex-direction: column; gap: 8px; padding-left: 22px; }
        .opt-btn { text-align: left; padding: 10px 14px; border-radius: 6px; border: 1px solid var(--line); background: var(--surface); font-size: 14px; }
        .opt-btn:hover { border-color: var(--blue-bright); }
        .opt-btn.selected { border-color: var(--blue); background: rgba(46,95,163,0.08); color: var(--blue-deep); font-weight: 600; }
        .quiz-submit { width: 100%; margin-top: 30px; padding: 13px 0; border-radius: 8px; border: none; font-size: 15px; font-weight: 700; background: var(--blue); color: #fff; }
        .quiz-submit:disabled { opacity: .4; cursor: not-allowed; }

        .result-card { text-align: center; padding: 30px 22px 26px; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; }
        .band-number { font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 42px; color: var(--blue-deep); margin-top: 8px; }
        .band-label { font-size: 12.5px; color: var(--ink-soft); }
        .result-note { font-size: 14px; color: var(--ink-soft); margin-top: 14px; }
        .score-row { margin-top: 14px; font-size: 13.5px; color: var(--ink-soft); }
        .review-wrap { margin-top: 24px; display: flex; flex-direction: column; gap: 14px; }
        .review-row { display: flex; gap: 12px; align-items: flex-start; }
        .review-icon { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; margin-top: 2px; font-weight: 700; }
        .review-icon.ok { background: rgba(62,138,91,0.14); color: var(--green); }
        .review-icon.no { background: rgba(196,69,59,0.12); color: var(--red); }
        .review-q { font-size: 13.5px; color: var(--ink); }
        .review-ans { font-size: 12.5px; color: var(--ink-soft); margin-top: 4px; }
        .retry-btn { width: 100%; margin-top: 22px; padding: 12px 0; background: none; color: var(--blue-deep); border: 1px solid var(--blue); border-radius: 8px; font-size: 14px; font-weight: 700; }
        .fade-in { animation: riseIn .35s ease; }

        @media (max-width: 860px) {
          .nav-links { display: none; }
          .hero-grid { grid-template-columns: 1fr; }
          h1 { font-size: 34px; }
          .feature-grid, .steps, .test-grid { grid-template-columns: 1fr; }
          .step { border-left: none; border-top: 2px solid var(--line); padding-left: 0; padding-top: 16px; }
          .cta-band { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <header>
        <nav className="wrap">
          <a className="brand" onClick={() => showView('home')}>
            <span className="brand-mark">P</span>Paul IELTS
          </a>
          <div className="nav-links">
            <a onClick={() => showView('home', 'features')}>Vì sao phù hợp</a>
            <a onClick={() => showView('home', 'how')}>Cách hoạt động</a>
            <a onClick={() => showView('luyen-de')}>Luyện đề</a>
            <a onClick={() => showView('about')}>Về Paul IELTS</a>
          </div>
          <div className="nav-actions">
            <button className="btn-ghost" onClick={() => showView('login')}>Đăng nhập</button>
            <button className="btn-primary" onClick={() => showView('signup')}>Đăng ký miễn phí</button>
          </div>
        </nav>
      </header>

      <main>
        {/* HOME VIEW */}
        <section className={`view ${activeView === 'home' ? 'active' : ''}`} id="view-home">
          <div className="hero">
            <div className="wrap hero-grid">
              <div>
                <div className="eyebrow-line"><span className="eyebrow-dot"></span>Dành riêng cho người đi làm</div>
                <h1>Luyện Reading &amp; Listening vừa khít giờ nghỉ của bạn</h1>
                <p className="lede">Không cần lịch học cố định. Mỗi buổi luyện chỉ 15–20 phút, chấm điểm tức thì và quy ra band ngay sau khi nộp bài — để việc ôn thi không giẫm chân lên giờ làm việc.</p>
                <div className="hero-ctas">
                  <button className="btn-large" onClick={goToQuiz}>Làm thử bài đầu tiên</button>
                  <a className="link-secondary" onClick={() => showView('home', 'how')}>Xem cách hoạt động</a>
                </div>
                <div className="trust-row"><strong>15–20 phút</strong> mỗi buổi · <strong>Miễn phí</strong> 5 bài đầu tiên</div>
              </div>
              <div className="hero-visual">
                <div className="hero-visual-label">Tiến độ band theo tuần</div>
                <div className="hero-visual-title">Người luyện đều đặn 3 buổi/tuần</div>
                <svg viewBox="0 0 460 220" width="100%">
                  <line x1="30" y1="30" x2="30" y2="185" stroke="#D8E1EE" strokeWidth="1.5"/>
                  <line x1="30" y1="185" x2="440" y2="185" stroke="#D8E1EE" strokeWidth="1.5"/>
                  <text x="10" y="34" fontFamily="Inter" fontSize="11" fill="#8492A8">9.0</text>
                  <text x="10" y="112" fontFamily="Inter" fontSize="11" fill="#8492A8">6.5</text>
                  <text x="14" y="189" fontFamily="Inter" fontSize="11" fill="#8492A8">4.0</text>
                  <polyline points="60,150 140,132 220,108 300,84 380,58" fill="none" stroke="#3E7BD6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="60" cy="150" r="5" fill="#2E5FA3"/>
                  <circle cx="140" cy="132" r="5" fill="#2E5FA3"/>
                  <circle cx="220" cy="108" r="5" fill="#2E5FA3"/>
                  <circle cx="300" cy="84" r="5" fill="#2E5FA3"/>
                  <circle cx="380" cy="58" r="6.5" fill="#C4453B"/>
                  <text x="46" y="204" fontFamily="Inter" fontSize="11" fill="#8492A8">Tuần 1</text>
                  <text x="126" y="204" fontFamily="Inter" fontSize="11" fill="#8492A8">Tuần 2</text>
                  <text x="206" y="204" fontFamily="Inter" fontSize="11" fill="#8492A8">Tuần 3</text>
                  <text x="286" y="204" fontFamily="Inter" fontSize="11" fill="#8492A8">Tuần 4</text>
                  <text x="358" y="204" fontFamily="Inter" fontSize="11" fill="#8492A8">Tuần 5</text>
                  <text x="392" y="52" fontFamily="Manrope" fontWeight="700" fontSize="13" fill="#C4453B">7.0</text>
                </svg>
              </div>
            </div>
          </div>

          <div className="section" id="features">
            <div className="wrap">
              <div className="section-head">
                <h2>Được thiết kế quanh lịch làm việc, không phải ngược lại</h2>
                <p>Phần lớn nền tảng IELTS được làm cho học sinh có nhiều giờ rảnh. Paul IELTS làm ngược lại — mọi thứ gói gọn trong khoảng nghỉ ngắn giữa ngày làm việc.</p>
              </div>
              <div className="feature-grid">
                <div className="feature-card">
                  <svg className="feature-icon" viewBox="0 0 38 38" fill="none"><circle cx="19" cy="19" r="15" stroke="#2E5FA3" strokeWidth="2"/><path d="M19 11v8l6 4" stroke="#2E5FA3" strokeWidth="2" strokeLinecap="round"/></svg>
                  <h3>Bài luyện 15–20 phút</h3>
                  <p>Vừa một lần nghỉ trưa hoặc một chặng di chuyển — không cần dồn cả buổi tối.</p>
                </div>
                <div className="feature-card">
                  <svg className="feature-icon" viewBox="0 0 38 38" fill="none"><path d="M9 20l7 7 13-15" stroke="#2E5FA3" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <h3>Chấm điểm tức thì</h3>
                  <p>Nộp bài là thấy kết quả ngay, kèm band ước tính và câu nào cần xem lại.</p>
                </div>
                <div className="feature-card">
                  <svg className="feature-icon" viewBox="0 0 38 38" fill="none"><path d="M8 27l6-9 6 4 9-13" stroke="#2E5FA3" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <h3>Theo dõi tiến độ theo tuần</h3>
                  <p>Biểu đồ đơn giản cho thấy band đang đi lên hay đang chững, để biết lúc nào cần đổi cách luyện.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="section" id="how">
            <div className="wrap">
              <div className="section-head"><h2>Bắt đầu trong ba bước</h2></div>
              <div className="steps">
                <div className="step"><div className="step-index">01</div><h3>Làm bài kiểm tra trình độ</h3><p>Một bài ngắn để xác định band hiện tại, không cần tài khoản.</p></div>
                <div className="step"><div className="step-index">02</div><h3>Nhận lịch luyện phù hợp</h3><p>Hệ thống gợi ý bài luyện đúng dạng câu bạn còn yếu, không học lan man.</p></div>
                <div className="step"><div className="step-index">03</div><h3>Luyện đều, xem tiến độ</h3><p>Mỗi buổi ngắn, kết quả cộng dồn theo tuần để thấy rõ mình đang ở đâu.</p></div>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="wrap">
              <div className="cta-band">
                <div>
                  <h2>Còn 15 phút nghỉ trưa hôm nay?</h2>
                  <p>Làm thử một bài Reading ngay bây giờ, không cần đăng ký trước.</p>
                </div>
                <button className="btn-on-dark" onClick={goToQuiz}>Làm thử ngay</button>
              </div>
            </div>
          </div>
        </section>

        {/* LUYỆN ĐỀ VIEW */}
        <section className={`view ${activeView === 'luyen-de' ? 'active' : ''}`} id="view-luyen-de">
          <div className="wrap page-head">
            <div className="eyebrow-line"><span className="eyebrow-dot"></span>Luyện đề</div>
            <h1 className="page-title">Chọn kỹ năng muốn luyện</h1>
          </div>
          <div className="wrap">
            <div className="test-grid">
              <div className="test-card">
                <span className="test-badge badge-ready">Sẵn sàng</span>
                <h3>Reading — Bài luyện thử</h3>
                <p>1 đoạn văn, 5 câu hỏi dạng True/False/Not Given và trắc nghiệm. Có đồng hồ đếm giờ và chấm điểm tức thì.</p>
                <button className="btn-full enabled" onClick={goToQuiz}>Bắt đầu</button>
              </div>
              <div className="test-card">
                <span className="test-badge badge-soon">Sắp ra mắt</span>
                <h3>Listening — Bài luyện thử</h3>
                <p>Đang được xây dựng — sẽ có ngay sau khi phần Reading hoàn thiện.</p>
                <button className="btn-full disabled" disabled>Sắp ra mắt</button>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT VIEW */}
        <section className={`view ${activeView === 'about' ? 'active' : ''}`} id="view-about">
          <div className="wrap page-head">
            <div className="eyebrow-line"><span className="eyebrow-dot"></span>Về chúng tôi</div>
            <h1 className="page-title">Paul IELTS</h1>
          </div>
          <div className="wrap about-body">
            <p>Paul IELTS được xây cho một nhóm người học cụ thể: người đi làm đang ôn IELTS mà không có nhiều giờ trống. Thay vì một khóa học dài, sản phẩm tập trung vào những buổi luyện ngắn, đúng trọng tâm, có thể làm trong giờ nghỉ trưa hoặc trên đường di chuyển.</p>
            <p>Sản phẩm hiện đang ở giai đoạn thử nghiệm sớm, bắt đầu với kỹ năng Reading và sẽ mở rộng sang Listening tiếp theo.</p>
          </div>
        </section>

        {/* LOGIN VIEW */}
        <section className={`view ${activeView === 'login' ? 'active' : ''}`} id="view-login">
          <div className="wrap">
            <div className="auth-shell">
              <h1>Đăng nhập</h1>
              <p className="lede" style={{ color: 'var(--ink-soft)' }}>Vào lại để tiếp tục theo dõi tiến độ của bạn.</p>
              <form onSubmit={(e) => handleMockSubmit(e, 'login')}>
                <div className="field"><label>Email</label><input type="email" placeholder="ban@vidu.com" required /></div>
                <div className="field"><label>Mật khẩu</label><input type="password" placeholder="••••••••" required /></div>
                <button className="btn-large auth-submit" type="submit">Đăng nhập</button>
                <div className={`form-note ${loginNoteVisible ? 'visible' : ''}`}>Đây là bản demo giao diện — hệ thống tài khoản thật chưa được kết nối.</div>
              </form>
              <div className="auth-switch">Chưa có tài khoản? <button onClick={() => showView('signup')}>Đăng ký miễn phí</button></div>
            </div>
          </div>
        </section>

        {/* SIGNUP VIEW */}
        <section className={`view ${activeView === 'signup' ? 'active' : ''}`} id="view-signup">
          <div className="wrap">
            <div className="auth-shell">
              <h1>Tạo tài khoản</h1>
              <p className="lede" style={{ color: 'var(--ink-soft)' }}>Miễn phí 5 bài luyện đầu tiên, không cần thẻ thanh toán.</p>
              <form onSubmit={(e) => handleMockSubmit(e, 'signup')}>
                <div className="field"><label>Họ tên</label><input type="text" placeholder="Nguyễn Văn A" required /></div>
                <div className="field"><label>Email</label><input type="email" placeholder="ban@vidu.com" required /></div>
                <div className="field"><label>Mật khẩu</label><input type="password" placeholder="Tối thiểu 8 ký tự" required /></div>
                <button className="btn-large auth-submit" type="submit">Đăng ký miễn phí</button>
                <div className={`form-note ${signupNoteVisible ? 'visible' : ''}`}>Đây là bản demo giao diện — hệ thống tài khoản thật chưa được kết nối.</div>
              </form>
              <div className="auth-switch">Đã có tài khoản? <button onClick={() => showView('login')}>Đăng nhập</button></div>
            </div>
          </div>
        </section>

        {/* READING QUIZ VIEW */}
        <section className={`view ${activeView === 'reading-quiz' ? 'active' : ''}`} id="view-reading-quiz">
          <div className="wrap">
            <div className="quiz-shell">
              {!submitted ? (
                <div id="quiz-panel">
                  <div className="quiz-top">
                    <div>
                      <div className="eyebrow-line" style={{ marginBottom: '6px' }}><span className="eyebrow-dot"></span>Reading · Bài luyện thử</div>
                      <div className="quiz-title">The Four-Day Week Experiment</div>
                    </div>
                    <div className={`quiz-timer ${timeLeft <= 30 ? 'low' : ''}`}>{minutes}:{seconds}</div>
                  </div>
                  <div className="quiz-progress-track">
                    <div className={`quiz-progress-fill ${timeLeft <= 30 ? 'low' : ''}`} style={{ width: `${(timeLeft / DURATION) * 100}%` }}></div>
                  </div>

                  <div className="passage-card">
                    <p>Between 2022 and 2023, a coalition of researchers coordinated one of the largest trials of the four-day working week ever conducted, involving more than sixty companies across several industries. Employees maintained full salaries while reducing their contracted hours by twenty percent, provided that output remained consistent.</p>
                    <p>Contrary to early skepticism, most participating firms reported no meaningful decline in revenue, and several noted measurable gains in staff retention. Researchers attributed part of this success to a phenomenon they termed "compressed focus": knowing that time was limited, employees restructured meetings, minimised low-value tasks, and protected blocks of uninterrupted work.</p>
                    <p>However, the trial also revealed limitations. Roles requiring constant customer-facing availability, such as retail and healthcare, proved far harder to adapt, and some employees reported that unfinished work simply migrated into personal time rather than disappearing altogether. The researchers cautioned that policymakers should not treat the model as a universal solution, but rather as one option among several for rethinking how modern labour is organised.</p>
                  </div>

                  <div className="quiz-questions">
                    {QUESTIONS.map((q, i) => (
                      <div className="q-block" key={q.id}>
                        <div className="q-head"><span className="q-num">{i + 1}</span><p className="q-text">{q.text}</p></div>
                        <div className="q-options">
                          {q.options.map((opt) => (
                            <button
                              key={opt}
                              className={`opt-btn ${answers[q.id] === opt ? 'selected' : ''}`}
                              onClick={() => selectAnswer(q.id, opt)}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    className="quiz-submit"
                    onClick={submitQuiz}
                    disabled={!allDone}
                  >
                    {allDone ? 'Nộp bài' : `Nộp bài (${answeredCount}/${QUESTIONS.length})`}
                  </button>
                </div>
              ) : (
                <div id="result-panel">
                  <div className="result-card fade-in">
                    <div className="eyebrow-line" style={{ justifyContent: 'center' }}><span className="eyebrow-dot"></span>Kết quả</div>
                    <div className="band-number">{bandResult.band}</div>
                    <div className="band-label">Band ước tính</div>
                    <p className="result-note">{bandResult.note}</p>
                    <div className="score-row">{score}/{QUESTIONS.length} câu đúng</div>
                  </div>
                  <div className="review-wrap">
                    {QUESTIONS.map((q, i) => {
                      const userAns = answers[q.id];
                      const correct = userAns === q.answer;
                      return (
                        <div className="review-row" key={q.id}>
                          <div className={`review-icon ${correct ? 'ok' : 'no'}`}>{correct ? '✓' : '✗'}</div>
                          <div>
                            <p className="review-q">{i + 1}. {q.text}</p>
                            <p className="review-ans">
                              Bạn chọn: <strong style={{ color: correct ? 'var(--green)' : 'var(--red)' }}>{userAns || '(bỏ trống)'}</strong>
                              {!correct && (
                                <> — Đáp án đúng: <strong style={{ color: 'var(--blue)' }}>{q.answer}</strong></>
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button className="retry-btn" onClick={resetQuiz}>Làm lại</button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap footer-row">
          <div className="footer-brand">Paul IELTS</div>
          <div className="footer-note">Luyện Reading &amp; Listening cho người đi làm bận rộn.</div>
        </div>
      </footer>
    </>
  );
}