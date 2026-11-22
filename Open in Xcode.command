#!/bin/bash
# Runstart – dobbeltklik på denne fil i Finder for at åbne iOS-appen i Xcode.
#
# Første gang: installerer det, appen skal bruge (kan tage 5–10 minutter).
# Derefter: åbner bare Xcode-projektet. Tryk ▶ (Run) eller Product → Archive i Xcode.
#
# Kræver på Mac'en: Xcode (fra App Store) og Node.js (https://nodejs.org eller `brew install node`).

set -e
cd "$(dirname "$0")"
export EXPO_NO_TELEMETRY=1

say_step() { printf '\n\033[1;32m▶ %s\033[0m\n' "$1"; }
fail() { printf '\n\033[1;31m✖ %s\033[0m\n\n' "$1"; read -r -p "Tryk Enter for at lukke …"; exit 1; }

# --- tjek forudsætninger ---------------------------------------------------
xcode-select -p >/dev/null 2>&1 || fail "Xcode mangler. Installér Xcode fra App Store, åbn det én gang, og prøv igen."
command -v node >/dev/null 2>&1 || {
  if command -v brew >/dev/null 2>&1; then say_step "Installerer Node.js med Homebrew"; brew install node;
  else fail "Node.js mangler. Hent det på https://nodejs.org (LTS) og prøv igen."; fi
}
# CocoaPods: brug en installeret, ellers installér den til din egen bruger (kræver ingen adgangskode)
for d in "$HOME"/.gem/ruby/*/bin "$HOME"/.local/share/gem/ruby/*/bin; do [ -d "$d" ] && PATH="$d:$PATH"; done
export PATH
command -v pod >/dev/null 2>&1 || {
  say_step "Installerer CocoaPods (kun til din bruger – ingen adgangskode)"
  if command -v brew >/dev/null 2>&1; then brew install cocoapods
  else
    RUBY_MAJOR=$(ruby -e 'print RUBY_VERSION.split(".")[0]')
    if [ "$RUBY_MAJOR" -lt 3 ]; then
      # macOS' indbyggede Ruby 2.6: når en hjælpepakke er for ny, foreslår RubyGems selv den sidste
      # version, der virker ("Try installing it with `gem install X -v Y`"). Den installeres, og vi prøver igen.
      gem_install_old_ruby() {
        local target="$1" tries=0 out suggestion
        while [ $tries -lt 25 ]; do
          tries=$((tries+1))
          out=$(gem install --user-install --no-document --conservative "$target" 2>&1) && { echo "$out" | tail -n 2; return 0; }
          echo "$out" | tail -n 4
          suggestion=$(echo "$out" | sed -n 's/.*gem install \([A-Za-z0-9_.-]*\) -v \([0-9][0-9A-Za-z.]*\).*/\1:\2/p' | head -1)
          [ -n "$suggestion" ] || return 1
          # RubyGems foreslår nogle gange den samme version, som lige fejlede – så giver vi op
          [ "$suggestion" != "$target" ] || return 1
          case " $GEM_SEEN " in *" $suggestion "*) return 1;; esac
          GEM_SEEN="$GEM_SEEN $suggestion"
          say_step "Installerer $suggestion (sidste version, der virker med Ruby 2.6)"
          gem_install_old_ruby "$suggestion" || return 1
        done
        return 1
      }
      GEM_SEEN=""
      for g in zeitwerk:2.6.18 minitest:5.15.0 i18n:1.14.8 public_suffix:4.0.7 nap:1.1.0 activesupport:6.1.7.10 ffi:1.16.3 cocoapods:1.16.2; do
        gem_install_old_ruby "$g" || fail "CocoaPods-pakken $g kunne ikke installeres. Send teksten ovenfor til Claude."
      done
    else
      gem install --user-install --no-document cocoapods || fail "CocoaPods kunne ikke installeres. Send teksten ovenfor til Claude."
    fi
    for d in "$HOME"/.gem/ruby/*/bin; do [ -d "$d" ] && PATH="$d:$PATH"; done
    export PATH
  fi
  command -v pod >/dev/null 2>&1 || fail "CocoaPods blev installeret, men 'pod' kan ikke findes. Send teksten ovenfor til Claude."
}
# Ruby 2.6 + activesupport 6.1 virker kun med concurrent-ruby <= 1.3.4 (kendt CocoaPods-fejl:
# "uninitialized constant ActiveSupport::LoggerThreadSafeLevel::Logger")
if [ "$(ruby -e 'print RUBY_VERSION.split(".")[0]')" -lt 3 ]; then
  gem list concurrent-ruby --exact -i -v 1.3.4 >/dev/null 2>&1 || gem install --user-install --no-document concurrent-ruby:1.3.4
  for v in $(gem list concurrent-ruby --exact 2>/dev/null | sed -n 's/.*(\(.*\)).*/\1/p' | tr ',' ' '); do
    v=${v#default: }
    if [ "$(printf '%s\n' 1.3.4 "$v" | sort -V | tail -1)" != "1.3.4" ]; then
      gem uninstall concurrent-ruby -v "$v" -x -I --user-install >/dev/null 2>&1 || true
    fi
  done
fi
POD_VERSION=$(LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pod --version 2>&1) || { echo "$POD_VERSION"; fail "CocoaPods ($(command -v pod)) kan ikke starte. Send teksten ovenfor til Claude."; }

XCODE_VERSION=$(xcodebuild -version | head -1 | awk '{print $2}')
say_step "Xcode $XCODE_VERSION, Node $(node -v), CocoaPods $POD_VERSION"

# --- JavaScript-pakker -----------------------------------------------------
if [ ! -d node_modules ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
  say_step "Installerer pakker (npm ci)"
  npm ci
fi

# Ældre Xcode (< 26.6): én linje i ExpoModulesJSI skal skrives lidt om (ændrer ikke appens opførsel).
if [ "$(printf '%s\n' 26.6 "$XCODE_VERSION" | sort -V | head -1)" != "26.6" ]; then
  say_step "Xcode $XCODE_VERSION er ældre end 26.6 – tilføjer kompatibilitetsrettelse"
  python3 scripts/ci-xcode-compat.py || true
fi

# --- Xcode-projekt ---------------------------------------------------------
# ios-mappen genereres ud fra app.json. Den laves igen, hvis app.json eller pakkerne er nyere.
if [ ! -d ios/Runstart.xcworkspace ] || [ app.json -nt ios/Podfile.lock ] || [ package-lock.json -nt ios/Podfile.lock ]; then
  say_step "Laver Xcode-projektet (expo prebuild)"
  npx expo prebuild --platform ios --no-install || fail "expo prebuild fejlede. Send teksten ovenfor til Claude."
  say_step "Installerer iOS-biblioteker (pod install) – kan tage nogle minutter"
  (cd ios && LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 pod install) || fail "pod install fejlede. Send teksten ovenfor til Claude."
  # ▶ Run bygger Release, så appen har al koden med og virker uden en udviklingsserver på Mac'en
  sed -i '' '/<LaunchAction/{n;s/buildConfiguration = "Debug"/buildConfiguration = "Release"/;}' ios/Runstart.xcodeproj/xcshareddata/xcschemes/Runstart.xcscheme || true
fi

say_step "Åbner Xcode"
open ios/Runstart.xcworkspace

cat <<'TXT'

Klar! I Xcode:
  1. Vælg projektet "Runstart" → fanen "Signing & Capabilities" → vælg dit Team (første gang).
  2. Vælg din iPhone eller en simulator øverst, og tryk ▶ (Run).
  3. Til TestFlight/App Store: Product → Archive.

TXT
