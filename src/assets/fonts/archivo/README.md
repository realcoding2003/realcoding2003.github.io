# Archivo RC Wide 800

Source: @fontsource-variable/archivo 5.3.0, SIL OFL (OFL.txt).

Reproduce from the repository root:

```sh
/opt/anaconda3/bin/fonttools varLib.instancer node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2 wdth=125 wght=800 --output=/private/tmp/s2-archivo-latin-800.woff2
/opt/anaconda3/bin/fonttools varLib.instancer node_modules/@fontsource-variable/archivo/files/archivo-latin-ext-wdth-normal.woff2 wdth=125 wght=800 --output=/private/tmp/s2-archivo-ext-800.woff2
/opt/anaconda3/bin/pyftsubset /private/tmp/s2-archivo-ext-800.woff2 --unicodes='U+20A9' --flavor=woff2 --output-file=/private/tmp/s2-archivo-won.woff2
/opt/anaconda3/bin/fonttools merge --output-file=/private/tmp/s2-archivo-merged.ttf /private/tmp/s2-archivo-latin-800.woff2 /private/tmp/s2-archivo-won.woff2
/opt/anaconda3/bin/pyftsubset /private/tmp/s2-archivo-merged.ttf --unicodes='U+0020-007E,U+00A0-00FF,U+2013-2014,U+2018-201F,U+2026,U+20A9,U+20AC' --flavor=woff2 --output-file=src/assets/fonts/archivo/archivo-rc-wide-800-latin.woff2
```

2026-11-10 title audit: all 465 front-matter titles (155 per language).
English non-ASCII characters are U+2014 (two titles) and U+20A9 (one title).
Korean titles add only Hangul; Japanese titles add Japanese scripts and
U+3001, U+30FB, U+30FC, U+FF1A, U+FF1F, supplied by LINE Seed JP.
Keep ASCII/Latin-1 (including U+00D7), punctuation U+2013-2014 and
U+2018-201F, ellipsis, won and euro in both this subset and fonts.mjs.
The latin source lacks won; take its real glyph and advance from latin-ext,
instantiate both at the same axes, subset won before merging. Do not draw,
substitute or horizontally overlap a fallback currency glyph.

Fallback calculation uses fontTools TTFont hmtx advances for the 62 ASCII
alphanumeric characters, normalized by head.unitsPerEm. Archivo mean
0.798983871em / macOS Arial Bold mean 0.604082661em = 1.322639967.
`size-adjust: 132.263997%`. Archivo hhea ascent 878,
descent -210, UPM 1000. Divide normalized
metrics by size-adjust: `ascent-override: 66.382388%`,
`descent-override: 15.877337%`, `line-gap-override: 0%`.
This matches mean width and line metrics, not every kerning pair.
Arial source: /System/Library/Fonts/Supplemental/Arial Bold.ttf (not copied).
