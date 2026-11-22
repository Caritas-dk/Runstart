import React from 'react';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import type { Lang } from '../core/types';

/** Small drawn flags (same look on iPhone and Android, no emoji font needed). 3:2 ratio. */
export function Flag({ lang, width = 30 }: { lang: Lang; width?: number }) {
  const h = (width * 2) / 3;
  return (
    <Svg width={width} height={h} viewBox="0 0 60 40">
      <Defs><ClipPath id={`f-${lang}`}><Rect width={60} height={40} rx={5} /></ClipPath></Defs>
      <G clipPath={`url(#f-${lang})`}>
        {lang === 'da' && <>
          <Rect width={60} height={40} fill="#C8102E" />
          <Rect x={18} width={7} height={40} fill="#FFFFFF" />
          <Rect y={16.5} width={60} height={7} fill="#FFFFFF" />
        </>}
        {lang === 'de' && <>
          <Rect width={60} height={13.4} fill="#000000" />
          <Rect y={13.3} width={60} height={13.4} fill="#DD0000" />
          <Rect y={26.6} width={60} height={13.4} fill="#FFCE00" />
        </>}
        {lang === 'fr' && <>
          <Rect width={20} height={40} fill="#002395" />
          <Rect x={20} width={20} height={40} fill="#FFFFFF" />
          <Rect x={40} width={20} height={40} fill="#ED2939" />
        </>}
        {lang === 'es' && <>
          <Rect width={60} height={40} fill="#AA151B" />
          <Rect y={10} width={60} height={20} fill="#F1BF00" />
        </>}
        {lang === 'en' && <>
          <Rect width={60} height={40} fill="#012169" />
          <Path d="M0 0L60 40M60 0L0 40" stroke="#FFFFFF" strokeWidth={8} />
          <Path d="M0 0L60 40M60 0L0 40" stroke="#C8102E" strokeWidth={3} />
          <Path d="M30 0V40M0 20H60" stroke="#FFFFFF" strokeWidth={12} />
          <Path d="M30 0V40M0 20H60" stroke="#C8102E" strokeWidth={7} />
        </>}
      </G>
      <Rect width={60} height={40} rx={5} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} />
    </Svg>
  );
}
