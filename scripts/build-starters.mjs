// Builds the downloadable starter projects for the labs.
//
//   starters/_shared/maven/   added to every Maven lab (wrapper, .gitignore, test helpers)
//   starters/labNN/common/    files shared by both languages
//   starters/labNN/ua|en/     language-specific files; they override common/ files with the same path
//   starters/labNN/starter.json
//       maven     false for a lab without a Maven project (default true)
//       shared    optional list of the _shared/maven files to take (default: all of them)
//       messages  { key: { ua, en } } — "{{key}}" in *.tmpl files is replaced, and ".tmpl" is dropped
//       readme    data for the generated README.md (used when no layer has its own README.md)
//
// Output: public/starters/labNN-<lang>.zip. With "--dir <path>" the projects are written
// unzipped to <path>/<lang>/labNN instead (used to compile and test them locally).
// No dependencies: a minimal ZIP writer on top of node:zlib.
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const ROOT = path.resolve(import.meta.dirname, '..')
const SRC = path.join(ROOT, 'starters')
const LANGS = ['ua', 'en']
const EXECUTABLE = new Set(['mvnw'])

const dirArg = process.argv.indexOf('--dir')
const OUT_DIR = dirArg > 0 ? path.resolve(process.argv[dirArg + 1]) : null
const OUT_ZIP = path.join(ROOT, 'public', 'starters')

function listFiles(dir, base = dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const full = path.join(dir, e.name)
    return e.isDirectory() ? listFiles(full, base) : [path.relative(base, full).split(path.sep).join('/')]
  })
}

function render(text, messages, lang, where) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const m = messages[key]
    if (!m || m[lang] === undefined) throw new Error(`${where}: no "${lang}" message for {{${key}}}`)
    return m[lang]
  })
}

// ---------- README ----------

const README_TEXT = {
  ua: {
    intro: 'Текст завдання — на сайті курсу. У цьому проєкті є все, що інакше довелося б копіювати звідти.',
    inside: 'Що всередині', file: 'Файл', status: 'Статус',
    given: 'надано, не змінюйте', main: 'надано: розкоментовуйте блоки `STAGE` по черзі',
    yours: '**ваше**: замініть кожен `throw new UnsupportedOperationException("TODO")`',
    tests: 'тести до етапів',
    open: 'Як відкрити',
    openText: 'IntelliJ IDEA: **File → Open** → оберіть цю папку (ту, де лежить `pom.xml`). JDK {jdk} або новіший.',
    run: 'Запуск',
    runNote: 'На Windows замість `./mvnw` — `mvnw.cmd`. Встановлювати Maven не потрібно: wrapper завантажить його під час першого запуску. В IntelliJ можна просто натиснути ▶ біля `main`.',
    testsTitle: 'Тести',
    all: 'усі етапи', one: 'лише один етап', several: 'кілька етапів',
    testsNote: 'Етапи, які ви ще не почали, падають з `UnsupportedOperationException: TODO` — так і має бути. Етап готовий, коли його тести зелені і програма друкує рівно очікуваний вивід із завдання.',
  },
  en: {
    intro: 'The task text is on the course site. This project contains everything you would otherwise copy from it.',
    inside: 'What is inside', file: 'File', status: 'Status',
    given: 'given, do not change', main: 'given: uncomment the `STAGE` blocks one by one',
    yours: '**yours**: replace every `throw new UnsupportedOperationException("TODO")`',
    tests: 'tests for the stages',
    open: 'Opening the project',
    openText: 'IntelliJ IDEA: **File → Open** → select this folder (the one with `pom.xml`). JDK {jdk} or newer.',
    run: 'Running',
    runNote: 'On Windows use `mvnw.cmd` instead of `./mvnw`. You do not need to install Maven: the wrapper downloads it on the first run. In IntelliJ you can simply press ▶ next to `main`.',
    testsTitle: 'Tests',
    all: 'all stages', one: 'only one stage', several: 'several stages',
    testsNote: 'Stages you have not started yet fail with `UnsupportedOperationException: TODO` — that is expected. A stage is done when its tests are green and the program prints exactly the expected output from the task.',
  },
}

const code = s => '`' + s + '`'

function readme(r, lang) {
  const T = README_TEXT[lang]
  const L = []
  L.push(`# ${r.title[lang]}`, '', r.intro?.[lang] ?? T.intro, '')
  if (r.files?.length) {
    L.push(`## ${T.inside}`, '', `| ${T.file} | ${T.status} |`, '| --- | --- |')
    for (const f of r.files) {
      const status = typeof f.status === 'string' ? T[f.status] : f.status[lang]
      L.push(`| ${f.names.map(code).join(', ')} | ${status} |`)
    }
    L.push('')
  }
  if (r.maven !== false) {
    L.push(`## ${T.open}`, '', T.openText.replace('{jdk}', r.jdk ?? 17), '')
    if (r.mains?.length) {
      L.push(`## ${T.run}`, '', '```bash')
      for (const m of r.mains) L.push(`./mvnw compile exec:java -Dexec.mainClass=${m}`)
      L.push('```', '', T.runNote, '')
    }
    if (r.stages?.length) {
      const [a, b] = r.stages
      L.push(`## ${T.testsTitle}`, '', '```bash',
        `./mvnw test`.padEnd(36) + `# ${T.all}`,
        `./mvnw test -Dgroups=${a}`.padEnd(36) + `# ${T.one}: ${r.stages.join(', ')}`)
      if (b) L.push(`./mvnw test -Dgroups=${a},${b}`.padEnd(36) + `# ${T.several}`)
      L.push('```', '', T.testsNote, '')
    }
  }
  if (r.notes?.[lang]) L.push(r.notes[lang].trim(), '')
  return L.join('\n')
}

// ---------- ZIP ----------

function dosDateTime(d) {
  return {
    time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
    date: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  }
}

function zip(entries) {
  const { time, date } = dosDateTime(new Date(2025, 0, 1))
  const local = []
  const central = []
  let offset = 0
  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name, 'utf8')
    const deflated = zlib.deflateRawSync(data)
    const crc = zlib.crc32(data)
    const mode = EXECUTABLE.has(path.posix.basename(name)) ? 0o100755 : 0o100644

    const lh = Buffer.alloc(30)
    lh.writeUInt32LE(0x04034b50, 0)
    lh.writeUInt16LE(20, 4)
    lh.writeUInt16LE(0x0800, 6)      // UTF-8 names
    lh.writeUInt16LE(8, 8)           // deflate
    lh.writeUInt16LE(time, 10)
    lh.writeUInt16LE(date, 12)
    lh.writeUInt32LE(crc, 14)
    lh.writeUInt32LE(deflated.length, 18)
    lh.writeUInt32LE(data.length, 22)
    lh.writeUInt16LE(nameBuf.length, 26)
    local.push(lh, nameBuf, deflated)

    const ch = Buffer.alloc(46)
    ch.writeUInt32LE(0x02014b50, 0)
    ch.writeUInt16LE((3 << 8) | 20, 4)   // made by Unix, so the file mode is honoured
    ch.writeUInt16LE(20, 6)
    ch.writeUInt16LE(0x0800, 8)
    ch.writeUInt16LE(8, 10)
    ch.writeUInt16LE(time, 12)
    ch.writeUInt16LE(date, 14)
    ch.writeUInt32LE(crc, 16)
    ch.writeUInt32LE(deflated.length, 20)
    ch.writeUInt32LE(data.length, 24)
    ch.writeUInt16LE(nameBuf.length, 28)
    ch.writeUInt32LE((mode << 16) >>> 0, 38)
    ch.writeUInt32LE(offset, 42)
    central.push(ch, nameBuf)

    offset += lh.length + nameBuf.length + deflated.length
  }
  const centralBuf = Buffer.concat(central)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(centralBuf.length, 12)
  end.writeUInt32LE(offset, 16)
  return Buffer.concat([...local, centralBuf, end])
}

// ---------- main ----------

if (OUT_DIR) fs.rmSync(OUT_DIR, { recursive: true, force: true })
else { fs.rmSync(OUT_ZIP, { recursive: true, force: true }); fs.mkdirSync(OUT_ZIP, { recursive: true }) }

const only = process.argv.slice(2).filter(a => /^lab\d\d$/.test(a))
const labs = fs.readdirSync(SRC).filter(d => /^lab\d\d$/.test(d)).filter(d => !only.length || only.includes(d)).sort()

for (const lab of labs) {
  const cfgPath = path.join(SRC, lab, 'starter.json')
  const cfg = fs.existsSync(cfgPath) ? JSON.parse(fs.readFileSync(cfgPath, 'utf8')) : {}
  const messages = cfg.messages ?? {}
  const layers = [...(cfg.maven === false ? [] : [path.join(SRC, '_shared', 'maven')]),
    path.join(SRC, lab, 'common')]

  for (const lang of LANGS) {
    const files = new Map()   // published path -> Buffer
    for (const dir of [...layers, path.join(SRC, lab, lang)]) {
      const isShared = dir === path.join(SRC, '_shared', 'maven')
      for (const rel of listFiles(dir)) {
        if (isShared && cfg.shared && !cfg.shared.includes(rel)) continue
        const full = path.join(dir, rel)
        if (rel.endsWith('.tmpl')) {
          files.set(rel.slice(0, -5), Buffer.from(render(fs.readFileSync(full, 'utf8'), messages, lang, `${lab}/${rel}`)))
        } else {
          files.set(rel, fs.readFileSync(full))
        }
      }
    }
    if (!files.has('README.md') && cfg.readme) {
      files.set('README.md', Buffer.from(readme({ ...cfg.readme, maven: cfg.maven }, lang)))
    }

    const names = [...files.keys()].sort()
    if (OUT_DIR) {
      for (const rel of names) {
        const target = path.join(OUT_DIR, lang, lab, rel)
        fs.mkdirSync(path.dirname(target), { recursive: true })
        fs.writeFileSync(target, files.get(rel))
        if (EXECUTABLE.has(path.basename(rel))) fs.chmodSync(target, 0o755)
      }
      console.log(`starters: ${lab} (${lang}) -> ${path.join(OUT_DIR, lang, lab)}`)
    } else {
      const out = path.join(OUT_ZIP, `${lab}-${lang}.zip`)
      fs.writeFileSync(out, zip(names.map(rel => ({ name: `${lab}/${rel}`, data: files.get(rel) }))))
      console.log(`starters: ${path.relative(ROOT, out)} (${names.length} files)`)
    }
  }
}
