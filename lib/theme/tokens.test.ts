import { describe, expect, it } from 'bun:test';

import { PrimaPalette, PrimaRadius, PrimaSemantic, PrimaSpacing } from './tokens';

describe('prima palette', () => {
  it('matches frontend primary colors', () => {
    expect(PrimaPalette.primaryStart).toBe('#2f76df');
    expect(PrimaPalette.primaryEnd).toBe('#255fc2');
  });

  it('matches frontend neutral panel colors', () => {
    expect(PrimaPalette.backgroundWashStart).toBe('#f6f8fc');
    expect(PrimaPalette.backgroundWashEnd).toBe('#eef4ff');
    expect(PrimaPalette.surface).toBe('#ffffff');
    expect(PrimaPalette.border).toBe('#dce6f7');
  });

  it('defines semantic status pill tokens for all tones', () => {
    expect(Object.keys(PrimaSemantic.statusPill).sort()).toEqual(['danger', 'neutral', 'primary', 'success', 'warning']);

    expect(PrimaSemantic.statusPill.primary.backgroundColor).toBe('#eaf1ff');
    expect(PrimaSemantic.statusPill.primary.borderColor).toBe('#c4d7fb');
    expect(PrimaSemantic.statusPill.primary.color).toBe('#255fc2');

    expect(PrimaSemantic.statusPill.success.backgroundColor).toBe('#e8f6ee');
    expect(PrimaSemantic.statusPill.success.borderColor).toBe('#c7ebd6');
    expect(PrimaSemantic.statusPill.warning.backgroundColor).toBe('#fff6e8');
    expect(PrimaSemantic.statusPill.warning.borderColor).toBe('#f6dfba');
    expect(PrimaSemantic.statusPill.danger.backgroundColor).toBe('#fdeceb');
    expect(PrimaSemantic.statusPill.danger.borderColor).toBe('#f7cbc7');
  });

  it('exposes core spacing and radius tokens', () => {
    expect(PrimaSpacing.screenHorizontal).toBe(20);
    expect(PrimaSpacing.screenVertical).toBe(16);
    expect(PrimaSpacing.cardPadding).toBe(16);
    expect(PrimaRadius.card).toBe(18);
    expect(PrimaRadius.pill).toBe(999);
  });

  it('defines semantic panel elevation token', () => {
    expect(PrimaSemantic.panel.shadowColor).toBe('#173364');
    expect(PrimaSemantic.panel.shadowOpacity).toBe(0.08);
    expect(PrimaSemantic.panel.shadowRadius).toBe(18);
  });
});
