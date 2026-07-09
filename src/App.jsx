import { useState, useEffect } from 'react'
import { lectures, labs } from './data/index'
import './App.css'

const t = {
  ua: {
    title: "Гайд по Java",
    subtitle: "Курс лекцій на базі навчальної програми MiNI PW",
    searchPlaceholder: "Пошук тем, коду чи ключових слів...",
    progress: "Прогрес вивчення",
    completed: "Вивчено",
    notCompleted: "Позначити як вивчене",
    quizTitle: "Тест для самоперевірки",
    quizSubmit: "Перевірити відповіді",
    quizReset: "Пройти тест знову",
    quizCorrect: "Вірно!",
    quizIncorrect: "Є помилки. Спробуйте ще раз.",
    prev: "Назад",
    next: "Вперед",
    noLecturesFound: "Лекцій не знайдено за вашим запитом",
    author: "Розроблено на основі матеріалів факультету MiNI PW • Адаптовано для Java",
    markAllRead: "Позначити все як вивчене",
    resetProgress: "Скинути прогрес",
    infoTitle: "Корисна примітка",
    copied: "Скопійовано!",
    copy: "Копіювати",
    quizScore: "Ваш результат",
    closeQuiz: "Закрити",
    questions: "питання"
  },
  pl: {
    title: "Przewodnik po Javie",
    subtitle: "Kurs wykładów oparty na programie MiNI PW",
    searchPlaceholder: "Szukaj tematów, kodu lub słów kluczowych...",
    progress: "Postęp nauki",
    completed: "Ukończono",
    notCompleted: "Oznacz jako ukończone",
    quizTitle: "Test sprawdzający",
    quizSubmit: "Sprawdź odpowiedzi",
    quizReset: "Rozwiąż ponownie",
    quizCorrect: "Poprawnie!",
    quizIncorrect: "Są błędy. Spróbuj ponownie.",
    prev: "Poprzedni",
    next: "Następny",
    noLecturesFound: "Nie znaleziono wykładów spełniających kryteria",
    author: "Opracowane na podstawie materiałów Wydziału MiNI PW • Adaptacja do Java",
    markAllRead: "Oznacz wszystkie jako przeczytane",
    resetProgress: "Resetuj postęp",
    infoTitle: "Ważna uwaga",
    copied: "Skopiowano!",
    copy: "Kopiuj",
    quizScore: "Twój wynik",
    closeQuiz: "Zamknij",
    questions: "pytania"
  },
  en: {
    title: "Java Guide",
    subtitle: "Lecture course based on the MiNI PW syllabus",
    searchPlaceholder: "Search topics, code, or keywords...",
    progress: "Learning Progress",
    completed: "Completed",
    notCompleted: "Mark as completed",
    quizTitle: "Knowledge Check Quiz",
    quizSubmit: "Verify Answers",
    quizReset: "Retake Quiz",
    quizCorrect: "Correct!",
    quizIncorrect: "Incorrect answers. Try again.",
    prev: "Previous",
    next: "Next",
    noLecturesFound: "No lectures matched your query",
    author: "Developed based on MiNI PW materials • Adapted for Java",
    markAllRead: "Mark all as read",
    resetProgress: "Reset progress",
    infoTitle: "Important Note",
    copied: "Copied!",
    copy: "Copy",
    quizScore: "Your score",
    closeQuiz: "Close",
    questions: "questions"
  }
};

function App() {
  const [selectedLectureId, setSelectedLectureId] = useState("01")
  const [searchQuery, setSearchQuery] = useState("")
  const [lang, setLang] = useState("ua")
  const [theme, setTheme] = useState("dark")
  const [completedLectures, setCompletedLectures] = useState(() => {
    const saved = localStorage.getItem("java_guide_completed")
    return saved ? JSON.parse(saved) : {}
  })
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState({})
  const [copiedIndex, setCopiedIndex] = useState(null)

  useEffect(() => {
    localStorage.setItem("java_guide_completed", JSON.stringify(completedLectures))
  }, [completedLectures])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const allItems = [...lectures, ...labs]
  const currentLecture = allItems.find(l => l.id === selectedLectureId) || allItems[0]

  const handleToggleComplete = (id) => {
    setCompletedLectures(prev => {
      const updated = { ...prev, [id]: !prev[id] }
      return updated
    })
  }

  const handleResetProgress = () => {
    if (window.confirm(lang === 'ua' ? 'Ви впевнені, що хочете скинути весь прогрес?' : 'Czy na pewno chcesz zresetować cały postęp?')) {
      setCompletedLectures({})
      setQuizAnswers({})
      setQuizSubmitted({})
    }
  }

  const handleMarkAllComplete = () => {
    const all = {}
    allItems.forEach(l => {
      all[l.id] = true
    })
    setCompletedLectures(all)
  }

  const totalProgress = Math.round((Object.keys(completedLectures).filter(k => completedLectures[k]).length / allItems.length) * 100)

  // Filter items based on search query
  const filteredItems = allItems.filter(l => {
    const query = searchQuery.toLowerCase()
    return l.title.toLowerCase().includes(query) ||
           l.description.toLowerCase().includes(query) ||
           l.sections.some(s => s.title.toLowerCase().includes(query) || s.content.toLowerCase().includes(query))
  })

  const handleSelectLecture = (id) => {
    setSelectedLectureId(id)
    // Smooth scroll to main content top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrev = () => {
    const currentIndex = allItems.findIndex(l => l.id === selectedLectureId)
    if (currentIndex > 0) {
      handleSelectLecture(allItems[currentIndex - 1].id)
    }
  }

  const handleNext = () => {
    const currentIndex = allItems.findIndex(l => l.id === selectedLectureId)
    if (currentIndex < allItems.length - 1) {
      handleSelectLecture(allItems[currentIndex + 1].id)
    }
  }

  const handleQuizAnswer = (questionIdx, optionIdx) => {
    if (quizSubmitted[selectedLectureId]) return // Can't change after check
    setQuizAnswers(prev => ({
      ...prev,
      [`${selectedLectureId}_${questionIdx}`]: optionIdx
    }))
  }

  const handleQuizSubmit = () => {
    setQuizSubmitted(prev => ({
      ...prev,
      [selectedLectureId]: true
    }))
  }

  const handleQuizReset = () => {
    setQuizSubmitted(prev => ({
      ...prev,
      [selectedLectureId]: false
    }))
    setQuizAnswers(prev => {
      const copy = { ...prev }
      currentLecture.quiz.forEach((_, idx) => {
        delete copy[`${selectedLectureId}_${idx}`]
      })
      return copy
    })
  }

  // Simple Markdown & Code parser
  const renderTextContent = (text, secIdx) => {
    const lines = text.split('\n')
    let keyIdx = 0
    let insideCode = false
    let codeLines = []
    let codeLang = 'java'
    let outputElements = []
    let insideList = false
    let listItems = []

    const flushList = () => {
      if (listItems.length > 0) {
        outputElements.push(
          <ul key={`list-${secIdx}-${keyIdx++}`} className="content-list">
            {listItems}
          </ul>
        )
        listItems = []
        insideList = false
      }
    }

    const parseInlineText = (inputText) => {
      // 1. Escape HTML
      let html = inputText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")

      // 2. Bold: **text**
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // 3. Inline code: `code`
      html = html.replace(/`(.*?)`/g, '<code>$1</code>')

      return <span dangerouslySetInnerHTML={{ __html: html }} />
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Handle Code Block
      if (line.startsWith('```')) {
        if (insideCode) {
          // Close Code Block
          const codeString = codeLines.join('\n')
          const currentCodeIdx = keyIdx++
          outputElements.push(
            <div key={`code-${secIdx}-${currentCodeIdx}`} className="code-block-wrapper">
              <div className="code-block-header">
                <span className="code-lang-label">{codeLang}</span>
                <button
                  className="code-copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(codeString)
                    setCopiedIndex(`${secIdx}-${currentCodeIdx}`)
                    setTimeout(() => setCopiedIndex(null), 1500)
                  }}
                >
                  {copiedIndex === `${secIdx}-${currentCodeIdx}` ? t[lang].copied : t[lang].copy}
                </button>
              </div>
              <pre className="code-pre">
                <code className="code-content">{codeString}</code>
              </pre>
            </div>
          )
          codeLines = []
          insideCode = false
        } else {
          // Open Code Block
          flushList()
          codeLang = line.replace('```', '') || 'java'
          insideCode = true
        }
        continue
      }

      if (insideCode) {
        codeLines.push(lines[i]) // keep raw spacing/indentation
        continue
      }

      // Handle bullet points
      if (line.startsWith('* ')) {
        insideList = true
        listItems.push(
          <li key={`li-${secIdx}-${i}`} className="content-list-item">
            {parseInlineText(line.substring(2))}
          </li>
        )
        continue
      } else if (insideList && line !== '') {
        // Continue list items or end list
        if (!line.startsWith('* ')) {
          flushList()
        }
      }

      // Handle Table header / divider (simple omit)
      if (line.startsWith('|') && (line.includes('---') || line.includes(':---'))) {
        continue
      }

      // Handle Table rows
      if (line.startsWith('|') && line.endsWith('|')) {
        flushList()
        const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
        const isHeader = i > 0 && lines[i-1].includes('---') // simple heuristic
        outputElements.push(
          <div key={`tr-${secIdx}-${i}`} className={`table-row-grid ${isHeader ? 'table-header' : ''}`}>
            {cells.map((cell, cIdx) => (
              <div key={`cell-${cIdx}`} className="table-cell">
                {parseInlineText(cell)}
              </div>
            ))}
          </div>
        )
        continue
      }

      // Handle Custom Alert boxes (glassmorphism cards)
      if (line.startsWith('> [!')) {
        flushList()
        const alertType = line.match(/> \[!(.*?)\]/)?.[1] || 'NOTE'
        // Read lines until empty line or end of quote
        let alertContentLines = []
        let j = i + 1
        while (j < lines.length && lines[j].trim().startsWith('>')) {
          alertContentLines.push(lines[j].trim().replace(/^>\s?/, ''))
          j++
        }
        i = j - 1 // Advance index
        outputElements.push(
          <div key={`alert-${secIdx}-${i}`} className={`alert-box alert-${alertType.toLowerCase()}`}>
            <div className="alert-badge">
              <span className="alert-icon">
                {alertType === 'IMPORTANT' && '⚠️'}
                {alertType === 'WARNING' && '🔥'}
                {alertType === 'CAUTION' && '🛑'}
                {alertType === 'NOTE' && '💡'}
                {alertType === 'TIP' && '✨'}
              </span>
              <span className="alert-label">{alertType}</span>
            </div>
            <div className="alert-text-body">
              {parseInlineText(alertContentLines.join(' '))}
            </div>
          </div>
        )
        continue
      }

      // Handle sub-headings
      if (line.startsWith('### ')) {
        flushList()
        outputElements.push(
          <h4 key={`h4-${secIdx}-${i}`} className="section-h4">
            {parseInlineText(line.substring(4))}
          </h4>
        )
        continue
      }

      // Handle normal paragraphs
      if (line !== '') {
        flushList()
        outputElements.push(
          <p key={`p-${secIdx}-${i}`} className="content-paragraph">
            {parseInlineText(line)}
          </p>
        )
      }
    }

    flushList()
    return outputElements
  }

  // Quiz calculations
  const totalQuizQuestions = currentLecture.quiz ? currentLecture.quiz.length : 0
  let correctAnswersCount = 0
  if (currentLecture.quiz) {
    currentLecture.quiz.forEach((q, idx) => {
      if (quizAnswers[`${selectedLectureId}_${idx}`] === q.answer) {
        correctAnswersCount++
      }
    })
  }

  return (
    <div className="app-container">
      {/* Sidebar Layout */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="title-area">
            <span className="logo-badge">JVM</span>
            <h2>{t[lang].title}</h2>
          </div>
          <p className="subtitle">{t[lang].subtitle}</p>
        </div>

        {/* Learning Progress Indicator */}
        <div className="progress-card">
          <div className="progress-labels">
            <span className="progress-title">{t[lang].progress}</span>
            <span className="progress-percentage">{totalProgress}%</span>
          </div>
          <div className="progress-track-bar">
            <div className="progress-fill-bar" style={{ width: `${totalProgress}%` }}></div>
          </div>
          <div className="progress-buttons">
            <button className="small-action-btn" onClick={handleMarkAllComplete}>{t[lang].markAllRead}</button>
            <button className="small-action-btn btn-danger" onClick={handleResetProgress}>{t[lang].resetProgress}</button>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="search-box-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder={t[lang].searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery("")}>×</button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="lecture-nav">
          <ul className="lecture-list">
            {filteredItems.map((l) => {
              const isSelected = l.id === selectedLectureId
              const isCompleted = completedLectures[l.id]
              const isLab = l.id.startsWith("Lab")
              const badgeText = isLab ? l.id : `Wykład ${l.id}`
              const titleText = isLab ? l.title.replace(/^Лабораторна \d+:\s?/, '') : l.title.replace(/^Wykład \d+:\s?/, '')
              return (
                <li
                  key={l.id}
                  className={`lecture-item ${isSelected ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isLab ? 'lab-item' : ''}`}
                  onClick={() => handleSelectLecture(l.id)}
                >
                  <div className="lecture-item-checkbox">
                    <span className="chk-mark">{isCompleted ? '✓' : ''}</span>
                  </div>
                  <div className="lecture-item-content">
                    <span className="lecture-badge">{badgeText}</span>
                    <span className="lecture-title-text">{titleText}</span>
                  </div>
                </li>
              )
            })}
            {filteredItems.length === 0 && (
              <p className="no-results-msg">{t[lang].noLecturesFound}</p>
            )}
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="main-header">
          <div className="header-breadcrumbs">
            <span>{t[lang].title}</span>
            <span className="divider">/</span>
            <span className="active-breadcrumb">{currentLecture.title.split(':')[0]}</span>
          </div>

          <div className="controls-group">
            {/* Language Selector */}
            <div className="lang-selector">
              {['ua', 'pl', 'en'].map((lCode) => (
                <button
                  key={lCode}
                  className={`lang-btn ${lang === lCode ? 'active' : ''}`}
                  onClick={() => setLang(lCode)}
                >
                  {lCode.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Dark / Light Toggle */}
            <button
              className="theme-toggle-btn"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        <article className="lecture-article">
          <div className="lecture-hero-card">
            <span className="hero-badge">{lang === 'ua' ? 'Навчальний модуль' : lang === 'pl' ? 'Moduł edukacyjny' : 'Lecture Module'} {currentLecture.id}</span>
            <h1 className="hero-lecture-title">{currentLecture.title}</h1>
            <p className="hero-lecture-desc">{currentLecture.description}</p>

            <div className="article-meta-row">
              <button
                className={`complete-toggle-btn ${completedLectures[currentLecture.id] ? 'btn-completed' : ''}`}
                onClick={() => handleToggleComplete(currentLecture.id)}
              >
                <span className="btn-icon">{completedLectures[currentLecture.id] ? '✓' : '◯'}</span>
                <span>
                  {completedLectures[currentLecture.id] ? t[lang].completed : t[lang].notCompleted}
                </span>
              </button>
            </div>
          </div>

          {/* Render Lecture Sections */}
          <div className="lecture-body">
            {currentLecture.sections.map((section, idx) => (
              <section key={`sec-${idx}`} className="lecture-section-card">
                <h3 className="section-title-h3">{section.title}</h3>
                <div className="section-content-body">
                  {renderTextContent(section.content, idx)}
                </div>
              </section>
            ))}
          </div>

          {/* Interactive Quiz Section */}
          {currentLecture.quiz && currentLecture.quiz.length > 0 && (
            <section className="quiz-section-card">
              <div className="quiz-header">
                <span className="quiz-badge">⚡ QUIZ</span>
                <h3 className="quiz-title-h3">{t[lang].quizTitle}</h3>
              </div>

              <div className="quiz-questions-list">
                {currentLecture.quiz.map((q, qIdx) => {
                  const selectedOpt = quizAnswers[`${selectedLectureId}_${qIdx}`]
                  const submitted = quizSubmitted[selectedLectureId]
                  return (
                    <div key={`q-${qIdx}`} className="quiz-question-item">
                      <p className="quiz-question-text">
                        <span className="question-number">{qIdx + 1}.</span> {q.question}
                      </p>
                      <div className="quiz-options-grid">
                        {q.options.map((opt, oIdx) => {
                          let optClass = ""
                          if (selectedOpt === oIdx) {
                            optClass = "option-selected"
                          }
                          if (submitted) {
                            if (oIdx === q.answer) {
                              optClass = "option-correct"
                            } else if (selectedOpt === oIdx) {
                              optClass = "option-incorrect"
                            } else {
                              optClass = "option-disabled"
                            }
                          }

                          return (
                            <button
                              key={`opt-${oIdx}`}
                              className={`quiz-option-btn ${optClass}`}
                              disabled={submitted}
                              onClick={() => handleQuizAnswer(qIdx, oIdx)}
                            >
                              <span className="option-letter">{String.fromCharCode(65 + oIdx)}.</span>
                              <span className="option-text">{opt}</span>
                            </button>
                          )
                        })}
                      </div>

                      {/* Explanation box after checking */}
                      {submitted && selectedOpt === q.answer && (
                        <div className="feedback-box feedback-success">
                          <p><strong>{t[lang].quizCorrect}</strong> {q.explanation}</p>
                        </div>
                      )}
                      {submitted && selectedOpt !== q.answer && (
                        <div className="feedback-box feedback-danger">
                          <p><strong>{t[lang].quizIncorrect}</strong> {q.explanation}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="quiz-actions-footer">
                {!quizSubmitted[selectedLectureId] ? (
                  <button
                    className="quiz-primary-btn"
                    disabled={currentLecture.quiz.some((_, idx) => quizAnswers[`${selectedLectureId}_${idx}`] === undefined)}
                    onClick={handleQuizSubmit}
                  >
                    {t[lang].quizSubmit}
                  </button>
                ) : (
                  <div className="quiz-result-score-row">
                    <span className="score-label">
                      {t[lang].quizScore}: <strong>{correctAnswersCount} / {totalQuizQuestions}</strong>
                    </span>
                    <button className="quiz-secondary-btn" onClick={handleQuizReset}>
                      {t[lang].quizReset}
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Navigation links at footer */}
          <footer className="article-navigation-footer">
            <button
              className="footer-nav-btn"
              disabled={allItems.findIndex(l => l.id === selectedLectureId) === 0}
              onClick={handlePrev}
            >
              ← {t[lang].prev}
            </button>
            <button
              className="footer-nav-btn"
              disabled={allItems.findIndex(l => l.id === selectedLectureId) === allItems.length - 1}
              onClick={handleNext}
            >
              {t[lang].next} →
            </button>
          </footer>
        </article>

        {/* Footer Credit */}
        <footer className="main-footer-credit">
          <p>{t[lang].author}</p>
        </footer>
      </main>
    </div>
  )
}

export default App
