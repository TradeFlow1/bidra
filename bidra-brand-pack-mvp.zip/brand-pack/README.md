# Bidra Brand Pack (MVP)

This pack contains the **exact** Bidra logo and icon you supplied, plus light/dark usage assets and brand color codes.

## What’s inside

- `assets/logo/`
  - `bidra-logo_light.png` (use on light backgrounds)
  - `bidra-logo_dark.png` (use on dark backgrounds)
- `assets/icon/`
  - `bidra-icon_light.png`
  - `bidra-icon_dark.png`
- `assets/favicons/` (optional resized squares for web/app icons)
- `colors.json` (source of truth)
- `colors.css` (CSS variables for light/dark theme)
- `tailwind-snippet.txt` (Tailwind config snippet)
- `nextjs-usage.txt` (quick usage examples)

## Brand color codes

- **Bidra Blue:** `#3B82F6` (rgb 59,130,246)
- **Bidra Ink:**  `#111827`
- **White:**      `#FFFFFF`

## Drop-in for the Bidra repo (PowerShell)

From the repo root:

```powershell
# 1) Copy assets into public/
New-Item -ItemType Directory -Force -Path .\public\brand\logo, .\public\brand\icon | Out-Null
Copy-Item -Force .\brand-pack\assets\logo\* .\public\brand\logo\
Copy-Item -Force .\brand-pack\assets\icon\* .\public\brand\icon\

# 2) (Optional) Copy favicons
New-Item -ItemType Directory -Force -Path .\public\brand\favicons | Out-Null
Copy-Item -Force .\brand-pack\assets\favicons\* .\public\brand\favicons\

# 3) Add tokens to your global CSS (paste file contents)
Get-Content .\brand-pack\colors.css
```

> Tip: If you keep this pack in the repo, place it at `./brand-pack/` (same structure as this zip).

## Recommended logo swap (Next.js)

```tsx
<img src="/brand/logo/bidra-logo_dark.png" className="hidden dark:block" alt="Bidra" />
<img src="/brand/logo/bidra-logo_light.png" className="block dark:hidden" alt="Bidra" />
```

## Notes

- Originals are included **unchanged**.
- Optional favicons are resized from a center-square crop of the icon for practical web/app use.
