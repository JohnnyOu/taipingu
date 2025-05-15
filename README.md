Taipingu is a minimalistic japanese typing game, featuring thousands of sentences from the collaborative [Tatoeba](https://tatoeba.org/) project (CC-BY).

- Furigana transcription 
- Translation in many languages
- Audio (native speakers)
- 2 font styles
- Test your typing speed
- Control the number of unknown kanji readings per sentence

# Technical stuff

No build process (i.e. just serve index.html)

Audio is served from Tatoeba.org

Sentences are downloaded from Tatoeba dumps, processed into JSON files and indexed by feature (translation language, audio, readings) so that they can be queried and fetched when this repo is deployed as a static site.

```sh
# Fetch sentences, filter, index
cd sentences/tatoeba
make clean && make
```

The font is Google Noto/Adobe Source Han (it has two names) (SIL Open Font License), in Sans and Serif styles, weighing 3/4MB. The former is subsetted to include only latin and the Japanese characters in the initial sentence to allow the page to load in a reasonable amount of time.

```sh
# Generate subset for Noto Sans
cd fonts
make clean && make
# Check using devtools that the page is able to 
# render all text using only the subset font.

```

That's a boring font choice but it's very legible and has proportional character variants which are enabled on the furigana to make it more compact.

## Todo

- track down "TODO" comments in the codebase
- cache buffered sentences in local storage for next startup
- display a loading indicator in case loading is slow or fails
- simple analytics




# Other Japanese typing games

- https://typing.playgram.jp/advanced/play/easy
