

.PHONY: clean

#

.PHONY: data
data: tmp/aggregate.json
	rm -rf $@
	node scripts/generate.mjs $< language-names.json chunk-size.json $@

#

tmp/aggregate.json: tmp/jpn_transcriptions.tsv tmp/sentences_with_audio.csv tmp/links.csv tmp/sentences_detailed.csv
	node scripts/aggregate.mjs tmp $@

#

tmp/jpn_transcriptions.tsv.bz2: | tmp
	curl -o $@ https://downloads.tatoeba.org/exports/per_language/jpn/jpn_transcriptions.tsv.bz2
tmp/jpn_transcriptions.tsv: tmp/jpn_transcriptions.tsv.bz2
	bzip2 -dkf $<
	touch $@

tmp/sentences_with_audio.tar.bz2: | tmp
	curl -o $@ https://downloads.tatoeba.org/exports/sentences_with_audio.tar.bz2
tmp/sentences_with_audio.csv: tmp/sentences_with_audio.tar.bz2
	tar -xvjf $< -C tmp
	touch $@

tmp/links.tar.bz2: | tmp
	curl -o $@ https://downloads.tatoeba.org/exports/links.tar.bz2
tmp/links.csv: tmp/links.tar.bz2
	tar -xvjf $< -C tmp
	touch $@

tmp/sentences_detailed.tar.bz2: | tmp
	curl -o $@ https://downloads.tatoeba.org/exports/sentences_detailed.tar.bz2
tmp/sentences_detailed.csv: tmp/sentences_detailed.tar.bz2
	tar -xvjf $< -C tmp
	touch $@

#

tmp:
	mkdir -p tmp

clean:
	rm -rf tmp