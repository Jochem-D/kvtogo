# KV TOGO Website

Static website for KV TOGO with JSON-driven teams data, image uploads, and simple embeds.

## Run locally

1. Start Docker:
   ```
   docker compose up -d
   ```
2. Open:
   - Website: http://localhost:8082
   - phpMyAdmin: http://localhost:8081

## Content

- Teams data: `data/teams.json`
- Team photos: `uploads/teams/`
- Hero slideshow images: set `data-images` in `index.html`

## Pages

- Home: `index.html`
- Teams: `pages/teams.html`
- Brasserie: `pages/brasserie.html`

## Notes

- Favicon is set per page in the HTML `<head>`.
- Instagram widget uses Behold. Update the `data-behold-id` in `index.html` if needed.
