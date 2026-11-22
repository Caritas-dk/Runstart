# Runstart – 0-GOAL

Ved opstart vises en splash screen med teksten **RUNSTART 0-GOAL** og en piktogram-løber, der krydser målstregen (`assets/splash-icon.png`, `src/ui/SplashOverlay.tsx`).

Løbeapp til iPhone og Android med tre programmer bygget på løb/gang og gradvis progression:

| Program | Varighed | Løbepas |
|---|---|---|
| 0–5 km | 8 uger | 24 |
| 0–10 km | 15 uger | 45 |
| Halvmaraton | 21 uger | 63 |

Engangskøb, ingen konto, ingen reklamer, ingen tilkøb. Alle data ligger lokalt på telefonen.

## Funktioner

- Gennemse alle programmer og løbepas før start; vælg selv program, uge og løbepas.
- 3 løbepas om ugen på valgfrie træningsdage; løbepas kan flyttes til en anden dato. Valgfri måldato.
- Hvert løbepas starter og slutter med 2 minutters gang. Forhåndsvisning af intervaller og planlagt varighed.
- **Løbebånd eller udendørs vælges før hvert løbepas.**
  - Løbebånd: kun tid registreres under løbet. GPS bruges aldrig, og der vises ingen distance, hastighed eller tempo. Efter løbepasset kan man (frivilligt) indtaste distancen fra løbebåndets display – den tæller med i samlet distance og milepæle og kan rettes senere under Historik.
  - Udendørs: tid og distance via GPS. Distance, aktuelt tempo, gennemsnitstempo og hastighed vises hele tiden.
- Stemmeguide (fuld / kun skift / fra), lydtest, lydstyrke, vibration, nedtælling, distance og tempo ved hver km udendørs.
- **Sprog:** appen starter altid på engelsk. Et lille flag øverst til højre viser det valgte sprog; tryk på det for at vælge tekstsprog og talesprog hver for sig – dansk, engelsk, fransk, tysk og spansk.
- **Milepæle:** samlet antal km (udendørs løbepas + distance indtastet fra løbebåndet) vises på startskærmen sammen med næste milepæl. 24 milepæle – fx første km på ét løbepas, 5/10/15 km og halvmaraton på ét løbepas, 10 km, halvmaraton, maraton, 100/250/500 km i alt, 5–60 minutters løb uden pause, 1/10/25/50 løbepas, første hele uge og gennemførte programmer. Nye milepæle fejres efter løbepasset med en rosende bemærkning, som stemmen også læser op.
- Musik fra Spotify eller en anden app spiller videre; den dæmpes, mens stemmen taler.
- Træningen fortsætter med låst skærm og i baggrunden.
- Under træning: aktivitet, intervaltid, næste aktivitet, aktiv tid, resttid og samlet tid. Store knapper til pause/fortsæt/stop; stop kræver bekræftelse. Ekstra gåpause på sammenhængende løb.
- Samlet tid tæller alt løb, al gang og alle pauser. En pause fryser intervallet, men tæller med i samlet tid.
- Efter træning: samlet tid, løbetid, gangtid, pausetid, gennemførelse (+ distance, tempo og hastighed udendørs). Vurdering: For let / Passende / For hårdt. Gentag løbepas eller uge, eller vælg lettere niveau.
- Afbrudte løbepas gemmes som delvise og rykker ikke programmet frem. Gentagelser gemmes som separate træninger.
- Historik pr. program: gennemførte løbepas, ugentlig aktivitet, løbe- og gangtid, længste sammenhængende løb.
- Lokale påmindelser på træningsdage. Eksport/import af backup (JSON-fil) og sletning af alle data.
- Alt fungerer offline.

## Teknik

- [Expo](https://expo.dev) SDK 58, React Native, TypeScript, Expo Router (`src/app`).
- `src/core` – ren logik uden afhængigheder af telefonen (programmer, tidsmotor, stemme-cues, GPS-beregning, plan, statistik, backup). Dækket af tests i `__tests__`.
- Tidsmotoren regner alt ud fra tidsstempler, så tiden er korrekt, selvom telefonen sætter appen på pause i baggrunden.
- `src/services` – lyd og tale (`expo-audio`, `expo-speech`), GPS (`expo-location` + `expo-task-manager`), påmindelser (`expo-notifications`), backupfiler (`expo-file-system`, `expo-sharing`).
- Baggrund: iOS bruger baggrundstilstandene *audio* og *location*; Android bruger en forgrundstjeneste (notifikation med det aktuelle interval).
- Musikdæmpning: på iOS kører talen i sin egen systemstyrede lydsession, som dæmper anden lyd; på Android skifter appen lydfokus til "må dæmpes", mens stemmen taler.

## Kom i gang (udvikling)

```bash
npm install
npm test            # logiktests
npx tsc --noEmit    # typetjek
npx expo lint
```

Appen bruger native moduler (baggrundslyd, GPS i baggrunden), så den skal køres som et *development build* – ikke i Expo Go.

## Færdige app-filer (bygges automatisk)

Hver gang der skubbes til `main`, bygger GitHub Actions (`.github/workflows/build.yml`) appen:

- **Android:** `Runstart-android-apk` – en APK, der kan installeres direkte på telefonen (tillad "installér ukendte apps").
- **iOS:** `Runstart-ios` – en usigneret `.ipa` til iPhone og en `.app.zip` til iOS-simulatoren.

Hent dem under **Actions → seneste "Build apps" → Artifacts** (nederst på siden). En usigneret `.ipa` skal signeres, før den kan installeres på en iPhone – fx med Sideloadly eller AltStore og dit eget Apple-id (gratis Apple-id: appen virker i 7 dage ad gangen), eller via TestFlight med en Apple Developer-konto.

## Byg iOS-appen selv i Xcode (Mac)

1. Hent repo'et til din Mac (`git clone https://github.com/Caritas-dk/Runstart.git`, eller *Code → Open with GitHub Desktop*).
2. **Dobbeltklik på `Open in Xcode.command`** i Finder.
   - Første gang installerer den det nødvendige (Node-pakker, CocoaPods) og laver Xcode-projektet – det tager 5–10 minutter. Næste gang åbner den bare Xcode.
   - Siger macOS *"Apple kunne ikke bekræfte, at … er fri for malware"*: åbn **Systemindstillinger → Anonymitet & sikkerhed**, rul ned og tryk **Åbn alligevel** – eller kør den i Terminal med `bash "Open in Xcode.command"`. Advarslen kommer kun, når repo'et er hentet som zip/i browseren; med `git clone` eller GitHub Desktop kommer den ikke.
3. I Xcode: projektet **Runstart** → **Signing & Capabilities** → vælg dit **Team** (første gang).
4. Vælg din iPhone eller en simulator, og tryk **▶ Run**. Til TestFlight/App Store: **Product → Archive**.

Kræver Xcode 26.6 eller nyere (ældre Xcode får automatisk en lille kompatibilitetsrettelse) og Node.js (https://nodejs.org).
`ios/`-mappen laves ud fra `app.json` og ligger ikke i git – kør bare `Open in Xcode.command` igen efter ændringer.

## Test på din egen telefon

Kræver en gratis konto på [expo.dev](https://expo.dev). Byg sker i skyen – der skal ikke installeres Xcode eller Android Studio.

```bash
npx eas-cli@latest login
npx eas-cli@latest init                       # kobler projektet til din Expo-konto
npx eas-cli@latest build --profile preview --platform android   # giver en APK, der kan installeres direkte
npx eas-cli@latest build --profile preview --platform ios       # kræver Apple Developer-konto (99 USD/år)
```

### Tjekliste før udgivelse

Disse ting kan kun afprøves på en rigtig telefon:

- [ ] Stemmeguide på alle 5 talesprog (telefonen skal have stemmen installeret).
- [ ] Spotify spiller videre og dæmpes, mens stemmen taler – både iPhone og Android.
- [ ] Træningen fortsætter med låst skærm i 30+ minutter – både løbebånd og udendørs.
- [ ] Udendørs: distance og tempo er rimelige på en kendt rute; GPS-ikonet forsvinder efter løbepasset.
- [ ] Løbebånd: der bliver aldrig bedt om placering, og GPS er ikke aktiv.
- [ ] Påmindelser kommer på de valgte træningsdage.
- [ ] Eksport → slet alle data → import giver samme historik.
- [ ] Luk appen midt i et løbepas → åbn igen → "Fortsæt" og "Gem som delvist" virker.

**Appen udgives ikke i App Store eller Google Play uden udtrykkelig besked fra ejeren.**
