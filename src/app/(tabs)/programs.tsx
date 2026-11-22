import React from 'react';
import { PROGRAMS } from '../../core/programs';
import { useT } from '../../store/store';
import { Screen, T, s } from '../../ui/components';
import { ProgramCard } from '../../ui/ProgramCard';

export default function Programs() {
  const { t } = useT();
  return (
    <Screen title={t('nav_programs')}>
      <T style={[s.small, s.muted, { marginBottom: 14, lineHeight: 20 }]}>{t('welcome_text')}</T>
      {PROGRAMS.map((p) => <ProgramCard key={p.id} pid={p.id} />)}
    </Screen>
  );
}
