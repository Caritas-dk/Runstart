#!/usr/bin/env python3
"""CI only, for Xcode older than 26.6 (Swift 6.2.3).

That compiler wrongly rejects one line in expo-modules-jsi with
"sending 'slot' risks causing data races", although `slot` is declared
nonisolated(unsafe). We pass the pointer through an @unchecked Sendable box
instead, which is the same thing at runtime. Newer Xcode builds the original.
"""
import pathlib, sys

f = pathlib.Path('node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI/Runtime/Values/JavaScriptObject.swift')
src = f.read_text()
old = """    try runtime._withUnsafeGuaranteedRef { runtime in
      try JavaScriptActor.assumeIsolated {
        try encode(JavaScriptValue.Slot(slot), runtime)
      }
    }"""
new = """    let slotBox = _CICompatUnsafeSendableBox(value: slot)
    try runtime._withUnsafeGuaranteedRef { runtime in
      try JavaScriptActor.assumeIsolated {
        try encode(JavaScriptValue.Slot(slotBox.value), runtime)
      }
    }"""
if src.count(old) != 1:
    sys.exit('compat patch: expected code not found exactly once – expo-modules-jsi changed, patch not applied')
src = src.replace(old, new) + "\n/// CI compat for Xcode < 26.6 (see scripts/ci-xcode-compat.py)\nstruct _CICompatUnsafeSendableBox<T>: @unchecked Sendable { let value: T }\n"
f.write_text(src)
print('compat patch applied to', f)
