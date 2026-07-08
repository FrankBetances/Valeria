# -*- coding: utf-8 -*-
"""Genera docs/Valeria-Manual-Casos-de-Uso.docx a partir del contenido del manual.

Uso:
    pip install python-docx
    python3 docs/build-docx.py

Requiere las capturas de docs/screenshots/ (ver docs/capture-screenshots.js).
"""
import os
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = os.path.join(ROOT, 'docs', 'screenshots')
OUT = os.path.join(ROOT, 'docs', 'Valeria-Manual-Casos-de-Uso.docx')

PRIMARY = RGBColor(0x00, 0xA3, 0x9E)     # teal oscuro (texto sobre blanco)
PRIMARY_BRIGHT = RGBColor(0x00, 0xC4, 0xBE)
INK = RGBColor(0x1F, 0x29, 0x37)
INK2 = RGBColor(0x4B, 0x55, 0x63)
MUTED = RGBColor(0x6B, 0x72, 0x80)
FILL_LIGHT = 'E6F9F8'
FILL_TINT = 'F0FDF9'
FILL_WARN = 'FFFBEB'
FILL_OK = 'EAFAF2'

doc = Document()
doc.core_properties.title = 'Valeria+ · Manual de Casos de Uso'
doc.core_properties.author = 'Proyecto Valeria+'
doc.core_properties.language = 'es-ES'

# ---------- página y estilos base ----------
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

# pie de página
footer_p = sec.footer.paragraphs[0]
footer_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = footer_p.add_run('Valeria+ · Manual de Casos de Uso · v4 (con capturas de pantalla) · Julio de 2026')
run.font.size = Pt(8)
run.font.color.rgb = MUTED


# ---------- utilidades ----------
def shade(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:fill'), fill)
    tc_pr.append(shd)


def p(text='', bold=False, size=None, color=None, align=None, style=None,
      space_after=6, italic=False):
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
    """parts: lista de (texto, bold) o (texto, bold, color)."""
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


def uc_header(code, actor_tag, title):
    t = doc.add_table(rows=1, cols=1)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = t.cell(0, 0)
    shade(cell, '00C4BE')
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
p('Manual de usuario · v4 · con capturas de pantalla', bold=True, size=10, color=PRIMARY)
p('Manual de Casos de Uso', bold=True, size=34, color=INK, space_after=10)
p('Aplicación de terapia auditivo-verbal para niñas y niños con hipoacusia, '
  'implante coclear o dificultades del lenguaje.', size=13, color=INK2, space_after=16)
p('Guía para logopedas, familias y cuidadores\nJulio de 2026 · Documento interno\nExpo / React Native',
  size=10, color=MUTED)
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
    ('CU-02', 'Prescripción de terapias (Modo Profesional)'),
    ('CU-03', 'Retomar un paciente e iniciar sesión'),
    ('CU-04', 'Test de Ling previo (audífono / implante)'),
    ('CU-05', 'Realizar una sesión de ejercicios'),
    ('CU-06', 'Ejercicios de lenguaje con voz (TTS, micrófono, TPR)'),
    ('CU-07', 'Configurar recordatorios diarios'),
    ('CU-08', 'Motivación: racha, niveles e insignias'),
    ('CU-09', 'Consultar el panel de resultados'),
    ('CU-10', 'Cambiar entre Modo Familia y Modo Profesional'),
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
    par.add_run(txt).bold = False
doc.add_page_break()

# ============================ CAP 1 ============================
kicker('Capítulo 1')
doc.add_heading('Introducción a Valeria+', level=1)
par = doc.add_paragraph()
rich(par, [('Valeria+', True), (' es una aplicación móvil (Expo / React Native) diseñada para acompañar las ', False),
           ('sesiones de terapia auditivo-verbal', True),
           (' de niñas y niños. Reúne en un solo lugar el registro del paciente, una comprobación auditiva previa '
            '(Test de Ling), la prescripción y reproducción de ejercicios, y un panel de resultados para seguir '
            'la evolución.', False)])
par = doc.add_paragraph()
rich(par, [('La app parte de un principio clave: ', False),
           ('los padres y cuidadores son el motor de voz y evaluación', True),
           ('. En los ejercicios de audición no hay reconocimiento automático de voz: es el adulto quien produce '
            'cada sonido y quien puntúa la respuesta del niño en una escala sencilla. Esto hace que la terapia '
            'funcione en cualquier dispositivo, sin depender de la calidad del micrófono, y refuerza el vínculo '
            'familiar en el proceso.', False)])
callout('A quién va dirigida',
        'Logopedas y profesionales de audición/lenguaje (que prescriben y supervisan) y familias o cuidadores '
        '(que realizan las sesiones en casa). Este manual cubre a ambos perfiles.')
doc.add_heading('Qué encontrará en este manual', level=3)
par = doc.add_paragraph()
rich(par, [('Diez ', False), ('casos de uso', True),
           (' paso a paso que recorren las tareas más habituales, desde dar de alta a un paciente hasta '
            'interpretar sus resultados. Cada caso indica el actor responsable, las precondiciones, el flujo '
            'principal, las variantes y el resultado esperado, y se acompaña de ', False),
           ('capturas de pantalla reales de la aplicación', True),
           (' para que sea fácil reconocer cada paso en el dispositivo.', False)])
data_table(['Módulo', 'Para qué sirve'], [
    [[('Audición', True), (' — 13 terapias', False)],
     'Fonética-fonología, semántica, morfosintaxis y pragmática para pacientes con audífono, implante coclear o hipoacusia.'],
    [[('Lenguaje', True), (' — 7 terapias', False)],
     'Atención conjunta, imitación, comprensión, expresión, comunicación funcional, regulación conductual e interacción social.'],
    [[('Test de Ling', True)], 'Comprobación auditiva rápida (6 sonidos) antes de los ejercicios de audición.'],
    [[('Gamificación', True)], 'XP, racha diaria, niveles con nombre e insignias para mantener la motivación.'],
], widths=[4.5, 12.5])

# ============================ CAP 2 ============================
doc.add_page_break()
kicker('Capítulo 2')
doc.add_heading('Roles y modos de acceso', level=1)
par = doc.add_paragraph()
rich(par, [('Valeria+ distingue dos formas de usar la app sobre el mismo dispositivo. El cambio no requiere '
            'cerrar sesión: se controla con un ', False), ('PIN de 4 dígitos', True), ('.', False)])
data_table(['Modo', 'Quién', 'Qué puede hacer'], [
    [[('Modo Familia', True), ('\n(por defecto)', False)], 'Tutor, madre, padre o cuidador',
     'Ver la prescripción (solo lectura), realizar las sesiones de ejercicios, activar recordatorios y consultar '
     'el progreso. No puede modificar qué ejercicios están activos.'],
    [[('Modo Profesional', True), ('\n(requiere PIN)', False)], 'Logopeda / profesional',
     'Todo lo anterior más activar o desactivar terapias y guardar la prescripción. Se desbloquea con el PIN y '
     'se vuelve a bloquear al guardar.'],
], widths=[3.6, 3.6, 9.8])
callout('PIN de demostración',
        [('El PIN de ejemplo es ', False), ('1985', True),
         ('. En un despliegue real, el logopeda debe sustituirlo por uno propio. El PIN nunca se guarda en '
          'texto plano: se valida contra un hash SHA-256.', False)],
        fill=FILL_WARN, label_color=RGBColor(0xB4, 0x53, 0x09))
doc.add_heading('Privacidad de los datos', level=3)
p('Toda la información del paciente (ficha, historial de sesiones, progreso) se guarda localmente en el '
  'dispositivo mediante almacenamiento cifrado. La app está pensada para cumplir RGPD/HIPAA en el manejo de '
  'datos personales (PII). No se envían datos a servidores externos para funcionar.')

# ============================ CAP 3 ============================
doc.add_page_break()
kicker('Capítulo 3')
doc.add_heading('Mapa de pantallas y glosario', level=1)
p('Una sesión completa recorre siempre el mismo circuito. El Test de Ling solo aparece cuando el paciente usa '
  'audífono o implante coclear.')
p('Bienvenida  →  Créditos  →  Ficha / Selección  →  Prescripción  →  Test de Ling*  →  Ejercicios  →  Resultados',
  bold=True, color=PRIMARY, align=WD_ALIGN_PARAGRAPH.CENTER)
p('* El Test de Ling se salta automáticamente si la patología del paciente no indica audífono ni implante.',
  size=8.5, color=MUTED)
figures([('01-bienvenida.png', 'Bienvenida: “Comenzar” o “Ya tengo un paciente registrado”.'),
         ('02-creditos.png', 'Créditos del proyecto y colaboradores.'),
         ('05-prescripcion.png', 'Prescripción de Terapias, el “centro de mando” de cada sesión.')],
        width_cm=4.2)
doc.add_heading('Glosario', level=3)
data_table(['Término', 'Significado'], [
    ['Ficha de registro', 'Datos sociodemográficos del niño, el tutor y el equipo médico.'],
    ['Prescripción', 'Conjunto de terapias que el logopeda deja activas para ese paciente.'],
    ['Test de Ling', 'Comprobación de 6 sonidos (m, u, a, i, sh, s) que verifica si el niño oye desde graves hasta agudos.'],
    ['Escala EPT-3', 'Valoración unificada de 3 niveles: ★ Emergente · ★★ En proceso · ★★★ Consolidado.'],
    ['Pausa activa', 'Mini-juego de movimiento entre ejercicios (saltos de rana, paso robot, equilibrio de flamenco…).'],
    ['TPR', 'Total Physical Response: aprender vocabulario asociando palabras a acciones físicas.'],
    ['Racha (🔥)', 'Días consecutivos en los que se ha completado al menos una sesión.'],
    ['NHC', 'Número de Historia Clínica del paciente.'],
], widths=[4.2, 12.8])

# ============================ CASOS DE USO ============================
doc.add_page_break()
kicker('Casos de uso')
doc.add_heading('Guía paso a paso', level=1)
p('Cada caso de uso describe una tarea completa. Las etiquetas “Profesional” y “Familia” indican el actor principal.')

# ---- CU-01 ----
uc_header('CU-01', 'Profesional / Familia', 'Alta de un nuevo paciente')
uc_meta('Logopeda o tutor que crea la ficha', 'Bienvenida → Créditos → Ficha de Registro',
        'App instalada y abierta', 'Ficha guardada y cifrada en el dispositivo')
h4('Flujo principal')
numbered([
    [('En la pantalla de ', False), ('Bienvenida', True), (', pulsar ', False), ('“Comenzar”', True),
     (' y avanzar por Créditos.', False)],
    [('En la ', False), ('Ficha de Registro', True), (', rellenar los datos del ', False), ('Niño/a', True),
     (': nombre y apellidos (obligatorio), fecha de nacimiento, ', False), ('NHC', True),
     (' (obligatorio) y género.', False)],
    [('Completar el bloque ', False), ('Tutor / Cuidador', True),
     (': nombre (obligatorio), vínculo familiar, ', False), ('correo', True),
     (' (obligatorio y con formato válido) y teléfono/WhatsApp para los reportes.', False)],
    [('Completar ', False), ('Diagnóstico y equipo médico', True),
     (': patología, médico prescriptor y logopeda asignado.', False)],
    [('Pulsar ', False), ('“Guardar ficha”', True),
     ('. Aparece la confirmación “Ficha guardada y cifrada”.', False)],
    [('Pulsar ', False), ('“Continuar a Prescripción →”', True),
     (' para pasar a la selección de terapias.', False)],
])
h4('Flujos alternativos')
bullets([
    [('Falta un campo obligatorio o el correo es inválido:', True),
     (' el campo se resalta en rojo y no se guarda hasta corregirlo.', False)],
    [('La patología indica audífono o implante coclear:', True),
     (' se recordará más adelante para lanzar el Test de Ling antes de los ejercicios (ver CU-04).', False)],
])
callout('Dato clave', 'La patología seleccionada determina el circuito de la sesión. Elíjala con cuidado.')
figures([('03-ficha-registro.png', 'Ficha de Registro: datos del niño/a (nombre, fecha, NHC y género).'),
         ('04-ficha-guardada.png', 'Ficha guardada y cifrada; aparece “Continuar a Prescripción →”.')])

# ---- CU-02 ----
uc_header('CU-02', 'Profesional', 'Prescripción de terapias (Modo Profesional)')
uc_meta('Logopeda', 'Prescripción de Terapias', 'Ficha del paciente creada · PIN disponible',
        'Selección de terapias guardada en el dispositivo')
h4('Flujo principal')
numbered([
    [('En ', False), ('Prescripción de Terapias', True), (', pulsar ', False),
     ('“Desbloquear Edición Profesional”', True), ('.', False)],
    [('Introducir el ', False), ('PIN de 4 dígitos', True), (' (demo: ', False), ('1985', True),
     ('). Al validarse, aparece “Modo profesional desbloqueado”.', False)],
    [('Elegir la pestaña ', False), ('Audición', True), (' (13 terapias) o ', False), ('Lenguaje', True),
     (' (7 terapias).', False)],
    'Activar o desactivar cada terapia con su interruptor. El contador “N prescritos” se actualiza al momento.',
    [('Pulsar ', False), ('“Guardar Prescripción”', True),
     ('. La selección se guarda y la edición vuelve a bloquearse.', False)],
])
h4('Flujos alternativos')
bullets([
    [('PIN incorrecto:', True), (' los puntos se marcan en rojo (“PIN incorrecto”) y se pueden reintroducir.', False)],
    [('Solo consulta (sin PIN):', True),
     (' se puede ver la lista, pero los interruptores están atenuados y no se pueden cambiar.', False)],
    [('Practicar sin editar:', True),
     (' el botón ▶ de cada fila inicia esa terapia directamente, incluso en Modo Familia.', False)],
])
data_table(['Categoría (Audición)', 'Ejemplos de terapias'], [
    ['Fonética-Fonología', 'Asociación vocal inicial · Articulación de vocales · Completar vocal'],
    ['Semántica', 'Detección del intruso · Adivinanza por letra · Prendas y órdenes'],
    ['Morfosintaxis', 'Singular/plural · Flexión de género · Estructura S-V-O'],
    ['Pragmática', 'Preguntas ¿qué? · Adaptación del discurso · Emociones · Petición de repetición'],
], widths=[4.6, 12.4])
figures([('06-pin-profesional.png', 'Teclado de PIN para desbloquear el Modo Profesional.'),
         ('07-modo-profesional.png', 'Edición desbloqueada: interruptores activos y “Guardar Prescripción”.'),
         ('08-lenguaje.png', 'Pestaña Lenguaje: las 7 terapias del protocolo familiar.')])

# ---- CU-03 ----
uc_header('CU-03', 'Familia', 'Retomar un paciente e iniciar una sesión')
uc_meta('Tutor o cuidador', 'Bienvenida → Selección de paciente → Prescripción',
        'Existe al menos una ficha guardada', 'Paciente activo cargado y listo para practicar')
h4('Flujo principal')
numbered([
    [('En ', False), ('Bienvenida', True), (', pulsar ', False), ('“Ya tengo un paciente”', True), ('.', False)],
    'Seleccionar la ficha del niño/a en la lista de pacientes del dispositivo.',
    'La app carga su prescripción y su progreso (racha, nivel) en la pantalla de Terapias.',
    'Pulsar el botón ▶ de la terapia deseada para comenzar. Según la patología, se abrirá primero el Test de '
    'Ling (CU-04) o directamente los ejercicios (CU-05).',
])
h4('Flujos alternativos')
bullets([[('No hay pacientes guardados:', True),
          (' use CU-01 para dar de alta uno nuevo desde “Comenzar”.', False)]])
figures([('16-pacientes.png', 'Selección de paciente: fichas guardadas en el dispositivo.')])

# ---- CU-04 ----
uc_header('CU-04', 'Familia', 'Test de Ling previo (audífono / implante)')
uc_meta('Tutor que produce los sonidos', 'Test de Ling', 'Patología con audífono o implante coclear',
        'Comprobación auditiva registrada + recomendación')
h4('Flujo principal')
numbered([
    [('Responder a la pregunta previa: ', False), ('¿el niño usa audífonos o implante?', True),
     (' Si la respuesta es No, se salta directo a los ejercicios.', False)],
    [('Si es Sí, para cada uno de los ', False), ('6 sonidos', True),
     (' (m, u, a, i, sh, s), el adulto lo produce ', False), ('tapándose la boca', True),
     (' (sin que el niño lea los labios).', False)],
    [('Marcar la respuesta del niño en la escala de 3: ', False), ('Identifica', True),
     (' (repite/reconoce) · ', False), ('Detecta', True), (' (reacciona) · ', False),
     ('Sin respuesta', True), ('.', False)],
    [('Al terminar, la app muestra el resultado y una recomendación adaptada. Pulsar ', False),
     ('“Comenzar ejercicios”', True), ('.', False)],
])
callout('Por qué estos 6 sonidos',
        [('Cubren el rango del habla, de graves (~250 Hz) a muy agudos (~5 kHz). El sonido ', False),
         ('“s”', True),
         (' es el más difícil de oír; si se detecta, el equipo funciona bien en frecuencias altas.', False)])
figures([('09-ling-pregunta.png', 'Pregunta previa: ¿usa audífonos o implante coclear?'),
         ('10-ling-test.png', 'Sonido en curso: el tutor lo produce y marca la respuesta.'),
         ('11-ling-resultado.png', 'Resultado con recomendación y “Comenzar ejercicios →”.')])

# ---- CU-05 ----
uc_header('CU-05', 'Familia', 'Realizar una sesión de ejercicios')
uc_meta('Tutor + niño/a', 'Reproductor de Ejercicios → Resultados',
        'Terapia iniciada (con o sin Test de Ling)', 'Sesión valorada y guardada en el historial')
h4('Flujo principal')
numbered([
    [('La app presenta cada ejercicio con ', False), ('fichas ilustradas', True),
     (' grandes y coloridas. ', False), ('Toque cualquier imagen para ampliarla', True),
     (' a pantalla completa.', False)],
    [('El adulto guía la actividad y valora la respuesta del niño con la ', False), ('escala EPT-3', True),
     (': ★ emergente, ★★ en proceso, ★★★ consolidado.', False)],
    [('Cada ejercicio ofrece una ', False), ('“versión en movimiento”', True),
     (' para trabajar el mismo objetivo con el cuerpo.', False)],
    [('Entre ejercicios aparecen ', False), ('pausas activas', True),
     (' (saltos de rana, paso robot, equilibrio de flamenco…) para descargar energía.', False)],
    [('Al terminar la sesión se calcula la media y se muestran las ', False), ('recompensas', True),
     (' (XP, racha, nivel, insignias). Ver CU-08.', False)],
])
h4('Flujos alternativos')
bullets([
    [('Sesión perfecta:', True),
     (' si todos los ejercicios obtienen ★★★, se desbloquea la insignia “Sesión estrella”.', False)],
    [('Salir a mitad:', True),
     (' se puede volver atrás; lo valorado hasta ese punto no cuenta como sesión completada.', False)],
])
figures([('12-ejercicio.png', 'Ficha ilustrada: consigna del tutor, imágenes ampliables y versión en movimiento.'),
         ('13-evaluacion-ept3.png', 'Evaluación EPT-3: el adulto toca 1★, 2★ o 3★ según la respuesta.'),
         ('14-sesion-completada.png', 'Fin de sesión: XP, racha, nivel y promedio EPT-3.')])

# ---- CU-06 ----
uc_header('CU-06', 'Familia', 'Ejercicios de lenguaje con voz (TTS, micrófono, TPR)')
uc_meta('Tutor + niño/a', 'Reproductor · pestaña Lenguaje', 'Terapia de Lenguaje prescrita',
        'Ejercicio completado con apoyo de voz')
p('El módulo de Lenguaje añade tres ayudas de voz sobre las 7 terapias (Atención conjunta, Imitación, '
  'Comprensión, Expresión, Comunicación funcional, Regulación conductual e Interacción social):')
data_table(['Función', 'Cómo se usa'], [
    [[('Lectura por voz (TTS)', True)],
     'La app lee en voz alta la palabra o instrucción para que el niño la escuche como modelo.'],
    [[('Juego del micrófono', True)],
     'El niño repite ante el micrófono; el adulto confirma si la producción fue correcta. Refuerza la expresión verbal.'],
    [[('Cápsulas TPR', True)],
     'Vocabulario asociado a acciones físicas (Total Physical Response): oír la palabra y hacer el gesto.'],
], widths=[4.6, 12.4])
callout('Permisos',
        'El juego del micrófono necesita permiso de micrófono; la lectura por voz usa la síntesis del sistema. '
        'Concédalos cuando la app lo solicite.', fill=FILL_WARN, label_color=RGBColor(0xB4, 0x53, 0x09))

# ---- CU-07 ----
uc_header('CU-07', 'Familia', 'Configurar recordatorios diarios')
uc_meta('Tutor o logopeda', 'Prescripción → “Recordatorios de sesión”',
        'Permiso de notificaciones del sistema', 'Avisos en la pantalla de bloqueo')
h4('Flujo principal')
numbered([
    [('En la tarjeta ', False), ('“Recordatorios de sesión”', True), (', activar el interruptor.', False)],
    'Conceder el permiso de notificaciones si el sistema lo pide.',
    [('La app programa hasta ', False), ('4 avisos al día', True), (' —a las ', False),
     ('9:00, 13:00, 17:00 y 20:00', True),
     ('— en la pantalla de bloqueo para no perder la racha.', False)],
])
bullets([
    [('Permiso denegado:', True),
     (' aparece un aviso pidiendo conceder el permiso en los ajustes del sistema.', False)],
    [('Desactivar:', True), (' el mismo interruptor cancela todos los recordatorios.', False)],
])

# ---- CU-08 ----
uc_header('CU-08', 'Familia', 'Motivación: racha, niveles e insignias')
uc_meta('Niño/a (con apoyo del adulto)', 'Fin de sesión · cabecera de Prescripción',
        'Al menos una sesión completada', 'XP, racha y niveles actualizados')
p('Al estilo de apps como Duolingo, Valeria+ recompensa la constancia. Todo se guarda localmente.')
h4('Cómo se gana XP en cada sesión')
bullets([
    [('Base:', True), (' 20 puntos + 5 por ejercicio.', False)],
    [('Precisión:', True), (' hasta +30 según la media de estrellas.', False)],
    [('Racha:', True), (' hasta +14 por días consecutivos.', False)],
    [('Sesión perfecta', True), (' (todo ★★★): +15.', False)],
])
h4('Niveles (cada 100 XP)')
p('Osezno → Oso Curioso → Oso Valiente → Oso Explorador → Oso Sabio → Gran Oso → Oso Legendario.')
h4('Insignias destacadas')
data_table(['Insignia', 'Cómo se consigue'], [
    ['🌱 Primer paso', 'Completar la primera sesión.'],
    ['🔥 En llamas / ⚡ Semana perfecta / 🏆 Imparable', 'Rachas de 3, 7 y 14 días.'],
    ['🎓 Practicante / 🚀 Explorador / 💎 Maestro Valeria', '10, 25 y 50 sesiones completadas.'],
    ['⭐ Sesión estrella / 🌟 Constelación', '1 y 5 sesiones perfectas.'],
], widths=[8.5, 8.5])
callout('Racha viva',
        'La racha se mantiene mientras se practique hoy o ayer. Si se salta más de un día, vuelve a cero: '
        'por eso ayudan los recordatorios de CU-07.', fill=FILL_OK, label_color=RGBColor(0x04, 0x78, 0x57))

# ---- CU-09 ----
uc_header('CU-09', 'Profesional / Familia', 'Consultar el panel de resultados')
uc_meta('Logopeda o tutor', 'Resultados del paciente', 'Historial de sesiones registrado',
        'Visión de la evolución del paciente')
h4('Flujo principal')
numbered([
    [('Abrir el ', False), ('panel de resultados', True),
     (' del paciente al finalizar una sesión o desde su ficha.', False)],
    [('Revisar la ', False), ('evolución', True),
     (': medias por ejercicio, progreso en la escala EPT-3 e historial de sesiones.', False)],
    [('Consultar el ', False), ('estado de gamificación', True),
     (': XP total, racha y nivel actual.', False)],
    'El logopeda usa estos datos para ajustar la prescripción (volver a CU-02) en la siguiente revisión.',
])
callout('Ciclo de mejora',
        'Resultados → decisión clínica → nueva prescripción → nuevas sesiones. El panel cierra el círculo entre '
        'lo que el niño practica en casa y lo que el profesional supervisa.')
figures([('15-resultados.png', 'Panel de resultados: motivación, insignias y adherencia semanal.')])

# ---- CU-10 ----
uc_header('CU-10', 'Profesional', 'Cambiar entre Modo Familia y Modo Profesional')
uc_meta('Logopeda', 'Prescripción de Terapias', 'Conocer el PIN',
        'Edición habilitada o bloqueada según convenga')
h4('Flujo principal')
numbered([
    [('Para ', False), ('entrar', True),
     (' en Modo Profesional: pulsar el candado 🔒, introducir el PIN. El estado pasa a 🔓 '
      '“Modo profesional activo”.', False)],
    'Realizar los cambios de prescripción necesarios.',
    [('Para ', False), ('salir', True), (': pulsar ', False), ('“Guardar Prescripción”', True),
     ('. La edición se bloquea automáticamente y vuelve a Modo Familia.', False)],
])
callout('Buena práctica',
        'Guarde siempre antes de entregar el dispositivo a la familia, para que la prescripción quede protegida '
        'en modo solo lectura.', fill=FILL_WARN, label_color=RGBColor(0xB4, 0x53, 0x09))

# ============================ ANEXO ============================
doc.add_page_break()
kicker('Anexo A')
doc.add_heading('Preguntas frecuentes y resolución de problemas', level=1)
data_table(['Situación', 'Qué hacer'], [
    ['No recuerdo el PIN profesional',
     'El PIN lo define el logopeda. En la demo es 1985. Si se olvida en producción, debe restablecerse desde '
     'la configuración de la app.'],
    ['No aparece el Test de Ling',
     'Es normal: solo se muestra si la patología de la ficha indica audífono o implante coclear (CU-04).'],
    ['La racha volvió a cero',
     'Se perdió porque pasó más de un día sin practicar. Active los recordatorios (CU-07) para evitarlo.'],
    ['No llegan los recordatorios',
     'Conceda a la app el permiso de notificaciones en los ajustes del sistema.'],
    ['El juego del micrófono no oye',
     'Revise el permiso de micrófono y que el dispositivo no esté en silencio.'],
    ['No puedo cambiar los ejercicios',
     'Está en Modo Familia (solo lectura). Desbloquee el Modo Profesional con el PIN (CU-02 / CU-10).'],
    ['¿Se pierden los datos al cerrar la app?',
     'No. Ficha, prescripción, historial y progreso se guardan cifrados en el dispositivo.'],
], widths=[6.0, 11.0])
p('', space_after=4)
p('Valeria+ · Manual de Casos de Uso · v4 (con capturas de pantalla) · Julio de 2026 · Terapia auditivo-verbal '
  'para la infancia. Documento de apoyo para logopedas y familias. Los datos personales se tratan localmente '
  'conforme a RGPD/HIPAA.', size=8.5, color=MUTED)

doc.save(OUT)
print('OK:', OUT, os.path.getsize(OUT), 'bytes · figuras:', FIG_N)
