# -*- coding: utf-8 -*-
"""Genera docs/Valeria-Manual-Casos-de-Uso.docx a partir del contenido del manual.

Uso:
    pip install python-docx
    python3 docs/build-docx.py

Requiere las capturas de docs/screenshots/ (ver docs/capture-screenshots.js).
Mantiene el mismo contenido que docs/manual-casos-de-uso.html (v10.3).

OJO: este script NO lee el HTML; lleva el texto duplicado dentro. Todo cambio
de contenido hay que aplicarlo en LOS DOS sitios o el Word y el PDF se quedan
desincronizados sin que nada avise.
"""
import os
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.path.join(ROOT, 'docs', 'screenshots')
OUT = os.path.join(ROOT, 'docs', 'Valeria-Manual-Casos-de-Uso.docx')

PRIMARY = RGBColor(0x00, 0xA3, 0x9E)
PRIMARY_BRIGHT = RGBColor(0x00, 0xC4, 0xBE)
VIOLET_DARK = RGBColor(0x6D, 0x3F, 0xC4)
INK = RGBColor(0x1F, 0x29, 0x37)
INK2 = RGBColor(0x4B, 0x55, 0x63)
MUTED = RGBColor(0x6B, 0x72, 0x80)
FILL_LIGHT = 'E6F9F8'
FILL_TINT = 'F0FDF9'
FILL_WARN = 'FFFBEB'
FILL_OK = 'EAFAF2'
FILL_VIOLET = 'F5F0FF'
FILL_VIOLET_HEAD = '7C4FD0'

doc = Document()
doc.core_properties.title = 'Valeria+ · Manual de Casos de Uso'
doc.core_properties.author = 'Proyecto Valeria+'
doc.core_properties.language = 'es-ES'

sec = doc.sections[0]
sec.page_width, sec.page_height = Cm(21.0), Cm(29.7)
sec.left_margin = sec.right_margin = Cm(2.0)
sec.top_margin, sec.bottom_margin = Cm(2.0), Cm(2.2)

normal = doc.styles['Normal']
normal.font.name = 'Calibri'
normal.font.size = Pt(10.5)
normal.font.color.rgb = INK
normal.paragraph_format.space_after = Pt(6)
normal.element.rPr.rFonts.set(qn('w:eastAsia'), 'Calibri')

for name, size, color, before in (('Heading 1', 17, PRIMARY, 14),
                                  ('Heading 2', 13.5, RGBColor(0xFF, 0xFF, 0xFF), 12),
                                  ('Heading 3', 11.5, INK2, 10)):
    st = doc.styles[name]
    st.font.name = 'Calibri'
    st.font.size = Pt(size)
    st.font.bold = True
    st.font.color.rgb = color
    st.paragraph_format.space_before = Pt(before)
    st.paragraph_format.space_after = Pt(4)
    st.paragraph_format.keep_with_next = True

footer_p = sec.footer.paragraphs[0]
footer_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = footer_p.add_run('Valeria+ · Manual de Casos de Uso · v10.3 (con capturas de pantalla) · Agosto de 2026')
run.font.size = Pt(8)
run.font.color.rgb = MUTED


# ---------- utilidades ----------
def shade(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:fill'), fill)
    tc_pr.append(shd)


def p(text='', bold=False, size=None, color=None, align=None, style=None, space_after=6, italic=False):
    par = doc.add_paragraph(style=style)
    par.paragraph_format.space_after = Pt(space_after)
    if align is not None:
        par.alignment = align
    if text:
        r = par.add_run(text)
        r.bold = bold
        r.italic = italic
        if size:
            r.font.size = Pt(size)
        if color:
            r.font.color.rgb = color
    return par


def rich(par, parts, size=None):
    for part in parts:
        text, bold = part[0], part[1]
        r = par.add_run(text)
        r.bold = bold
        if size:
            r.font.size = Pt(size)
        if len(part) > 2 and part[2]:
            r.font.color.rgb = part[2]
    return par


def kicker(text):
    par = p(text.upper(), bold=True, size=8.5, color=PRIMARY_BRIGHT, space_after=0)
    par.paragraph_format.keep_with_next = True
    return par


def numbered(items):
    for i, item in enumerate(items, 1):
        par = doc.add_paragraph()
        par.paragraph_format.left_indent = Cm(0.8)
        par.paragraph_format.first_line_indent = Cm(-0.45)
        par.paragraph_format.space_after = Pt(3)
        par.add_run(f'{i}. ').bold = True
        if isinstance(item, str):
            par.add_run(item)
        else:
            rich(par, item)


def bullets(items):
    for item in items:
        par = doc.add_paragraph()
        par.paragraph_format.left_indent = Cm(0.8)
        par.paragraph_format.first_line_indent = Cm(-0.45)
        par.paragraph_format.space_after = Pt(3)
        par.add_run('•  ')
        if isinstance(item, str):
            par.add_run(item)
        else:
            rich(par, item)


def callout(label, text, fill=FILL_TINT, label_color=PRIMARY):
    t = doc.add_table(rows=1, cols=1)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = t.cell(0, 0)
    shade(cell, fill)
    par = cell.paragraphs[0]
    par.paragraph_format.space_after = Pt(2)
    r = par.add_run(label.upper())
    r.bold = True
    r.font.size = Pt(8.5)
    r.font.color.rgb = label_color
    par2 = cell.add_paragraph()
    par2.paragraph_format.space_after = Pt(2)
    if isinstance(text, str):
        par2.add_run(text)
    else:
        rich(par2, text)
    for par_x in (par, par2):
        for run_x in par_x.runs:
            if run_x.font.size is None:
                run_x.font.size = Pt(9.5)
    p('', space_after=2)


def data_table(headers, rows, widths=None, header_fill=FILL_LIGHT):
    t = doc.add_table(rows=1 + len(rows), cols=len(headers))
    t.style = doc.styles['Table Grid']
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for j, h in enumerate(headers):
        cell = t.cell(0, j)
        shade(cell, header_fill)
        par = cell.paragraphs[0]
        r = par.add_run(h)
        r.bold = True
        r.font.size = Pt(9)
        r.font.color.rgb = PRIMARY
    for i, row in enumerate(rows, 1):
        for j, val in enumerate(row):
            cell = t.cell(i, j)
            par = cell.paragraphs[0]
            if isinstance(val, str):
                r = par.add_run(val)
                r.font.size = Pt(9.5)
            else:
                rich(par, val, size=9.5)
    if widths:
        for j, w in enumerate(widths):
            for row_x in t.rows:
                row_x.cells[j].width = Cm(w)
    p('', space_after=2)
    return t


FIG_N = 0


def figures(items, width_cm=4.6):
    """items: lista de (archivo, pie). Fila de imágenes con pies debajo."""
    global FIG_N
    t = doc.add_table(rows=2, cols=len(items))
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for j, (fname, cap) in enumerate(items):
        FIG_N += 1
        cell = t.cell(0, j)
        par = cell.paragraphs[0]
        par.alignment = WD_ALIGN_PARAGRAPH.CENTER
        par.add_run().add_picture(os.path.join(SHOTS, fname), width=Cm(width_cm))
        ccell = t.cell(1, j)
        cpar = ccell.paragraphs[0]
        cpar.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r1 = cpar.add_run(f'Fig. {FIG_N} · ')
        r1.bold = True
        r1.font.size = Pt(8.5)
        r1.font.color.rgb = PRIMARY
        r2 = cpar.add_run(cap)
        r2.font.size = Pt(8.5)
        r2.font.color.rgb = INK2
    p('', space_after=2)


def uc_header(code, actor_tag, title, violet=False):
    t = doc.add_table(rows=1, cols=1)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = t.cell(0, 0)
    shade(cell, FILL_VIOLET_HEAD if violet else '00C4BE')
    par = cell.paragraphs[0]
    par.paragraph_format.space_before = Pt(4)
    r = par.add_run(f'{code} · {actor_tag}')
    r.bold = True
    r.font.size = Pt(8.5)
    r.font.color.rgb = RGBColor(0xF0, 0xFD, 0xF9)
    par2 = cell.add_paragraph()
    par2.paragraph_format.space_after = Pt(4)
    r = par2.add_run(title)
    r.bold = True
    r.font.size = Pt(14)
    r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)


def uc_meta(actor, pantalla, precond, resultado):
    t = doc.add_table(rows=2, cols=2)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for (i, j, k, v) in ((0, 0, 'ACTOR', actor), (0, 1, 'PANTALLA', pantalla),
                         (1, 0, 'PRECONDICIÓN', precond), (1, 1, 'RESULTADO', resultado)):
        cell = t.cell(i, j)
        par = cell.paragraphs[0]
        r = par.add_run(k)
        r.bold = True
        r.font.size = Pt(7.5)
        r.font.color.rgb = MUTED
        par2 = cell.add_paragraph()
        r = par2.add_run(v)
        r.bold = True
        r.font.size = Pt(9.5)
    p('', space_after=2)


def h4(text):
    par = p(text, bold=True, size=10.5, color=INK2, space_after=3)
    par.paragraph_format.keep_with_next = True
    par.paragraph_format.space_before = Pt(8)


# ============================ PORTADA ============================
for _ in range(4):
    p('', space_after=0)
p('valeria+', bold=True, size=16, color=PRIMARY_BRIGHT)
p('🐻', size=52, align=WD_ALIGN_PARAGRAPH.LEFT, space_after=18)
p('Manual de usuario · v10.3 · con capturas de pantalla', bold=True, size=10, color=PRIMARY)
p('Manual de Casos de Uso', bold=True, size=34, color=INK, space_after=10)
p('Aplicación de terapia auditivo-verbal y del lenguaje para niñas y niños con hipoacusia, '
  'implante coclear, dislalias, dislexia, TEA o dificultades del lenguaje.', size=13, color=INK2, space_after=16)
p('Guía para logopedas, familias y cuidadores\nJulio de 2026 · Documento interno\n'
  'Expo SDK 54 / React Native · Castellano · Galego · Dominicano · Euskera · Voz neuronal offline', size=10, color=MUTED)
doc.add_page_break()

# ============================ ÍNDICE ============================
kicker('Contenido')
doc.add_heading('Índice', level=1)
toc = [
    ('', 'INTRODUCCIÓN'),
    ('1', 'Introducción a Valeria+'), ('2', 'Roles y modos de acceso'),
    ('3', 'Mapa de pantallas y glosario'),
    ('', 'CASOS DE USO'),
    ('CU-01', 'Alta de un nuevo paciente'),
    ('CU-02', 'Elegir un bloque de terapia (hub de bloques)'),
    ('CU-03', 'Academy: formarse con las Cápsulas de Conocimiento'),
    ('CU-04', 'Pares Mínimos para dislalias'),
    ('CU-05', 'Expansión Semántica: escenarios, categorías, progresión y contrastes'),
    ('CU-06', 'Prescribir terapias (Audición, Lenguaje, TEA y Dislexia · Modo Profesional)'),
    ('CU-07', 'Retomar un paciente e iniciar sesión'),
    ('CU-08', 'Test de Ling previo (audífono / implante)'),
    ('CU-09', 'Realizar una sesión de ejercicios'),
    ('CU-10', 'Configurar recordatorios diarios (elegir franjas)'),
    ('CU-11', 'Motivación: racha, niveles e insignias'),
    ('CU-12', 'Consultar el panel de resultados'),
    ('CU-13', 'Cambiar entre Modo Familia y Modo Profesional'),
    ('CU-14', 'Exportar la evidencia de usabilidad del piloto (QR + compartir)'),
    ('CU-15', 'Elegir la variedad de terapia (Castellano · Galego · Dominicano · Euskera)'),
    ('CU-16', 'Panel del Adulto: carga comunicativa (ruido, doble tarea, quiebre)'),
    ('CU-17', 'Academy: aprender lo básico de Lengua de Signos Española'),
    ('', 'REALIDAD AUMENTADA'),
    ('CU-18', 'Realidad Aumentada: permiso de cámara y prueba de aptitud del teléfono'),
    ('CU-19', 'AR-1 · Cinemática Orofacial: la boquita de beso mueve el coche'),
    ('CU-20', 'AR-2 · Localización del sonido: de «¿giró?» a milisegundos'),
    ('CU-21', 'AR-3 · Selección semántica por fijación: elegir mirando'),
    ('CU-22', 'Ajustar los umbrales de Realidad Aumentada y ver las señales en vivo'),
    ('', 'ANEXOS'),
    ('A', 'Preguntas frecuentes y resolución de problemas'),
    ('B', 'Historial de versiones'),
]
for num, txt in toc:
    if not num:
        p(txt, bold=True, size=8.5, color=PRIMARY, space_after=2)
        continue
    par = doc.add_paragraph()
    par.paragraph_format.space_after = Pt(3)
    par.paragraph_format.left_indent = Cm(0.4)
    r = par.add_run(f'{num}   ')
    r.bold = True
    r.font.color.rgb = PRIMARY_BRIGHT
    par.add_run(txt)
doc.add_page_break()

# ============================ CAP 1 ============================
kicker('Capítulo 1')
doc.add_heading('Introducción a Valeria+', level=1)
par = doc.add_paragraph()
rich(par, [('Valeria+', True), (' es una aplicación móvil (Expo SDK 54 / React Native) diseñada para acompañar las ', False),
           ('sesiones de terapia auditivo-verbal y del lenguaje', True),
           (' de niñas y niños. Reúne en un solo lugar el registro del paciente, una comprobación auditiva previa '
            '(Test de Ling), siete bloques de terapia, un espacio de formación para el cuidador (Academy) y un panel '
            'de resultados para seguir la evolución.', False)])
par = doc.add_paragraph()
rich(par, [('La app parte de un principio clave: ', False),
           ('los padres y cuidadores son el motor de voz y evaluación', True),
           ('. En los bloques con micrófono, el reconocimiento de voz ayuda, pero ', False),
           ('el adulto siempre es el juez final', True),
           (': puede corregir el veredicto con un toque. Y donde no hay micrófono (Expo Go, navegador web), el adulto '
            'valora la respuesta con botones. Así la terapia funciona en cualquier dispositivo y refuerza el vínculo familiar.', False)])
callout('A quién va dirigida',
        'Logopedas y profesionales de audición/lenguaje (que prescriben y supervisan) y familias o cuidadores '
        '(que realizan las sesiones en casa). Este manual cubre a ambos perfiles.')
doc.add_heading('Los siete bloques de terapia', level=3)
p('Desde la pantalla Prescripción de Terapias se elige uno de estos bloques. Cada uno responde a un perfil clínico '
  'distinto, pero todos comparten la misma lógica: el adulto guía la sesión y tiene la última palabra.')
data_table(['Bloque', 'Para qué sirve'], [
    [[('🗣️ Pares Mínimos', True)],
     'Dislalias fonológicas. 15 pares de palabras casi iguales (rana/lana) en 6 grupos —rotacismo, sigmatismo, '
     'velares, labiodental, nasales y laterales— con juego de voz, misión física y sello doble adulto-niño.'],
    [[('🧩 Expansión Semántica', True)],
     'Progresión léxica para intervención temprana: 5 escenarios diarios, 9 progresiones (onomatopeya → adjetivo) y '
     '8 cápsulas de contraste, uniendo imagen, voz y acción física.'],
    [[('👂 Audición', True), (' — 18 terapias', False)],
     'Protocolo ACOPROS: fonética-fonología, semántica, morfosintaxis, pragmática y escucha en ruido (RA-1…RA-5) '
     'para pacientes con audífono, implante coclear o hipoacusia.'],
    [[('💬 Lenguaje', True), (' — 7 terapias', False)],
     'Protocolo familiar: atención conjunta, imitación, comprensión, expresión, comunicación funcional, regulación '
     'conductual e interacción social.'],
    [[('🧠 TEA', True), (' — 6 terapias', False)],
     'Protocolo PRT + TCC para el espectro autista: atención conjunta triangulada, quiebre pragmático (con '
     'consentimiento), espejo asimétrico, transición interrumpida, categorización bajo ruido y múltiples señales. '
     'Todos los estresores son manuales (Panel del Adulto).'],
    [[('📖 Dislexia', True), (' — 6 terapias', False)],
     'Fonología y acceso léxico: intruso fonológico, rastreo léxico con interferencia, síntesis fonémica rítmica, '
     'criba de pseudopalabras, rastreo visual de rotaciones (b/d · p/q) y denominación rápida (RAN).'],
    [[('🎯 Realidad Aumentada', True), (' — 3 ejercicios (solo Android, en teléfono)', False)],
     'La cámara frontal como sensor de movimiento: postura labial (AR-1), giro de la cabeza hacia un sonido (AR-2) y '
     'elección de dibujo con la mirada (AR-3). El premio en 3D se gana con el gesto, no con la voz; en dos de los tres '
     'el micrófono está apagado. Requiere permiso de cámara y una prueba de aptitud del aparato (CU-18 a CU-22).'],
], widths=[4.8, 12.2])
p('Además, el Test de Ling es una comprobación auditiva rápida (6 sonidos) previa a los ejercicios de audición; '
  'Academy forma al cuidador (ver CU-03), y la gamificación (XP, racha, niveles e insignias) mantiene la motivación '
  'en todos los bloques.', size=9.5, color=MUTED)
doc.add_heading('Cómo son las sesiones', level=3)
p('Todos los bloques comparten una misma mecánica de sesión, diseñada para que el niño no se canse y para que el adulto '
  'mantenga el control en cada paso.')
data_table(['Elemento', 'Qué aporta'], [
    [[('🧭 Flujo PASO 1→4', True)],
     'Cada mini-juego avanza por cuatro pasos visibles —consigna → juego → movimiento → evaluación—. En Pares Mínimos y '
     'Expansión Semántica una barra de fase de turno (Escucha → Repite → Veredicto → Misión) marca en todo momento en '
     'qué punto va el ensayo, con doble vuelta evaluada (objetivo + opuesta).'],
    [[('🔄 Rondas variadas', True)],
     'El botón “🔄 Otra ronda” rota hasta 3 contenidos distintos por ejercicio para que el niño no memorice siempre el '
     'mismo ítem.'],
    [[('🎯 Sesión completa', True)],
     'Un botón por bloque encadena todos los ejercicios prescritos en una sola tanda (pasando por el Test de Ling si '
     'procede), en vez de lanzarlos de uno en uno.'],
    [[('💬 Frases portadoras', True)],
     'En Pares Mínimos la palabra objetivo se incrusta en una frase con entonación natural seguida de una pregunta, en '
     'vez de dictarse aislada diez veces seguidas.'],
    [[('🔊 Voz humana', True)],
     'El motor prioriza voces neuronales/enhanced (Google neural/WaveNet, iOS Enhanced/Siri) y descarta las metálicas, '
     'con prosodia natural (pausas por frase, entonación en preguntas y exclamaciones) y frases de ánimo rotativas.'],
    [[('🖼️ Fichas siempre visibles', True)],
     'Pictogramas SVG de alto contraste para las palabras cuyos emojis se ven como cuadros vacíos o de bajo contraste '
     'en muchos Android, con emoji de reserva.'],
], widths=[4.8, 12.2])
doc.add_heading('Cuatro variedades de habla con voz neuronal offline', level=3)
p('El contenido terapéutico —lo que se locuta, se muestra y se evalúa— puede trabajarse en cuatro variedades; la '
  'interfaz (menús y botones) permanece siempre en castellano. Castellano, gallego y euskera usan voces neuronales '
  'pregeneradas empaquetadas en la app, de modo que la locución suena natural y funciona sin conexión (ver CU-15). La '
  'elección se guarda en el dispositivo y se aplica a todos los bloques.')
data_table(['Variedad', 'Voz y particularidades'], [
    [[('🇪🇸 Castellano', True)],
     'Voz neuronal Sharvard (offline) y reconocimiento del sistema en español de España.'],
    [[('Galego', True), (' (Proxecto Nós)', False)],
     'Voz neuronal Celtia, con banco de pares propio. El contenido compartido con el castellano recae con suavidad en '
     'la voz neuronal castellana mientras Celtia no lo cubra.'],
    [[('🇩🇴 Dominicano', True), (' (Quisqueya Habla)', False)],
     'Voz latina del dispositivo y micrófono en es-DO. Respeto dialectal: no marca como error el seseo, la aspiración '
     'de la “s” ni el cambio de “r/l” a final de sílaba.'],
    [[('Euskera', True), (' (batua · ILENIA/NEL-GAITU)', False)],
     'Voz neuronal HiTZ-TTS (UPV/EHU · Aholab). El reconocimiento usa eu-ES y, donde no exista, recae en es-ES con un '
     'pliegue de la ⟨h⟩ muda.'],
], widths=[4.4, 12.6])
doc.add_heading('Academy: formación del cuidador', level=3)
p('En la terapia auditivo-verbal el adulto es el motor de cada sesión, así que aprender a acompañar forma parte del '
  'tratamiento. Academy es un espacio de formación para el adulto, no para el niño, organizado en seis dominios '
  '(Lenguaje, Hipoacusia, Dislalias, Dislexia y TEA). Cada dominio ofrece Cápsulas de Conocimiento de unos dos minutos '
  '—cómo aprenden a hablar los niños, el porqué del movimiento (TPR), los vicios a evitar, el manejo de los '
  'dispositivos auditivos…— que terminan con un quiz de respuesta explicada, y lleva su propia escala de niveles e '
  'insignias. Un feed de prioridad destaca arriba el dominio que corresponde a la patología de la ficha, para empezar '
  'por lo que más sirve (ver CU-03).')
doc.add_heading('Motivación y constancia', level=3)
p('Al estilo de apps como Duolingo, Valeria+ premia la práctica sostenida en todos los bloques con XP, racha (🔥), '
  'niveles (de Osezno a Oso Legendario) e insignias. El progreso se guarda localmente y se refleja al instante al '
  'terminar cada sesión, sin re-dibujar el resto de la pantalla (ver CU-11).')
doc.add_heading('Herramientas para el piloto clínico', level=3)
p('Para la validación con profesionales, la app suma un conjunto de instrumentos que no interfieren con la sesión (no '
  'bloquean animaciones ni audio) y que respetan siempre el principio de que el adulto es quien decide.')
data_table(['Herramienta', 'Qué aporta'], [
    [[('🎛️ Panel del Adulto · Carga comunicativa', True)],
     'Tres módulos manuales dentro del ejercicio —escucha en ruido (slider), oso distractor de doble tarea y quiebre '
     'pragmático—. La app nunca los activa ni ajusta sola (muro MDR; ver CU-16).'],
    [[('📊 Telemetría de usabilidad', True)],
     'Mide de forma anónima el tiempo por pantalla, los toques fuera de zona útil (misclicks) y la proporción de '
     'cápsulas de movimiento saltadas. Sin nombres, sin audio y sin el contenido de las respuestas.'],
    [[('💬 Encuesta rápida (SUS)', True)],
     'Una única pregunta de satisfacción (1–5 con caritas) sobre lo fácil que fue integrar el ejercicio en la rutina. '
     'Aparece solo tras completar cuatro bloques distintos y como mucho una vez por semana.'],
    [[('📤 Exportación dual', True)],
     'Con el PIN profesional, genera a la vez un código QR con el resumen (offline) y abre el menú de compartir con el '
     'registro completo; los datos se guardan cifrados y se purgan tras una exportación correcta (ver CU-14).'],
], widths=[4.8, 12.2])
doc.add_heading('Privacidad y funcionamiento sin conexión', level=3)
p('Valeria+ es plenamente funcional sin conexión: toda la información del paciente (ficha, historial, evolución por '
  'fonema, progreso y avance de Academy) se guarda cifrada en el dispositivo, conforme a RGPD/HIPAA. Para pruebas con '
  'profesionales existe una sincronización en la nube opcional y aditiva (acceso con correo y contraseña); si no se '
  'activa, todo permanece únicamente en el dispositivo. El capítulo 2 detalla los roles, el PIN y la privacidad.')

# ============================ CAP 2 ============================
doc.add_page_break()
kicker('Capítulo 2')
doc.add_heading('Roles y modos de acceso', level=1)
par = doc.add_paragraph()
rich(par, [('Valeria+ distingue dos formas de usar la app sobre el mismo dispositivo. El cambio no requiere cerrar '
            'sesión: se controla con un ', False), ('PIN de 4 dígitos', True),
           (' del logopeda, compartido por todos los bloques.', False)])
data_table(['Modo', 'Quién', 'Qué puede hacer'], [
    [[('Modo Familia', True), ('\n(por defecto)', False)], 'Tutor, madre, padre o cuidador',
     'Practicar lo prescrito, realizar las sesiones, activar recordatorios y consultar el progreso. No puede cambiar '
     'qué terapias, pares o actividades están activos.'],
    [[('Modo Profesional', True), ('\n(requiere PIN)', False)], 'Logopeda / profesional',
     'Todo lo anterior más prescribir: activar o desactivar terapias en cada uno de los bloques prescribibles y guardar '
     'la selección. Se desbloquea con el PIN y se vuelve a bloquear al guardar.'],
], widths=[3.6, 3.6, 9.8])
callout('PIN de demostración',
        [('El PIN de ejemplo es ', False), ('1985', True),
         ('. En un despliegue real, el logopeda debe sustituirlo por uno propio. El PIN nunca se guarda en texto plano: '
          'se valida contra un hash SHA-256 (compatible con Hermes en Android).', False)],
        fill=FILL_WARN, label_color=RGBColor(0xB4, 0x53, 0x09))
doc.add_heading('Privacidad de los datos', level=3)
p('Toda la información del paciente (ficha, historial de sesiones, evolución por fonema, progreso) se guarda localmente '
  'en el dispositivo mediante almacenamiento cifrado. La app está pensada para cumplir RGPD/HIPAA en el manejo de datos '
  'personales (PII). Sin conexión, la app es plenamente funcional: no necesita ningún servidor para operar.')
callout('Sincronización en la nube (opcional)',
        'Para pruebas con profesionales, la app ofrece un acceso profesional con correo y contraseña (Firebase '
        'Authentication) que permite guardar una copia de pacientes y sesiones en la nube (Cloud Firestore). Es una capa '
        'aditiva y opcional: cada profesional autenticado solo accede a sus propios datos, protegidos por reglas de '
        'seguridad. Si no se activa, todo sigue guardándose únicamente en el dispositivo.',
        fill=FILL_VIOLET, label_color=VIOLET_DARK)
callout('La voz del menor y el reconocimiento del habla',
        'Valeria+ no guarda, no reproduce y no envía a ningún servidor propio ningún archivo de audio del menor: el '
        'sonido se procesa durante el turno de habla y se descarta, y lo único que la app conserva es el resultado de la '
        'valoración (acierto o error). Quien reconoce las palabras es el servicio de reconocimiento del propio teléfono. '
        'Desde esta versión, la app le pide que trabaje sin conexión, dentro del dispositivo, para que la voz del menor '
        'no salga de él. Que lo consiga depende del teléfono y de la variedad de habla: hace falta que el paquete de '
        'idioma esté descargado en el aparato. Es lo habitual en castellano; en galego y en euskera es mucho menos '
        'frecuente, y ahí el reconocimiento puede seguir haciéndose a través del servicio en línea del sistema, conforme '
        'a la política de privacidad de ese servicio, ajena a Valeria+. En otras palabras: la app pide siempre lo más '
        'privado que el teléfono permita, pero no puede prometer lo mismo en todos los dispositivos ni en todas las '
        'variedades. Por eso la tarjeta “Voz de la app” muestra, para la variedad activa, si se está escuchando dentro '
        'del teléfono o a través del servicio del sistema, y por qué cuando es lo segundo. Si lo único que falta es el '
        'paquete de idioma, la app le ofrece descargarlo; si prefiere no hacerlo, los ejercicios funcionan igual y no se '
        'vuelve a insistir.')

callout('La cámara en los ejercicios de Realidad Aumentada',
        'El séptimo bloque usa la cámara frontal como sensor de movimiento. Tres afirmaciones que no son intenciones '
        'sino restricciones del propio código, comprobables en el repositorio público: no se graba ni se guarda ninguna '
        'imagen —cada fotograma se analiza y se descarta al instante—, ningún vídeo sale del teléfono y no se reconoce '
        'la cara de nadie. Lo único que se conserva son números: grados de giro, milisegundos, proporciones y qué dibujo '
        'se miró. Por eso este tratamiento no es identificación biométrica: mide conducta motora, no identidades. El '
        'permiso se pide una vez por paciente, con esas tres afirmaciones a la vista, y puede retirarse en cualquier '
        'momento desde los ajustes de Android (CU-18).', fill=FILL_VIOLET, label_color=VIOLET_DARK)

callout('Telemetría de usabilidad del piloto',
        'Durante el piloto, la app recoge métricas de usabilidad anónimas (tiempo por pantalla, toques fuera de zona útil '
        'y cápsulas de movimiento saltadas) y una encuesta breve de satisfacción. No incluyen nombres, ni audio, ni el '
        'contenido de las respuestas; se guardan cifradas en el dispositivo bajo un identificador de sesión y se purgan '
        'tras exportarlas (ver CU-14). Al tratarse de un estudio con menores, el consentimiento informado de las familias '
        'se gestiona en el protocolo del piloto, fuera de la app.')

# ============================ CAP 3 ============================
doc.add_page_break()
kicker('Capítulo 3')
doc.add_heading('Mapa de pantallas y glosario', level=1)
p('Tras el alta o la selección del paciente se llega al hub de Prescripción, desde donde se abre cualquiera de los '
  'siete bloques (o Academy). El Test de Ling solo precede a los ejercicios de audición cuando el paciente usa audífono '
  'o implante coclear, y el bloque de Realidad Aumentada pasa antes por su propia preparación (permiso de cámara y '
  'prueba de aptitud).')
p('Bienvenida  →  Créditos  →  Ficha / Selección  →  Hub de bloques  →  '
  'Pares Mínimos · Expansión Semántica · Audición* · Lenguaje · TEA · Dislexia · Realidad Aumentada**  →  Resultados',
  bold=True, color=PRIMARY, align=WD_ALIGN_PARAGRAPH.CENTER)
p('* Los ejercicios de Audición pasan antes por el Test de Ling si la patología indica audífono o implante.',
  size=9, color=MUTED)
p('** Realidad Aumentada solo aparece en teléfonos Android con la app instalada, y pasa antes por el permiso de '
  'cámara y la prueba de aptitud (CU-18).', size=9, color=MUTED)
figures([('01-bienvenida.png', 'Bienvenida: “Comenzar” o “Ya tengo un paciente registrado”.'),
         ('02-creditos.png', 'Créditos del proyecto y colaboradores.'),
         ('05-hub-bloques.png', 'Hub de Prescripción: los bloques de terapia y la tarjeta Academy.')],
        width_cm=4.2)
doc.add_heading('Glosario', level=3)
data_table(['Término', 'Significado'], [
    ['Hub de bloques', 'Pantalla “Prescripción de Terapias”: siete tarjetas (Pares Mínimos, Expansión Semántica, Audición, Lenguaje, TEA, Dislexia y Realidad Aumentada) más la tarjeta Academy, desde donde se practica o prescribe.'],
    ['Par mínimo', 'Dos palabras que solo se distinguen por un fonema (rana / lana). Entrenan el contraste que el niño sustituye.'],
    ['Sustitución', 'Error fonológico habitual: el niño dice la palabra contraria (r̄ → l). La app la detecta y la corrige.'],
    ['Sello doble', 'Mecánica anti-pasividad: el adulto y el niño pulsan dos huellas a la vez para avanzar (o mantienen una \n     pulsada 2 s). La app explica en la propia tarjeta para qué sirve: hasta que no están las dos manos, el ejercicio espera.'],
    ['TPR', 'Total Physical Response: aprender una palabra asociándola a una acción física del cuerpo.'],
    ['Fase de turno', 'Barra guía de Pares Mínimos y Expansión Semántica que marca en qué momento va el ejercicio: Escucha → Repite → Veredicto → Misión.'],
    ['Sesión completa', 'Botón que encadena en una sola sesión todos los ejercicios prescritos de un bloque, en vez de lanzarlos de uno en uno.'],
    ['Otra ronda', 'Botón que rota el contenido de un mini-juego de Audición/Lenguaje (hasta 3 variantes) para que no se memorice el mismo ítem.'],
    ['Progresión léxica', 'Secuencia que sube de onomatopeya → sustantivo → verbo → adjetivo sobre un mismo tema (el coche, el perro…).'],
    ['Test de Ling', 'Comprobación de 6 sonidos (m, u, a, i, sh, s) que verifica si el niño oye desde graves hasta agudos.'],
    ['Escala EPT-3', 'Valoración unificada de 3 niveles: ★ Emergente · ★★ En proceso · ★★★ Consolidado.'],
    ['Racha (🔥)', 'Días consecutivos en los que se ha completado al menos una sesión.'],
    ['NHC', 'Número de Historia Clínica del paciente.'],
    ['Telemetría de usabilidad', 'Métricas anónimas que la app recoge durante el piloto para medir lo fácil que resulta de usar (tiempo por pantalla, misclicks, abandono de cápsulas). Sin datos personales.'],
    ['Misclick', 'Toque en una zona “muerta” de la pantalla, fuera de cualquier botón o elemento útil. Un exceso señala que algo no se entiende o el objetivo es pequeño.'],
    ['Abandono TPR', 'Proporción de cápsulas de movimiento (TPR) que se saltan en vez de completarse. Ayuda a saber si las pausas activas encajan en la sesión.'],
    ['SUS (encuesta)', 'System Usability Scale adaptada: una pregunta de 1 a 5 sobre la facilidad de uso real. Aparece con moderación (hito de 4 bloques distintos y máx. 1 vez/semana).'],
    ['Exportación dual', 'Salida del piloto en dos formatos a la vez: un QR con el resumen (offline) y el menú de compartir con el registro completo (online). Requiere el PIN profesional.'],
    ['Variedad', 'Lengua o forma del habla en que la app locuta y evalúa el contenido: Castellano, Galego (Proxecto Nós), Dominicano (es-DO, Quisqueya Habla) o Euskera (batua, proyecto ILENIA/NEL-GAITU). Se elige en “Voz de la app”.'],
    ['Voz neuronal', 'Locución pregenerada con modelos de voz de alta calidad (Sharvard en castellano, Celtia en gallego, HiTZ-TTS en euskera) empaquetada en la app; suena natural y funciona sin conexión.'],
    ['Pliegue vasco', 'Ajuste que ignora la ⟨h⟩ muda del euskera al comparar la voz del niño con la esperada, para que el reconocimiento no la penalice. No afecta a las sibilantes ni africadas, que son contraste clínico y valora el adulto.'],
    ['TEA', 'Trastorno del Espectro Autista. Bloque de 6 terapias (PRT + TCC) centrado en atención conjunta, reparación comunicativa, flexibilidad y regulación, con estresores siempre manuales.'],
    ['Dislexia', 'Bloque de 6 terapias de conciencia fonológica y acceso léxico (intruso fonológico, síntesis fonémica, pseudopalabras, rotaciones b/d·p/q y denominación rápida).'],
    ['RAN', 'Rapid Automatized Naming (denominación rápida): nombrar en voz alta una serie de dibujos en orden de lectura. El ritmo lo marca la mano del adulto, nunca un cronómetro.'],
    ['Escucha en ruido', 'Categoría de Audición (RA-1…RA-5) que entrena la comprensión con ruido de fondo. El adulto sube o baja el ruido a mano con el deslizador del Panel del Adulto.'],
    ['Rasgo dialectal', 'Característica normal del habla de una región (p. ej. el seseo dominicano). No es un error clínico y la app no lo penaliza.'],
    ['Frase portadora', 'Frase natural en la que se incrusta la palabra objetivo (“El oso encontró una rana…”) para practicarla con entonación real en vez de aislada.'],
    ['Carga comunicativa', 'Conjunto de retos que el adulto activa a mano en su panel: ruido de fondo, distractor visual y quiebre de la comunicación. Nunca los activa la app sola.'],
    ['Quiebre pragmático', 'Tarea en la que el adulto rompe la comunicación a propósito (murmura o pide algo absurdo) para observar cómo el niño la repara.'],
    ['Realidad Aumentada (RA)', 'Séptimo bloque, solo en teléfonos Android. La cámara frontal mide gestos —labios, giro de cabeza, mirada— y esos gestos mueven figuras en 3D. No graba imagen y no identifica a nadie.'],
    ['Prueba de aptitud', 'Calentamiento de minuto y medio que mide qué puede sostener este teléfono. Devuelve un nivel (A a D) que decide qué ejercicios de RA se ofrecen. Describe el aparato, no al niño.'],
    ['Sostén', 'Tiempo seguido que el niño mantiene un gesto (por ejemplo la boquita de beso). En AR-1 es lo que hace avanzar el coche, y la serie de sostenes es el dato clínico.'],
    ['Fijación (dwell)', 'Mantener la mirada sobre un dibujo el tiempo suficiente para elegirlo, sin tocar la pantalla. Es cómo se responde en AR-3.'],
    ['Calibración de mirada', 'Rutina de 5 puntos con la osita (~15 s) que enseña al teléfono dónde mira ese niño. Obligatoria en AR-3 y propia de cada paciente y cada aparato.'],
    ['Latencia', 'Milisegundos que tarda el niño en girar la cabeza hacia un sonido (AR-2). Es la versión medible de la pregunta «¿giró?».'],
    ['Ensayo trampa', 'Ensayo de AR-2 en el que no suena nada. Sirve para distinguir que el niño oye de que mueve la cabeza por su cuenta. Sin ellos, la prueba sería una demostración, no una medida.'],
    ['Ensayo anulado', 'Ensayo que la app descarta porque el teléfono se movió durante la respuesta. Se anula a propósito: un ensayo contaminado estropea el registro entero.'],
], widths=[4.2, 12.8])

# ============================ CASOS DE USO ============================
doc.add_page_break()
kicker('Casos de uso')
doc.add_heading('Guía paso a paso', level=1)
p('Cada caso de uso describe una tarea completa e incluye capturas reales de la app. Las etiquetas “Profesional” y '
  '“Familia” indican el actor principal.')

# ---- CU-01 ----
uc_header('CU-01', 'Profesional / Familia', 'Alta de un nuevo paciente')
uc_meta('Logopeda o tutor que crea la ficha', 'Bienvenida → Créditos → Ficha de Registro',
        'App instalada y abierta', 'Ficha guardada y cifrada en el dispositivo')
h4('Flujo principal')
numbered([
    [('En la pantalla de ', False), ('Bienvenida', True), (', pulsar ', False), ('“Comenzar”', True), (' y avanzar por Créditos.', False)],
    [('En la ', False), ('Ficha de Registro', True), (', rellenar los datos del ', False), ('Niño/a', True),
     (': nombre y apellidos (obligatorio), fecha de nacimiento, ', False), ('NHC', True), (' (obligatorio) y género.', False)],
    [('Completar el bloque ', False), ('Tutor / Cuidador', True),
     (': nombre (obligatorio), vínculo familiar, ', False), ('correo', True),
     (' (obligatorio y con formato válido) y teléfono/WhatsApp para los reportes.', False)],
    [('Completar ', False), ('Diagnóstico y equipo médico', True), (': patología, médico prescriptor y logopeda asignado.', False)],
    [('Pulsar ', False), ('“Guardar ficha”', True), ('. Aparece la confirmación “Ficha guardada y cifrada”.', False)],
    [('Pulsar ', False), ('“Continuar a Prescripción →”', True), (' para pasar al hub de bloques.', False)],
])
h4('Flujos alternativos')
bullets([
    [('Falta un campo obligatorio o el correo es inválido:', True), (' el campo se resalta en rojo y no se guarda hasta corregirlo.', False)],
    [('La patología indica audífono o implante coclear:', True), (' se recordará para lanzar el Test de Ling antes de los ejercicios de audición (ver CU-08).', False)],
])
callout('Dato clave', 'La patología determina el circuito de la sesión (p. ej. una dislalia orienta hacia Pares Mínimos; '
        'un implante, hacia el Test de Ling). Elíjala con cuidado.')
figures([('03-ficha-registro.png', 'Ficha de Registro: datos del niño/a (nombre, fecha, NHC y género).'),
         ('04-ficha-guardada.png', 'Ficha guardada y cifrada; aparece “Continuar a Prescripción →”.')])

# ---- CU-02 ----
uc_header('CU-02', 'Profesional / Familia', 'Elegir un bloque de terapia (hub de bloques)')
uc_meta('Logopeda o tutor', 'Prescripción de Terapias (hub)', 'Ficha del paciente activa',
        'Bloque de terapia abierto para practicar o prescribir')
p('El hub es el centro de mando de cada sesión. Muestra la racha 🔥 y el nivel 🏅 del paciente y presenta los seis '
  'bloques como tarjetas. Audición, Lenguaje, TEA y Dislexia indican además cuántas terapias hay activas.')
h4('Flujo principal')
numbered([
    [('Tocar la tarjeta del bloque deseado: ', False), ('Pares Mínimos', True), (' (CU-04), ', False),
     ('Expansión Semántica', True), (' (CU-05), ', False), ('Audición', True), (', ', False), ('Lenguaje', True),
     (', ', False), ('TEA', True), (' o ', False), ('Dislexia', True), (' (CU-06 / CU-09).', False)],
    [('Antes de la primera sesión, abrir la tarjeta destacada ', False), ('“Academy”', True),
     (' para formarse como cuidador (ver CU-03): en la terapia auditivo-verbal el adulto dirige la sesión, así que conviene empezar por ahí.', False)],
    [('Desde la misma pantalla se activan los ', False), ('recordatorios de sesión', True), (' (ver CU-10).', False)],
])
callout('Empieza por Academy', 'La tarjeta Academy (CU-03) comparte jerarquía visual con los bloques de terapia y no '
        'depende de nada previo: es el primer paso recomendado para que el adulto acompañe con criterio.',
        fill=FILL_VIOLET, label_color=VIOLET_DARK)
callout('Dónde practica cada quién', 'En Modo Familia todos los bloques son accesibles para practicar lo prescrito; '
        'solo el logopeda, con el PIN, cambia qué está activo en cada uno.')

# ---- CU-03 · ACADEMY · FORMACIÓN DEL CUIDADOR ----
doc.add_page_break()
uc_header('CU-03', 'Familia', 'Academy: formarse con las Cápsulas de Conocimiento')
uc_meta('Adulto que dirige la sesión (familia o cuidador)', 'Prescripción de Terapias → Academy (hub de dominios)',
        'Ninguna; disponible desde el primer día', 'Cápsula completada y progreso guardado en su dominio')
p('Academy es el espacio de formación para el adulto. En la terapia auditivo-verbal la persona que acompaña al niño es '
  'el motor de la sesión, así que Academy le enseña —en pequeñas dosis— a hacerlo mejor. No es un curso '
  'único: se organiza en seis dominios de formación, cada uno con su propia lista de cápsulas, su escala de niveles '
  '(de Novato a “Experto en…”) y sus insignias. Un feed de prioridad destaca arriba el dominio que corresponde a la '
  'patología de la ficha del paciente, para que el cuidador empiece por lo que más le sirve.')
data_table(['Dominio', 'Qué se aprende'], [
    [[('💬 Lenguaje', True)], 'Cómo aprenden a hablar los niños (el baño de lenguaje y la conversación por turnos), el porqué del movimiento (TPR) y los vicios a evitar: remodelar en vez de corregir y comentar más que preguntar.'],
    [[('👂 Hipoacusia / Sordera', True)], 'Qué es la sordera y su abordaje, más micro-guías de hardware para el manejo y cuidado del audífono, el implante coclear y los dispositivos osteointegrados.'],
    [[('🗣️ Dislalias', True)], 'Puntos de articulación de cada sonido, a qué edad se espera cada uno y cómo practicar en casa los sonidos difíciles (la erre, las praxias de la boca).'],
    [[('🔤 Dislexia', True)], 'Conciencia fonológica y apoyo a la lectura emergente: cómo suena y se segmenta cada palabra antes de leerla.'],
    [[('🧩 TEA', True)], 'Comunicación, anticipación y regulación en el espectro autista: cómo sostener la atención conjunta y reparar la comunicación sin presión.'],
], widths=[4.8, 12.2])
h4('Flujo principal')
numbered([
    [('En ', False), ('Prescripción de Terapias', True), (', pulsar la tarjeta ', False), ('“Academy”', True), (' (bajo el rótulo “Tu formación”).', False)],
    [('El ', False), ('feed de prioridad', True), (' propone el dominio que encaja con la patología de la ficha; también se puede elegir cualquier otro ', False), ('dominio', True), (' del hub.', False)],
    [('Elegir una ', False), ('Cápsula de Conocimiento', True), (' de la lista del dominio (unos 2 minutos cada una) —o, en Hipoacusia, una ', False), ('micro-guía de hardware', True), ('.', False)],
    [('Leer las ', False), ('diapositivas', True), (' y responder el ', False), ('quiz rápido', True), (' del final; cada respuesta muestra una breve explicación.', False)],
    [('Al aprobar, la app suma ', False), ('puntos e insignias en ese dominio', True), (' y su ', False), ('barra de progreso avanza al instante', True), (', sin re-dibujar el resto del hub.', False)],
])
callout('Es para el adulto, no para el niño',
        'Academy vive junto a los menús de la app, que maneja siempre el adulto; la tableta se cede al niño solo cuando '
        'el ejercicio ya ha empezado. Por eso el niño no llega por error a esta formación.')
callout('El progreso no se pierde',
        'El avance (cápsulas hechas, nivel e insignias) se guarda cifrado en el dispositivo, igual que el resto de '
        'datos, y funciona sin conexión.')

# ---- CU-04 · PARES MÍNIMOS ----
uc_header('CU-04', 'Familia', 'Pares Mínimos para dislalias', violet=True)
uc_meta('Tutor + niño/a (en pareja)', 'Pares Mínimos · Dislalias', 'Par prescrito por el logopeda',
        'Sesión de 10 ensayos valorada + evolución del fonema')
par = doc.add_paragraph()
rich(par, [('Bloque para ', False), ('dislalias fonológicas', True),
           ('. Se muestran dos fichas casi iguales (por ejemplo ', False), ('rana / lana', True),
           ('); la app pide una en voz alta y el niño la dice al micrófono. Con reconocimiento de voz, la app detecta '
            'si salió el fonema o la sustitución habitual; sin micrófono, ', False), ('el adulto hace de juez', True),
           ('. Una ', False), ('barra de fase de turno', True),
           (' (Escucha → Repite → Veredicto → Misión) muestra en todo momento en qué paso va el ensayo.', False)])
h4('Flujo principal')
numbered([
    [('En el ', False), ('banco de contrastes', True), (', elegir un par prescrito (15 disponibles en 6 grupos: rotacismo, sigmatismo, velares, labiodental, nasales y laterales). Pulsar ▶.', False)],
    [('La app ', False), ('pide una ficha', True), (' en voz alta (“Di: rana”). El niño la dice. La fase de turno avanza de Escucha a Repite.', False)],
    [('La app evalúa comparando lo que oyó con ', False), ('las dos palabras del par', True),
     (' y quedándose con la más parecida: ', False), ('acierto', True), (' (3★ al primer intento, 2★ tras corrección), ', False),
     ('sustitución', True), (' detectada (corrección específica del par) o ', False), ('aproximación', True), (' (reintento). '
      'Si lo oído se parece igual a las dos, la app no se moja: dice «casi» y deja el veredicto al adulto.', False)],
    [('Cada acierto trae una ', False), ('misión física', True), (' (“¡Salto de rana!”) y termina con el ', False),
     ('sello doble', True), (': el adulto y el niño pulsan dos huellas a la vez para continuar.', False)],
    [('A lo largo de los 10 ensayos hay ', False), ('rotación de roles', True), (' (“¡Ahora mandas tú!”) y una ', False),
     ('cápsula TPR', True), (' de movimiento. Al final se guarda la sesión y la evolución del fonema.', False)],
])
h4('Flujos alternativos')
bullets([
    [('El adulto es el juez final:', True), (' si la app oyó mal, corrige el veredicto con “dijo rana / dijo lana”.', False)],
    [('Dos correcciones seguidas:', True), (' la app pasa a imitación asistida (1★) para no frustrar; nunca hay un tercer fallo seguido.', False)],
    [('Sin reconocimiento de voz', True), (' (Expo Go / navegador): el adulto valora con los botones “Dijo …”.', False)],
])
callout('Anti-pasividad', 'Nada avanza sin las manos de los dos: el sello doble obliga a que el adulto participe en '
        'cada ensayo. La rotación de roles convierte al niño en “juez” que discrimina qué palabra dijo el adulto.',
        fill=FILL_VIOLET, label_color=VIOLET_DARK)
callout('Cómo decide la app entre las dos palabras',
        'Los pares se diferencian a menudo en una sola letra (rana/lana, cubo/tubo, boca/bota). Por eso la app no '
        'pregunta «¿se parece bastante al objetivo?» —con esa pregunta, decir el distractor pasaría por acierto— sino a '
        'cuál de las dos se parece más. El empate se resuelve con un «casi», nunca inventando un veredicto. A cambio, '
        'alguna pronunciación aproximada que antes daba estrella ahora da «casi» y pide otro intento: es el precio de '
        'que el ejercicio detecte de verdad la sustitución, y el adulto puede corregirlo siempre.')
figures([('06-pares-banco.png', 'Banco de contrastes: los pares agrupados por tipo de error.'),
         ('08-pares-juego.png', 'Ensayo: dos fichas, la consigna y el juez del adulto.'),
         ('09-pares-veredicto.png', 'Acierto: misión física de celebración y sello doble.')])

# ---- CU-05 · EXPANSIÓN SEMÁNTICA ----
uc_header('CU-05', 'Familia', 'Expansión Semántica: escenarios, categorías, progresión y contrastes', violet=True)
uc_meta('Tutor + niño/a', 'Expansión Semántica · Progresión Léxica', 'Actividad prescrita por el logopeda',
        'Palabras trabajadas uniendo símbolo, voz y cuerpo')
par = doc.add_paragraph()
rich(par, [('Rehabilitación léxica ', False), ('offline', True),
           (' para intervención temprana. Cada palabra une imagen, voz y una ', False),
           ('acción física del adulto', True),
           (' que la ancla al mundo real del niño. ', False),
           ('Cada bloque declara un objetivo terapéutico único', True),
           (', visible antes de empezar, y se practica en cuatro pestañas:', False)])
data_table(['Modo', 'Objetivo declarado', 'Qué contiene'], [
    [[('Escenarios', True)], 'Repetición verbal dentro de una rutina', '5 rutinas diarias (mañana, comida, parque, baño, dormir), 6 palabras cada una.'],
    [[('Categorías', True)], 'Vocabulario nuevo por campo, de lo familiar a lo raro', '5 categorías de 6 palabras (frutas, animales, transportes, colores, el cuerpo) con progresión de dificultad: se empieza por lo más familiar y se avanza a lo menos frecuente.'],
    [[('Progresión', True)], 'Ampliar el campo semántico de un concepto', '9 secuencias de cuatro pasos: concepto → parte → acción → cualidad (coche → rueda → corre → rápido). “El desayuno” da el salto a la combinación de dos palabras (“quiero pan”).'],
    [[('Contrastes', True)], 'Opuestos: primero comprender, después decir', '8 cápsulas TPR de pares: grande/pequeño, limpio/sucio, abrir/cerrar, subir/bajar, frío/caliente, encender/apagar, lleno/vacío, meter/sacar.'],
], widths=[2.8, 4.4, 9.8])
p('Como en Pares Mínimos, una barra de fase de turno (Escucha → Repite → Veredicto → Misión) guía cada paso.')
h4('Antes de empezar: la antesala de preparación')
par = doc.add_paragraph()
rich(par, [('Toda actividad pasa primero por una ', False), ('pantalla de preparación', True),
           (' con el material necesario y los pasos que vienen. ', False),
           ('Nada suena hasta que el adulto pulsa “Ya lo tengo todo”', True),
           ('. Se puede volver a consultar en cualquier momento desde “Ver preparación”, sin perder el paso en curso.', False)])
h4('Flujo principal')
numbered([
    'Elegir la pestaña (Escenarios, Categorías, Progresión o Contrastes) y pulsar ▶ en una actividad prescrita.',
    [('Leer la ', False), ('antesala', True), (': qué material hace falta y qué vais a hacer. Confirmar con “Ya lo tengo todo”.', False)],
    [('La app ', False), ('enseña la imagen y dice la palabra', True), (' (“Esto es la cama. Di: cama”). El niño la repite.', False)],
    [('El micrófono valora el intento aceptando las ', False), ('aproximaciones propias de la edad', True),
     ('. Si el micrófono no capta nada, el intento ', False), ('no cuenta', True),
     (' y se vuelve a modelar. El adulto puede dar por válido el intento en cualquier momento de la escucha.', False)],
    [('Cada palabra se cierra con la ', False), ('acción física del adulto', True),
     (' (“Da unas palmaditas en la cama y sentaos en ella”). Se avanza al siguiente paso.', False)],
])
h4('Contrastes: dos vueltas de distinta naturaleza')
p('Una cápsula de contraste evalúa dos habilidades distintas, y por eso tiene dos vueltas:')
numbered([
    [('Comprensión.', True), (' Se muestran las dos imágenes a la vez y el niño toca la correcta. No hay micrófono.', False)],
    [('Producción.', True), (' El niño dice la palabra opuesta y se evalúa por voz.', False)],
])
p('El panel de resultados y el informe que se comparte con el logopeda las muestran por separado. Un promedio único '
  'escondía el caso más frecuente en clínica: el niño entiende el par pero todavía no lo dice.')
callout('Por qué funciona', 'La palabra se aprende cuando el niño la vive con el cuerpo, no solo cuando la oye. En una '
        'cápsula, el objeto que nombra el audio, el que muestra la imagen y el que pide la preparación son el mismo: lo '
        'único que cambia entre las dos vueltas es el atributo contrastado (la misma cuchara, limpia y sucia). Por eso '
        'las imágenes son pictogramas propios y no emoji: dos emoji iguales harían la vuelta de comprensión irresoluble.',
        fill=FILL_VIOLET, label_color=VIOLET_DARK)
figures([('10-expansion-escenarios.png', 'Escenarios diarios: mañana, comida y parque.'),
         ('11-expansion-progresion.png', 'Progresión léxica. Captura de la v9: desde la v9.1 las fases son concepto → parte → acción → cualidad, y hay una cuarta pestaña de Categorías.'),
         ('12-expansion-juego.png', 'Paso: imagen, consigna y misión física del adulto.')])

# ---- CU-06 · PRESCRIPCIÓN AUD/LENG ----
uc_header('CU-06', 'Profesional', 'Prescribir terapias (Audición, Lenguaje, TEA y Dislexia · Modo Profesional)')
uc_meta('Logopeda', 'Hub → Audición / Lenguaje / TEA / Dislexia', 'Ficha creada · PIN disponible',
        'Selección de terapias guardada en el dispositivo')
h4('Flujo principal')
numbered([
    [('En el hub, abrir ', False), ('Audición', True), (' (18 terapias), ', False), ('Lenguaje', True), (' (7), ', False),
     ('TEA', True), (' (6) o ', False), ('Dislexia', True), (' (6).', False)],
    [('Pulsar ', False), ('“Desbloquear Edición Profesional”', True), (' e introducir el ', False), ('PIN', True), (' (demo: ', False), ('1985', True), (').', False)],
    'Activar o desactivar cada terapia con su interruptor. El contador “N prescritos” se actualiza al momento.',
    [('Pulsar ', False), ('“Guardar Prescripción”', True), ('. La selección se guarda y la edición vuelve a bloquearse.', False)],
])
h4('Flujos alternativos')
bullets([
    [('PIN incorrecto:', True), (' los puntos se marcan en rojo y se pueden reintroducir.', False)],
    [('Solo consulta (sin PIN):', True), (' se ve la lista, pero los interruptores están atenuados.', False)],
    [('Practicar sin editar:', True), (' el botón ▶ de cada fila inicia esa terapia, incluso en Modo Familia. '
     'El mismo PIN prescribe en los siete bloques (Pares Mínimos, Expansión Semántica, Audición, Lenguaje, TEA, Dislexia y Realidad Aumentada).', False)],
    [('Consentimiento del módulo TEA:', True), (' el Quiebre Pragmático Inducido (TEA-2) exige aceptar antes un '
     'encuadre de consentimiento informado; hasta entonces queda bloqueado.', False)],
])
callout('Estresores siempre manuales', 'En TEA y Dislexia, el ruido, la latencia y la persecución los aplica el adulto '
        'a mano; la app nunca ajusta la dificultad ni cronometra sola (muro MDR).')
figures([('07-pin-profesional.png', 'Teclado de PIN compartido por todos los bloques.'),
         ('13-audicion-lista.png', 'Audición: las 18 terapias con su interruptor de prescripción.')])

# ---- CU-07 · RETOMAR ----
uc_header('CU-07', 'Familia', 'Retomar un paciente e iniciar una sesión')
uc_meta('Tutor o cuidador', 'Bienvenida → Selección de paciente → Hub', 'Existe al menos una ficha guardada',
        'Paciente activo cargado y listo para practicar')
h4('Flujo principal')
numbered([
    [('En ', False), ('Bienvenida', True), (', pulsar el botón ', False), ('“Ya tengo un paciente registrado”', True),
     (' (un botón de tamaño completo, al nivel de “Comenzar”).', False)],
    'Seleccionar la ficha del niño/a en la lista de pacientes del dispositivo.',
    [('La app carga su prescripción y su progreso (racha, nivel) y abre el ', False), ('hub de bloques', True), ('.', False)],
    'Elegir un bloque para practicar (CU-02).',
])
bullets([[('No hay pacientes guardados:', True), (' use CU-01 para dar de alta uno nuevo desde “Comenzar”.', False)]])
figures([('16-pacientes.png', 'Selección de paciente: fichas guardadas en el dispositivo.')])

# ---- CU-08 · LING ----
uc_header('CU-08', 'Familia', 'Test de Ling previo (audífono / implante)')
uc_meta('Tutor que produce los sonidos', 'Test de Ling', 'Patología con audífono o implante coclear',
        'Comprobación auditiva registrada + recomendación')
h4('Flujo principal')
numbered([
    [('Al pulsar ▶ en una terapia de ', False), ('Audición', True), (', responder: ', False),
     ('¿el niño usa audífonos o implante?', True), (' Si es No, se salta a los ejercicios. La cabecera muestra el ', False),
     ('nombre del paciente activo', True), (' tomado de su ficha de registro.', False)],
    [('Si es Sí, para cada uno de los ', False), ('6 sonidos', True), (' (m, u, a, i, sh, s) el adulto lo produce ', False),
     ('tapándose la boca', True), ('.', False)],
    [('Marcar la respuesta del niño: ', False), ('Identifica', True), (' · ', False), ('Detecta', True), (' · ', False),
     ('Sin respuesta', True), ('.', False)],
    [('Al terminar, la app muestra el resultado y una recomendación. Pulsar ', False), ('“Comenzar ejercicios”', True), ('.', False)],
])
callout('Por qué estos 6 sonidos', [('Cubren el rango del habla, de graves (~250 Hz) a muy agudos (~5 kHz). El sonido ', False),
        ('“s”', True), (' es el más difícil de oír; si se detecta, el equipo funciona bien en frecuencias altas.', False)])
figures([('14-ling-pregunta.png', 'Pregunta previa: ¿usa audífonos o implante coclear?'),
         ('15-ling-test.png', 'Sonido en curso: el tutor lo produce y marca la respuesta.')])

# ---- CU-09 · SESIÓN DE EJERCICIOS ----
uc_header('CU-09', 'Familia', 'Realizar una sesión de ejercicios (Audición / Lenguaje)')
uc_meta('Tutor + niño/a', 'Reproductor de Ejercicios → Resultados', 'Terapia iniciada (con o sin Test de Ling)',
        'Sesión valorada y guardada en el historial')
h4('Flujo principal')
numbered([
    [('Antes de nada, si la actividad necesita ', False), ('material real', True),
     (' (burbujas, una pelota, un muñeco, un tambor…), la app lo dice en una tarjeta ', False),
     ('“ANTES DE EMPEZAR · NECESITARÁS”', True),
     (', arriba del todo. Está ahí a propósito: leer el material a mitad de la actividad no sirve de nada.', False)],
    [('Cada mini-juego sigue un flujo numerado ', False), ('PASO 1→4', True),
     (': consigna → juego → movimiento → evaluación. La app presenta ', False), ('fichas ilustradas', True),
     (' grandes; ', False), ('toque cualquier imagen para ampliarla', True), (' a pantalla completa.', False)],
    [('Con ', False), ('“🔄 Otra ronda”', True), (' el ejercicio rota su contenido (hasta 3 variantes: vocales, palabra '
     'articulada, vocal faltante, intruso, adivinanzas, plurales, frases S-V-O, emociones…), para que el niño no '
     'memorice siempre el mismo ítem.', False)],
    [('El adulto guía la actividad y valora la respuesta con la ', False), ('escala EPT-3', True),
     (': ★ emergente, ★★ en proceso, ★★★ consolidado.', False)],
    [('Cada ejercicio ofrece una ', False), ('“versión en movimiento”', True),
     ('; entre ejercicios aparecen ', False), ('pausas activas', True),
     ('. Los de Lenguaje añaden voz (TTS), juego del micrófono y cápsulas TPR.', False)],
    [('Junto a la evaluación, la app muestra ', False), ('qué ejercicio viene después', True),
     (', para que el adulto pueda anunciarlo antes de puntuar. Al tocar la estrella se pasa al siguiente de inmediato, '
      'y ese salto sin aviso es justo lo que descoloca a los niños que peor llevan las transiciones.', False)],
    [('Al terminar se calcula la media y se muestran las ', False), ('recompensas', True),
     (' (XP, racha, nivel, insignias). Ver CU-11.', False)],
])
h4('Flujos alternativos')
bullets([
    [('Sesión completa:', True), (' el botón “🎯 Sesión completa” de cada bloque encadena todos los ejercicios prescritos '
     'en una sola tanda (pasando por el Test de Ling si la ficha lo indica), en vez de lanzarlos de uno en uno.', False)],
    [('Sesión perfecta:', True), (' si todos los ejercicios obtienen ★★★, se desbloquea la insignia “Sesión estrella”.', False)],
    [('Salir a mitad:', True), (' se puede volver atrás; lo valorado hasta ese punto no cuenta como sesión completada.', False)],
    [('Actividades que se repiten sesión tras sesión:', True), (' algunas —como Atención Conjunta— traen una lista de '
     '“🔀 OTRAS FORMAS DE HACERLA”. Es la misma actividad con el mismo objetivo, cambiando solo el envoltorio: repetida '
     'siempre igual, el niño anticipa la respuesta y la ejecuta en automático, con lo que deja de medir lo que dice medir.', False)],
])
callout('Dos ayudas para el adulto en los ejercicios de escucha',
        'En la adivinanza por letra (SE-2) el texto se muestra escrito además de locutarse, para poder leerlo o '
        'repetirlo con otras palabras sin tener que reproducir el audio primero. En la lectura labiofacial (RA-2) el '
        'adulto tiene que decir la palabra sin voz, y antes la única forma de saber cuál era, era pulsar “oír la '
        'palabra” delante del niño —que es exactamente lo que invalida el ejercicio—. Ahora hay una chuleta plegada '
        '“🙈 SOLO PARA EL ADULTO”: se abre apartando la pantalla, se lee y se vuelve a cerrar. Empieza siempre cerrada.')
callout('Escucha en ruido (RA-1)',
        'La app locuta solo la palabra objetivo («vaca»), no la orden entera, porque lo que el ejercicio mide es '
        'reconocer esa palabra con ruido de fondo. La consigna del adulto va en la misma línea: di solo el nombre del '
        'animal, con tu voz normal.', fill=FILL_WARN)
figures([('17-ejercicio.png', 'Ficha ilustrada: consigna, imágenes ampliables y versión en movimiento.'),
         ('18-evaluacion-ept3.png', 'Evaluación EPT-3: el adulto toca 1★, 2★ o 3★.'),
         ('19-sesion-completada.png', 'Fin de sesión: XP, racha, nivel y promedio EPT-3.')])

# ---- CU-10 · RECORDATORIOS ----
uc_header('CU-10', 'Familia', 'Configurar recordatorios diarios')
uc_meta('Tutor o logopeda', 'Hub → “Recordatorios de sesión”', 'Permiso de notificaciones del sistema',
        'Avisos en la pantalla de bloqueo, solo en las franjas elegidas')
p('Hay cuatro franjas y se elige cuáles se quieren: de las cuatro a ninguna. No es un “todo o nada”.')
data_table(['Franja', 'Qué llega'], [
    [[('Mañana · 9:00', True)], 'Invitación a la sesión del día.'],
    [[('Mediodía · 13:00', True)], 'Recordatorio corto a media jornada.'],
    [[('Tarde · 17:00', True)], 'Última llamada para no perder la racha.'],
    [[('Noche · 20:00', True)], 'Consejo para el adulto, no aviso de juego: uno de los cinco consejos de “el hogar como centro de rehabilitación”, que rota cada día. Va dirigido a quien acompaña, no al niño.'],
], widths=[4.4, 12.6])
h4('Flujo principal')
numbered([
    [('En la tarjeta ', False), ('“Recordatorios de sesión”', True), (' del hub, activar el interruptor.', False)],
    'Conceder el permiso de notificaciones si el sistema lo pide.',
    [('Marcar o desmarcar las ', False), ('franjas', True),
     (' que se quieran. El texto de la tarjeta muestra en todo momento cuántos avisos llegarán y a qué hora.', False)],
])
bullets([
    [('Permiso denegado:', True), (' aparece un aviso pidiendo conceder el permiso en los ajustes del sistema.', False)],
    [('Desactivar una franja:', True), (' deja de llegar de inmediato. No solo se deja de reprogramar: se cancelan también los avisos que ya estaban en cola.', False)],
    [('Quitar las cuatro:', True), (' equivale a apagar los recordatorios, y el interruptor maestro se apaga solo.', False)],
    [('Al actualizar desde una versión anterior:', True), (' quedan activas las cuatro, como hasta ahora. Nadie pierde avisos por el cambio.', False)],
])

# ---- CU-11 · GAMIFICACIÓN ----
uc_header('CU-11', 'Familia', 'Motivación: racha, niveles e insignias')
uc_meta('Niño/a (con apoyo del adulto)', 'Fin de sesión · cabecera del hub', 'Al menos una sesión completada',
        'XP, racha y niveles actualizados')
p('Al estilo de apps como Duolingo, Valeria+ recompensa la constancia en todos los bloques. Todo se guarda localmente.')
h4('Cómo se gana XP · Niveles · Insignias')
bullets([
    [('XP por sesión:', True), (' base (20 + 5 por ejercicio) + precisión (hasta +30) + racha (hasta +14) + sesión perfecta (+15).', False)],
    [('Niveles (cada 100 XP):', True), (' Osezno → Oso Curioso → Oso Valiente → Oso Explorador → Oso Sabio → Gran Oso → Oso Legendario.', False)],
    [('Insignias:', True), (' 🌱 Primer paso · 🔥 rachas (3/7/14 días) · 🎓 sesiones (10/25/50) · ⭐ sesiones perfectas.', False)],
])
callout('Racha viva', 'La racha se mantiene mientras se practique hoy o ayer. Si se salta más de un día, vuelve a cero: '
        'por eso ayudan los recordatorios de CU-10.', fill=FILL_OK, label_color=RGBColor(0x04, 0x78, 0x57))

# ---- CU-12 · RESULTADOS ----
uc_header('CU-12', 'Profesional / Familia', 'Consultar el panel de resultados')
uc_meta('Logopeda o tutor', 'Resultados del paciente', 'Historial de sesiones registrado',
        'Visión de la evolución del paciente')
h4('Flujo principal')
numbered([
    [('Abrir el ', False), ('panel de resultados', True), (' al finalizar una sesión o desde la ficha. La cabecera muestra el ', False),
     ('nombre y NHC del paciente activo', True), (', tomados de su ficha de registro.', False)],
    [('Revisar la ', False), ('evolución por estrellas', True), (' (media de las últimas sesiones) y, para dislalias, la nueva gráfica de ', False),
     ('sustitución por fonema', True), (': el % de ensayos con la sustitución detectada por el micrófono, donde bajar es mejorar.', False)],
    [('Consultar el ', False), ('estado de gamificación', True), (' (XP, racha, nivel) y la ', False), ('adherencia semanal', True), ('.', False)],
    'El logopeda usa estos datos para ajustar la prescripción (volver a CU-06) en la siguiente revisión.',
])
callout('Ciclo de mejora', 'Resultados → decisión clínica → nueva prescripción → nuevas sesiones. La gráfica de fonema '
        'convierte la práctica de pares mínimos en un indicador clínico objetivo entre sesiones.')
figures([('20-resultados.png', 'Panel: motivación, insignias y adherencia semanal.'),
         ('21-resultados-fonema.png', 'Evolución por estrellas y sustitución por fonema (bajar = mejorar).')])

# ---- CU-13 · CAMBIO DE MODO ----
uc_header('CU-13', 'Profesional', 'Cambiar entre Modo Familia y Modo Profesional')
uc_meta('Logopeda', 'Cualquier bloque prescribible', 'Conocer el PIN', 'Edición habilitada o bloqueada según convenga')
h4('Flujo principal')
numbered([
    [('Para ', False), ('entrar', True), (' en Modo Profesional: pulsar “Desbloquear Edición Profesional” 🔒 e introducir el PIN. '
     'El estado pasa a 🔓 “Modo profesional activo”.', False)],
    'Realizar los cambios de prescripción necesarios en el bloque (Pares Mínimos, Expansión Semántica, Audición, Lenguaje, TEA o Dislexia).',
    [('Para ', False), ('salir', True), (': pulsar ', False), ('“Guardar Prescripción”', True),
     ('. La edición se bloquea automáticamente y vuelve a Modo Familia.', False)],
])
callout('Buena práctica', 'Guarde siempre antes de entregar el dispositivo a la familia, para que la prescripción quede '
        'protegida en modo solo lectura. El PIN es el mismo en todos los bloques.',
        fill=FILL_WARN, label_color=RGBColor(0xB4, 0x53, 0x09))

# ---- CU-14 · EXPORTACIÓN DE TELEMETRÍA DEL PILOTO ----
doc.add_page_break()
uc_header('CU-14', 'Profesional', 'Exportar la evidencia de usabilidad del piloto (QR + compartir)')
uc_meta('Logopeda / responsable del piloto', 'Hub de bloques → “Acceso Profesional”',
        'Se han usado ejercicios · PIN disponible', 'Resumen en QR + registro completo compartido; datos purgados')
par = doc.add_paragraph()
rich(par, [('Durante el piloto, la app va guardando de forma ', False), ('anónima y sin molestar', True),
           (' unas métricas de usabilidad (tiempo por pantalla, misclicks y cápsulas de movimiento saltadas) junto con la '
            'encuesta breve de satisfacción. Este caso de uso explica cómo el profesional las ', False),
           ('saca del dispositivo', True), (' para el análisis, con dos salidas a la vez: una ', False), ('offline', True),
           (' (QR) y otra ', False), ('online', True), (' (compartir).', False)])
h4('Flujo principal')
numbered([
    [('En el ', False), ('hub de bloques', True), (', bajar hasta la tarjeta ', False), ('“Acceso Profesional”', True), (' y tocarla.', False)],
    [('Introducir el ', False), ('PIN', True), (' del logopeda (demo: ', False), ('1985', True), (').', False)],
    [('Se abre la pantalla de ', False), ('exportación', True), (': en el acto aparece un ', False), ('código QR', True),
     (' con el resumen (nº de sesiones, % de abandono TPR, misclicks y media de la encuesta) y, a la vez, el ', False),
     ('menú de compartir', True), (' del sistema para enviar el ', False), ('registro completo', True), (' por email o WhatsApp.', False)],
    [('Offline:', True), (' escanear el QR con otro móvil para capturar el resumen sin necesidad de conexión.', False)],
    [('Online:', True), (' elegir la app de destino (correo, WhatsApp…) para enviar el registro completo en crudo.', False)],
    [('Tras un envío correcto, la app ', False), ('vacía el archivo', True), (' del dispositivo y lo confirma (“Log exportado y purgado”).', False)],
])
h4('Flujos alternativos')
bullets([
    [('Se cancela el compartir:', True), (' el registro ', False), ('no', True), (' se borra; el QR sigue visible y se puede reintentar.', False)],
    [('Sin conexión:', True), (' use solo el QR; el envío por compartir queda para cuando haya red.', False)],
    [('Resumen muy largo para el QR:', True), (' la app avisa y basta con usar el compartir del registro completo.', False)],
])
callout('Qué contiene cada salida',
        [('El ', False), ('QR', True), (' lleva solo el ', False), ('resumen estadístico', True),
         (' comprimido (sin datos personales). El ', False), ('compartir', True), (' envía el ', False),
         ('registro completo', True), (' de la telemetría anónima y la encuesta, correlacionados por identificador de '
          'sesión, para el análisis del piloto.', False)])
callout('Encuesta de satisfacción (SUS)',
        [('La pregunta de 1 a 5 (“Fue fácil integrar este ejercicio en la rutina de mi hijo/a”) aparece ', False),
         ('sola', True), (' al completar 4 bloques distintos y como mucho ', False), ('una vez por semana', True),
         (' por dispositivo. La familia no tiene que buscarla ni configurarla.', False)],
        fill=FILL_WARN, label_color=RGBColor(0xB4, 0x53, 0x09))

# ---- CU-15 · VARIEDAD DE TERAPIA ----
doc.add_page_break()
uc_header('CU-15', 'Profesional / Familia', 'Elegir la variedad de terapia (Castellano · Galego · Dominicano · Euskera)')
uc_meta('Logopeda o tutor', 'Tarjeta “Voz de la app”',
        'App abierta (funciona sin conexión)', 'El contenido se locuta y evalúa en la variedad elegida')
par = doc.add_paragraph()
rich(par, [('Valeria+ puede trabajar el contenido terapéutico en ', False), ('cuatro variedades', True),
           ('. La ', False), ('interfaz', True), (' (menús y botones) sigue en castellano; lo que cambia es ', False),
           ('lo que se dice, se muestra y se evalúa', True),
           ('. La elección se guarda en el dispositivo y se aplica a todos los bloques.', False)])
data_table(['Variedad', 'Cómo suena y evalúa'], [
    [[('🇪🇸 Castellano', True)], 'Voz neuronal Sharvard pregenerada (offline) y reconocimiento del sistema en español de España.'],
    [[('Galego', True), (' (Proxecto Nós)', False)], 'Voz neuronal Celtia pregenerada en gallego; contenido y pares propios. El contenido compartido con el castellano (Expansión Semántica, Audición y Lenguaje) suena con la voz neuronal castellana mientras Celtia no lo cubra.'],
    [[('🇩🇴 Dominicano', True), (' (Quisqueya Habla)', False)], 'Usa la voz latina del dispositivo y el micrófono en es-DO; respeta los rasgos del habla caribeña.'],
    [[('Euskera', True), (' (batua · ILENIA/NEL-GAITU)', False)], 'Voz neuronal HiTZ-TTS pregenerada (UPV/EHU · Aholab), empaquetada y offline. El reconocimiento usa eu-ES donde el dispositivo lo trae; si no, recae en es-ES con un pliegue de la ⟨h⟩ muda que no penaliza las sibilantes ni africadas (contraste clínico que valora el adulto).'],
], widths=[4.2, 12.8])
h4('Flujo principal')
numbered([
    [('Abrir la tarjeta ', False), ('“Voz de la app”', True), (' y localizar ', False), ('“Variedad de la voz”', True), ('.', False)],
    [('Tocar ', False), ('Castellano', True), (', ', False), ('Galego', True), (', ', False), ('Dominicano', True), (' o ', False), ('Euskera', True), ('.', False)],
    [('La app cambia al instante la locución y el reconocimiento; la tarjeta muestra un aviso sobre la voz disponible.', False)],
])
h4('Flujos alternativos')
bullets([
    [('En dominicano suena peninsular o robótica:', True), (' instalar una voz de “Español (Latinoamérica)” en los ajustes del dispositivo; la app la usará automáticamente.', False)],
    [('En euskera sin reconocedor vasco:', True), (' el dispositivo escucha en es-ES con el pliegue de la ⟨h⟩; si tampoco hay micrófono (Expo Go / web), el adulto valora con botones, como en el resto de variedades.', False)],
    [('Falta la voz pregenerada de una locución:', True), (' en galego se reproduce primero el asset neuronal castellano equivalente si existe; en último término, la app recae con suavidad en la voz del sistema, sin interrumpir la sesión.', False)],
])
callout('Respeto dialectal',
        [('En dominicano, la app ', False), ('no marca como error', True),
         (' el seseo, la aspiración de la “s” ni el cambio de “r/l” a final de sílaba: son rasgos normales del habla, '
          'no fallos que corregir.', False)])
figures([('22-voz-variedad.png', 'Tarjeta “Voz de la app”: selector de variedad Castellano · Galego · Dominicano · Euskera.')],
        width_cm=6.4)

# ---- CU-16 · PANEL DEL ADULTO · CARGA COMUNICATIVA ----
uc_header('CU-16', 'Profesional', 'Panel del Adulto: carga comunicativa (ruido, doble tarea, quiebre)', violet=True)
uc_meta('Adulto que dirige la sesión (logopeda o tutor)', 'Reproductor de Ejercicios → Panel del Adulto',
        'Ejercicio de Audición/Lenguaje en curso', 'Reto de carga aplicado a mano y registrado')
par = doc.add_paragraph()
rich(par, [('Para el ', False), ('piloto clínico', True), (', el ', False), ('Panel del Adulto', True),
           (' (tarjeta plegable dentro del ejercicio) añade tres módulos de ', False), ('carga comunicativa', True),
           ('. Todos son ', False), ('manuales', True),
           (': la app nunca los activa, mide ni ajusta por su cuenta; es el adulto quien decide cuándo y cuánto.', False)])
data_table(['Módulo', 'Qué hace'], [
    [[('🔊 Escucha en ruido', True)], 'Un slider añade ruido de fondo (bullicio de cafetería) por debajo de la instrucción. El volumen sube o baja solo con el dedo del adulto.'],
    [[('🐻 Doble tarea', True)], 'Un oso distractor se asoma y se mueve por el borde de la pantalla sin ser tocable: obliga al niño a atender a la voz pese a la interferencia visual.'],
    [[('💬 Quiebre pragmático', True)], 'La app calla y el adulto rompe la comunicación a propósito; luego marca la estrategia de reparación que usó el niño.'],
], widths=[4.8, 12.2])
h4('Flujo principal')
numbered([
    [('Durante el ejercicio, desplegar la tarjeta ', False), ('“Panel del Adulto”', True), ('.', False)],
    [('Activar el módulo deseado: mover el ', False), ('slider de ruido', True), (', encender el ', False), ('oso distractor', True), (' o lanzar el ', False), ('quiebre pragmático', True), ('.', False)],
    [('Guiar la respuesta del niño y, en el quiebre, seleccionar la ', False), ('estrategia de reparación', True), (' observada.', False)],
    [('Desactivar el módulo cuando convenga; el nivel de reto queda registrado de forma anónima.', False)],
])
callout('Antes del quiebre pragmático',
        'Un aviso recuerda que la tarea genera “frustración útil” y se puede cancelar. Explicarlo evita que la familia lo '
        'viva como un fallo de la app.',
        fill=FILL_WARN, label_color=RGBColor(0xB4, 0x53, 0x09))
callout('Siempre en manos del adulto',
        'Ningún módulo se activa solo. Esta regla es deliberada: mantiene la app como herramienta de apoyo a la terapia, '
        'no como un aparato de medición automática.',
        fill=FILL_VIOLET, label_color=VIOLET_DARK)
figures([('23-panel-adulto.png', 'Panel del Adulto desplegado: ruido de fondo, oso distractor y quiebre pragmático.')],
        width_cm=6.4)

# ---- CU-17 · ACADEMY · LENGUA DE SIGNOS ----
uc_header('CU-17', 'Familia', 'Academy: aprender lo básico de Lengua de Signos Española', violet=True)
uc_meta('Adulto que acompaña al niño', 'Academy → dominio “Lengua de Signos (LSE)”', 'Ninguna; disponible desde el primer día',
        'Base para entender la LSE y decidir con criterio')
p('Sexto dominio de Academy, propuesto por las logopedas de ACOPROS. Seis cápsulas que dan una puerta de entrada a la '
  'Lengua de Signos Española: qué es, qué relación tiene con el habla y cómo empezar a comunicaros hoy mismo.')
data_table(['Cápsula', 'Qué responde'], [
    [[('La LSE es una lengua, no mímica', True)], 'Tiene léxico, orden de frase y morfología propios; no es español traducido a gestos. Está reconocida por la Ley 27/2007.'],
    [[('¿Signar retrasa el habla?', True)], 'La duda que trae casi toda familia. Lo que compromete el desarrollo es no tener acceso pleno a ninguna lengua en los primeros años, no la exposición a dos.'],
    [[('De qué está hecho un signo', True)], 'Configuración, lugar, orientación y movimiento, más la expresión facial. Cambiar un solo parámetro puede cambiar la palabra.'],
    [[('El alfabeto dactilológico', True)], 'Deletrear con la mano, con las configuraciones dibujadas. Sirve para nombres propios y palabras aún sin signo conocido.'],
    [[('Primeros signos con utilidad real', True)], 'No los colores ni los animales: los que le permiten pedir (más, comer, ayuda). Un niño que puede pedir deja de tener que llorar para que le entiendan.'],
    [[('Dónde se aprende de verdad', True)], 'Con personas sordas signantes y cursos oficiales. Ninguna app sustituye la conversación real.'],
], widths=[5.8, 11.2])
callout('Qué es y qué no es este módulo',
        'Un signo combina configuración de la mano, lugar, orientación y movimiento. Un dibujo estático captura los tres '
        'primeros y NO el cuarto. Por eso el módulo enseña lo que sí es enseñable así —el alfabeto dactilológico, cuyas '
        'configuraciones son posturas fijas— y para el léxico signado remite a fuente signada. Es una puerta de entrada, '
        'no un curso de LSE.')
h4('¿Y la prioridad de la audición?')
p('Valeria+ da prioridad al oído dentro de sus ejercicios auditivo-verbales: nombra antes de mostrar, para que el niño '
  'entrene la escucha. Eso sigue valiendo. La LSE es otra cosa: una lengua con estatuto legal propio a la que tu hijo '
  'puede tener derecho, y su adopción la decidís la familia y el equipo clínico, no una app. La primera cápsula del '
  'módulo aborda esa relación de frente para que no queden dos mensajes sueltos que parezcan reñidos.')
h4('Flujo principal')
numbered([
    [('Abrir ', False), ('Academy', True), (' desde la tarjeta del hub y elegir el dominio ', False), ('Lengua de Signos (LSE)', True), ('.', False)],
    [('Empezar por ', False), ('“La LSE es una lengua, no mímica”', True), (', y seguir por ', False),
     ('“¿Signar retrasa el habla?”', True), (': el feed las propone en ese orden a propósito.', False)],
    'Leer las diapositivas —las de configuraciones muestran el dibujo de la mano— y responder el quiz.',
    'Practicar el alfabeto frente al espejo deletreando el nombre del niño, cada día, hasta que lo reconozca.',
    'Contarle a la logopeda que estáis empezando con signos, para que el plan de casa y el de la sesión sean uno solo.',
])
bullets([
    [('Progreso independiente:', True), (' la XP de este dominio no se mezcla con la del resto; tiene su propia escala (“Experto en LSE”) e insignias.', False)],
    [('Al actualizar:', True), (' el dominio aparece con el progreso a cero y el del resto de dominios se conserva intacto.', False)],
])
callout('Validación',
        'El contenido de las seis cápsulas y las configuraciones de mano dibujadas fueron revisados y aprobados por una '
        'persona sorda signante. Es la única revisión que puede decir si una silueta se reconoce como la letra que dice ser.',
        fill=FILL_OK, label_color=RGBColor(0x04, 0x78, 0x57))

# ============================ ANEXO ============================
doc.add_page_break()
# ================= REALIDAD AUMENTADA (CU-18 … CU-22) =================
kicker('Realidad Aumentada')
doc.add_heading('El séptimo bloque', level=1)
p('Los cinco casos siguientes cubren el bloque de Realidad Aumentada, disponible solo en teléfonos Android con la app '
  'instalada. No llevan capturas, y la razón está al final del capítulo.')

# ---- CU-18 · PREPARACIÓN ----
uc_header('CU-18', 'Familia', 'Realidad Aumentada: permiso de cámara y prueba de aptitud del teléfono')
uc_meta('Tutor (el niño solo para el calentamiento)', 'Realidad Aumentada · preparación',
        'Teléfono Android con la app instalada (APK)',
        'Consentimiento dado, nivel de aptitud medido y ejercicios habilitados')
par = doc.add_paragraph()
rich(par, [('El séptimo bloque usa la ', False), ('cámara frontal como sensor de movimiento', True),
           (': mide si el niño redondea los labios, gira la cabeza hacia un sonido o mantiene la mirada en un dibujo, '
            'y esos gestos son los que hacen reaccionar a unas figuras en 3D. ', False),
           ('En dos de los tres ejercicios el micrófono está apagado', True),
           (', a propósito: se premia el esfuerzo motor antes de pedirle que hable, para que no escuche su propio error '
            'y se frustre antes de haber consolidado el gesto.', False)])
p('Antes de la primera sesión hay dos pasos que se hacen una sola vez, y merece la pena no saltárselos.')
h4('Flujo principal')
numbered([
    [('Abrir la tarjeta ', False), ('Realidad Aumentada', True), (' del hub. Si el teléfono o la versión de la app no lo admiten, la app lo dice y no ofrece nada más.', False)],
    [('Leer ', False), ('“Qué hace la cámara en estos juegos”', True), (' y aceptar. Se pide una vez por paciente.', False)],
    [('Hacer el ', False), ('calentamiento de minuto y medio', True), (' con la osita. Es la prueba de aptitud: mide lo que este aparato concreto puede sostener.', False)],
    [('Colocar el teléfono ', False), ('apoyado', True), (' —en un libro, una caja o contra la pared—, horizontal y a 30-35 cm de la cara. La app avisa en verde cuando la posición vale.', False)],
    'Elegir uno de los tres ejercicios habilitados para el nivel obtenido.',
])
h4('Qué habilita cada nivel de aptitud')
data_table(['Nivel', 'Qué se puede hacer'], [
    [[('A · Instrumento', True)], 'Los tres ejercicios, y los tiempos de AR-2 sirven como medida.'],
    [[('B · Clínico', True)], 'Los tres ejercicios; AR-2 solo como juego (sus tiempos no son defendibles).'],
    [[('C · Reducido', True)], 'AR-1 y AR-3, este último con 2 dibujos en vez de 3.'],
    [[('D · No apto', True)], 'El bloque no aparece. Los otros seis funcionan exactamente igual.'],
], widths=[4.0, 13.0])
h4('Flujos alternativos')
bullets([
    [('Sin permiso de cámara:', True), (' el bloque no se abre y el resto de la app sigue igual. El permiso se puede retirar en cualquier momento desde los ajustes de Android.', False)],
    [('El teléfono se mueve durante un ensayo:', True), (' la app anula ese ensayo. Un ensayo anulado es barato; uno contaminado estropea el registro.', False)],
    [('La cámara deja de ver la cara:', True), (' el ejercicio se cierra solo y la app explica que hay que apoyar mejor el teléfono.', False)],
    [('El aparato se calienta:', True), (' la app avisa. Conviene parar y volver otro día: un ejercicio a tirones no mide nada.', False)],
])
callout('Un nivel bajo no es culpa del niño',
        'El nivel de aptitud describe el teléfono, no al paciente ni al centro. Conviene decirlo así a la familia, '
        'porque el aparato lo pone ella. Con un nivel C el ejercicio de mirada usa dos dibujos en vez de tres, y eso no '
        'es una versión peor: elegir entre dos alternativas es un formato de evaluación perfectamente estándar.')
callout('Sobre la cámara, tres cosas que no cambian',
        'No se graba ni se guarda ninguna imagen: cada fotograma se analiza y se descarta al instante. Ningún vídeo '
        'sale del teléfono. Y no se reconoce la cara de nadie: se miden gestos —grados, milisegundos y proporciones—, '
        'nunca identidades.', fill=FILL_WARN, label_color=VIOLET_DARK)

# ---- CU-19 · AR-1 ----
uc_header('CU-19', 'Familia', 'AR-1 · Cinemática Orofacial: la boquita de beso mueve el coche')
uc_meta('Tutor + niño/a (3-4 años)', 'Realidad Aumentada · AR-1', 'Consentimiento y aptitud A, B o C (CU-18)',
        'Serie de sostén del gesto por ensayo')
par = doc.add_paragraph()
rich(par, [('Sirve para trabajar el ', False), ('gesto motor previo a /o/ y /u/', True),
           (' en dislalias funcionales, separándolo del sonido. El niño pone ', False), ('boquita de beso', True),
           (' y, mientras la sostiene, un coche en 3D acelera. No se le pide que diga nada: ', False),
           ('el micrófono está apagado', True), ('.', False)])
h4('Flujo principal')
numbered([
    [('Al entrar, ', False), ('3 segundos de reposo', True), (': la app toma la línea base de la boca de ese niño. La boca de uno de tres años y la de uno de seis no admiten la misma medida.', False)],
    [('Consigna única: ', False), ('«Pon boquita de beso para que el coche avance.»', True)],
    [('El coche ', False), ('acelera mientras el gesto se sostiene', True), (' y frena si se pierde. El premio llega al mantenerlo 1,5 segundos (ajustable entre 0,8 y 3 s en el Panel, CU-22).', False)],
    [('Se repite en ensayos cortos, con una ', False), ('cápsula de movimiento', True), (' intercalada.', False)],
])
h4('Flujos alternativos')
bullets([
    [('Mueca asimétrica:', True), (' si una comisura tira mucho más que la otra, no cuenta. Ese patrón compensatorio es justo el que la terapia intenta deshacer.', False)],
    [('No lo consigue en varios intentos:', True), (' el umbral está por encima de lo que hoy puede sostener. Bájelo usted en el Panel; la app nunca lo ajusta sola.', False)],
])
callout('Por qué el premio es progresivo',
        'El coche no aparece de golpe al cumplir el tiempo: acelera a la vez que el niño sostiene. Un premio de todo o '
        'nada no le enseña qué está haciendo bien. Y si pierde el gesto un instante, el progreso baja, no se borra: '
        'reiniciar a cero a un niño de cuatro años es asegurarse de que no lo consiga nunca.',
        fill=FILL_VIOLET, label_color=VIOLET_DARK)
callout('No se puede “ayudar” desde fuera',
        'El premio no llega por el paso del tiempo, ni por un toque del adulto, ni por el micrófono. Si el gesto no se '
        'hace, no hay coche. Eso es deliberado: es lo que hace que el refuerzo signifique algo.', fill=FILL_WARN)

# ---- CU-20 · AR-2 ----
uc_header('CU-20', 'Profesional', 'AR-2 · Localización del sonido: de «¿giró?» a milisegundos')
uc_meta('Logopeda (o tutor, en modo juego)', 'Realidad Aumentada · AR-2',
        'Aptitud A para medir tiempos; B o C solo como juego',
        'Latencia del giro cefálico por ensayo, o acierto/fallo con el motivo')
par = doc.add_paragraph()
rich(par, [('Es la versión ', False), ('instrumentada', True),
           (' del ejercicio RA-5 del bloque de Audición, que sigue disponible con campanita donde no haya montaje. '
            'Convierte una observación cualitativa —«¿giró la cabeza?»— en una ', False),
           ('latencia en milisegundos', True), ('.', False)])
h4('Dos modos, y el montaje decide cuál')
data_table(['', 'Modo juego (casa)', 'Modo instrumento (centro)'], [
    [[('Altavoz', True)], 'El del propio teléfono', 'Dos altavoces con cable a ±60°, a 1 m y a la altura del oído'],
    [[('Qué registra', True)], 'Acierto o fallo, sin tiempo y diciendo por qué', 'Latencia real de cada ensayo'],
], widths=[3.4, 6.4, 7.2])
h4('Flujo principal')
numbered([
    [('La app espera a que el niño lleve ', False), ('medio segundo mirando al frente', True), ('. Sin eso, media latencia sería el tiempo que tardó en volver la cabeza.', False)],
    [('Suena el estímulo por un lado, ', False), ('elegido al azar', True), (' (nunca más de dos veces seguidas el mismo).', False)],
    [('El niño gira. Hay ', False), ('2 segundos de ventana', True), ('; pasada, se anota «sin respuesta», nunca “error”.', False)],
    [('Entre ensayo y ensayo pasan ', False), ('de 3 a 6 segundos al azar', True), (', para que no anticipe.', False)],
    [('Uno de cada cinco ensayos, aproximadamente, ', False), ('no suena', True), ('. Es el control que distingue oír de mover la cabeza porque sí.', False)],
])
h4('Flujos alternativos')
bullets([
    [('Altavoz Bluetooth:', True), (' vetado. Añade un retraso variable de 100-300 ms, que es exactamente lo que se quiere medir. La app lo detecta y registra el ensayo sin tiempo.', False)],
    [('Sin montaje cableado o teléfono por debajo del nivel A:', True), (' el ejercicio funciona igual como juego, y cada registro dice por qué no lleva tiempo.', False)],
])
callout('Durante el ensayo, el adulto no existe',
        'No señalar, no mirar hacia el altavoz, no reaccionar. Es la fuente de sesgo más fácil de introducir y la más '
        'difícil de detectar después en los datos.', fill=FILL_WARN)
callout('Un tiempo vacío no es un fallo',
        'Cuando el registro no trae latencia, dice el motivo: ensayo sin sonido, sin respuesta, salida Bluetooth, sin '
        'altavoces cableados o teléfono insuficiente. Cada motivo se lee distinto, y por eso se guarda.')

# ---- CU-21 · AR-3 ----
uc_header('CU-21', 'Familia', 'AR-3 · Selección semántica por fijación: elegir mirando')
uc_meta('Tutor + niño/a (4-5 años)', 'Realidad Aumentada · AR-3',
        'Calibración de 5 puntos hecha para ese paciente y ese teléfono',
        'Primera mirada y elección final por ensayo')
par = doc.add_paragraph()
rich(par, [('Evalúa ', False), ('comprensión de vocabulario sin que la mano estorbe', True),
           (': pensado para niños con parálisis cerebral, dispraxia o cualquier dificultad de motricidad fina. El niño ', False),
           ('elige mirando', True), (', no señalando.', False)])
h4('Flujo principal')
numbered([
    [('Calibración obligatoria', True), (': 5 puntos con la osita, unos 15 segundos. Sin ella el puntero no apunta a nada. Se guarda por paciente y por teléfono.', False)],
    [('Aparecen ', False), ('3 dibujos', True), (' (2 si el teléfono es de nivel C), colocados por ángulos, no por píxeles.', False)],
    [('La app ', False), ('dice la palabra una sola vez', True), (' y espera.', False)],
    [('El niño mira el dibujo. Un ', False), ('anillo de progreso', True), (' se va cerrando mientras sostiene la mirada; a 1,2 segundos queda elegido (ajustable en el Panel).', False)],
    [('El acierto dispara un ', False), ('giro de 360°', True), (' de la figura.', False)],
])
h4('Flujos alternativos')
bullets([
    [('Mira al fondo, entre dibujos:', True), (' no acumula nada. El anillo solo avanza dentro de un dibujo, para que no elija sin querer.', False)],
    [('El puntero tiembla:', True), (' en el Panel se puede cambiar de iris (preciso pero nervioso) a rayo desde la nariz (más grueso pero estable). El ejercicio ni se entera del cambio.', False)],
])
callout('Dos datos que no significan lo mismo',
        'La primera mirada dice adónde fue de entrada —comprensión inmediata—; la elección final es lo que acaba '
        'escogiendo, con posible corrección por el camino. Solo la segunda dispara el premio. Conviene no confundirlas '
        'al leer el panel.', fill=FILL_VIOLET, label_color=VIOLET_DARK)
callout('No mezcle sesiones de 2 y de 3 dibujos',
        'Con dos alternativas se acierta la mitad de las veces por azar, y eso se corrige con más ensayos, no '
        'comparándolo con sesiones de tres. El registro guarda cuántos dibujos había justo para poder separarlas.',
        fill=FILL_WARN)
callout('Diga la palabra una sola vez',
        'Repetirla reinicia la búsqueda del niño y estropea el dato de primera mirada. Si no responde, es un dato; '
        'insistir lo borra.')

# ---- CU-22 · PANEL RA ----
uc_header('CU-22', 'Profesional', 'Ajustar los umbrales de Realidad Aumentada y ver las señales en vivo')
uc_meta('Logopeda', 'Realidad Aumentada · Panel del Adulto', 'Modo Profesional (PIN)',
        'Umbrales adaptados a ese niño y comprobación de que el aparato ve bien')
par = doc.add_paragraph()
rich(par, [('El bloque no adapta su dificultad solo. ', False), ('Lo hace usted', True),
           (', y esa es una decisión de diseño, no una carencia: un software que ajusta su propio criterio clínico deja '
            'de ser un instrumento.', False)])
h4('Flujo principal')
numbered([
    [('Abrir el ', False), ('Panel del Adulto', True), (' dentro del bloque de RA (bajo los ejercicios, no delante del niño).', False)],
    [('Ajustar el ', False), ('sostén de AR-1', True), (' (0,8-3 s), la ventana de respuesta de AR-2, el tiempo de fijación de AR-3 y el tipo de puntero.', False)],
    [('Usar ', False), ('“Ver las señales en vivo”', True), (' para comprobar distancia, grados de giro, apertura de labios y fotogramas por segundo antes de una sesión que importe.', False)],
])
callout('Qué encontrará en el panel del paciente, y qué no',
        'Encontrará series y magnitudes: sostén en milisegundos, latencia por ensayo, fijación hasta elegir, ensayos '
        'anulados y la ficha del aparato. No encontrará percentiles, comparación con «lo esperado para la edad», '
        'semáforos de gravedad ni etiquetas diagnósticas, y su ausencia es deliberada: un gráfico es descripción, un '
        'semáforo rojo es interpretación, y la interpretación es suya.')
callout('Dos sesiones en teléfonos distintos no se comparan sin más',
        'Cada registro lleva marca, modelo, nivel de aptitud y fotogramas por segundo sostenidos, precisamente porque '
        'el aparato condiciona la medida. Mírelo antes de leer una evolución como mejoría o empeoramiento.',
        fill=FILL_WARN)
callout('Por qué este capítulo no lleva capturas',
        'Los tres ejercicios de Realidad Aumentada solo funcionan con la cámara abierta en un teléfono físico, y '
        'cualquier captura fiel mostraría la cara de un niño. Preferimos describirlos con palabras antes que incluir '
        'una imagen de un menor en un documento que circula, o una recreación que no se parezca a lo que verá.')

kicker('Anexo A')
doc.add_heading('Preguntas frecuentes y resolución de problemas', level=1)
data_table(['Situación', 'Qué hacer'], [
    ['No recuerdo el PIN profesional',
     'El PIN lo define el logopeda. En la demo es 1985 y es el mismo en todos los bloques. Si se olvida en producción, debe restablecerse desde la configuración de la app.'],
    ['El micrófono no reconoce la voz',
     'En Expo Go y en el navegador web no hay reconocimiento de voz: use el modo juez (el adulto valora con botones). En la app instalada, revise el permiso de micrófono.'],
    ['El micrófono falla más en galego o en euskera',
     'Es esperable: el reconocimiento sin conexión necesita el paquete de idioma de esa variedad instalado en el teléfono, y en galego y euskera es poco frecuente. La tarjeta “Voz de la app” le dice, para la variedad activa, si se está escuchando dentro del teléfono o a través del servicio del sistema, y le ofrece descargar el paquete cuando el aparato lo permite. Recuerde que el adulto siempre puede corregir el veredicto, y que un fallo del micrófono no le gasta el intento al niño.'],
    ['¿Cómo sé si la voz de mi hijo sale del teléfono?',
     'En la tarjeta “Voz de la app”, debajo del selector de variedad. Indica «En el teléfono» o «Servicio del sistema» y, cuando es lo segundo, explica por qué (el aparato no sabe, falta el motor local o falta el paquete de ese idioma).'],
    ['En Pares Mínimos ahora sale “casi” más veces que antes',
     'Es un cambio buscado. Cuando lo que se oye se parece igual a las dos palabras del par, la app ya no da el acierto por defecto: dice «casi» y le deja a usted el veredicto. Antes, en los pares que se distinguen por una sola letra, decir la palabra equivocada podía puntuar como acierto, y eso vaciaba el ejercicio (CU-04).'],
    ['No veo el bloque de Realidad Aumentada',
     'Solo aparece en teléfonos Android con la app instalada (no en tablet, ni en Expo Go, ni en el navegador), y solo si la prueba de aptitud da nivel A, B o C. Con nivel D el bloque no se ofrece y los otros seis funcionan igual (CU-18).'],
    ['El ejercicio de Realidad Aumentada se cierra solo',
     'La cámara ha dejado de ver la cara del niño. Apoye el teléfono en un libro o una caja, en horizontal y a 30-35 cm; nunca lo sostenga en la mano (CU-18).'],
    ['¿Se graba a mi hijo con la cámara?',
     'No. Cada fotograma se analiza dentro del teléfono y se descarta en el mismo instante. No hay grabación, no sale ninguna imagen del aparato y no se reconoce la cara de nadie: solo se miden gestos (grados, milisegundos y proporciones).'],
    ['El coche de AR-1 no arranca aunque el niño pone la boca',
     'Puede que la mueca salga asimétrica (una comisura tira más que la otra), que no cuenta a propósito, o que el tiempo de sostén esté por encima de lo que hoy puede aguantar. Bájelo usted en el Panel del Adulto; la app nunca lo ajusta sola (CU-19 y CU-22).'],
    ['En AR-2 no aparecen los tiempos',
     'Los milisegundos solo son defendibles con teléfono de nivel A y altavoces con cable. Con Bluetooth se vetan a propósito (añade un retraso variable que es justo lo que se quiere medir). El ejercicio sigue funcionando como juego y el registro dice por qué no lleva tiempo (CU-20).'],
    ['En AR-3 la mirada no selecciona nada',
     'Falta la calibración de 5 puntos, que es obligatoria por paciente y por teléfono. Si el puntero tiembla, cambie de iris a rayo desde la nariz en el Panel (CU-21 y CU-22).'],
    ['La app oyó mal en Pares Mínimos',
     'El adulto es el juez final: use “dijo rana / dijo lana” para corregir el veredicto. Un falso positivo no penaliza al niño.'],
    ['No avanza tras la misión física',
     'Es el sello doble: el adulto y el niño deben pulsar las dos huellas a la vez. Sirve para que el ejercicio no siga solo. Con una sola mano, mantenga pulsada una huella 2 segundos.'],
    ['No aparece el Test de Ling',
     'Solo se muestra en los ejercicios de Audición si la patología indica audífono o implante coclear (CU-08).'],
    ['La racha volvió a cero',
     'Se perdió porque pasó más de un día sin practicar. Active los recordatorios (CU-10) para evitarlo.'],
    ['No puedo cambiar qué se practica',
     'Está en Modo Familia (solo lectura). Desbloquee el Modo Profesional con el PIN (CU-06 / CU-13).'],
    ['¿Se pierden los datos al cerrar la app?',
     'No. Ficha, prescripción, historial, evolución por fonema y progreso se guardan cifrados en el dispositivo.'],
    ['El mismo ejercicio se repetía siempre igual',
     'Use “🔄 Otra ronda”: cada mini-juego rota hasta 3 contenidos distintos. Para practicar todo lo prescrito de golpe, use “🎯 Sesión completa”.'],
    ['¿Necesito conexión o crear una cuenta?',
     'No. La app funciona en local sin conexión. El acceso profesional con correo y contraseña (sincronización en la nube) es opcional y solo se usa para pruebas con profesionales.'],
    ['¿Qué datos recoge el piloto sobre mi hijo/a?',
     'Solo métricas anónimas de usabilidad (tiempo por pantalla, misclicks y cápsulas saltadas) y una encuesta breve. No se guardan nombres, ni audio, ni el contenido de las respuestas. Todo se cifra en el dispositivo.'],
    ['¿Por qué apareció una encuesta con caritas?',
     'Es la encuesta de satisfacción del piloto (SUS). Solo aparece al completar 4 bloques distintos y como mucho una vez por semana. Se puede cerrar sin responder.'],
    ['¿Cómo exporto los datos del piloto?',
     'Desde el hub, tarjeta “Acceso Profesional” con el PIN: la app muestra un QR con el resumen y abre el compartir con el registro completo. Tras enviarlo, los datos se purgan (CU-14).'],
    ['¿Puedo usar la app en gallego, dominicano o euskera?',
     'Sí. En la tarjeta “Voz de la app” se elige la variedad (Castellano, Galego, Dominicano o Euskera). Cambia lo que se locuta y evalúa; los menús siguen en castellano (CU-15).'],
    ['En dominicano la voz suena de España o robótica',
     'Instale una voz de “Español (Latinoamérica)” en los ajustes del dispositivo. La app la detecta y la usa automáticamente.'],
    ['En galego, algunos ejercicios no hablaban',
     'La Expansión Semántica y los ejercicios de Audición y Lenguaje suenan con la voz neuronal castellana mientras Celtia no cubra ese contenido, en vez de quedar en silencio. Actualice la app si sigue ocurriendo.'],
    ['Marca como error algo que en mi país se dice así',
     'En la variedad dominicana la app respeta los rasgos del habla caribeña (seseo, “s” aspirada, “r/l” final). Y recuerde: el adulto es siempre el juez final del veredicto.'],
    ['Apareció ruido de fondo o un oso moviéndose',
     'Son módulos del Panel del Adulto (carga comunicativa) del piloto; solo se activan a mano. Desactívelos desde ese mismo panel (CU-16).'],
    ['¿Qué son los bloques de TEA y Dislexia?',
     'TEA (6 terapias, protocolo PRT + TCC) y Dislexia (6 terapias de conciencia fonológica y acceso léxico). Se prescriben con el mismo PIN que el resto y sus estresores los activa siempre el adulto (CU-06).'],
    ['¿Qué es la tarjeta “Academy” del hub?',
     'Es la formación para el adulto, organizada en seis dominios (Lenguaje, Hipoacusia, Dislalias, Dislexia, TEA y Lengua de Signos). Cápsulas breves con quiz sobre cómo aprenden a hablar los niños, el manejo de los dispositivos auditivos, los sonidos difíciles y más; un feed destaca el dominio que encaja con la patología de la ficha. No es un ejercicio para el niño (CU-03).'],
], widths=[6.0, 11.0])

# ============================ ANEXO B · HISTORIAL ============================
doc.add_page_break()
kicker('Anexo B')
doc.add_heading('Historial de versiones', level=1)
p('Este manual describe Valeria+ en su estado actual (v10.3). '
  'La siguiente tabla resume, a título informativo, cómo ha '
  'ido creciendo la app, por si resulta útil a quienes usaron versiones anteriores.')
data_table(['Versión', 'Hitos principales'], [
    [[('v5', True)],
     'Primeros bloques (Pares Mínimos y Expansión Semántica), Modo Profesional con PIN compartido por todos los bloques '
     'y almacenamiento local cifrado.'],
    [[('v6', True)],
     'Voz más humana, rondas variadas (“Otra ronda”), botón de sesión completa, fase de turno visible, pictogramas de '
     'alto contraste y sincronización en la nube opcional (Firebase).'],
    [[('v7', True)],
     'Instrumentación del piloto: telemetría de usabilidad anónima, encuesta SUS, guardado cifrado con purga y '
     'exportación dual (QR + compartir).'],
    [[('v8', True)],
     'Tres variedades de habla (Castellano, Galego y Dominicano) con voz neuronal offline, respeto dialectal, Panel del '
     'Adulto de carga comunicativa y frases portadoras.'],
    [[('v8.1', True)],
     'Botón de reingreso a tamaño completo, resultados y Test de Ling con el paciente real, y voz gallega que siempre '
     'arranca.'],
    [[('v8.2', True)],
     'Academy: primeras Cápsulas de Conocimiento para el cuidador, con quiz y progreso por niveles.'],
    [[('v9', True)],
     'Bloques de TEA y Dislexia, Audición ampliada a 18 terapias (escucha en ruido), banco castellano de 15 pares, '
     'cuarta variedad (Euskera) y Academy multidominio.'],
    [[('v9.1', True)],
     'Mejoras nacidas de la revisión clínica de las logopedas de ACOPROS: categorías léxicas con progresión de '
     'dificultad, antesala de preparación antes de cada actividad, contrastes con doble vuelta (comprender y decir) '
     'sobre pictogramas propios, escucha más tolerante que no penaliza los fallos del micrófono, recordatorios por '
     'franjas y el módulo de Lengua de Signos Española en Academy.'],
    [[('v10', True)],
     'Séptimo bloque: Realidad Aumentada (solo Android, en teléfono). La cámara frontal pasa a ser un sensor de '
     'movimiento y el premio en 3D se gana con el gesto —labios, giro de cabeza, mirada—, no con la voz: en dos de los '
     'tres ejercicios el micrófono está apagado. Incluye permiso de cámara por paciente, prueba de aptitud del aparato '
     'y umbrales que ajusta el profesional (CU-18 a CU-22).'],
    [[('v10.1', True)],
     'El audio del turno de habla deja de salir del teléfono siempre que el dispositivo lo permita: la app pide ahora '
     'reconocimiento sin conexión, decidido variedad por variedad, y lo muestra en la tarjeta “Voz de la app”, donde '
     'también ofrece descargar el paquete de idioma que falte. No cambia nada de lo clínico —la ventana de escucha '
     'larga, la tolerancia a los fallos del micrófono y el pliegue dialectal siguen igual—, y el adulto sigue siendo el '
     'juez final.'],
    [[('v10.2', True)],
     'Los pares mínimos vuelven a detectar la sustitución. Al comparar lo oído con la palabra pedida, la app toleraba '
     'una letra de diferencia; como la mayoría de los pares se distinguen por una sola letra, decir la palabra '
     'equivocada podía puntuar como acierto. Ahora se compara con las dos palabras del par y gana la más parecida; si '
     'empatan, sale «casi» y decide el adulto. Cuesta algún «casi» de más en pronunciaciones aproximadas, y a cambio el '
     'ejercicio mide lo que dice medir.'],
    [[('v10.3', True)],
     'El micrófono vuelve a escuchar, y el bloque de Lenguaje dice qué material hace falta. El reconocimiento de voz '
     'había dejado de contar bien el caso más común —el niño que tarda en arrancar—, y con ello repetía siempre que no '
     'se le escuchaba; además, cuando el reconocedor del propio teléfono no arrancaba, la variedad se quedaba atascada '
     'sin salida. Las dos cosas están corregidas. Del lado clínico, y a petición de ACOPROS: los siete ejercicios de '
     'Lenguaje declaran su material antes de empezar, Atención Conjunta trae varias formas de hacerla para que no se '
     'mecanice, Imitación progresa de la sílaba a la palabra corta, Regulación Conductual habla de recompensa acordada '
     'con el niño y explica cómo montar la agenda visual, la adivinanza se puede leer, la lectura labiofacial tiene '
     'chuleta para el adulto, la escucha en ruido locuta solo la palabra objetivo y la app anuncia el siguiente '
     'ejercicio antes de puntuar.'],
], widths=[2.4, 14.6])
p('Sobre la cobertura de este manual. Los capítulos paso a paso cubren ya los siete bloques, incluida la Realidad '
  'Aumentada de la v10 (CU-18 a CU-22). Los cambios de la v10.1 y la v10.2 no añaden pantallas: afectan a cómo se '
  'reconoce y se valora la voz por dentro, y están explicados en el capítulo 2 («Privacidad de los datos») y en CU-04. '
  'La v10.3 sí añade elementos visibles —la tarjeta de material, la lista de formas alternativas, la chuleta del adulto '
  'y el aviso del siguiente ejercicio—, todos descritos en CU-09.')
p('Sobre las capturas de pantalla. Las imágenes de este manual se tomaron en la v9, así que en las pantallas de '
  'Expansión Semántica y de recordatorios verás alguna diferencia respecto al texto: la cuarta pestaña de Categorías, '
  'la antesala de preparación y el selector de franjas son posteriores a esas capturas. El capítulo de Realidad '
  'Aumentada no lleva capturas, y la razón está explicada al final de CU-22: cualquier imagen fiel de esos ejercicios '
  'mostraría la cara de un niño.')
p('', space_after=4)
p('Valeria+ · Manual de Casos de Uso · v10.3 (con capturas de pantalla) · Agosto de 2026 · Terapia auditivo-verbal y del '
  'lenguaje para la infancia. Documento de apoyo para logopedas y familias. Disponible en Castellano, Galego (Proxecto '
  'Nós), Dominicano (Quisqueya Habla) y Euskera (batua · ILENIA/NEL-GAITU). Los datos personales se tratan localmente '
  'conforme a RGPD/HIPAA; la sincronización en la nube y la telemetría anónima del piloto son opcionales.', size=8.5, color=MUTED)

doc.save(OUT)
print('OK:', OUT, os.path.getsize(OUT), 'bytes · figuras:', FIG_N)
