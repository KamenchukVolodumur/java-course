// Shared helpers for markdown content files (lectures and translated labs).

export function parseFrontmatter(raw) {
  const text = raw.replace(/\r\n/g, '\n')
  const meta = {}
  let body = text
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/)
  if (m) {
    for (const line of m[1].split('\n')) {
      const i = line.indexOf(':')
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim()
    }
    body = text.slice(m[0].length)
  }
  return { meta, body }
}

// Splits on "## " headings outside code fences; text before the first heading
// becomes a section without a title.
export function splitSections(body) {
  const sections = []
  let current = { title: null, lines: [] }
  let inCode = false
  for (const line of body.split('\n')) {
    if (line.trim().startsWith('```')) inCode = !inCode
    if (!inCode && line.startsWith('## ')) {
      if (current.title !== null || current.lines.some(l => l.trim())) sections.push(current)
      current = { title: line.slice(3).trim(), lines: [] }
    } else {
      current.lines.push(line)
    }
  }
  sections.push(current)
  return sections
    .filter(s => s.title !== null || s.lines.some(l => l.trim()))
    .map(s => ({ title: s.title, content: s.lines.join('\n') }))
}
