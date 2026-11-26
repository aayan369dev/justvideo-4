# Just Video — Website

Website for **Just Video Broadcast Pvt Ltd**, Mumbai: film camera and lens rental, post-production and sound.

Plain HTML, CSS and JavaScript. No build step, no install.

## Folder structure

```
just-video/
├── index.html              Main page (all sections)
├── css/
│   └── style.css           All styles
├── js/
│   ├── posters.js          List of film poster images
│   ├── intro.js            Opening intro video and film-tunnel effect
│   ├── main.js             Hero video, moving film strip, video cards, count-up numbers, rental flyer
│   ├── rental-tabs.js      Camera / Lenses / Monitoring tabs
│   └── product-viewer.js   Full-screen 360° product viewer (spin, drag, zoom)
├── images/
│   ├── posters/            46 film posters (film strip)
│   ├── serials/            TV serial images
│   ├── rental/             Photos in the blue rental flyer
│   ├── products/           Rental equipment photos
│   ├── videos/             Thumbnails for the video cards
│   ├── hero-poster.jpg
│   └── intro-poster.jpg
└── videos/
    ├── intro.mp4           Opening intro
    ├── hero.mp4            Hero background video
    └── teaser.mp4          Official Teaser
```

## Run on your computer

Open `index.html` in a browser. To test the way it will run online, start a small server in this folder:

```
python -m http.server 8000
```

Then open http://localhost:8000

## Put it on GitHub

1. Create a new repository on GitHub (for example `just-video`).
2. Click **Add file → Upload files**, drag in everything inside this folder (index.html, css, js, images, videos, README.md), then click **Commit changes**.

Or with git:

```
git init
git add .
git commit -m "Just Video website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/just-video.git
git push -u origin main
```

## Make it live

- **Vercel:** New Project → import the GitHub repo → Framework preset: *Other* → Deploy.
- **GitHub Pages:** repo Settings → Pages → Source: *Deploy from a branch* → `main` / root → Save.

## Changing content

- **Text:** edit `index.html`.
- **Product photos:** replace a file in `images/products/` with a new one using the same name.
- **Film posters:** add images to `images/posters/` and add their paths in `js/posters.js`.
- **Extra videos:** the video cards Shoot Day 5, Reel 2 Rough Cut, Night Shoot, First Look and Trailer play these files. Put them in the `videos/` folder with exactly these names:
  - `videos/shootday5.mp4`
  - `videos/reel2.mp4`
  - `videos/nightshoot.mp4`
  - `videos/firstlook.mp4`
  - `videos/trailer.mp4`

Keep each file under 100 MB (GitHub's limit per file).
