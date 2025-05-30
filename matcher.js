export function isAscii(char) {
  return char.codePointAt(0) < 128
}
export function isFullwidth(char) {
  const code = char.codePointAt(0)
  return 0xff01 <= code && code <= 0xff5e
}
export function fullwidthToAscii(char) {
  return String.fromCharCode(char.codePointAt(0) - 0xfee0)
}
export function asciiToFullwidth(char) {
  return String.fromCharCode(char.codePointAt(0) + 0xfee0)
}

export class Matcher {
  japaneseText = ''
  japaneseIndex = 0
  keystrokes = ''
  targets = []
  currentCharIsRomaji = true

  constructor(jp) {
    // case-insensitive matching for latin characters
    this.japaneseText = jp.toLowerCase()

    this.reset()
  }

  /** Show the player what to type next (1 character) */
  get hint() {
    if (!this.currentCharIsRomaji) {
      const kanaTarget = this.targets.find((target) => !isAscii(target[0]))
      if (kanaTarget) return kanaTarget.charAt(0)
    }

    return this.targets[0]?.charAt(0)
  }

  get completed() {
    return this.japaneseIndex === this.japaneseText.length
  }

  reset() {
    this.japaneseIndex = 0
    this.keystrokes = ''
    this.updateInputTargets()
  }

  updateInputTargets() {
    this.targets = getInputTargets(this.japaneseText.slice(this.japaneseIndex))
  }

  /**
   * Advances input completion state
   * @param {string} char
   * @returns {boolean} true if character matches one the input targets
   */
  input(char) {
    // case-insensitive
    char = char.toLowerCase()

    this.currentCharIsRomaji = isAscii(char)

    // character completes an input target
    // increment japanese index and get new targets
    // e.g. targets=['a'] input='a'
    if (this.targets.includes(char)) {
      this.japaneseIndex++
      if (this.japaneseIndex < this.japaneseText.length) {
        this.updateInputTargets()
      }
      this.keystrokes += char
      return true
    }

    // see if character prefixes an input target (or several)
    // e.g. targets=['ti', 'chi'] input='t' => ['ti']
    const matchingInputTargets = this.targets.filter((inputTarget) =>
      inputTarget.startsWith(char),
    )

    // e.g. targets=['ma'] input='h'
    if (matchingInputTargets.length === 0) return false

    // e.g. targets=['ti'] input='t' => ['i']
    this.targets = matchingInputTargets.map((inputTarget) =>
      inputTarget.slice(char.length),
    )

    this.keystrokes += char
    return true
  }
}

/**
 * @param {string} jp "しんじられない"
 * @returns {string[]} ["し", "si", "shi"]
 */
function getInputTargets(jp) {
  const romajiTargets = matchTextWithRules(jp, romajiRules)
  const kanaTargets = matchTextWithRules(jp, kanaRules)

  const targets = [...romajiTargets, ...kanaTargets]

  // in case the rules missed something...
  const nextCharacter = jp.charAt(0)
  targets.push(nextCharacter)
  if (isFullwidth(nextCharacter)) {
    targets.push(fullwidthToAscii(nextCharacter))
  } else if(isAscii(nextCharacter)) {
    targets.push(asciiToFullwidth(nextCharacter))
  }

  return targets
}

function matchTextWithRules(text, rules) {
  for (const [regex, targets] of rules) {
    if (text.match(regex)) {
      return targets
    }
  }
  return []
}

/**
 * Unicode for hiragana: https://www.unicode.org/charts/PDF/U3040.pdf
 * Unicode for katakana: https://www.unicode.org/charts/PDF/U30A0.pdf
 */
const HIRAGANA_START = 0x3041 // 'ぁ'
const HIRAGANA_END = 0x3096 // 'ゖ'
const KATAKANA_OFFSET = 0x30a1 - 0x3041 // Offset between 'ぁ' and 'ァ'

/**
 * Match each hiragana and katakana to its base hiragana plus dakuten if exists.
 * Examples: [/^[あア]/, ['あ']], [/^[がガ]/, ['か゛']]
 */
const kanaRules = []
for (let unicode = HIRAGANA_START; unicode <= HIRAGANA_END; unicode++) {
  const hiragana = String.fromCharCode(unicode)
  const katakana = String.fromCharCode(unicode + KATAKANA_OFFSET)

  // decompose kana into base kana plus dakuten
  const decomposed = hiragana.normalize('NFD')
  const baseHiragana = decomposed.charAt(0)

  // independent forms of dakuten and han-dakuten are two bits after the diacritic form
  const dakuten = decomposed.codePointAt(1)
    ? String.fromCharCode(decomposed.codePointAt(1) + 2)
    : ''

  kanaRules.push([
    new RegExp(`^[${hiragana}${katakana}]`),
    [`${baseHiragana}${dakuten}`],
  ])
}

/**
 *  Match a single kana character at the start of a string,
 *  and return the list of possible keyboard inputs.
 *  Order matters: patterns with lookaheads must precede general ones.
 *  Example: `/^[しシ](?=[ゃャゅュぇェょョ])/` before `/^[しシ]/` to match 'sh' before 'si'.
 */
const romajiRules = [
  [/^[きキ](?=[ゃャぃィゅュぇェょョ])/, ['ky']],
  [/^[ぎギ](?=[ゃャぃィゅュぇェょョ])/, ['gy']],
  [/^[にニ](?=[ゃャぃィゅュぇェょョ])/, ['ny']],
  [/^[みミ](?=[ゃャぃィゅュぇェょョ])/, ['my']],
  [/^[りリ](?=[ゃャぃィゅュぇェょョ])/, ['ry']],
  [/^[ひヒ](?=[ゃャぃィゅュぇェょョ])/, ['hy']],
  [/^[びビ](?=[ゃャぃィゅュぇェょョ])/, ['by']],
  [/^[ぴピ](?=[ゃャぃィゅュぇェょョ])/, ['py']],

  [/^[ふフ](?=[ぃィぇェ])/, ['f', 'fy']],
  [/^[ふフ](?=[ぁァぉォ])/, ['f']],
  [/^[ふフ](?=[ゃャゅュょョ])/, ['fy']],

  [/^[うウ](?=[ゃャゅュょョ])/, ['wy']],

  [/^[しシ](?=[ゃャゅュぇェょョ])/, ['sh', 'sy']],
  [/^[しシ](?=[ぃィ])/, ['sy']],

  [/^[じジ](?=[ゃャゅュぇェょョ])/, ['j', 'zy', 'jy']],
  [/^[じジ](?=[ぃィ])/, ['zy', 'jy']],

  [/^[ちチ](?=[ゃャゅュぇェょョ])/, ['ch', 'ty', 'cy']],
  [/^[ちチ](?=[ぃィ])/, ['ty', 'cy']],

  [/^[ぢヂ](?=[ゃャぃィゅュぇェょョ])/, ['dy']],

  [/^[うウ](?=[ぃィぇェ])/, ['w', 'wh']],
  [/^[うウ](?=[ぁァぉォ])/, ['wh']],

  [/^[ヴ](?=[ぁァぃィぇェぉォ])/, ['v']],
  [/^[ヴ](?=[ゃャゅュょョ])/, ['vy']],

  [/^[てテ](?=[ゃャぃィゅュぇェょョ])/, ['th']],

  [/^[でデ](?=[ゃャぃィゅュぇェょョ])/, ['dh']],

  [/^[つツ](?=[ぁァぃィぇェぉォ])/, ['ts']],
  [/^[つツ](?=[ゃャゅュょョ])/, ['tsy']],

  [/^[づヅ](?=[ぁァぃィぇェぉォ])/, ['dz']],
  [/^[づヅ](?=[ゃャゅュょョ])/, ['dzy']],

  [/^[とト](?=[ぅゥ])/, ['tw']],
  [/^[どド](?=[ぅゥ])/, ['dw']],

  [/^[あア]/, ['a']],
  [/^[いイ]/, ['i']],
  [/^[うウ]/, ['u']],
  [/^[えエ]/, ['e']],
  [/^[おオ]/, ['o']],

  [/^[かカ]/, ['ka']],
  [/^[がガ]/, ['ga']],
  [/^[きキ]/, ['ki']],
  [/^[ぎギ]/, ['gi']],
  [/^[くク]/, ['ku']],
  [/^[ぐグ]/, ['gu']],
  [/^[けケ]/, ['ke']],
  [/^[げゲ]/, ['ge']],
  [/^[こコ]/, ['ko']],
  [/^[ごゴ]/, ['go']],

  [/^[さサ]/, ['sa']],
  [/^[ざザ]/, ['za']],
  [/^[しシ]/, ['si', 'shi']],
  [/^[じジ]/, ['ji', 'zi']],
  [/^[すス]/, ['su']],
  [/^[ずズ]/, ['zu']],
  [/^[せセ]/, ['se']],
  [/^[ぜゼ]/, ['ze']],
  [/^[そソ]/, ['so']],
  [/^[ぞゾ]/, ['zo']],

  [/^[たタ]/, ['ta']],
  [/^[だダ]/, ['da']],
  [/^[ちチ]/, ['ti', 'chi']],
  [/^[ぢヂ]/, ['di']],
  [/^[つツ]/, ['tu', 'tsu']],
  [/^[づヅ]/, ['du', 'dzu']],
  [/^[てテ]/, ['te']],
  [/^[でデ]/, ['de']],
  [/^[とト]/, ['to']],
  [/^[どド]/, ['do']],

  [/^[なナ]/, ['na']],
  [/^[にニ]/, ['ni']],
  [/^[ぬヌ]/, ['nu']],
  [/^[ねネ]/, ['ne']],
  [/^[のノ]/, ['no']],

  [/^[はハ]/, ['ha']],
  [/^[ばバ]/, ['ba']],
  [/^[ぱパ]/, ['pa']],
  [/^[ひヒ]/, ['hi']],
  [/^[びビ]/, ['bi']],
  [/^[ぴピ]/, ['pi']],
  [/^[ふフ]/, ['fu', 'hu']],
  [/^[ぶブ]/, ['bu']],
  [/^[ぷプ]/, ['pu']],
  [/^[へヘ]/, ['he']],
  [/^[べベ]/, ['be']],
  [/^[ぺペ]/, ['pe']],
  [/^[ほホ]/, ['ho']],
  [/^[ぼボ]/, ['bo']],
  [/^[ぽポ]/, ['po']],

  [/^[まマ]/, ['ma']],
  [/^[みミ]/, ['mi']],
  [/^[むム]/, ['mu']],
  [/^[めメ]/, ['me']],
  [/^[もモ]/, ['mo']],

  [/^[やヤ]/, ['ya']],
  [/^[ゆユ]/, ['yu']],
  [/^[よヨ]/, ['yo']],

  [/^[らラ]/, ['ra']],
  [/^[りリ]/, ['ri']],
  [/^[るル]/, ['ru']],
  [/^[れレ]/, ['re']],
  [/^[ろロ]/, ['ro']],

  [/^[わワ]/, ['wa']],
  [/^[ゐヰ]/, ['wyi']],
  [/^[ゑヱ]/, ['wye']],
  [/^[をヲ]/, ['wo']],

  [/^[ヴ]/, ['vu']],

  [/^[んン](?=[なにぬねのナニヌネノ])/, ["n'", 'nn']],
  [/^[んン]/, ['n']],

  [/^[ー]/, ['-']],

  [/^[っッ](?=[かきくけこカキクケコ])/, ['k']],
  [/^[っッ](?=[がぎぐげごガギグゲゴ])/, ['g']],
  [/^[っッ](?=[さしすせそサシスセソ])/, ['s']],
  [/^[っッ](?=[ざずぜぞザズゼゾ])/, ['z']],
  [/^[っッ](?=[たつてとタツテト])/, ['t']],
  [/^[っッ](?=[だぢづでどダヂヅデド])/, ['d']],
  [/^[っッ](?=[なにぬねのナニヌネノ])/, ['n']],
  [/^[っッ](?=[はひへほハヒヘホ])/, ['h']],
  [/^[っッ](?=[ばびぶべぼバビブベボ])/, ['b']],
  [/^[っッ](?=[ぱぴぷぺぽパピプペポ])/, ['p']],
  [/^[っッ](?=[まみむめもマミムメモ])/, ['m']],
  [/^[っッ](?=[やゆよヤユヨ])/, ['y']],
  [/^[っッ](?=[らりるれろラリルレロ])/, ['r']],
  [/^[っッ](?=[わワゐヰうウゑヱをヲ])/, ['w']],
  [/^[っッ](?=[ちチ][ゃャゅュぇェょョ])/, ['c', 't']],
  [/^[っッ](?=[ちチ])/, ['t', 'c']],
  [/^[っッ](?=[ふフ])/, ['f', 'h']],
  [/^[っッ](?=[じジ])/, ['j', 'j']],
  [/^[っッ](?=[ヴ])/, ['v']],

  [/^[ぁァ]/, ['a', 'xa', 'la']],
  [/^[ぃィ]/, ['i', 'xi', 'li']],
  [/^[ぅゥ]/, ['u', 'xu', 'lu']],
  [/^[ぇェ]/, ['e', 'xe', 'le']],
  [/^[ぉォ]/, ['o', 'xo', 'lo']],
  [/^[ゃャ]/, ['a', 'xya', 'lya']],
  [/^[ゅュ]/, ['u', 'xyu', 'lyu']],
  [/^[ょョ]/, ['o', 'xyo', 'lyo']],
  [/^[ゎヮ]/, ['xwa', 'lwa']],
  [/^[っッ]/, ['xtu', 'ltu', 'xtsu', 'ltsu']],
  [/^[ヵ]/, ['xka', 'lka']],
  [/^[ヶ]/, ['xke', 'lke']],

  // punctuation (best effort)
  [/^[、，,､]/, [',']],
  [/^[。．.]/, ['.']],
  [/^[：:]/, [':']],
  [/^[；;]/, [';']],
  [/^[？?]/, ['?']],
  [/^[！!]/, ['!']],
  [/^[—―-]/, ['-']],
  [/^…/, ['...']],
  [/^・/, ['.', '/']],
  [/^[〜~]/, ['~']],
  [/^／/, ['/', ';']],
  [/^％/, ['%']],

  // lenient quotes and brackets
  [/^[「｢『（［＂”"]/, ['"', '«', '[', '(', '{']],
  [/^[」｣』）］]/, ['"', '»', ']', ')', '}']],
]
