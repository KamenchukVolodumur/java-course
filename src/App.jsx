import { useEffect, useMemo, useState } from 'react'
import { getChapters, getLecturePages, LANGS } from './content/lectures'
import { getLabs, starterUrl } from './content/labs'
import Markdown, { subHeadings } from './Markdown'
import './App.css'

const t = {
  ua: {
    brand: 'Програмування на Java',
    search: 'Пошук',
    lectures: 'Лекції',
    labs: 'Лабораторні',
    language: 'Українська',
    noResults: 'Нічого не знайдено',
    progress: 'Прогрес',
    reset: 'скинути',
    resetConfirm: 'Скинути весь прогрес?',
    theme: { auto: 'Тема: системна', light: 'Тема: світла', dark: 'Тема: темна' },
    toggleMenu: 'Показати/сховати меню',
    quiz: 'Тест для самоперевірки',
    questions: 'питань',
    check: 'Перевірити',
    retry: 'Пройти знову',
    correct: 'Правильно.',
    incorrect: 'Неправильно.',
    score: 'Результат',
    markDone: 'Позначити як вивчене',
    done: 'Вивчено',
    prev: 'Попередня',
    next: 'Наступна',
    copy: 'Копіювати',
    copied: 'Скопійовано',
    starter: 'Завантажити стартовий проєкт',
    starterHint: 'Готові файли до лабораторної: наданий код, заготовки й тести до етапів. Інструкція — у README.md всередині.',
    footer: 'За матеріалами курсів MiNI PW (C#, C++) · адаптовано для Java',
  },
  en: {
    brand: 'Programming in Java',
    search: 'Search',
    lectures: 'Lectures',
    labs: 'Laboratories',
    language: 'English',
    noResults: 'No results',
    progress: 'Progress',
    reset: 'reset',
    resetConfirm: 'Reset all progress?',
    theme: { auto: 'Theme: system', light: 'Theme: light', dark: 'Theme: dark' },
    toggleMenu: 'Show/hide menu',
    quiz: 'Self-check quiz',
    questions: 'questions',
    check: 'Check answers',
    retry: 'Try again',
    correct: 'Correct.',
    incorrect: 'Incorrect.',
    score: 'Score',
    markDone: 'Mark as done',
    done: 'Done',
    prev: 'Previous',
    next: 'Next',
    copy: 'Copy',
    copied: 'Copied',
    starter: 'Download the starter project',
    starterHint: 'Ready-made files for the lab: the given code, stubs and tests for the stages. Instructions are in README.md inside.',
    footer: 'Based on MiNI PW courses (C#, C++) · adapted for Java',
  },
}

const THEMES = ['auto', 'light', 'dark']

const readStorage = (key, fallback) => {
  try {
    const v = localStorage.getItem(key)
    return v === null ? fallback : JSON.parse(v)
  } catch {
    return fallback
  }
}
const writeStorage = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage unavailable */ }
}


const isLab = (item) => item.id.startsWith('Lab')
const initialLang = () => { const l = readStorage('jg_lang', 'ua'); return LANGS.includes(l) ? l : 'ua' }
const shortTitle = (item) => (isLab(item) ? item.title.replace(/^[^:]*\d+:\s?/, '') : item.title)
const numberOf = (item) => String(Number(item.id.replace('Lab', '')))

const Icon = ({ name }) => {
  const paths = {
    menu: 'M3 6h18M3 12h18M3 18h18',
    chevron: 'M9 6l6 6-6 6',
    translate: 'M4 5h8M8 3v2m1.5 0c-.5 3-2.5 6-5.5 8m2-4c1 2 3 3.5 5 4M13 21l4-9 4 9m-6.5-3h5',
    theme: 'M12 3a9 9 0 1 0 0 18V3z',
    download: 'M12 4v11m-5-5l5 5 5-5M5 20h14',
    check: 'M5 12l5 5 9-10',
  }
  return (
    <svg className={`icon icon-${name}`} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={name === 'theme' ? 0 : 2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {name === 'theme' ? <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" /><path d={paths.theme} fill="currentColor" /></> : <path d={paths[name]} />}
    </svg>
  )
}

function Quiz({ item, labels }) {
  const [answers, setAnswers] = useState({})
  const [checked, setChecked] = useState(false)
  const quiz = item.quiz || []
  if (!quiz.length) return null
  const score = quiz.filter((q, i) => answers[i] === q.answer).length

  return (
    <details className="book-details quiz">
      <summary>{labels.quiz} <span className="muted">· {quiz.length} {labels.questions}</span></summary>
      <div className="details-body">
        {quiz.map((q, qi) => (
          <div key={qi} className="quiz-question">
            <p><strong>{qi + 1}.</strong> {q.question}</p>
            <div className="quiz-options">
              {q.options.map((opt, oi) => {
                let cls = 'quiz-option'
                if (answers[qi] === oi) cls += ' selected'
                if (checked && oi === q.answer) cls += ' correct'
                else if (checked && answers[qi] === oi) cls += ' wrong'
                return (
                  <button key={oi} className={cls} disabled={checked}
                    onClick={() => setAnswers(a => ({ ...a, [qi]: oi }))}>
                    <span className="quiz-letter">{String.fromCharCode(65 + oi)}</span>
                    <span>{opt}</span>
                  </button>
                )
              })}
            </div>
            {checked && (
              <blockquote className={`book-hint ${answers[qi] === q.answer ? 'tip' : 'caution'}`}>
                <p><strong>{answers[qi] === q.answer ? labels.correct : labels.incorrect}</strong> {q.explanation}</p>
              </blockquote>
            )}
          </div>
        ))}
        <div className="quiz-footer">
          {!checked ? (
            <button className="btn" disabled={Object.keys(answers).length < quiz.length} onClick={() => setChecked(true)}>
              {labels.check}
            </button>
          ) : (
            <>
              <span>{labels.score}: <strong>{score} / {quiz.length}</strong></span>
              <button className="btn" onClick={() => { setAnswers({}); setChecked(false) }}>{labels.retry}</button>
            </>
          )}
        </div>
      </div>
    </details>
  )
}

function App() {
  const [lang, setLang] = useState(initialLang)
  const chapters = getChapters(lang)
  const labs = getLabs(lang)
  const allItems = useMemo(() => [...getLecturePages(lang), ...getLabs(lang)], [lang])
  const [currentId, setCurrentId] = useState(() => {
    const fromHash = decodeURIComponent(window.location.hash.slice(1)).split('/')[0]
    return allItems.some(i => i.id === fromHash) ? fromHash : allItems[0].id
  })
  const [query, setQuery] = useState('')
  const [theme, setTheme] = useState(() => readStorage('jg_theme', 'auto'))
  const [menuHidden, setMenuHidden] = useState(() => readStorage('jg_menu_hidden', false))
  const [mobileMenu, setMobileMenu] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [done, setDone] = useState(() => readStorage('java_guide_completed', {}))
  const current = allItems.find(i => i.id === currentId) || allItems[0]
  const groupsOf = (item) => (isLab(item) ? { labs: true } : { lectures: true, [item.chapter]: true })
  const [openGroups, setOpenGroups] = useState(() => groupsOf(current))
  const L = t[lang] || t.ua

  useEffect(() => writeStorage('java_guide_completed', done), [done])
  useEffect(() => writeStorage('jg_lang', lang), [lang])
  useEffect(() => writeStorage('jg_menu_hidden', menuHidden), [menuHidden])
  useEffect(() => {
    writeStorage('jg_theme', theme)
    if (theme === 'auto') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  useEffect(() => {
    document.documentElement.lang = lang === 'ua' ? 'uk' : lang
    document.title = `${shortTitle(current)} · ${L.brand}`
  }, [current, lang, L.brand])
  useEffect(() => {
    const onHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1)).split('/')[0]
      if (allItems.some(i => i.id === id)) setCurrentId(id)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [allItems])

  const select = (id) => {
    setCurrentId(id)
    const target = allItems.find(i => i.id === id)
    if (target) setOpenGroups(g => ({ ...g, ...groupsOf(target) }))
    setMobileMenu(false)
    window.history.replaceState(null, '', `#${id}`)
    window.scrollTo({ top: 0 })
  }

  const q = query.trim().toLowerCase()
  const matches = (item) => !q || item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) ||
    item.sections.some(s => (s.title || '').toLowerCase().includes(q) || s.content.toLowerCase().includes(q))
  const visibleChapters = chapters.map(c => ({ ...c, pages: c.pages.filter(matches) })).filter(c => c.pages.length)
  const visibleLabs = labs.filter(matches)
  const isOpen = (key) => Boolean(q) || Boolean(openGroups[key])
  const toggle = (key) => setOpenGroups(o => ({ ...o, [key]: !o[key] }))

  const menuItem = (item, label) => (
    <li key={item.id}>
      <a href={`#${item.id}`} className={`menu-link ${item.id === current.id ? 'active' : ''}`}
        onClick={(e) => { e.preventDefault(); select(item.id) }}>
        {label}
        <span className="grow">{shortTitle(item)}</span>
        {done[item.id] && <Icon name="check" />}
      </a>
    </li>
  )

  const idx = allItems.findIndex(i => i.id === current.id)
  const prev = allItems[idx - 1]
  const next = allItems[idx + 1]
  const doneCount = allItems.filter(i => done[i.id]).length
  const percent = Math.round((doneCount / allItems.length) * 100)

  const toc = current.sections.map((s, si) => ({
    id: `sec-${si}`,
    title: s.title,
    subs: subHeadings(s.content).map((h, hi) => ({ id: `sec-${si}-h${hi}`, title: h })),
  })).flatMap(s => (s.title ? [s] : s.subs.map(h => ({ ...h, subs: [] }))))
  const chapterOf = chapters.find(c => c.id === current.chapter)
  const headerTitle = isLab(current) ? current.title.split(':')[0] : chapterOf?.title

  const jump = (e, id) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.replaceState(null, '', `#${current.id}/${id}`)
  }

  return (
    <div className={`book ${menuHidden ? 'menu-hidden' : ''} ${mobileMenu ? 'mobile-menu-open' : ''}`}>
      <div className="menu-overlay" onClick={() => setMobileMenu(false)} />

      <aside className="book-menu" aria-label="Menu">
        <div className="book-menu-content">
          <nav>
            <h2 className="book-brand"><a href="#" onClick={(e) => { e.preventDefault(); select(allItems[0].id) }}>{L.brand}</a></h2>

            <div className="book-search">
              <input type="text" placeholder={L.search} aria-label={L.search} value={query}
                onChange={e => setQuery(e.target.value)} maxLength={64} />
            </div>

            <ul className="book-sites">
              <li>
                <button className={`menu-row ${langOpen ? 'open' : ''}`} onClick={() => setLangOpen(o => !o)}>
                  <Icon name="translate" /><span className="grow">{L.language}</span><Icon name="chevron" />
                </button>
                {langOpen && (
                  <ul>
                    {LANGS.filter(l => l !== lang).map(l => (
                      <li key={l}><button className="menu-link" onClick={() => { setLang(l); setLangOpen(false) }}>{t[l].language}</button></li>
                    ))}
                  </ul>
                )}
              </li>
            </ul>

            <ul className="book-section">
              <li>
                <button className={`menu-row ${isOpen('lectures') ? 'open' : ''}`} onClick={() => toggle('lectures')}>
                  <span className="grow">{L.lectures}</span><Icon name="chevron" />
                </button>
                {isOpen('lectures') && (
                  <ul>
                    {visibleChapters.map(c => (
                      <li key={c.id}>
                        <button className={`menu-row ${isOpen(c.id) ? 'open' : ''}`} onClick={() => toggle(c.id)}>
                          <span className="menu-num">{Number(c.number)}.</span>
                          <span className="grow">{c.title}</span><Icon name="chevron" />
                        </button>
                        {isOpen(c.id) && <ul>{c.pages.map(pg => menuItem(pg, null))}</ul>}
                      </li>
                    ))}
                    {visibleChapters.length === 0 && <li className="muted menu-empty">{L.noResults}</li>}
                  </ul>
                )}
              </li>
            </ul>

            <ul className="book-section">
              <li>
                <button className={`menu-row ${isOpen('labs') ? 'open' : ''}`} onClick={() => toggle('labs')}>
                  <span className="grow">{L.labs}</span><Icon name="chevron" />
                </button>
                {isOpen('labs') && (
                  <ul>
                    {visibleLabs.map(item => menuItem(item, <span className="menu-num">{numberOf(item)}.</span>))}
                    {visibleLabs.length === 0 && <li className="muted menu-empty">{L.noResults}</li>}
                  </ul>
                )}
              </li>
            </ul>

            <div className="menu-footer">
              <div className="progress-line">
                {L.progress}: {doneCount}/{allItems.length} ({percent}%)
                {doneCount > 0 && (
                  <button className="link-btn" onClick={() => { if (window.confirm(L.resetConfirm)) setDone({}) }}>{L.reset}</button>
                )}
              </div>
              <div className="progress-bar"><div style={{ width: `${percent}%` }} /></div>
              <button className="menu-row" onClick={() => setTheme(THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length])}>
                <Icon name="theme" /><span className="grow">{L.theme[theme]}</span>
              </button>
            </div>
          </nav>
        </div>
      </aside>

      <div className="book-page">
        <header className="book-header">
          <button className="menu-toggle" title={L.toggleMenu} aria-label={L.toggleMenu}
            onClick={() => (window.matchMedia('(max-width: 56rem)').matches ? setMobileMenu(m => !m) : setMenuHidden(h => !h))}>
            <Icon name="menu" />
          </button>
          <span className="header-title">{headerTitle}</span>
        </header>

        <article className="markdown book-article">
          {chapterOf && <p className="crumb muted">{Number(chapterOf.number)}. {chapterOf.title}</p>}
          <h1>{current.title}</h1>
          {current.description && <p className="lead">{current.description}</p>}
          {isLab(current) && starterUrl(current.id, lang) && (
            <div className="starter">
              <a className="starter-button" href={starterUrl(current.id, lang)} download>
                <Icon name="download" /> {L.starter}
              </a>
              <span className="muted">{L.starterHint}</span>
            </div>
          )}

          {current.sections.map((s, si) => (
            <section key={`${current.id}-${si}`}>
              {s.title && <h2 id={`sec-${si}`}>{s.title}</h2>}
              <Markdown text={s.content} sectionId={`sec-${si}`} labels={L} />
            </section>
          ))}

          <Quiz key={current.id} item={current} labels={L} />

          <div className="page-actions">
            <button className={`btn ${done[current.id] ? 'btn-done' : ''}`}
              onClick={() => setDone(d => ({ ...d, [current.id]: !d[current.id] }))}>
              {done[current.id] ? <><Icon name="check" /> {L.done}</> : L.markDone}
            </button>
          </div>
        </article>

        <footer className="book-footer">
          <div className="page-nav">
            {prev ? (
              <a href={`#${prev.id}`} onClick={(e) => { e.preventDefault(); select(prev.id) }}>
                <span className="muted">← {L.prev}</span>
                <span>{shortTitle(prev)}</span>
              </a>
            ) : <span />}
            {next ? (
              <a href={`#${next.id}`} className="next" onClick={(e) => { e.preventDefault(); select(next.id) }}>
                <span className="muted">{L.next} →</span>
                <span>{shortTitle(next)}</span>
              </a>
            ) : <span />}
          </div>
          <p className="muted small">{L.footer}</p>
        </footer>
      </div>

      <aside className="book-toc">
        <div className="book-toc-content">
          <nav id="TableOfContents">
            <ul>
              {toc.map(s => (
                <li key={s.id}>
                  <a href={`#${s.id}`} onClick={(e) => jump(e, s.id)}>{s.title}</a>
                  {s.subs.length > 0 && (
                    <ul>
                      {s.subs.map(h => <li key={h.id}><a href={`#${h.id}`} onClick={(e) => jump(e, h.id)}>{h.title}</a></li>)}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </div>
  )
}

export default App
