# Skutesjön

Statisk webbplats för Skutesjön — en plats vid sjön i Örby — samt systersajten Yggdrasil.

## Sidor

| Fil | Innehåll |
| --- | --- |
| `index.html` | Huvudsidan för Skutesjön |
| `yggdrasil.html` | Yggdrasil |
| `modell.html` | Skutesjön i 3D (three.js-modell) |

Bilder ligger i `img/`, videor i `media/`. Sajten är helt statisk och kräver ingen byggprocess.

## Visa lokalt

Öppna `index.html` direkt i webbläsaren, eller starta en enkel server:

```bash
python3 -m http.server
```

och gå till <http://localhost:8000>.

## Publicering

Sajten kan serveras som den är via t.ex. GitHub Pages (Settings → Pages → Deploy from branch → `main`, rotkatalogen).

## Hosting

Sajten ligger på **GitHub Pages** (Settings → Pages → Deploy from branch → `main`, rotkatalogen). Ingen byggprocess behövs.

Kalendern (med Facebook-koppling via en Netlify-funktion) togs bort 2026-11-16. Den finns kvar i git-historiken (commit `4f1e644`) om den ska tillbaka.

 
