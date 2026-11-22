import asyncio, json, os, base64
from playwright.async_api import async_playwright
C=json.load(open('captions.json'))
NAMES=['1workout','2home','3programs','4session','5milestones','6history','7language','8splash']
LOC={'en':'en-US','da':'da','de':'de-DE','fr':'fr-FR','es':'es-ES'}
B='file:///home/claude/splash/BarlowCondensed_800ExtraBold.ttf'
I='file:///home/claude/runstart/node_modules/@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf'
TPL="""<html><head><style>@font-face{font-family:B;src:url(%s)}@font-face{font-family:I;src:url(%s)}
body{margin:0;width:440px;height:956px;background:radial-gradient(120%% 70%% at 50%% 0%%,#163562 0%%,#0B1F3A 60%%);overflow:hidden;position:relative}
h1{font-family:B;color:#fff;font-size:%dpx;line-height:1;letter-spacing:.5px;text-align:center;margin:62px 24px 0}
p{font-family:I;color:#B6F23A;font-size:19px;text-align:center;margin:12px 24px 0}
.ph{position:absolute;left:50%%;transform:translateX(-50%%);top:194px;width:334px;height:723px;border-radius:44px;overflow:hidden;border:7px solid #1d3a63;box-shadow:0 20px 60px rgba(0,0,0,.45)}
.ph img{width:100%%;height:auto;display:block}
</style></head><body><h1>%s</h1><p>%s</p><div class="ph"><img src="%s"></div></body></html>"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome')
    pg=await b.new_page(viewport={'width':440,'height':956},device_scale_factor=3)
    for lang,caps in C.items():
      d=f'/home/claude/runstart/store/screenshots/{LOC[lang]}'; os.makedirs(d,exist_ok=True)
      for i,(n,(h,s)) in enumerate(zip(NAMES,caps)):
        size=46 if len(h)<=22 else 40 if len(h)<=26 else 36
        html=TPL%(B,I,size,h,s,f'file:///home/claude/shots/raw/{lang}_{n}.png')
        open('/tmp/c.html','w').write(html); await pg.goto('file:///tmp/c.html'); await pg.wait_for_timeout(150)
        await pg.screenshot(path=f'{d}/{i+1:02d}_{n[1:]}.png')
    await b.close()
asyncio.run(main())
