// ============================================================================
// Valeria+ · Auditoría de Balance Fonémico en Pares Mínimos (Port de minpair)
// ============================================================================
import { MINIMAL_PAIRS } from '../src/valeriaMinimalPairs';
import { distanceBySymbol } from './phoneme-distance';

export interface AuditReport {
  totalPairs: number;
  distribution: {
    d1_minimal: number;
    d2_medium: number;
    d3_maximal: number;
  };
  pairs: Array<{
    code: string;
    target: string;
    foil: string;
    phoneme: string;
    distance: number;
  }>;
}

export function runAudit(): AuditReport {
  let d1 = 0;
  let d2 = 0;
  let d3 = 0;

  const pairDetails = MINIMAL_PAIRS.map((pair) => {
    // Estimar fonemas del target y foil a partir de la primera consonante que difiere
    const tWord = pair.target.toLowerCase();
    const fWord = pair.foil.toLowerCase();
    let sym1 = tWord[0];
    let sym2 = fWord[0];

    // Buscar el primer carácter donde difieren
    for (let i = 0; i < Math.min(tWord.length, fWord.length); i++) {
      if (tWord[i] !== fWord[i]) {
        sym1 = tWord[i];
        sym2 = fWord[i];
        break;
      }
    }

    const dist = distanceBySymbol(sym1, sym2);
    if (dist === 1) d1++;
    else if (dist === 2) d2++;
    else d3++;

    return {
      code: pair.code,
      target: pair.target,
      foil: pair.foil,
      phoneme: pair.phoneme,
      distance: dist,
    };
  });

  return {
    totalPairs: MINIMAL_PAIRS.length,
    distribution: {
      d1_minimal: d1,
      d2_medium: d2,
      d3_maximal: d3,
    },
    pairs: pairDetails,
  };
}

if (require.main === module) {
  const rep = runAudit();
  console.log(`Auditoría Fonémica de Pares Mínimos Valeria+`);
  console.log(`Total de pares analizados: ${rep.totalPairs}`);
  console.log(`D=1 (Oposición Mínima): ${rep.distribution.d1_minimal}`);
  console.log(`D=2 (Oposición Media):  ${rep.distribution.d2_medium}`);
  console.log(`D=3 (Oposición Máxima): ${rep.distribution.d3_maximal}`);
}
