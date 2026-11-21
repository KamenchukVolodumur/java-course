// Lectures are markdown files: src/content/lectures/<chapter>/<NN-slug>.md (Ukrainian)
// with an optional English translation next to them: <NN-slug>.en.md.
// Each file starts with a frontmatter block (title, description) and is split
// into sections on "## " headings (outside code fences).
// A page without a translation falls back to the Ukrainian version.
import { quizzes } from './quizzes'
import { parseFrontmatter, splitSections } from '../markdown-source'

const files = import.meta.glob('./*/*.md', { query: '?raw', import: 'default', eager: true })

export const LANGS = ['ua', 'en']

const chapterTitles = {
  ua: {
    '01-intro': 'Вступ',
    '02-tools': 'Інструменти',
    '03-basics': 'Основи мови',
    '04-types': 'Створення типів',
    '05-features': 'Можливості мови',
    '06-collections': 'Колекції',
    '07-filesystem': 'Файлова система',
    '08-reflection': 'Рефлексія',
    '09-concurrency': 'Конкурентність',
    '10-ipc': 'Міжпроцесна взаємодія',
    '11-native': 'Взаємодія з нативним кодом',
    '12-synchronization': 'Синхронізація',
    '13-other': 'Інше',
    '14-extra': 'Додатково',
  },
  en: {
    '01-intro': 'Introduction',
    '02-tools': 'Tools',
    '03-basics': 'Language Basics',
    '04-types': 'Creating Types',
    '05-features': 'Language Features',
    '06-collections': 'Collections',
    '07-filesystem': 'File System',
    '08-reflection': 'Reflection',
    '09-concurrency': 'Concurrency',
    '10-ipc': 'Inter-Process Communication',
    '11-native': 'Native Interoperability',
    '12-synchronization': 'Synchronization',
    '13-other': 'Other Topics',
    '14-extra': 'Extras',
  },
}

// sources[lang][chapter][file] = { meta, body }
const sources = { ua: {}, en: {} }
for (const [path, raw] of Object.entries(files)) {
  const [, chapter, name] = path.match(/^\.\/([^/]+)\/([^/]+)\.md$/)
  const lang = name.endsWith('.en') ? 'en' : 'ua'
  const file = lang === 'en' ? name.slice(0, -3) : name
  ;((sources[lang][chapter] ||= {}))[file] = parseFrontmatter(raw)
}

function buildChapters(lang) {
  return Object.keys(chapterTitles.ua)
    .filter(chapter => sources.ua[chapter])
    .map(chapter => ({
      id: chapter,
      number: chapter.slice(0, 2),
      title: chapterTitles[lang][chapter],
      pages: Object.keys(sources.ua[chapter]).sort().map(file => {
        const translated = sources[lang]?.[chapter]?.[file]
        const { meta, body } = translated || sources.ua[chapter][file]
        const id = `${chapter.slice(0, 2)}-${file.replace(/^\d+-/, '')}`
        return {
          id,
          file,
          chapter,
          lang: translated ? lang : 'ua',
          title: meta.title || file,
          description: meta.description || '',
          sections: splitSections(body),
          quiz: (translated ? quizzes[lang]?.[id] : null) || quizzes.ua[id] || [],
        }
      }),
    }))
}

const cache = {}
export function getChapters(lang) {
  return (cache[lang] ||= buildChapters(LANGS.includes(lang) ? lang : 'ua'))
}

export function getLecturePages(lang) {
  return getChapters(lang).flatMap(c => c.pages)
}
