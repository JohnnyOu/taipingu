import { parseSentenceObject } from './shared.mjs'

// Polyfill set union and intersection
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/intersection#browser_compatibility
if (!Set.prototype.union) {
  Set.prototype.union = function (setB) {
    const union = new Set(this)
    for (const elem of setB) union.add(elem)
    return union
  }
}
if (!Set.prototype.intersection) {
  Set.prototype.intersection = function (setB) {
    const intersection = new Set()
    for (const elem of setB) if (this.has(elem)) intersection.add(elem)
    return intersection
  }
}
if (!Set.prototype.difference) {
  Set.prototype.difference = function (setB) {
    const difference = new Set(this)
    for (const elem of setB) difference.delete(elem)
    return difference
  }
}

//

async function fetchJSON(path) {
  return fetch(path).then((r) => r.json())
}

const jsonCache = {}
async function fetchJSONCached(path) {
  if (!jsonCache[path]) {
    jsonCache[path] = fetchJSON(path)
  }
  return jsonCache[path]
}

//

export async function getLanguages() {
  return fetchJSONCached(import.meta.resolve(`./data/languages.json`))
}

//

async function getIdSet(path) {
  const ids = await fetchJSONCached(import.meta.resolve(`./data/${path}.json`))
  return new Set(ids)
}

let _readingsBySentence
export async function getReadingsBySentence() {
  if (!_readingsBySentence) {
    _readingsBySentence = (
      await fetchJSON(import.meta.resolve(`./data/readings-by-sentence.json`))
    ).map((readings) => new Set(readings))
  }
  return _readingsBySentence
}

async function getSentenceIds({
  audio,
  language,
  knownReadings,
  unknownReadings,
}) {
  let ids = await (language === ''
    ? getIdSet('sentences')
    : getIdSet(`sentences-by-language/${language}`))

  if (audio) {
    ids = ids.intersection(await getIdSet('sentences-with-audio'))
  }

  if (unknownReadings !== null) {
    const knownReadingsSet = new Set(knownReadings)

    const readingsBySentence = await getReadingsBySentence()

    for (const [id, readings] of readingsBySentence.entries()) {
      if (readings.difference(knownReadingsSet).size !== unknownReadings) {
        ids.delete(id)
      }
    }
  }

  return Array.from(ids)
}

//

async function getSentence(id) {
  // return fetchJSON(import.meta.resolve(`./data/sentence/${id}.json`))
  const chunkSize = await fetchJSONCached(
    import.meta.resolve('./chunk-size.json'),
  )
  const chunk = await fetchJSON(
    import.meta.resolve(`./data/chunks/${Math.floor(id / chunkSize)}.json`),
  )
  return chunk[id % chunkSize]
}

//

function makeIdRandomizer(ids) {
  const seenIds = new Set()

  return () => {
    if (seenIds.size >= 0.9 * ids.length) seenIds.clear()
    let randomId
    do randomId = ids[Math.floor(Math.random() * ids.length)]
    while (seenIds.has(randomId))
    seenIds.add(randomId)
    return randomId
  }
}

export function makeSentenceProvider(settings) {
  const promisedIds = getSentenceIds(settings)
  const promisedIdRandomizer = promisedIds.then(makeIdRandomizer)

  async function getRandomSentence() {
    const id = (await promisedIdRandomizer)()
    if (id === undefined) {
      // TODO: no sentences; what to do?
      return
    }
    const sentence = await getSentence(id)
    return parseSentenceObject(sentence)
  }

  const promisedSentenceBuffer = []

  function preloadSentence() {
    promisedSentenceBuffer.push(getRandomSentence())
  }

  for (let i = 0; i < 5; i++) preloadSentence()

  return {
    async count() {
      const ids = await promisedIds
      return ids.length
    },
    next() {
      preloadSentence()
      return promisedSentenceBuffer.shift()
    },
  }
}
