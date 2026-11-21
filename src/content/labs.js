// Labs: the Ukrainian originals are JS objects in src/data/labNN.js.
// English translations are markdown files src/content/labs-en/labNN.md
// (frontmatter title/description, sections on "## ") with quizzes in
// src/content/labs-en/labNN.quiz.js ({ LabNN: [...] }). Missing translations fall back to Ukrainian.
import { labs as uaLabs } from '../data/index'
import { parseFrontmatter, splitSections } from './markdown-source'

const enFiles = import.meta.glob('./labs-en/lab*.md', { query: '?raw', import: 'default', eager: true })
const enQuizModules = import.meta.glob('./labs-en/*.quiz.js', { import: 'default', eager: true })
const enQuizzes = Object.assign({}, ...Object.values(enQuizModules))

const enLabs = Object.fromEntries(Object.entries(enFiles).map(([path, raw]) => {
  const id = 'Lab' + path.match(/lab(\d+)\.md$/)[1]
  const { meta, body } = parseFrontmatter(raw)
  return [id, {
    id,
    lang: 'en',
    title: meta.title || id,
    description: meta.description || '',
    sections: splitSections(body),
    quiz: enQuizzes[id] || [],
  }]
}))

// Starter projects: starters/labNN/{common,ua,en} are packed by scripts/build-starters.mjs
// into public/starters/labNN-<lang>.zip before dev/build. Only the folder names are needed here.
const starterLabs = new Set(Object.keys(import.meta.glob('/starters/lab*/starter.json', { eager: true }))
  .map(path => 'Lab' + path.match(/\/lab(\d+)\//)[1]))

export function starterUrl(labId, lang) {
  if (!starterLabs.has(labId)) return null
  return `${import.meta.env.BASE_URL}starters/${labId.toLowerCase()}-${lang}.zip`
}

export function getLabs(lang) {
  if (lang !== 'en') return uaLabs
  return uaLabs.map(lab => enLabs[lab.id] || lab)
}
