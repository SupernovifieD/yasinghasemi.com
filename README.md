# yasinghasemi.com

A retro Windows 98-style personal blog, served as a static website.

Website: [https://yasinghasemi.com](https://yasinghasemi.com)

## Run Locally

1. Start a local static server:

```bash
python3 -m http.server 8000
```

2. Open:

```text
http://localhost:8000
```

## Regenerate Documents Manifest

`fs.json` is generated from `mydocuments/`.

```bash
bash filesystem.sh
```

Or directly:

```bash
node scripts/generate-fs-json.mjs
```

## Website Table of Contents

This section is auto-generated from `mydocuments/`

<!-- DOCS_TOC:START -->
- 📁 [My Documents](https://yasinghasemi.com/#/docs)
  - 📁 [0-thebeginning](https://yasinghasemi.com/#/docs/0-thebeginning)
    - 📄 [howitcametobe.doc](https://yasinghasemi.com/mydocuments/0-thebeginning/howitcametobe.html)
  - 📁 [1-netradar](https://yasinghasemi.com/#/docs/1-netradar)
    - 📁 [2026-05-02](https://yasinghasemi.com/#/docs/1-netradar/2026-05-02)
      - 📄 [2026-05-02.doc](https://yasinghasemi.com/mydocuments/1-netradar/2026-05-02/2026-05-02.html)
    - 📁 [2026-05-03](https://yasinghasemi.com/#/docs/1-netradar/2026-05-03)
  - 📁 [2-movieindex](https://yasinghasemi.com/#/docs/2-movieindex)
<!-- DOCS_TOC:END -->

## Icon Credits

Thanks to these projects for Windows-style icon assets:

- [nestoris/Win98SE](https://github.com/nestoris/Win98SE)
- [trapd00r/win95-winxp_icons](https://github.com/trapd00r/win95-winxp_icons/tree/master)
