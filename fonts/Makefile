# Generate a subset font containing characters from
# - alphabet (lowercase, uppercase and full-width)
# - index.html
# - index.js (this is where the initial sentence is defined)
# - language names for the dropdown

SourceHanSansJP-Regular.subset.woff2: SourceHanSansJP-Regular.adjusted.woff2
	pyftsubset $< \ 
		--output-file=$@ \
		--layout-features='*' \
		--no-hinting \
		--flavor="woff2" \
		--text="$$(cat ../index.html ../index.js ../sentences/tatoeba/data/languages.json)" \
		--unicodes="U+0041-005A,U+0061-007A,U+FF41-FF5A,U+FF21-FF3A"

.PHONY: clean
clean:
	rm -f SourceHanSansJP-Regular.subset.woff2