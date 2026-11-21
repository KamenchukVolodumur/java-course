import { useState } from 'react'
import { tokenize } from './highlight'

// Supported markdown subset:
// ```lang code```, ### / #### headings, * / - bullets (with indented sub-items), 1. numbered lists,
// | tables |, > [!NOTE|TIP|IMPORTANT|WARNING|CAUTION] hints, > quotes, ---,
// inline **bold**, *italic*, `code`, [links](https://...)

export function parseInline(text) {
  let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const code = []
  html = html.replace(/`([^`]+)`/g, (_, c) => {
    code.push(c)
    return `@@CODE${code.length - 1}@@`
  })
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/(^|[\s(])\*([^*\s][^*]*?)\*(?=[\s.,:;)!?]|$)/g, '$1<em>$2</em>')
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  html = html.replace(/@@CODE(\d+)@@/g, (_, i) => `<code>${code[Number(i)]}</code>`)
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

/** Extracts "### " sub-headings of a section (used by the page TOC). */
export function subHeadings(content) {
  const result = []
  let inCode = false
  for (const raw of content.split('\n')) {
    const line = raw.trim()
    if (line.startsWith('```')) inCode = !inCode
    else if (!inCode && line.startsWith('### ')) result.push(line.substring(4))
  }
  return result
}

function CodeBlock({ code, lang, labels }) {
  const [copied, setCopied] = useState(false)
  const tokens = tokenize(code, lang)
  return (
    <div className="highlight">
      <button
        className="copy-btn"
        onClick={() => {
          navigator.clipboard?.writeText(code)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }}
      >
        {copied ? labels.copied : labels.copy}
      </button>
      <pre className="chroma" tabIndex={0}>
        <code data-lang={lang}>
          {tokens.map((t, i) => (t.cls ? <span key={i} className={t.cls}>{t.text}</span> : t.text))}
        </code>
      </pre>
    </div>
  )
}

const HINT_CLASS = { NOTE: 'note', TIP: 'tip', IMPORTANT: 'important', WARNING: 'warning', CAUTION: 'caution' }

export default function Markdown({ text, sectionId, labels }) {
  const lines = text.split('\n')
  const out = []
  let key = 0
  let headingIdx = 0
  let inCode = false
  let codeLines = []
  let codeLang = 'java'
  let list = null // { ordered, start, items: [{ text, subs }] }
  let table = null // { header, rows }

  const flushList = () => {
    if (list && list.items.length) {
      const Tag = list.ordered ? 'ol' : 'ul'
      out.push(
        <Tag key={key++} start={list.ordered && list.start !== 1 ? list.start : undefined}>
          {list.items.map((it, i) => (
            <li key={i}>
              {parseInline(it.text)}
              {it.subs.length > 0 && (
                <ul>{it.subs.map((s, j) => <li key={j}>{parseInline(s)}</li>)}</ul>
              )}
            </li>
          ))}
        </Tag>
      )
    }
    list = null
  }

  const flushTable = () => {
    if (table) {
      out.push(
        <div key={key++} className="table-wrap">
          <table>
            {table.header && (
              <thead><tr>{table.header.map((c, i) => <th key={i}>{parseInline(c)}</th>)}</tr></thead>
            )}
            <tbody>
              {table.rows.map((r, ri) => <tr key={ri}>{r.map((c, ci) => <td key={ci}>{parseInline(c)}</td>)}</tr>)}
            </tbody>
          </table>
        </div>
      )
    }
    table = null
  }

  const flushAll = () => { flushList(); flushTable() }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const line = raw.trim()

    if (line.startsWith('```')) {
      if (inCode) {
        out.push(<CodeBlock key={key++} code={codeLines.join('\n')} lang={codeLang} labels={labels} />)
        codeLines = []
        inCode = false
      } else {
        flushAll()
        codeLang = line.slice(3).trim() || 'java'
        inCode = true
      }
      continue
    }
    if (inCode) { codeLines.push(raw); continue }

    // tables
    if (line.startsWith('|') && line.endsWith('|')) {
      flushList()
      if (/^\|[\s:|-]+\|$/.test(line) && line.includes('-')) {
        if (table && table.rows.length === 1 && !table.header) table.header = table.rows.pop()
        continue
      }
      if (!table) table = { header: null, rows: [] }
      table.rows.push(line.split(/(?<!\\)\|/).map(c => c.trim().replace(/\\\|/g, '|')).slice(1, -1))
      continue
    } else if (table) {
      flushTable()
    }

    // hints: > [!TYPE]
    if (line.startsWith('> [!')) {
      flushAll()
      const type = (line.match(/> \[!(.*?)\]/)?.[1] || 'NOTE').toUpperCase()
      const body = []
      let j = i + 1
      while (j < lines.length && lines[j].trim().startsWith('>')) {
        body.push(lines[j].trim().replace(/^>\s?/, ''))
        j++
      }
      i = j - 1
      const blocks = []
      let para = []
      let bullets = []
      const pushPara = () => { if (para.length) { blocks.push({ p: para.join(' ') }); para = [] } }
      const pushBullets = () => { if (bullets.length) { blocks.push({ ul: bullets }); bullets = [] } }
      body.forEach(b => {
        if (/^[*-] /.test(b)) { pushPara(); bullets.push(b.slice(2)) }
        else if (b === '') { pushPara(); pushBullets() }
        else { pushBullets(); para.push(b) }
      })
      pushPara(); pushBullets()
      out.push(
        <blockquote key={key++} className={`book-hint ${HINT_CLASS[type] || 'note'}`}>
          {blocks.map((b, bi) => b.p !== undefined
            ? <p key={bi}>{parseInline(b.p)}</p>
            : <ul key={bi}>{b.ul.map((it, ii) => <li key={ii}>{parseInline(it)}</li>)}</ul>)}
        </blockquote>
      )
      continue
    }

    if (line.startsWith('> ')) {
      flushAll()
      out.push(<blockquote key={key++}><p>{parseInline(line.slice(2))}</p></blockquote>)
      continue
    }

    // lists
    const bullet = line.match(/^[*-] (.*)$/)
    const ordered = line.match(/^(\d+)\. (.*)$/)
    const indented = /^\s{2,}/.test(raw)
    const last = list ? list.items[list.items.length - 1] : null
    if (last && indented && (bullet || ordered)) {
      last.subs.push(bullet ? bullet[1] : ordered[2])
      continue
    }
    if (bullet || ordered) {
      const isOrdered = Boolean(ordered)
      if (list && list.ordered !== isOrdered) flushList()
      if (!list) list = { ordered: isOrdered, start: isOrdered ? Number(ordered[1]) : 1, items: [] }
      list.items.push({ text: bullet ? bullet[1] : ordered[2], subs: [] })
      continue
    }
    if (last && indented && line !== '') {
      if (last.subs.length) last.subs[last.subs.length - 1] += ' ' + line
      else last.text += ' ' + line
      continue
    }

    if (line === '') {
      let k = i + 1
      while (k < lines.length && lines[k].trim() === '') k++
      const next = k < lines.length ? lines[k] : ''
      const continues = list && (/^\s{2,}([*-]|\d+\.) /.test(next) ||
        (list.ordered ? /^\d+\. /.test(next.trim()) : /^[*-] /.test(next.trim())))
      if (!continues) flushList()
      continue
    }

    if (line.startsWith('#### ')) {
      flushAll()
      out.push(<h4 key={key++}>{parseInline(line.slice(5))}</h4>)
      continue
    }
    if (line.startsWith('### ')) {
      flushAll()
      out.push(<h3 key={key++} id={`${sectionId}-h${headingIdx++}`}>{parseInline(line.slice(4))}</h3>)
      continue
    }
    if (line === '---') {
      flushAll()
      out.push(<hr key={key++} />)
      continue
    }

    flushAll()
    out.push(<p key={key++}>{parseInline(line)}</p>)
  }
  flushAll()
  return <>{out}</>
}
