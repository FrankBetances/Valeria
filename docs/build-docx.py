# -*- coding: utf-8 -*-
"""Genera docs/Valeria-Manual-Casos-de-Uso.docx a partir del contenido del manual.

Uso:
    pip install python-docx
    python3 docs/build-docx.py

Requiere las capturas de docs/screenshots/ (ver docs/capture-screenshots.js).
Mantiene el mismo contenido que docs/manual-casos-de-uso.html (v6).
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
run = footer_p.add_run('Valeria+ · Manual de Casos de Uso · v6 (con capturas de pantalla) · Julio de 2026')
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
p('Manual de usuario · v6 · con capturas de pantalla', bold=True, size=10, color=PRIMARY)
p('Manual de Casos de Uso', bold=True, size=34, color=INK, space_after=10)
p('Aplicación de terapia auditivo-verbal y del lenguaje para niñas y niños con hipoacusia, '
  'implante coclear, dislalias o dificultades del lenguaje.', size=13, color=INK2, space_after=16)
p('Guía para logopedas, familias y cuidadores\nJulio de 2026 · Documento interno\n'
  'Expo SDK 54 / React Native · Backend opcional Firebase', size=10, color=MUTED)
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
    ('CU-02', 'Elegir un bloque de terapia (hub de 4 bloques)'),
    ('CU-03', 'Pares Mínimos para dislalias'),
    ('CU-04', 'Expansión Semántica / progresión léxica'),
    ('CU-05', 'Prescribir terapias de Audición y Lenguaje (Modo Profesional)'),
    ('CU-06', 'Retomar un paciente e iniciar sesión'),
    ('CU-07', 'Test de Ling previo (audífono / implante)'),
    ('CU-08', 'Realizar una sesión de ejercicios'),
    ('CU-09', 'Configurar recordatorios diarios'),
    ('CU-10', 'Motivación: racha, niveles e insignias'),
    ('CU-11', 'Consultar el panel de resultados'),
    ('CU-12', 'Cambiar entre Modo Familia y Modo Profesional'),
    ('', 'ANEXO'),
    ('A', 'Preguntas frecuentes y resolución de problemas'),
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
            '(Test de Ling), cuatro bloques de terapia y un panel de resultados para seguir la evolución.', False)])
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
doc.add_heading('Los cuatro bloques de terapia', level=3)
p('Desde la pantalla Prescripción de Terapias se elige uno de estos bloques. Los dos primeros se incorporaron en la '
  'versión 5 y la versión 6 amplió su contenido.')
data_table(['Bloque', 'Para qué sirve'], [
    [[('🗣️ Pares Mínimos', True)],
     'Dislalias fonológicas (rotacismo, sigmatismo, frontalización velar, f→p). 10 pares de palabras casi iguales '
     '(rana/lana) con juego de voz, misión física y sello doble padre-hijo.'],
    [[('🧩 Expansión Semántica', True)],
     'Progresión léxica para intervención temprana: 5 escenarios diarios, 7 progresiones (onomatopeya → adjetivo) y '
     '6 cápsulas de contraste, uniendo imagen, voz y acción física.'],
    [[('👂 Audición', True), (' — 13 terapias', False)],
     'Protocolo ACOPROS: fonética-fonología, semántica, morfosintaxis y pragmática para pacientes con audífono, '
     'implante coclear o hipoacusia.'],
    [[('💬 Lenguaje', True), (' — 7 terapias', False)],
     'Protocolo familiar: atención conjunta, imitación, comprensión, expresión, comunicación funcional, regulación '
     'conductual e interacción social.'],
], widths=[4.8, 12.2])
p('Además, el Test de Ling es una comprobación auditiva rápida (6 sonidos) previa a los ejercicios de audición, y la '
  'gamificación (XP, racha, niveles e insignias) mantiene la motivación en todos los bloques.', size=9.5, color=MUTED)
doc.add_heading('Novedades de la versión 6', level=3)
p('La versión 6 pule la experiencia de las sesiones y prepara la app para pruebas con profesionales:')
data_table(['Novedad', 'Qué aporta'], [
    [[('🔊 Voz más humana', True)],
     'El motor prioriza voces neuronales/enhanced (Google neural/WaveNet, iOS Enhanced/Siri) y descarta las metálicas. '
     'Añade prosodia natural (pausas por frase, entonación en preguntas y exclamaciones) y frases de ánimo rotativas.'],
    [[('🔄 Rondas variadas', True)],
     'Cada mini-juego de Audición y Lenguaje rota hasta 3 contenidos distintos con el botón “🔄 Otra ronda”, siguiendo '
     'un flujo numerado PASO 1→4 (consigna → juego → movimiento → evaluación).'],
    [[('🎯 Sesión completa', True)],
     'Botón por bloque que encadena todos los ejercicios prescritos en una sola sesión (pasando por el Test de Ling si '
     'procede), en vez de practicar de uno en uno.'],
    [[('🧭 Fase de turno visible', True)],
     'Pares Mínimos y Expansión Semántica muestran la barra Escucha → Repite → Veredicto → Misión, con consignas '
     'rotativas y doble vuelta evaluada (objetivo + opuesta).'],
    [[('🖼️ Fichas sin imágenes rotas', True)],
     'Pictogramas SVG de alto contraste para las palabras cuyos emojis se ven como cuadros vacíos o de bajo contraste '
     'en muchos Android, con emoji de reserva.'],
    [[('☁️ Sincronización opcional', True)],
     'Acceso profesional con correo y contraseña (Firebase Authentication) y copia de pacientes/sesiones en la nube '
     '(Cloud Firestore). Es aditivo: la app sigue funcionando en local sin conexión.'],
], widths=[4.8, 12.2])

# ============================ CAP 2 ============================
doc.add_page_break()
kicker('Capítulo 2')
doc.add_heading('Roles y modos de acceso', level=1)
par = doc.add_paragraph()
rich(par, [('Valeria+ distingue dos formas de usar la app sobre el mismo dispositivo. El cambio no requiere cerrar '
            'sesión: se controla con un ', False), ('PIN de 4 dígitos', True),
           (' del logopeda, compartido por todos los bloques (componente común de la versión 5).', False)])
data_table(['Modo', 'Quién', 'Qué puede hacer'], [
    [[('Modo Familia', True), ('\n(por defecto)', False)], 'Tutor, madre, padre o cuidador',
     'Practicar lo prescrito, realizar las sesiones, activar recordatorios y consultar el progreso. No puede cambiar '
     'qué terapias, pares o actividades están activos.'],
    [[('Modo Profesional', True), ('\n(requiere PIN)', False)], 'Logopeda / profesional',
     'Todo lo anterior más prescribir: activar o desactivar terapias en cada uno de los cuatro bloques y guardar la '
     'selección. Se desbloquea con el PIN y se vuelve a bloquear al guardar.'],
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
callout('Sincronización en la nube (opcional · v6)',
        'Para pruebas con profesionales, la versión 6 añade un acceso profesional con correo y contraseña (Firebase '
        'Authentication) que permite guardar una copia de pacientes y sesiones en la nube (Cloud Firestore). Es una capa '
        'aditiva y opcional: cada profesional autenticado solo accede a sus propios datos, protegidos por reglas de '
        'seguridad. Si no se activa, todo sigue guardándose únicamente en el dispositivo.',
        fill=FILL_VIOLET, label_color=VIOLET_DARK)

# ============================ CAP 3 ============================
doc.add_page_break()
kicker('Capítulo 3')
doc.add_heading('Mapa de pantallas y glosario', level=1)
p('Tras el alta o la selección del paciente se llega al hub de Prescripción, desde donde se abre cualquiera de los '
  'cuatro bloques. El Test de Ling solo precede a los ejercicios de audición cuando el paciente usa audífono o '
  'implante coclear.')
p('Bienvenida  →  Créditos  →  Ficha / Selección  →  Hub de 4 bloques  →  '
  'Pares Mínimos · Expansión Semántica · Audición* · Lenguaje  →  Resultados',
  bold=True, color=PRIMARY, align=WD_ALIGN_PARAGRAPH.CENTER)
p('* Los ejercicios de Audición pasan antes por el Test de Ling si la patología indica audífono o implante.',
  size=9, color=MUTED)
figures([('01-bienvenida.png', 'Bienvenida: “Comenzar” o “Ya tengo un paciente registrado”.'),
         ('02-creditos.png', 'Créditos del proyecto y colaboradores.'),
         ('05-hub-bloques.png', 'Hub de Prescripción: los cuatro bloques de terapia.')],
        width_cm=4.2)
doc.add_heading('Glosario', level=3)
data_table(['Término', 'Significado'], [
    ['Hub de bloques', 'Pantalla “Prescripción de Terapias”: cuatro tarjetas (Pares Mínimos, Expansión Semántica, Audición, Lenguaje) desde donde se practica o prescribe.'],
    ['Par mínimo', 'Dos palabras que solo se distinguen por un fonema (rana / lana). Entrenan el contraste que el niño sustituye.'],
    ['Sustitución', 'Error fonológico habitual: el niño dice la palabra contraria (r̄ → l). La app la detecta y la corrige.'],
    ['Sello doble', 'Mecánica anti-pasividad: padre e hijo pulsan dos huellas a la vez para avanzar (o mantienen una pulsada 2 s).'],
    ['TPR', 'Total Physical Response: aprender una palabra asociándola a una acción física del cuerpo.'],
    ['Fase de turno', 'Barra guía de Pares Mínimos y Expansión Semántica que marca en qué momento va el ejercicio: Escucha → Repite → Veredicto → Misión.'],
    ['Sesión completa', 'Botón que encadena en una sola sesión todos los ejercicios prescritos de un bloque, en vez de lanzarlos de uno en uno.'],
    ['Otra ronda', 'Botón que rota el contenido de un mini-juego de Audición/Lenguaje (hasta 3 variantes) para que no se memorice el mismo ítem.'],
    ['Progresión léxica', 'Secuencia que sube de onomatopeya → sustantivo → verbo → adjetivo sobre un mismo tema (el coche, el perro…).'],
    ['Test de Ling', 'Comprobación de 6 sonidos (m, u, a, i, sh, s) que verifica si el niño oye desde graves hasta agudos.'],
    ['Escala EPT-3', 'Valoración unificada de 3 niveles: ★ Emergente · ★★ En proceso · ★★★ Consolidado.'],
    ['Racha (🔥)', 'Días consecutivos en los que se ha completado al menos una sesión.'],
    ['NHC', 'Número de Historia Clínica del paciente.'],
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
    [('La patología indica audífono o implante coclear:', True), (' se recordará para lanzar el Test de Ling antes de los ejercicios de audición (ver CU-07).', False)],
])
callout('Dato clave', 'La patología determina el circuito de la sesión (p. ej. una dislalia orienta hacia Pares Mínimos; '
        'un implante, hacia el Test de Ling). Elíjala con cuidado.')
figures([('03-ficha-registro.png', 'Ficha de Registro: datos del niño/a (nombre, fecha, NHC y género).'),
         ('04-ficha-guardada.png', 'Ficha guardada y cifrada; aparece “Continuar a Prescripción →”.')])

# ---- CU-02 ----
uc_header('CU-02', 'Profesional / Familia', 'Elegir un bloque de terapia (hub de 4 bloques)')
uc_meta('Logopeda o tutor', 'Prescripción de Terapias (hub)', 'Ficha del paciente activa',
        'Bloque de terapia abierto para practicar o prescribir')
p('El hub es el centro de mando de cada sesión. Muestra la racha 🔥 y el nivel 🏅 del paciente y presenta los cuatro '
  'bloques como tarjetas. Audición y Lenguaje indican además cuántas terapias hay activas.')
h4('Flujo principal')
numbered([
    [('Tocar la tarjeta del bloque deseado: ', False), ('Pares Mínimos', True), (' (CU-03), ', False),
     ('Expansión Semántica', True), (' (CU-04), ', False), ('Audición', True), (' o ', False), ('Lenguaje', True), (' (CU-05 / CU-08).', False)],
    [('Desde la misma pantalla se activan los ', False), ('recordatorios de sesión', True), (' (ver CU-09).', False)],
])
callout('Dónde practica cada quién', 'En Modo Familia todos los bloques son accesibles para practicar lo prescrito; '
        'solo el logopeda, con el PIN, cambia qué está activo en cada uno.')

# ---- CU-03 · PARES MÍNIMOS ----
uc_header('CU-03', 'Familia', 'Pares Mínimos para dislalias', violet=True)
uc_meta('Tutor + niño/a (en pareja)', 'Pares Mínimos · Dislalias', 'Par prescrito por el logopeda',
        'Sesión de 10 ensayos valorada + evolución del fonema')
par = doc.add_paragraph()
rich(par, [('Bloque para ', False), ('dislalias fonológicas', True),
           ('. Se muestran dos fichas casi iguales (por ejemplo ', False), ('rana / lana', True),
           ('); la app pide una en voz alta y el niño la dice al micrófono. Con reconocimiento de voz, la app detecta '
            'si salió el fonema o la sustitución habitual; sin micrófono, ', False), ('el padre hace de juez', True),
           ('. Una ', False), ('barra de fase de turno', True),
           (' (Escucha → Repite → Veredicto → Misión) muestra en todo momento en qué paso va el ensayo.', False)])
h4('Flujo principal')
numbered([
    [('En el ', False), ('banco de contrastes', True), (', elegir un par prescrito (10 disponibles: rotacismo, sigmatismo, velares, labiodental). Pulsar ▶.', False)],
    [('La app ', False), ('pide una ficha', True), (' en voz alta (“¡Dile a papá cuál quieres! Di: rana”). El niño la dice. La fase de turno avanza de Escucha a Repite.', False)],
    [('La app evalúa: ', False), ('acierto', True), (' (3★ al primer intento, 2★ tras corrección), ', False),
     ('sustitución', True), (' detectada (corrección específica del par) o ', False), ('aproximación', True), (' (reintento).', False)],
    [('Cada acierto trae una ', False), ('misión física', True), (' (“¡Salto de rana!”) y termina con el ', False),
     ('sello doble', True), (': padre e hijo pulsan dos huellas a la vez para continuar.', False)],
    [('A lo largo de los 10 ensayos hay ', False), ('rotación de roles', True), (' (“¡Ahora mandas tú!”) y una ', False),
     ('cápsula TPR', True), (' de movimiento. Al final se guarda la sesión y la evolución del fonema.', False)],
])
h4('Flujos alternativos')
bullets([
    [('El padre es el juez final:', True), (' si la app oyó mal, corrige el veredicto con “dijo rana / dijo lana”.', False)],
    [('Dos correcciones seguidas:', True), (' la app pasa a imitación asistida (1★) para no frustrar; nunca hay un tercer fallo seguido.', False)],
    [('Sin reconocimiento de voz', True), (' (Expo Go / navegador): el padre valora con los botones “Dijo …”.', False)],
])
callout('Anti-pasividad', 'Nada avanza sin las manos de los dos: el sello doble obliga a que el adulto participe en '
        'cada ensayo. La rotación de roles convierte al niño en “juez” que discrimina qué palabra dijo el adulto.',
        fill=FILL_VIOLET, label_color=VIOLET_DARK)
figures([('06-pares-banco.png', 'Banco de contrastes: 10 pares agrupados por tipo de error.'),
         ('08-pares-juego.png', 'Ensayo: dos fichas, la consigna y el juez del padre.'),
         ('09-pares-veredicto.png', 'Acierto: misión física de celebración y sello doble.')])

# ---- CU-04 · EXPANSIÓN SEMÁNTICA ----
uc_header('CU-04', 'Familia', 'Expansión Semántica / progresión léxica', violet=True)
uc_meta('Tutor + niño/a', 'Expansión Semántica · Progresión Léxica', 'Actividad prescrita por el logopeda',
        'Palabras trabajadas uniendo símbolo, voz y cuerpo')
par = doc.add_paragraph()
rich(par, [('Rehabilitación léxica ', False), ('offline', True),
           (' para intervención temprana. Cada palabra une imagen, voz y una ', False),
           ('acción física del adulto', True),
           (' que la ancla al mundo real del niño. Tres modos de práctica en pestañas:', False)])
data_table(['Modo', 'Qué contiene'], [
    [[('Escenarios', True)], '5 rutinas diarias (mañana, comida, parque…), 6 palabras cada una.'],
    [[('Progresión', True)], '7 secuencias que suben Onomatopeya → Sustantivo → Verbo → Adjetivo (el coche, el perro, la vaca, el gato, la lluvia…).'],
    [[('Contrastes', True)], '6 cápsulas TPR de pares: grande/pequeño, limpio/sucio, abrir/cerrar, subir/bajar…'],
], widths=[3.6, 13.4])
p('Como en Pares Mínimos, una barra de fase de turno (Escucha → Repite → Veredicto → Misión) guía cada paso.')
h4('Flujo principal')
numbered([
    'Elegir la pestaña (Escenarios, Progresión o Contrastes) y pulsar ▶ en una actividad prescrita.',
    [('La app ', False), ('enseña la imagen y dice la palabra', True), (' (“Esto es la cama… Di: cama”). El niño la repite.', False)],
    [('El micrófono valora el intento aceptando las ', False), ('aproximaciones propias de la edad', True),
     ('; sin micrófono, el adulto decide (“Lo dijo / Casi”).', False)],
    [('Cada palabra se cierra con la ', False), ('acción física del adulto', True),
     (' (“Da unas palmaditas en la cama y sentaos en ella”). Se avanza al siguiente paso.', False)],
])
callout('Por qué funciona', 'La palabra se aprende cuando el niño la vive con el cuerpo, no solo cuando la oye. Las '
        'cápsulas de contraste añaden una “segunda vuelta” con la palabra opuesta para consolidar el par.',
        fill=FILL_VIOLET, label_color=VIOLET_DARK)
figures([('10-expansion-escenarios.png', 'Escenarios diarios: mañana, comida y parque.'),
         ('11-expansion-progresion.png', 'Progresión léxica: de onomatopeya a adjetivo.'),
         ('12-expansion-juego.png', 'Paso: imagen, consigna y misión física del adulto.')])

# ---- CU-05 · PRESCRIPCIÓN AUD/LENG ----
uc_header('CU-05', 'Profesional', 'Prescribir terapias de Audición y Lenguaje (Modo Profesional)')
uc_meta('Logopeda', 'Hub → Audición / Lenguaje', 'Ficha creada · PIN disponible',
        'Selección de terapias guardada en el dispositivo')
h4('Flujo principal')
numbered([
    [('En el hub, abrir ', False), ('Audición', True), (' (13 terapias) o ', False), ('Lenguaje', True), (' (7 terapias).', False)],
    [('Pulsar ', False), ('“Desbloquear Edición Profesional”', True), (' e introducir el ', False), ('PIN', True), (' (demo: ', False), ('1985', True), (').', False)],
    'Activar o desactivar cada terapia con su interruptor. El contador “N prescritos” se actualiza al momento.',
    [('Pulsar ', False), ('“Guardar Prescripción”', True), ('. La selección se guarda y la edición vuelve a bloquearse.', False)],
])
h4('Flujos alternativos')
bullets([
    [('PIN incorrecto:', True), (' los puntos se marcan en rojo y se pueden reintroducir.', False)],
    [('Solo consulta (sin PIN):', True), (' se ve la lista, pero los interruptores están atenuados.', False)],
    [('Practicar sin editar:', True), (' el botón ▶ de cada fila inicia esa terapia, incluso en Modo Familia. '
     'El mismo PIN prescribe también en Pares Mínimos y Expansión Semántica.', False)],
])
figures([('07-pin-profesional.png', 'Teclado de PIN compartido por los cuatro bloques.'),
         ('13-audicion-lista.png', 'Audición: las 13 terapias con su interruptor de prescripción.')])

# ---- CU-06 · RETOMAR ----
uc_header('CU-06', 'Familia', 'Retomar un paciente e iniciar una sesión')
uc_meta('Tutor o cuidador', 'Bienvenida → Selección de paciente → Hub', 'Existe al menos una ficha guardada',
        'Paciente activo cargado y listo para practicar')
h4('Flujo principal')
numbered([
    [('En ', False), ('Bienvenida', True), (', pulsar ', False), ('“Ya tengo un paciente”', True), ('.', False)],
    'Seleccionar la ficha del niño/a en la lista de pacientes del dispositivo.',
    [('La app carga su prescripción y su progreso (racha, nivel) y abre el ', False), ('hub de bloques', True), ('.', False)],
    'Elegir un bloque para practicar (CU-02).',
])
bullets([[('No hay pacientes guardados:', True), (' use CU-01 para dar de alta uno nuevo desde “Comenzar”.', False)]])
figures([('16-pacientes.png', 'Selección de paciente: fichas guardadas en el dispositivo.')])

# ---- CU-07 · LING ----
uc_header('CU-07', 'Familia', 'Test de Ling previo (audífono / implante)')
uc_meta('Tutor que produce los sonidos', 'Test de Ling', 'Patología con audífono o implante coclear',
        'Comprobación auditiva registrada + recomendación')
h4('Flujo principal')
numbered([
    [('Al pulsar ▶ en una terapia de ', False), ('Audición', True), (', responder: ', False),
     ('¿el niño usa audífonos o implante?', True), (' Si es No, se salta a los ejercicios.', False)],
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

# ---- CU-08 · SESIÓN DE EJERCICIOS ----
uc_header('CU-08', 'Familia', 'Realizar una sesión de ejercicios (Audición / Lenguaje)')
uc_meta('Tutor + niño/a', 'Reproductor de Ejercicios → Resultados', 'Terapia iniciada (con o sin Test de Ling)',
        'Sesión valorada y guardada en el historial')
h4('Flujo principal')
numbered([
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
    [('Al terminar se calcula la media y se muestran las ', False), ('recompensas', True),
     (' (XP, racha, nivel, insignias). Ver CU-10.', False)],
])
h4('Flujos alternativos')
bullets([
    [('Sesión completa:', True), (' el botón “🎯 Sesión completa” de cada bloque encadena todos los ejercicios prescritos '
     'en una sola tanda (pasando por el Test de Ling si la ficha lo indica), en vez de lanzarlos de uno en uno.', False)],
    [('Sesión perfecta:', True), (' si todos los ejercicios obtienen ★★★, se desbloquea la insignia “Sesión estrella”.', False)],
    [('Salir a mitad:', True), (' se puede volver atrás; lo valorado hasta ese punto no cuenta como sesión completada.', False)],
])
figures([('17-ejercicio.png', 'Ficha ilustrada: consigna, imágenes ampliables y versión en movimiento.'),
         ('18-evaluacion-ept3.png', 'Evaluación EPT-3: el adulto toca 1★, 2★ o 3★.'),
         ('19-sesion-completada.png', 'Fin de sesión: XP, racha, nivel y promedio EPT-3.')])

# ---- CU-09 · RECORDATORIOS ----
uc_header('CU-09', 'Familia', 'Configurar recordatorios diarios')
uc_meta('Tutor o logopeda', 'Hub → “Recordatorios de sesión”', 'Permiso de notificaciones del sistema',
        'Avisos en la pantalla de bloqueo')
h4('Flujo principal')
numbered([
    [('En la tarjeta ', False), ('“Recordatorios de sesión”', True), (' del hub, activar el interruptor.', False)],
    'Conceder el permiso de notificaciones si el sistema lo pide.',
    [('La app programa hasta ', False), ('4 avisos al día', True), (' —a las ', False),
     ('9:00, 13:00, 17:00 y 20:00', True), ('— con un consejo para padres que rota a diario.', False)],
])
bullets([
    [('Permiso denegado:', True), (' aparece un aviso pidiendo conceder el permiso en los ajustes del sistema.', False)],
    [('Desactivar:', True), (' el mismo interruptor cancela todos los recordatorios.', False)],
])

# ---- CU-10 · GAMIFICACIÓN ----
uc_header('CU-10', 'Familia', 'Motivación: racha, niveles e insignias')
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
        'por eso ayudan los recordatorios de CU-09.', fill=FILL_OK, label_color=RGBColor(0x04, 0x78, 0x57))

# ---- CU-11 · RESULTADOS ----
uc_header('CU-11', 'Profesional / Familia', 'Consultar el panel de resultados')
uc_meta('Logopeda o tutor', 'Resultados del paciente', 'Historial de sesiones registrado',
        'Visión de la evolución del paciente')
h4('Flujo principal')
numbered([
    [('Abrir el ', False), ('panel de resultados', True), (' al finalizar una sesión o desde la ficha.', False)],
    [('Revisar la ', False), ('evolución por estrellas', True), (' (media de las últimas sesiones) y, para dislalias, la nueva gráfica de ', False),
     ('sustitución por fonema', True), (': el % de ensayos con la sustitución detectada por el micrófono, donde bajar es mejorar.', False)],
    [('Consultar el ', False), ('estado de gamificación', True), (' (XP, racha, nivel) y la ', False), ('adherencia semanal', True), ('.', False)],
    'El logopeda usa estos datos para ajustar la prescripción (volver a CU-05) en la siguiente revisión.',
])
callout('Ciclo de mejora', 'Resultados → decisión clínica → nueva prescripción → nuevas sesiones. La gráfica de fonema '
        'convierte la práctica de pares mínimos en un indicador clínico objetivo entre sesiones.')
figures([('20-resultados.png', 'Panel: motivación, insignias y adherencia semanal.'),
         ('21-resultados-fonema.png', 'Evolución por estrellas y sustitución por fonema (bajar = mejorar).')])

# ---- CU-12 · CAMBIO DE MODO ----
uc_header('CU-12', 'Profesional', 'Cambiar entre Modo Familia y Modo Profesional')
uc_meta('Logopeda', 'Cualquier bloque prescribible', 'Conocer el PIN', 'Edición habilitada o bloqueada según convenga')
h4('Flujo principal')
numbered([
    [('Para ', False), ('entrar', True), (' en Modo Profesional: pulsar “Desbloquear Edición Profesional” 🔒 e introducir el PIN. '
     'El estado pasa a 🔓 “Modo profesional activo”.', False)],
    'Realizar los cambios de prescripción necesarios en el bloque (Pares Mínimos, Expansión Semántica, Audición o Lenguaje).',
    [('Para ', False), ('salir', True), (': pulsar ', False), ('“Guardar Prescripción”', True),
     ('. La edición se bloquea automáticamente y vuelve a Modo Familia.', False)],
])
callout('Buena práctica', 'Guarde siempre antes de entregar el dispositivo a la familia, para que la prescripción quede '
        'protegida en modo solo lectura. El PIN es el mismo en los cuatro bloques.',
        fill=FILL_WARN, label_color=RGBColor(0xB4, 0x53, 0x09))

# ============================ ANEXO ============================
doc.add_page_break()
kicker('Anexo A')
doc.add_heading('Preguntas frecuentes y resolución de problemas', level=1)
data_table(['Situación', 'Qué hacer'], [
    ['No recuerdo el PIN profesional',
     'El PIN lo define el logopeda. En la demo es 1985 y es el mismo en los cuatro bloques. Si se olvida en producción, debe restablecerse desde la configuración de la app.'],
    ['El micrófono no reconoce la voz',
     'En Expo Go y en el navegador web no hay reconocimiento de voz: use el modo juez (el adulto valora con botones). En la app instalada, revise el permiso de micrófono.'],
    ['La app oyó mal en Pares Mínimos',
     'El padre es el juez final: use “dijo rana / dijo lana” para corregir el veredicto. Un falso positivo no penaliza al niño.'],
    ['No avanza tras la misión física',
     'Es el sello doble: padre e hijo deben pulsar las dos huellas a la vez. Con una sola mano, mantenga pulsada una huella 2 segundos.'],
    ['No aparece el Test de Ling',
     'Solo se muestra en los ejercicios de Audición si la patología indica audífono o implante coclear (CU-07).'],
    ['La racha volvió a cero',
     'Se perdió porque pasó más de un día sin practicar. Active los recordatorios (CU-09) para evitarlo.'],
    ['No puedo cambiar qué se practica',
     'Está en Modo Familia (solo lectura). Desbloquee el Modo Profesional con el PIN (CU-05 / CU-12).'],
    ['¿Se pierden los datos al cerrar la app?',
     'No. Ficha, prescripción, historial, evolución por fonema y progreso se guardan cifrados en el dispositivo.'],
    ['El mismo ejercicio se repetía siempre igual',
     'Use “🔄 Otra ronda”: cada mini-juego rota hasta 3 contenidos distintos. Para practicar todo lo prescrito de golpe, use “🎯 Sesión completa”.'],
    ['¿Necesito conexión o crear una cuenta?',
     'No. La app funciona en local sin conexión. El acceso profesional con correo y contraseña (sincronización en la nube) es opcional y solo se usa para pruebas con profesionales (v6).'],
], widths=[6.0, 11.0])
p('', space_after=4)
p('Valeria+ · Manual de Casos de Uso · v6 (con capturas de pantalla) · Julio de 2026 · Terapia auditivo-verbal y del '
  'lenguaje para la infancia. Documento de apoyo para logopedas y familias. Los datos personales se tratan localmente '
  'conforme a RGPD/HIPAA; la sincronización en la nube es opcional.', size=8.5, color=MUTED)

doc.save(OUT)
print('OK:', OUT, os.path.getsize(OUT), 'bytes · figuras:', FIG_N)
