import { REGLAGES_DEFAUT, valider } from './reglages.service';

describe('valider (réglages)', () => {
  it('rend les valeurs par défaut pour une entrée vide ou invalide', () => {
    expect(valider(undefined)).toEqual(REGLAGES_DEFAUT);
    expect(valider(null)).toEqual(REGLAGES_DEFAUT);
    expect(valider({})).toEqual(REGLAGES_DEFAUT);
  });

  it('garde les valeurs correctes', () => {
    expect(valider({ taille: 'grande', arabe: true, direAuToucher: false, longueurPhrase: 4 })).toEqual({
      taille: 'grande',
      arabe: true,
      direAuToucher: false,
      longueurPhrase: 4,
    });
  });

  it('ignore les valeurs inconnues ou hors limites (fichier de sauvegarde abîmé)', () => {
    const r = valider({ taille: 'geante' as never, arabe: 'oui' as never, longueurPhrase: 50 });
    expect(r.taille).toBe('normale');
    expect(r.arabe).toBe(false);
    expect(r.longueurPhrase).toBe(8);
  });
});
