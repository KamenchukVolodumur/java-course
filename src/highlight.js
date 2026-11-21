// Lightweight syntax highlighter producing Chroma-style token classes
// (k, kd, kt, kc, n, nc, nd, nt, na, s, c, m, o, p) so that the
// Solarized colors in App.css match csharp.mini.pw.edu.pl (Hugo + Chroma).

const words = (s) => new Set(s.trim().split(/\s+/))

const JAVA = {
  declaration: words(`public private protected static final abstract sealed non-sealed default synchronized
    native transient volatile strictfp class interface enum record extends implements permits throws
    package import module requires exports opens uses provides transitive`),
  keyword: words(`if else for while do switch case return new try catch finally throw break continue yield
    instanceof var this super assert when with to`),
  type: words('boolean byte char double float int long short void'),
  constant: words('true false null'),
  classIntro: words('class interface enum record'),
}

const KOTLIN = {
  declaration: words(`package import class interface object fun val var private public protected internal
    override open data sealed companion abstract enum`),
  keyword: words('return if else when for while do try catch finally throw is in as by get set this super'),
  type: words('Int Long Double Float Boolean Unit Char'),
  constant: words('true false null'),
  classIntro: words('class interface object'),
}

const C = {
  declaration: words('static const extern struct typedef enum union unsigned signed'),
  keyword: words('if else for while do switch case return break continue goto sizeof'),
  type: words('int long short char float double void size_t jint jclass JNIEnv JNIEXPORT JNICALL'),
  constant: words('NULL true false'),
  classIntro: words('struct'),
}

const SQL_KEYWORDS = words(`select from where and or not insert into values update set delete create table
  index on primary key foreign references unique null default check join left right inner outer full
  group by having order asc desc limit offset as in between like is distinct count sum avg min max
  begin commit rollback transaction cascade varchar char bigint int integer numeric decimal timestamp
  bigserial serial boolean text generated always identity if exists drop alter add constraint truncate
  restart`)

const BASH_KEYWORDS = words('if then else elif fi for in do done case esac while until function return export local')
const BASH_COMMANDS = words(`git java javac jar mvn gradle ./gradlew ./mvnw docker curl echo cat cd ls mkdir rm cp mv
  ssh ssh-keygen chcp jshell jcmd jstack jstat jps jfr native-image npm node`)

const DOCKER_INSTR = words('FROM RUN COPY ADD WORKDIR EXPOSE ENTRYPOINT CMD ENV ARG USER LABEL VOLUME HEALTHCHECK AS')

// Each rule: [regex (sticky), class | (match, state) => class]
const javaLikeRules = (kw) => [
  [/\/\*[\s\S]*?\*\//y, 'c'],
  [/\/\/.*/y, 'c'],
  [/"""[\s\S]*?"""/y, 's'],
  [/"(?:\\.|[^"\\\n])*"/y, 's'],
  [/'(?:\\.|[^'\\\n])+'/y, 's'],
  [/@[A-Za-z_][\w.]*/y, 'nd'],
  [/\b(?:0[xX][\da-fA-F_]+|0[bB][01_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?)[lLfFdD]?\b/y, 'm'],
  [/non-sealed\b/y, 'kd'],
  [/[A-Za-z_$][\w$]*/y, (m, st) => {
    const afterDot = st.lastSig === '.'
    st.lastSig = m
    if (st.afterClassIntro) { st.afterClassIntro = false; return 'nc' }
    if (kw.declaration.has(m)) { if (kw.classIntro.has(m) && !afterDot) st.afterClassIntro = true; return 'kd' }
    if (kw.keyword.has(m)) return 'k'
    if (kw.type.has(m)) return 'kt'
    if (kw.constant.has(m)) return 'kc'
    return 'n'
  }],
  [/\s+/y, null],
  [/(?:->|::|==|!=|<=|>=|&&|\|\||\+\+|--|[+\-*/%=<>!&|^~?:])/y, (m, st) => { st.lastSig = m; st.afterClassIntro = false; return 'o' }],
  [/./y, (m, st) => { st.lastSig = m; st.afterClassIntro = false; return 'p' }],
]

const RULES = {
  java: javaLikeRules(JAVA),
  kotlin: javaLikeRules(KOTLIN),
  c: javaLikeRules(C),
  sql: [
    [/--.*/y, 'c'],
    [/'(?:''|[^'])*'/y, 's'],
    [/\b\d+(?:\.\d+)?\b/y, 'm'],
    [/[A-Za-z_][\w]*/y, (m) => SQL_KEYWORDS.has(m.toLowerCase()) ? 'k' : 'n'],
    [/\s+/y, null],
    [/[=<>!*+\-/%,;().?]/y, 'p'],
    [/./y, 'p'],
  ],
  bash: [
    [/#.*/y, 'c'],
    [/"(?:\\.|[^"\\])*"/y, 's'],
    [/'[^']*'/y, 's'],
    [/\$\{?[\w?]+\}?/y, 'nv'],
    [/--?[\w-]+/y, 'na'],
    [/[\w./-]+/y, (m, st) => {
      const first = st.lineStart
      st.lineStart = false
      if (BASH_KEYWORDS.has(m)) return 'k'
      if (first && BASH_COMMANDS.has(m)) return 'nb'
      return null
    }],
    [/\n/y, (m, st) => { st.lineStart = true; return null }],
    [/[ \t]+/y, null],
    [/[|&;<>]+/y, (m, st) => { st.lineStart = true; return 'o' }],
    [/./y, null],
  ],
  xml: [
    [/<!--[\s\S]*?-->/y, 'c'],
    [/<\/?[\w:.-]+/y, 'nt'],
    [/\/?>/y, 'nt'],
    [/[\w:.-]+(?==)/y, 'na'],
    [/"[^"]*"/y, 's'],
    [/[^<]+?(?=<|$)/y, null],
    [/./y, null],
  ],
  json: [
    [/"(?:\\.|[^"\\])*"(?=\s*:)/y, 'nt'],
    [/"(?:\\.|[^"\\])*"/y, 's'],
    [/-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y, 'm'],
    [/\b(?:true|false|null)\b/y, 'kc'],
    [/\s+/y, null],
    [/./y, 'p'],
  ],
  yaml: [
    [/#.*/y, 'c'],
    [/^[ \t]*-?[ \t]*[\w.-]+(?=:)/my, 'nt'],
    [/"(?:\\.|[^"\\])*"/y, 's'],
    [/'[^']*'/y, 's'],
    [/\$\{\w+\}/y, 'nv'],
    [/\b\d+(?:\.\d+)?\b/y, 'm'],
    [/\b(?:true|false|null)\b/y, 'kc'],
    [/\s+/y, null],
    [/./y, null],
  ],
  dockerfile: [
    [/#.*/y, 'c'],
    [/^[ \t]*[A-Z]+\b/my, (m) => DOCKER_INSTR.has(m.trim()) ? 'k' : null],
    [/\b(?:AS)\b/y, 'k'],
    [/"(?:\\.|[^"\\])*"/y, 's'],
    [/\s+/y, null],
    [/[\w./:=-]+/y, null],
    [/./y, 'p'],
  ],
}

const ALIASES = {
  java: 'java', kotlin: 'kotlin', kts: 'kotlin', c: 'c', cpp: 'c',
  sql: 'sql', bash: 'bash', sh: 'bash', shell: 'bash', powershell: 'bash',
  xml: 'xml', html: 'xml', json: 'json', yaml: 'yaml', yml: 'yaml', dockerfile: 'dockerfile',
}

/** Returns an array of { cls, text } tokens; cls is null for plain text. */
export function tokenize(code, lang) {
  const rules = RULES[ALIASES[(lang || '').toLowerCase()]]
  if (!rules) return [{ cls: null, text: code }]
  const tokens = []
  const state = { afterClassIntro: false, lineStart: true }
  let pos = 0
  while (pos < code.length) {
    let matched = false
    for (const [re, kind] of rules) {
      re.lastIndex = pos
      const m = re.exec(code)
      if (m && m[0].length > 0) {
        const cls = typeof kind === 'function' ? kind(m[0], state) : kind
        const last = tokens[tokens.length - 1]
        if (last && last.cls === cls) last.text += m[0]
        else tokens.push({ cls, text: m[0] })
        pos += m[0].length
        matched = true
        break
      }
    }
    if (!matched) {
      tokens.push({ cls: null, text: code[pos] })
      pos++
    }
  }
  return tokens
}
