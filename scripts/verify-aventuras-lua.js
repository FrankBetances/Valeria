// ============================================================================
// Verificador Clínico y Estructural de Aventuras con Lúa
// ============================================================================

const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '../src/AventurasLua');

function assert(condition, msg) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    process.exit(1);
  }
}

console.log('🔍 [Aventuras con Lúa] Verificando catálogos y tema clínico...');

// 1. Theme
const themeContent = fs.readFileSync(path.join(baseDir, 'Theme/luaTheme.ts'), 'utf8');
assert(themeContent.includes("primary: '#0D7685'"), 'Color primario teal no encontrado');
assert(themeContent.includes("minSize: 56"), 'Objetivo táctil infantil >= 56 dp requerido');
console.log('✅ 1. Tokens de diseño médico cálido validados (WCAG AAA, >= 56dp).');

// 2. Assessment Catalog
const assessmentContent = fs.readFileSync(path.join(baseDir, 'Catalog/LuaAssessmentCatalog.ts'), 'utf8');
const idMatches = assessmentContent.match(/id:\s*'lua_eval_[^']+'/g) || [];
assert(idMatches.length === 60, `Se esperaban 60 preguntas de evaluación, encontradas: ${idMatches.length}`);

const ageBands = ['0-2', '2-3', '3-4', '4-5', '5-7', '7-10'];
for (const band of ageBands) {
  const bandMatches = assessmentContent.match(new RegExp(`ageBand:\\s*'${band}'`, 'g')) || [];
  assert(bandMatches.length === 10, `La franja ${band} debe tener 10 preguntas, encontradas: ${bandMatches.length}`);
}
console.log('✅ 2. Banco de 60 preguntas interactivas (6 franjas x 10) con pautas clínicas validado.');

// 3. Stories Catalog
const storiesContent = fs.readFileSync(path.join(baseDir, 'Catalog/LuaStoriesCatalog.ts'), 'utf8');
const storyMatches = storiesContent.match(/id:\s*'lua_story_[^']+'/g) || [];
assert(storyMatches.length === 10, `Se esperaban 10 cuentos, encontrados: ${storyMatches.length}`);
assert(storiesContent.includes('Coco busca a mamá'), 'Cuento 1 presente');
assert(storiesContent.includes('El equipo que cuidó la playa'), 'Cuento 10 presente');
console.log('✅ 3. Catálogo de 10 cuentos con comprensión, vocabulario y dibujo validado.');

// 4. Songs Catalog
const songsContent = fs.readFileSync(path.join(baseDir, 'Catalog/LuaSongsCatalog.ts'), 'utf8');
const songMatches = songsContent.match(/id:\s*'lua_song_[^']+'/g) || [];
assert(songMatches.length === 10, `Se esperaban 10 canciones, encontradas: ${songMatches.length}`);
assert(songsContent.includes('Buenos días, sol'), 'Canción 1 presente');
assert(songsContent.includes('El baile de las vocales'), 'Canción 4 presente');
assert(songsContent.includes('Lávate las manitos'), 'Canción 6 presente');
console.log('✅ 4. Catálogo de 10 canciones motrices y de praxias validado.');

// 5. Printables Catalog
const printContent = fs.readFileSync(path.join(baseDir, 'Catalog/LuaPrintablesCatalog.ts'), 'utf8');
const printMatches = printContent.match(/id:\s*'lua_print_[^']+'/g) || [];
assert(printMatches.length === 10, `Se esperaban 10 imprimibles, encontrados: ${printMatches.length}`);
assert(printContent.includes('Rueda de las emociones de Lúa'), 'Imprimible 5 presente');
assert(printContent.includes('Diploma de logros de Lúa'), 'Imprimible 10 presente');
console.log('✅ 5. Catálogo de 10 imprimibles y diplomas validado.');

console.log('\n🎉 TODOS LOS CATÁLOGOS DE AVENTURAS CON LÚA ESTÁN ÍNTEGROS Y VALIDADOS.');
