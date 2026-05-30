# yasinghasemi.com

My retro Windows 98-style personal blog, served as a static website. Feel free to explore, fork, copy, paste, interact, and suggest tweaks. 

See it in action: [yasinghasemi.com](https://yasinghasemi.com)

## Latest Posts

This section is auto-generated from published posts in `mydocuments/`.

<!-- LATEST_POSTS:START -->
- [When MPM Becomes a Decision Marathon](https://yasinghasemi.com/#/docs/2-MineralProspectivityMapping/May-20) - May 20, 2026
- [Why Did I Start Working on a Mineral Prospectivity Mapping Project?](https://yasinghasemi.com/#/docs/2-MineralProspectivityMapping/why) - May 12, 2026
- [How NetRadar Was Started](https://yasinghasemi.com/#/docs/1-NetRadar/1-howitstarted) - May 9, 2026
<!-- LATEST_POSTS:END -->

## Run Locally

Well, it is a static website, but scripts work when run them on a server. So:

1. Start a local static server:

```bash
python3 -m http.server 8000
```

2. Open and enjoy:

```text
http://localhost:8000
```

## Regenerate Documents Manifest

There is actually in file system at work here which is not very complicated. `fs.json` is generated from `mydocuments/`. The following bash command does the job for you.

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
  - 📁 [1-NetRadar](https://yasinghasemi.com/#/docs/1-NetRadar)
    - 📁 [1-howitstarted](https://yasinghasemi.com/#/docs/1-NetRadar/1-howitstarted)
      - 📄 [howitstarted.doc](https://yasinghasemi.com/mydocuments/1-NetRadar/1-howitstarted/howitstarted.html)
    - 📁 [2026-05-03](https://yasinghasemi.com/#/docs/1-NetRadar/2026-05-03)
  - 📁 [2-MineralProspectivityMapping](https://yasinghasemi.com/#/docs/2-MineralProspectivityMapping)
    - 📁 [May-20](https://yasinghasemi.com/#/docs/2-MineralProspectivityMapping/May-20)
      - 📄 [mpm-and-its-challenges.doc](https://yasinghasemi.com/mydocuments/2-MineralProspectivityMapping/May-20/mpm-and-its-challenges.html)
    - 📁 [why](https://yasinghasemi.com/#/docs/2-MineralProspectivityMapping/why)
      - 📄 [why.doc](https://yasinghasemi.com/mydocuments/2-MineralProspectivityMapping/why/why.html)
<!-- DOCS_TOC:END -->

## Icon Credits

Thanks to these projects for Windows-style icon assets:

- [nestoris/Win98SE](https://github.com/nestoris/Win98SE)
- [trapd00r/win95-winxp_icons](https://github.com/trapd00r/win95-winxp_icons/tree/master)
- [GitHub](https://icons8.com/icon/3R1xLIHPgzn5/github) icon by [Icons8](https://icons8.com)
- [LinkedIn](https://icons8.com/icon/ZADJgisVhP37/linkedin) icon by [Icons8](https://icons8.com)
