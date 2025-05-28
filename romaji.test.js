import { describe, expect, test } from 'bun:test'
import { Matcher } from './romaji.js'

function match(jp, input) {
  const matcher = new Matcher(jp)
  let matchedInput = ''
  for (const char of input) {
    const result = matcher.input(char)
    if (!result) break
    matchedInput += char
  }
  return [matcher.japaneseText.slice(0, matcher.japaneseIndex), matchedInput]
}

function expectFullMatch(jp, kb) {
  const [jpMatch, kbMatch] = match(jp, kb)
  expect([jpMatch, kbMatch]).toEqual([jp, kb])
}

test('ん', () => {
  // Romaji matching
  expectFullMatch('ん', 'n')
  expectFullMatch('んか', 'nka')
  expectFullMatch('んい', 'ni')
  expect(match('んに', 'nni')).toEqual(['ん', 'nn'])
  expectFullMatch('んに', 'nnni')
  expectFullMatch('んに', "n'ni")
  expectFullMatch('こんにちは', "kon'nichiha")
  expectFullMatch('さんねんまえににっぽんに', "san'nenmaeninippon'ni")

  // Kana matching
  expectFullMatch('ン', 'ん')
  expectFullMatch('ほんとう', 'ほんとう')
  expectFullMatch('ピンポン', 'ひ゜んほ゜ん')
})

test('dakuten', () => {
  expectFullMatch('にほんご', 'にほんこ゛')
  expectFullMatch('ベッド', 'へ゛っと゛')
  expectFullMatch('ペラペラ', 'へ゜らへ゜ら')
})

test('long vowels', () => {
  expectFullMatch('かあ', 'kaa')
  expectFullMatch('まあマー', 'maama-')
  expectFullMatch('とうきょう', 'toukyou')
  expectFullMatch('トウキョウ', 'toukyou')
  expectFullMatch('とーきょー', 'to-kyo-')
  expectFullMatch('トーキョー', 'to-kyo-')
  expectFullMatch('アート', 'a-to')
})

test('useless stuff', () => {
  expect(match('うゃうゅうょ', 'wyawyuwy')).toEqual(['うゃうゅう', 'wyawyuwy'])
})

test('partial match', () => {
  expect(match('じゅ', 'j')).toEqual(['じ', 'j'])
  // expect(match('じゅ', 'jy')).toEqual(['じ', 'jy'])
  expectFullMatch('じゅ', 'ju')
  // expectFullMatch('じゅ', 'jyu')
  // expectFullMatch('じゅ', 'jilyu')
})

test('small tsu', () => {
  expectFullMatch('いっちゃった', 'icchatta')
  expectFullMatch('いっちゃった', 'ittyatta')
  expectFullMatch('いっちゃった', 'いっちゃった')
  expectFullMatch('ペット', 'へ゜っと')
})

test('other', () => {
  expectFullMatch('トゥどぅ', 'twudwu')
  expectFullMatch('きょ', 'kyo')
  expect(match('きょ', 'ky')).toEqual(['き', 'ky'])
  expectFullMatch('しゃ', 'sha')
  expect(match('しゃ', 'sh')).toEqual(['し', 'sh'])
  expectFullMatch('シャー', 'sha-')
  expect(match('じゃあ', 'jaa')).toEqual(['じゃあ', 'jaa'])
  expect(match('じゃあ', 'j')).toEqual(['じ', 'j'])
  expectFullMatch('ファミリ', 'famiri')
  expectFullMatch('ティッシュ', 'thisshu')
  // expectFullMatch('ティッシュ', 'texixtusixyu')
  expect(match('ティッシュ', 'th')).toEqual(['テ', 'th'])
  expectFullMatch('デューティー', 'dhu-thi-')
  // expectFullMatch('ジャーナリスト', 'jya-narisuto')
  // Star Wars
  expectFullMatch('スターウォーズ', 'suta-who-zu')
  expectFullMatch('ウェーター', 'we-ta-')
  // expectFullMatch('ウェーター', 'whe-ta-')
  expect(match('ウェ', 'w')).toEqual(['ウ', 'w'])
  expectFullMatch('オリーヴ', 'ori-vu')
  expectFullMatch('ヴァージニア', 'va-jinia')
  // Wolfgang Sawallisch
  expectFullMatch('ヴォルフガング・サヴァリッシュ', 'vorufugangu/savarisshu')
  // Henri Vieuxtemps
  expectFullMatch('アンリ・ヴュータン', 'anri/vyu-tan')
  // T-shirt
  expectFullMatch('ティーシャツ', 'thi-shatsu')
  // expectFullMatch('ティーシャツ', 'teli-shatsu')
  // Firefox
  expectFullMatch('ファイアーフォックス', 'faia-fokkusu')
})

test('punctuation', () => {
  expectFullMatch('a、b、「foo」、x・y。', 'a,b,[foo],x/y.')
  expectFullMatch('はい。', 'hai.')
})

describe('hint', () => {
  test('isRomaji', () => {
    const matcher = new Matcher('aiueo')
    expect(matcher.isRomaji('a')).toBe(true)
    expect(matcher.isRomaji('A')).toBe(true)
    expect(matcher.isRomaji(',')).toBe(true)
    expect(matcher.isRomaji('-')).toBe(true)
    expect(matcher.isRomaji('あ')).toBe(false)
    expect(matcher.isRomaji('ア')).toBe(false)
    expect(matcher.isRomaji('ー')).toBe(false)
  })

  test('romaji-only input', () => {
    const input = 'syuppatudekiru'
    const matcher = new Matcher(input)
    expect(matcher.currentCharIsRomaji).toBe(true)

    input.split('').forEach((char, index) => {
      matcher.input(char)
      expect(matcher.currentCharIsRomaji).toBe(true)
      if (index != input.length - 1) {
        expect(matcher.hint).toBe(input.charAt(index + 1))
      }
    })
  })

  test('kana-only input', () => {
    const input = 'しゅっは゜つて゛きる'
    const matcher = new Matcher(input)
    expect(matcher.currentCharIsRomaji).toBe(true)

    input.split('').forEach((char, index) => {
      matcher.input(char)
      expect(matcher.currentCharIsRomaji).toBe(false)
      if (index != input.length - 1) {
        expect(matcher.hint).toBe(input.charAt(index + 1))
      }
    })
  })

  test('romaji/kana mixed input', () => {
    const input = 'syuppatuて゛きる'
    const matcher = new Matcher(input)
    expect(matcher.currentCharIsRomaji).toBe(true)

    input.split('').forEach((char, index) => {
      matcher.input(char)
      expect(matcher.currentCharIsRomaji).toBe(matcher.isRomaji(char))
    })
  })
})
