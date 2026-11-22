"""App Store texts for Runstart 0-GOAL. Run: python3 store/listing.py -> writes store/metadata/<locale>/*.txt (fastlane deliver layout) and checks Apple's limits."""
import json, os, sys

PRIVACY = "https://github.com/Caritas-dk/Runstart/blob/main/store/PRIVACY.md"
SUPPORT = "https://github.com/Caritas-dk/Runstart/blob/main/store/SUPPORT.md"

L = {}

L["da"] = dict(
name="Runstart 0-GOAL",
subtitle="Løb/gang til 5, 10 og 21 km",
promotional_text="Fra sofa til mål med løb og gang i små skridt. Stemmeguide på 5 sprog, musik der spiller videre, og ingen konto eller reklamer – alt bliver på din telefon.",
keywords="løbeprogram,løbetræning,begynder,interval,halvmaraton,5 km,10 km,jogging,kondition,motion,coach",
description="""Kom i gang med at løbe – helt fra nul. Runstart 0-GOAL tager dig fra de første forsigtige minutter til 5 km, 10 km eller en halvmaraton med løb og gang i små, overkommelige skridt.

TRE PROGRAMMER
• 0–5 km på 8 uger
• 0–10 km på 15 uger
• Halvmaraton (21,1 km) på 21 uger
Tre løbepas om ugen på de dage, du selv vælger. Se alle løbepas igennem på forhånd, flyt et løbepas, gentag en uge eller gå et niveau ned, hvis det bliver for hårdt.

STEMMEGUIDE, DER LØBER MED
• Fortæller hvornår du skal løbe og gå, hvornår du er halvvejs, og hvad der kommer bagefter
• Nedtælling og vibration ved hvert skift
• Virker med skærmen slukket og telefonen i lommen
• Musikken fra Spotify eller en anden app spiller videre, mens stemmen taler

LØBEBÅND ELLER UDENDØRS – DU VÆLGER HVER GANG
• Udendørs: distance, tempo og hastighed via GPS, vist hele tiden – og stemmen kan sige distance og tempo ved hver kilometer
• Løbebånd: kun tid, ingen GPS. Bagefter kan du skrive distancen fra løbebåndet ind, så den tæller med

MOTIVATION
• Samlet antal kilometer på forsiden
• 24 milepæle med ros undervejs: din første kilometer, 5, 10 og 15 km på ét løbepas, 10 km og en halvmaraton i alt, 100 km-klubben og mange flere
• Historik, ugentlig aktivitet og en kalender over dine løbepas
• Påmindelser på dine træningsdage

FEM SPROG
Dansk, engelsk, fransk, tysk og spansk. Tekst og tale kan have hvert sit sprog – tryk på flaget for at skifte.

DINE DATA ER DINE
Ingen konto, ingen reklamer, ingen tilkøb. Alt gemmes lokalt på telefonen, og du kan selv tage en backup.

Lavet af Team Ingberg.""",
)

L["en-US"] = dict(
name="Runstart 0-GOAL",
subtitle="Run/walk to 5K, 10K and half",
promotional_text="From couch to goal with run/walk in small steps. Voice coach in 5 languages, your music keeps playing, and no account or ads – everything stays on your phone.",
keywords="running plan,beginner,5k,10k,interval,half marathon,jogging,run walk,training,cardio,coach",
description="""Start running – from zero. Runstart 0-GOAL takes you from your first careful minutes to 5K, 10K or a half marathon with run/walk intervals in small, doable steps.

THREE PROGRAMS
• 0–5K in 8 weeks
• 0–10K in 15 weeks
• Half marathon (21.1 km) in 21 weeks
Three runs a week on the days you choose. Preview every run, move a run, repeat a week or step down a level if it gets too hard.

A VOICE COACH THAT RUNS WITH YOU
• Tells you when to run and when to walk, when you are halfway, and what comes next
• Countdown and vibration at every change
• Works with the screen off and the phone in your pocket
• Music from Spotify or any other app keeps playing while the coach speaks

TREADMILL OR OUTDOORS – YOU CHOOSE EVERY TIME
• Outdoors: distance, pace and speed via GPS, shown at all times – and the coach can announce distance and pace every kilometre
• Treadmill: time only, no GPS. Afterwards you can enter the distance from the treadmill so it counts

MOTIVATION
• Your total kilometres on the home screen
• 24 milestones with praise along the way: your first kilometre, 5, 10 and 15 km in one run, 10 km and a half marathon in total, the 100 km club and many more
• History, weekly activity and a calendar of your runs
• Reminders on your training days

FIVE LANGUAGES
English, Danish, French, German and Spanish. Text and voice can each have their own language – tap the flag to switch.

YOUR DATA IS YOURS
No account, no ads, no in-app purchases. Everything is stored on your phone, and you can make your own backup.

Made by Team Ingberg.""",
)

L["de-DE"] = dict(
name="Runstart 0-GOAL",
subtitle="Laufen/Gehen bis 5K, 10K, HM",
promotional_text="Vom Sofa zum Ziel mit Laufen und Gehen in kleinen Schritten. Sprachcoach in 5 Sprachen, deine Musik läuft weiter, kein Konto, keine Werbung – alles bleibt am Handy.",
keywords="laufplan,laufanfänger,5 km,10 km,intervall,halbmarathon,joggen,lauftraining,ausdauer,coach",
description="""Fang an zu laufen – ganz von null. Runstart 0-GOAL bringt dich von den ersten vorsichtigen Minuten bis zu 5 km, 10 km oder einem Halbmarathon – mit Laufen und Gehen in kleinen, machbaren Schritten.

DREI PROGRAMME
• 0–5 km in 8 Wochen
• 0–10 km in 15 Wochen
• Halbmarathon (21,1 km) in 21 Wochen
Drei Läufe pro Woche an den Tagen, die du selbst wählst. Sieh dir jeden Lauf vorher an, verschiebe einen Lauf, wiederhole eine Woche oder geh eine Stufe zurück, wenn es zu hart wird.

EIN SPRACHCOACH, DER MITLÄUFT
• Sagt dir, wann du laufen und wann du gehen sollst, wann du die Hälfte geschafft hast und was als Nächstes kommt
• Countdown und Vibration bei jedem Wechsel
• Funktioniert bei ausgeschaltetem Bildschirm mit dem Handy in der Tasche
• Musik aus Spotify oder einer anderen App läuft weiter, während der Coach spricht

LAUFBAND ODER DRAUSSEN – DU ENTSCHEIDEST JEDES MAL
• Draußen: Distanz, Pace und Geschwindigkeit per GPS, immer sichtbar – und der Coach kann bei jedem Kilometer Distanz und Pace ansagen
• Laufband: nur Zeit, kein GPS. Danach kannst du die Distanz vom Laufband eintragen, damit sie mitzählt

MOTIVATION
• Deine Gesamtkilometer auf dem Startbildschirm
• 24 Meilensteine mit Lob unterwegs: dein erster Kilometer, 5, 10 und 15 km in einem Lauf, 10 km und ein Halbmarathon insgesamt, der 100-km-Club und viele mehr
• Verlauf, wöchentliche Aktivität und ein Kalender deiner Läufe
• Erinnerungen an deinen Trainingstagen

FÜNF SPRACHEN
Deutsch, Englisch, Dänisch, Französisch und Spanisch. Text und Sprachausgabe können je eine eigene Sprache haben – tippe auf die Flagge, um zu wechseln.

DEINE DATEN GEHÖREN DIR
Kein Konto, keine Werbung, keine In-App-Käufe. Alles wird lokal auf deinem Handy gespeichert, und du kannst selbst ein Backup erstellen.

Gemacht von Team Ingberg.""",
)

L["fr-FR"] = dict(
name="Runstart 0-GOAL",
subtitle="Course/marche : 5K, 10K, semi",
promotional_text="Du canapé à l'objectif en alternant course et marche, pas à pas. Coach vocal en 5 langues, votre musique continue, sans compte ni pub – tout reste sur votre téléphone.",
keywords="plan course,débutant,5 km,10 km,fractionné,semi-marathon,jogging,footing,endurance,coach",
description="""Commencez à courir – à partir de zéro. Runstart 0-GOAL vous emmène de vos premières minutes prudentes jusqu'à 5 km, 10 km ou un semi-marathon, en alternant course et marche par petites étapes faciles.

TROIS PROGRAMMES
• 0–5 km en 8 semaines
• 0–10 km en 15 semaines
• Semi-marathon (21,1 km) en 21 semaines
Trois séances par semaine, les jours de votre choix. Consultez chaque séance à l'avance, déplacez une séance, répétez une semaine ou baissez d'un niveau si c'est trop difficile.

UN COACH VOCAL QUI COURT AVEC VOUS
• Vous dit quand courir et quand marcher, quand vous êtes à mi-parcours et ce qui vient ensuite
• Compte à rebours et vibration à chaque changement
• Fonctionne écran éteint, téléphone dans la poche
• La musique de Spotify ou d'une autre app continue pendant que le coach parle

TAPIS DE COURSE OU EXTÉRIEUR – À VOUS DE CHOISIR À CHAQUE FOIS
• En extérieur : distance, allure et vitesse par GPS, affichées en permanence – et le coach peut annoncer distance et allure à chaque kilomètre
• Sur tapis : uniquement le temps, sans GPS. Ensuite, vous pouvez saisir la distance du tapis pour qu'elle compte

MOTIVATION
• Votre total de kilomètres sur l'écran d'accueil
• 24 étapes clés avec des félicitations en chemin : votre premier kilomètre, 5, 10 et 15 km en une séance, 10 km et un semi-marathon au total, le club des 100 km et bien d'autres
• Historique, activité hebdomadaire et calendrier de vos séances
• Rappels les jours d'entraînement

CINQ LANGUES
Français, anglais, danois, allemand et espagnol. Le texte et la voix peuvent avoir chacun leur langue – touchez le drapeau pour changer.

VOS DONNÉES VOUS APPARTIENNENT
Pas de compte, pas de pub, pas d'achats intégrés. Tout est enregistré sur votre téléphone, et vous pouvez faire votre propre sauvegarde.

Créé par Team Ingberg.""",
)

L["es-ES"] = dict(
name="Runstart 0-GOAL",
subtitle="Correr/andar: 5K, 10K y media",
promotional_text="Del sofá a la meta alternando correr y caminar, paso a paso. Entrenador de voz en 5 idiomas, tu música sigue sonando, sin cuenta ni anuncios: todo queda en tu móvil.",
keywords="plan correr,principiante,5 km,10 km,intervalos,media maratón,running,trotar,resistencia",
description="""Empieza a correr, desde cero. Runstart 0-GOAL te lleva de tus primeros minutos con cuidado hasta los 5 km, 10 km o una media maratón, alternando correr y caminar en pasos pequeños y asequibles.

TRES PROGRAMAS
• 0–5 km en 8 semanas
• 0–10 km en 15 semanas
• Media maratón (21,1 km) en 21 semanas
Tres sesiones por semana, los días que tú elijas. Consulta cada sesión con antelación, mueve una sesión, repite una semana o baja un nivel si se hace demasiado duro.

UN ENTRENADOR DE VOZ QUE CORRE CONTIGO
• Te dice cuándo correr y cuándo caminar, cuándo llevas la mitad y qué viene después
• Cuenta atrás y vibración en cada cambio
• Funciona con la pantalla apagada y el móvil en el bolsillo
• La música de Spotify u otra app sigue sonando mientras habla el entrenador

CINTA O AL AIRE LIBRE: TÚ ELIGES CADA VEZ
• Al aire libre: distancia, ritmo y velocidad por GPS, siempre a la vista, y el entrenador puede anunciar distancia y ritmo en cada kilómetro
• En cinta: solo el tiempo, sin GPS. Después puedes introducir la distancia de la cinta para que cuente

MOTIVACIÓN
• Tus kilómetros totales en la pantalla de inicio
• 24 hitos con elogios por el camino: tu primer kilómetro, 5, 10 y 15 km en una sesión, 10 km y una media maratón en total, el club de los 100 km y muchos más
• Historial, actividad semanal y un calendario de tus sesiones
• Recordatorios en tus días de entrenamiento

CINCO IDIOMAS
Español, inglés, danés, francés y alemán. El texto y la voz pueden tener cada uno su idioma: toca la bandera para cambiar.

TUS DATOS SON TUYOS
Sin cuenta, sin anuncios, sin compras dentro de la app. Todo se guarda en tu móvil y puedes hacer tu propia copia de seguridad.

Creado por Team Ingberg.""",
)

LIMITS = dict(name=30, subtitle=30, promotional_text=170, description=4000)

def main():
    root = os.path.join(os.path.dirname(__file__), "metadata")
    bad = []
    for loc, f in L.items():
        d = os.path.join(root, loc); os.makedirs(d, exist_ok=True)
        f = dict(f, privacy_url=PRIVACY, support_url=SUPPORT, marketing_url="")
        for k, v in f.items():
            open(os.path.join(d, k + ".txt"), "w").write(v + ("\n" if v else ""))
        for k, lim in LIMITS.items():
            if len(f[k]) > lim: bad.append(f"{loc} {k}: {len(f[k])}>{lim}")
        kb = len(f["keywords"].encode());
        if kb > 100: bad.append(f"{loc} keywords: {kb} bytes>100")
        print(f"{loc:6} name {len(f['name'])}/30 sub {len(f['subtitle'])}/30 promo {len(f['promotional_text'])}/170 desc {len(f['description'])}/4000 kw {kb}/100B")
    json.dump(L, open(os.path.join(os.path.dirname(__file__), "listing.json"), "w"), ensure_ascii=False, indent=1)
    if bad: print("OVER LIMIT:", *bad, sep="\n  "); sys.exit(1)
    print("All within Apple's limits.")

if __name__ == "__main__": main()
