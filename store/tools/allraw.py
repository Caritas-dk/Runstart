import asyncio, json, sys
from playwright.async_api import async_playwright
D0=json.load(open('/home/claude/shots/seed.json')); LB=json.load(open('/home/claude/shots/labels.json'))
HIDE="""for(const el of document.querySelectorAll('div')){ if([...el.children].some(c=>c.textContent.trim()==='DEMO') && el.textContent.includes('60')) el.style.visibility='hidden'; }"""
async def run(b,LANG):
  OUT=f'/home/claude/shots/raw/{LANG}_'; S=LB[LANG]
  D=json.loads(json.dumps(D0)); D['settings']['lang']=LANG; D['settings']['voiceLang']=LANG
  INIT="localStorage.clear();localStorage.setItem('runstart/data/v1',%s);"%json.dumps(json.dumps(D))
  lat,lon=55.6761,12.5683
  ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=3,timezone_id='Europe/Copenhagen',geolocation={'latitude':lat,'longitude':lon,'accuracy':5},permissions=['geolocation'])
  async def page():
    pg=await ctx.new_page(); await pg.clock.install(time='2026-11-23T06:40:00+01:00'); await pg.clock.resume(); await pg.add_init_script(INIT); return pg
  pg=await page(); await pg.goto('http://localhost:8766/'); await pg.wait_for_timeout(1300); await pg.screenshot(path=OUT+'8splash.png')
  await pg.wait_for_timeout(2500); await pg.screenshot(path=OUT+'2home.png')
  await pg.get_by_text(S['start_session'],exact=True).first.click(); await pg.wait_for_timeout(1000)
  await pg.get_by_text(S['outdoor'],exact=True).first.click(); await pg.wait_for_timeout(600); await pg.screenshot(path=OUT+'4session.png')
  await pg.get_by_text(S['start_session'],exact=True).last.click(); await pg.wait_for_timeout(1500)
  for i in range(400):
    await pg.clock.fast_forward(1000); lat+=2.9/111320; lon+=0.3/111320
    await ctx.set_geolocation({'latitude':lat,'longitude':lon,'accuracy':5})
    if i%40==0: await pg.wait_for_timeout(50)
  await pg.wait_for_timeout(1500); await pg.evaluate(HIDE); await pg.wait_for_timeout(200); await pg.screenshot(path=OUT+'1workout.png')
  await pg.close()
  for route,name in [('/programs','3programs'),('/milestones','5milestones'),('/history','6history'),('/language','7language')]:
    q=await page(); await q.goto('http://localhost:8766'+route); await q.wait_for_timeout(3500); await q.screenshot(path=OUT+name+'.png'); await q.close()
  await ctx.close()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome')
    for l in sys.argv[1:]: await run(b,l); print('done',l)
    await b.close()
asyncio.run(main())
