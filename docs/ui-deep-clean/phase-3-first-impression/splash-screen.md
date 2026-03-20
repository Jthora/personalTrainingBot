# Splash Screen Specification

> Inline HTML/CSS splash rendered before React mounts — eliminates white flash.

---

## Design Constraints

1. **Must be inline**: No external CSS or JS — the splash must render from markup inside `index.html`
2. **Must be lightweight**: < 2KB total (HTML + CSS combined)
3. **Must match theme**: Background `#040709` (--surface-base), text `#E3ECFF` (--text-primary), accent `#5A7FFF` (--accent)
4. **Must be replaced by React**: Content goes inside `<div id="root">` — React's `createRoot().render()` replaces it
5. **Must support reduced motion**: Spinner should stop or become static under `prefers-reduced-motion: reduce`

---

## Proposed Markup

```html
<body style="background: #040709; margin: 0">
  <div id="root">
    <!-- Splash: replaced by React on mount -->
    <style>
      .splash{display:flex;flex-direction:column;align-items:center;justify-content:center;
        height:100vh;background:#040709;color:#E3ECFF;font-family:'Inter',system-ui,sans-serif}
      .splash-logo{font-family:'Aldrich',sans-serif;font-size:clamp(20px,4vw,28px);
        letter-spacing:0.04em;margin-bottom:24px;opacity:0.9}
      .splash-spinner{width:36px;height:36px;border:3px solid rgba(90,127,255,0.15);
        border-left-color:#5A7FFF;border-radius:50%;animation:spin .8s linear infinite}
      @keyframes spin{to{transform:rotate(360deg)}}
      @media(prefers-reduced-motion:reduce){.splash-spinner{animation:none;opacity:0.4}}
    </style>
    <div class="splash">
      <div class="splash-logo">STARCOM ACADEMY</div>
      <div class="splash-spinner"></div>
    </div>
  </div>
  <script type="module" src="/src/main.tsx"></script>
  ...
</body>
```

---

## Integration Details

### What changes in `index.html`

1. Add `style="background: #040709; margin: 0"` to `<body>` tag
2. Replace empty `<div id="root"></div>` with the splash markup above
3. The `<style>` block uses minified CSS (no newlines in production)

### What happens at runtime

1. Browser parses HTML → renders splash instantly (no JS needed)
2. Vite loads `main.tsx` → React bootstraps
3. `createRoot(document.getElementById('root')!).render(...)` — React replaces splash innerHTML
4. If React fails to load, splash stays visible (better than blank white)

### `<noscript>` fallback

The existing `<noscript>` block (lines 144-174) already provides a JS-disabled fallback. No changes needed.

---

## Lighthouse Impact

| Metric | Before | Expected After |
|--------|--------|---------------|
| FCP | ~800ms (white → LoadingMessage paint) | ~100ms (splash paint) |
| LCP | ~1200ms (LoadingMessage painted) | ~100ms (splash logo = LCP element) |
| CLS | 0 | 0 (splash replaced atomically) |

The splash becomes both FCP and LCP because it's the first and largest meaningful paint. React mount replaces it seamlessly.

---

## Font Loading Note

The splash uses `font-family: 'Aldrich', sans-serif`. Since the Aldrich `@font-face` is declared in `theme.css` (loaded by React), the splash will initially render in `sans-serif` and swap to Aldrich once the CSS loads. This is a FOUT (flash of unstyled text) but is acceptable — the text is visible immediately.

To avoid FOUT, we could add an inline `@font-face` for Aldrich in the splash `<style>`. This adds ~200 bytes but is optional.
