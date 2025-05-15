# Load random sentences using the API

## v0 API (NO CORS)

to="eng" only return "eng" translations
trans_to="eng" only return sentences that have a "eng" translation

language code format unknown (eng, jpn, fra ...)

https://tatoeba.org/en/api_v0/search?from=jpn&has_audio=yes&native=yes&orphans=no&sort=random&to=eng&trans_filter=limit&trans_to=eng&unapproved=no&word_count_min=1

Can be required to have audio (has_audio=yes, trans_has_audio=yes)

10 results per page, limited to 1000 results (100 pages) (page=2)

## unstable API (NO FILTERING, NO RANDOM)

OpenAPI, Restful
Documentation at https://api.dev.tatoeba.org/unstable

# Play audio files

## audio.tatoeba.org

I think this only works for CK's english language audios

## https://tatoeba.org/en/audio/download/177030

The client uses this URL  
Undocumented, CORS OK

## https://api.tatoeba.org/unstable/audio/177030/file

New API endpoint for audio
