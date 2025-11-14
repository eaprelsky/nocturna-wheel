# Subject: Inline icon regression in `@eaprelsky/nocturna-wheel` v3.0.0

Hi team 👋

Thank you for shipping v3.0.0 with embedded SVG icons — this is exactly what we needed to simplify hosting. Unfortunately, the release still loads icons from `./assets/svg/...` at runtime. Below is a detailed breakdown of the issue so it can be reproduced and fixed quickly.

---

## 1. Environment
- Library: `@eaprelsky/nocturna-wheel@3.0.0` (npm)
- Consumers: Node.js/Puppeteer service and plain browser tests
- Platforms affected: Chrome (desktop + headless), Firefox (desktop)

## 2. Expected vs actual
| | Expected | Actual |
| --- | --- | --- |
| Icon loading | Icons should work “out of the box” because bundle contains inline `IconData` | Library performs HTTP requests to `./assets/svg/zodiac/*` and logs `Planet icon not found` / `Zodiac sign icon not found` |
| Configuration | Consumers should not need to configure paths | Without manually re-registering `IconProvider`, all icons fail and chart renders only text fallbacks |

## 3. Reproduction (100% deterministic)
1. Create blank HTML page, include `@eaprelsky/nocturna-wheel@3.0.0/dist/nocturna-wheel.umd.js` via `<script>`.
2. Instantiate the demo snippet from README (`new NocturnaWheel.WheelChart({ container, planets })`).
3. Open DevTools → Network/Console.
4. Observe requests to `./assets/svg/zodiac/zodiac-planet-*.svg`. After ~30 requests chart fails with `icon not found` warnings; icons never appear.

## 4. Root cause analysis
- In `dist/nocturna-wheel.umd.js` (top section) `ServiceRegistry.getIconProvider()` creates **legacy** icon provider that *always* returns file paths. This instance is registered immediately via `ServiceRegistry.initializeServices()`.
- Later in the bundle an enhanced `IconProvider` class + `IconData` object are defined, but **never registered** with the already-existing `iconProvider` service.
- As a result the main renderers (Planet/Zodiac/Aspect) inject the legacy provider and call `getPlanetIconPath()` which produces `./assets/...` URLs regardless of the embedded data.
- The inline icon data is effectively dead code unless the consumer manually instantiates `new IconProvider({ useInline: true })`, calls `setInlineData(IconData)` and re-registers it in `ServiceRegistry`.

## 5. Suggested fix
1. Inside the bundle, after `IconProvider` and `IconData` are defined, override the legacy service:
   ```js
   const inlineIconProvider = new IconProvider({ useInline: true });
   inlineIconProvider.setInlineData(IconData);
   ServiceRegistry.register('iconProvider', inlineIconProvider);
   ```
2. Alternatively, update `ServiceRegistry.getIconProvider()` to lazily instantiate the *real* `IconProvider` class and inject inline data when available.
3. Ensure `config.assets.basePath` defaults to `inline://` (or is ignored) when inline provider is active, so renderers never attempt HTTP calls.

## 6. Temporary consumer workaround
To unblock our production deployment we currently:
```js
const inlineIconProvider = new NocturnaWheel.IconProvider({
  basePath: 'inline://',
  useInline: true
});

inlineIconProvider.setInlineData(NocturnaWheel.IconData);
NocturnaWheel.ServiceRegistry.register('iconProvider', inlineIconProvider);

const chart = new NocturnaWheel.WheelChart({
  container: '#chart',
  config: { assets: { basePath: 'inline://' } },
  planets: planetsData
});
```
This confirms that the inline icon data is valid — as soon as we re-register the provider everything works. It would be great if the library did this automatically.

## 7. Impact
- All consumers upgrading from v2.x still need to host and map SVG assets, defeating the purpose of v3.0.0.
- Server-side rendering (Puppeteer/Playwright) becomes fragile because missing asset requests slow down rendering and flood logs.
- Developers misled by README (“icons work automatically”) lose time debugging.

Please let me know if you need a minimal reproduction repo; I can share our Puppeteer harness or a CodePen showing the failing behaviour. Thanks again for your work — once this fix ships the upgrade path will be truly seamless.

Best regards,  
Egor (Nocturna Image service)

