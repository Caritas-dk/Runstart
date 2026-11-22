# Runstart 0-GOAL – App Store-guide

Alt, der skal udfyldes i App Store Connect, i den rækkefølge du møder det. Tekster på fem sprog ligger i `store/metadata/<sprog>/`, skærmbilleder i `store/screenshots/<sprog>/`.

## 1. Før du starter
- [ ] Apple Developer Program som **Individual** er godkendt (mail fra Apple).
- [ ] Xcode → Settings → Accounts viser et team med dit navn **uden** "(Personal Team)".

## 2. Opret appen i App Store Connect
appstoreconnect.apple.com → **Apps → + → New App**

| Felt | Værdi |
|---|---|
| Platforms | iOS |
| Name | **Runstart 0-GOAL** (Navnet "Runstart" alene kan være optaget – derfor 0-GOAL med) |
| Primary Language | English (U.S.) |
| Bundle ID | **dk.caritas.runstart** (vælg i listen – den oprettes automatisk første gang Xcode uploader; ellers opret den under Certificates, Identifiers & Profiles → Identifiers). Kan ikke ændres senere. Siger Xcode, at ID'et er optaget (det kan ske, fordi din gratis Personal Team allerede har brugt det), så skift til **dk.teamingberg.runstart** i app.json og byg igen. |
| SKU | runstart-001 |
| User Access | Full Access |

## 3. App Information
| Felt | Værdi |
|---|---|
| Category | Primary: **Health & Fitness** · Secondary: **Sports** |
| Content Rights | "No, it does not contain, show, or access third-party content" |
| Age Rating | Svar **None / No** på alle spørgsmål → **4+** |
| Privacy Policy URL | https://github.com/Caritas-dk/Runstart/blob/main/store/PRIVACY.md |
| Localizations | Tilføj Danish, German, French (France), Spanish (Spain) og udfyld Name/Subtitle for hver |

## 4. App Privacy
- **Data Collection:** vælg **"No, we do not collect data from this app"** → resultat: **Data Not Collected**.
  (GPS bruges kun på telefonen og sendes aldrig nogen steder hen, så det tæller ikke som indsamling.)

## 5. Pricing and Availability
- Price: **Free** (USD 0)
- Availability: alle lande (eller kun dem du ønsker)

## 6. EU – Digital Services Act (trader status)
Apple spørger, om du er "trader" (erhvervsdrivende). For en gratis app uden kommercielt formål kan du vælge **"I'm not a trader"**. Vælger du trader, bliver din adresse, telefon og mail vist offentligt i EU's App Store.

## 7. Version 1.0 – for hvert sprog
Kopiér fra `store/metadata/<sprog>/` (eller fra materiale-siden):
- Promotional Text, Description, Keywords
- Support URL: https://github.com/Caritas-dk/Runstart/blob/main/store/SUPPORT.md
- Marketing URL: (tom)
- **Screenshots → iPhone 6.9" Display:** træk de 8 billeder fra `store/screenshots/<sprog>/` ind i rækkefølge 01–08. (6.9" dækker automatisk alle mindre iPhones.)
- Copyright: **2026 Jesper Laursen**

## 8. App Review Information
- Sign-in required: **Nej**
- Contact: dit navn, telefon og mail
- **Notes** (kopiér):

```
Runstart 0-GOAL is a beginner run/walk training app (0–5 km, 0–10 km, half marathon). No account or login is needed and no data leaves the device.

How to test:
1. On first launch, tap the flag (top right) to choose a language.
2. Tap a program and "Start program", then "Start session".
3. Choose "Treadmill" (time only, no GPS) or "Outdoors" (GPS distance/pace), then start. The voice coach announces run/walk changes.

Background modes:
- Location: used only during an active OUTDOOR session so distance keeps being measured while the phone is locked in the runner's pocket. It stops when the session ends. "When In Use" permission only; the location indicator is shown. Never used on the treadmill, never sent off the device.
- Audio: the voice coach speaks interval changes while the screen is locked, mixing with (and briefly ducking) the user's own music.

Notifications are local training-day reminders only (no push server).
```

## 9. Byg og upload (det hjælper jeg med på din Mac)
1. Xcode → Runstart-target → **Signing & Capabilities** → Team: dit nye team.
2. Øverst: vælg **Any iOS Device (arm64)** som destination.
3. **Product → Archive**.
4. Organizer → **Distribute App → App Store Connect → Upload**.
5. Efter 5–30 min dukker buildet op under **TestFlight** og kan vælges under version 1.0 → **Build**.
6. Export Compliance: allerede besvaret i appen (bruger ikke kryptering ud over standard).

## 10. Indsend
- **Add for Review → Submit**. Det gør du selv (eller siger god for, at jeg klikker).
- Apples gennemgang tager typisk 1–2 døgn. Vælg evt. "Manually release" så du selv bestemmer udgivelsesdagen.
