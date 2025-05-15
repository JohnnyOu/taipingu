export class Matcher {
  japaneseText = ''
  japaneseIndex = 0
  keystrokes = ''
  targets = []

  /**
   * First character of first possible input target
   */
  get hint() {
    return this.targets[0][0]
  }

  get completed() {
    return this.japaneseIndex === this.japaneseText.length
  }

  constructor(jp) {
    // No spaces, lowercase, half-width ASCII
    // TODO: normalize outside of this function
    this.japaneseText = jp
      .toLowerCase()
      .replace(/\s/g, '')
      .replace(/[\uFF01-\uFF5E]/g, (c) =>
        String.fromCharCode(c.charCodeAt(0) - 0xfee0),
      )
    this.reset()
  }

  reset() {
    this.japaneseIndex = 0
    this.keystrokes = ''
    this.updateInputTargets()
  }

  updateInputTargets() {
    this.targets = [
      ...getInputTargets(this.japaneseText.slice(this.japaneseIndex)),
      this.japaneseText[this.japaneseIndex],
    ]
  }

  /**
   * Advances input completion state
   * @param {string} char
   * @returns {boolean} true if character matches one the input targets
   */
  input(char) {
    // character completes an input target
    // increment japanese index and get new targets
    // e.g. allowed=['a'] input='a'
    if (this.targets.includes(char)) {
      this.japaneseIndex++
      if (this.japaneseIndex < this.japaneseText.length) {
        this.updateInputTargets()
      }
      this.keystrokes += char
      return true
    }

    // see if character prefixes an input target (or several)
    // e.g. allowed=['ti', 'chi'] input='t' =>['ti']
    const matchingInputTargets = this.targets.filter((inputTarget) =>
      inputTarget.startsWith(char),
    )

    // e.g. allowed=['ma'] input='h'
    if (matchingInputTargets.length === 0) return false

    // e.g. allowed=['ti'] input='t' =>['i']
    this.targets = matchingInputTargets.map((inputTarget) =>
      inputTarget.slice(char.length),
    )

    this.keystrokes += char
    return true
  }
}

/**
 * @param {string} jp "しんじられない"
 * @returns {string[]} ["si", "shi"]
 */
function getInputTargets(jp) {
  return rules.find((rule) => jp.match(rule[0]))[1]
}

/**
 *  Match a single kana character at the start of a string,
 *  and return the list of possible keyboard inputs.
 *  Order matters: patterns with lookaheads must precede general ones.
 *  Example: `/^[しシ](?=[ゃャゅュぇェょョ])/` before `/^[しシ]/` to match 'sh' before 'si'.
 */
const rules = [
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
  [/^[、，,]/, [',']],
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

  // lenient quotes and brackets
  [/^[「｢『（”"]/, ['"', '«', '[', '(', '{']],
  [/^[」｣』）"]/, ['"', '»', ']', ')', '}']],

  // catch-all -- this should only happen for
  // characters that can be typed directly
  // (e.g. latin letters)
  [/^./, []],
]
