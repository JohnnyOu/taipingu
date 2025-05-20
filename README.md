## <ruby>[Taipingu](https://entibo.github.io/taipingu/)<rt>タイピング</rt></ruby> is a simple Japanese typing game, in the browser

![image](https://github.com/user-attachments/assets/fc1b44ea-119b-4194-9c0e-190ec209a5f3)

**※ You don't need a Japanese keyboard or Japanese language input software (IME) to play!**

# Features

- Thousands of sentences from [Tatoeba](https://tatoeba.org/en/sentences/search?from=jpn&sort=modified&trans_to=eng)
  - <ruby>Furigana<rt>ふりがな</rt></ruby> (optional)
  - Translation available in many languages
  - Audio recordings from native speakers
- 2 font styles
- Test your typing speed
- Control the number of unknown kanji readings per sentence (experimental)

If you're learning Japanese, you win the game when your reading speed catches up to your typing speed.  
がんばって！

# Want to contribute?

If you found a bug or if you want to suggest a feature, you can [open an issue](https://github.com/entibo/taipingu/issues).  
For questions and general feedback there's also the [discussions](https://github.com/entibo/taipingu/discussions/new/choose).

# Technical stuff

Sentence data is included in this repository.  
Audio recordings are served from Tatoeba.org.

This app is a single page (index.html) with styles (index.css) and Javascript:

- index.js — app logic, interaction, settings
- romaji.js — match keyboard input with characters in a Japanese sentence
- sentences/tatoeba/api.js — fetch random sentences based on settings

There is no tooling required to build this project but a few scripts are used to generate static assets:

- Sentences are downloaded from Tatoeba dumps, processed into JSON files and indexed by feature (translation language, audio, readings) so that they can be queried and fetched when this repo is deployed as a static site.

  ```sh
  # Fetch sentences, filter, index
  cd sentences/tatoeba
  make clean && make
  ```

- The font is Google Noto/Adobe Source Han (it has two names) (SIL Open Font License), in Sans and Serif styles, weighing around 4MB each. The former is subsetted to include only latin + the Japanese characters in the initial sentence to allow the page to load in a reasonable amount of time. There are more playful fonts out there but this one is very legible and has proportional character variants which are enabled on the furigana to make it more compact.

  ```sh
  # Generate subset for Noto Sans
  cd fonts
  make clean && make
  # Check using devtools that the page is able to
  # render all text using only the subset font.

  ```

## Todo

- track down "TODO" comments in the codebase
- cache buffered sentences in local storage for next startup
- display a loading indicator in case loading is slow or fails

# Other Japanese typing games

- https://typing.playgram.jp/advanced/play/easy
