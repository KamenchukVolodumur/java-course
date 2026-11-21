// Self-check questions live next to the pages: <chapter>/quiz.js (Ukrainian)
// and <chapter>/quiz.en.js (English) export default
// { [pageId]: [{ question, options, answer, explanation }] }
const ua = import.meta.glob('./*/quiz.js', { import: 'default', eager: true })
const en = import.meta.glob('./*/quiz.en.js', { import: 'default', eager: true })

export const quizzes = {
  ua: Object.assign({}, ...Object.values(ua)),
  en: Object.assign({}, ...Object.values(en)),
}
