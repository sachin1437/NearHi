# NearHi web (Next.js, static export)

Source for the landing page, Terms and Privacy. `next build` writes plain HTML/CSS/JS to `web/out`,
and `scripts/build-static.sh` or `scripts\build-static.ps1` on Windows (repo root) copies that into `static/`, which FastAPI serves as before.
There is no Node server in production.

- `app/(site)` landing page. `app/(legal)` Terms and Privacy.
- `components/RadiusDemo.tsx` is the interactive distance demo on the landing page.
- `public/` is copied into the build unchanged: fonts, icons, robots.txt, sitemap.xml, `hit.js`, and the
  chat (`talk/`) and admin (`admin/`) pages, which are still plain HTML.
- Pages link with plain `<a>` tags on purpose (full page loads keep each page's CSS separate).

```
npm install
npm run dev     # local preview on :3000
../scripts/build-static.sh   # from the repo root: build and refresh static/ (Windows: ..\scripts\build-static.ps1)
```
