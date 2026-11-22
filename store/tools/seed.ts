import { sessionSegments, segmentsTotal } from '../runstart/src/core/programs.ts';
import { achievedIds } from '../runstart/src/core/milestones.ts';
// p10: 6 weeks done (18 sessions), now at week 7 session 1. Mix of outdoor (GPS) and treadmill (manual).
const hist:any[] = []; const start = new Date('2026-10-12T06:00:00Z');
const dayOff=[0,2,4]; let n=0;
for (let w=0; w<6; w++) for (let s=0; s<3; s++) {
  const segs = sessionSegments('p10', w, s);
  const run = segs.filter(x=>x.type==='run').reduce((a,b)=>a+b.dur,0);
  const walk = segs.filter(x=>x.type==='walk').reduce((a,b)=>a+b.dur,0);
  const longest = Math.max(...segs.filter(x=>x.type==='run').map(x=>x.dur));
  const d = new Date(start); d.setUTCDate(d.getUTCDate()+w*7+dayOff[s]);
  const outdoor = (n%3)!==1;
  const km = +((run/60)*0.155 + (walk/60)*0.095).toFixed(2);
  hist.push({ id:'h'+n, pid:'p10', w, s, env: outdoor?'outdoor':'treadmill', date:d.toISOString(), completed:true, completion:1,
    total:segmentsTotal(segs)+20, active:segmentsTotal(segs), run, walk, pause:20, longest, repeat:false,
    rating: n%5===0?'easy':'right', dist: km, distSource: outdoor?'gps':'manual' });
  n++;
}
const tot = hist.reduce((a,h)=>a+(h.dist||0),0);
const data = { settings:{ lang:'en', voiceLang:'en', voiceAmount:'full', volume:0.9, vibration:true, countdown:3, kmVoice:true, reminders:true, reminderTime:'07:30' },
  active:'p10', programs:{ p10:{ pos:{w:6,s:0}, days:[0,2,4], startDate:'2026-10-12', goalDate:'2027-01-24', moved:{}, finished:false } },
  history: hist, onboarded:true };
console.error('total km', tot.toFixed(1), 'milestones', achievedIds(hist as any).length);
console.log(JSON.stringify(data));
