import sys, json, base64, io, copy
from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / 'public' / 'ACTA-DE-REUNION-REFERENCIA.docx'

def text_of(row):
    return ' '.join(c.text.strip() for c in row.cells if c.text.strip())

def find_row(table, needle, start=0):
    for i in range(start, len(table.rows)):
        if needle.lower() in text_of(table.rows[i]).lower():
            return i
    return -1

def set_cell(cell, text, bold=False, font_size=10):
    cell.text = ''
    lines = str(text or '').split('\n')
    first = cell.paragraphs[0]
    for idx, line in enumerate(lines):
        paragraph = first if idx == 0 else cell.add_paragraph()
        paragraph.paragraph_format.space_before = Pt(0)
        paragraph.paragraph_format.space_after = Pt(2)
        run = paragraph.add_run(line)
        run.font.name = 'Arial'
        run.font.size = Pt(font_size)
        run.bold = bold

def clone_row_before(table, source_idx, before_idx):
    row_xml = copy.deepcopy(table.rows[source_idx]._tr)
    table._tbl.insert(before_idx, row_xml)

def replace_activity_cell(cell, selected):
    labels = ['Asistencia técnica', 'Monitoreo y seguimiento', 'Balance']
    cell.text = ''
    for i, label in enumerate(labels):
        para = cell.paragraphs[0] if i == 0 else cell.add_paragraph()
        para.paragraph_format.space_before = Pt(0)
        para.paragraph_format.space_after = Pt(0)
        run = para.add_run(f'{label}   ( {"X" if label == selected else " "} )')
        run.font.name = 'Arial'; run.font.size = Pt(9)

def replace_modality_cell(cell, selected):
    cell.text = ''
    for i, label in enumerate(['Presencial', 'Virtual']):
        para = cell.paragraphs[0] if i == 0 else cell.add_paragraph()
        para.paragraph_format.space_before = Pt(0); para.paragraph_format.space_after = Pt(0)
        run = para.add_run(f'{label}   ( {"X" if label == selected else " "} )')
        run.font.name = 'Arial'; run.font.size = Pt(9)

def replace_scope_cell(cell, selected):
    cell.text = ''
    para = cell.paragraphs[0]
    para.paragraph_format.space_after = Pt(0)
    run = para.add_run(f'Regional   ( {"X" if selected == "Regional" else " "} )      Local   ( {"X" if selected == "Local" else " "} )')
    run.font.name = 'Arial'; run.font.size = Pt(9)

def add_image(doc, item):
    raw = base64.b64decode(item.get('data', ''))
    if not raw:
        return
    doc.add_page_break()
    heading = item.get('caption') or ('Registro fotográfico de asistencia' if item.get('kind') == 'attendance' else 'Evidencia fotográfica')
    para = doc.add_paragraph()
    para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = para.add_run(heading)
    run.bold = True; run.font.name = 'Arial'; run.font.size = Pt(11)
    para.paragraph_format.space_after = Pt(12)
    stream = io.BytesIO(raw)
    pic = doc.add_picture(stream, width=Inches(6.0 if item.get('kind') == 'attendance' else 5.7))
    doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER


def main():
    payload = json.load(sys.stdin)
    form = payload.get('form', {})
    evidence = payload.get('evidence', [])
    doc = Document(str(TEMPLATE))
    doc.core_properties.title = 'Acta de reunión'
    doc.core_properties.subject = 'Acta institucional generada a partir de un resumen de reunión'
    t0, t1 = doc.tables[0], doc.tables[1]

    # Tabla de datos generales: se conservan los anchos, bordes y estructura del archivo maestro.
    date_value = form.get('date') or ''
    if date_value and len(date_value) == 10 and date_value[4] == '-':
        date_value = f'{date_value[8:10]}/{date_value[5:7]}/{date_value[0:4]}'
    set_cell(t0.cell(0, 1), date_value or 'Pendiente')
    set_cell(t0.cell(0, 3), form.get('startTime') or 'Pendiente')
    replace_activity_cell(t0.cell(1, 1), form.get('activity', 'Asistencia técnica'))
    replace_modality_cell(t0.cell(1, 3), form.get('modality', 'Virtual'))
    replace_scope_cell(t0.cell(2, 1), form.get('scope', 'Local'))
    set_cell(t0.cell(2, 3), form.get('totalParticipants') or 'Pendiente')

    # Tabla de identificación y agenda.
    set_cell(t1.cell(0, 1), form.get('dre') or 'Pendiente')
    set_cell(t1.cell(1, 1), form.get('ugel') or 'Pendiente')
    set_cell(t1.cell(2, 1), form.get('participants') or 'Pendiente')

    agenda_header = find_row(t1, 'Agenda')
    agreement_header = find_row(t1, 'ACUERDOS')
    if agenda_header >= 0 and agreement_header >= 0:
        existing_agenda_rows = list(range(agenda_header + 1, agreement_header))
        agenda = [x.strip() for x in form.get('agenda', []) if str(x).strip()]
        while len(existing_agenda_rows) < len(agenda):
            current_agreement_header = find_row(t1, 'ACUERDOS')
            clone_row_before(t1, existing_agenda_rows[-1] if existing_agenda_rows else agenda_header, current_agreement_header)
            existing_agenda_rows = list(range(agenda_header + 1, find_row(t1, 'ACUERDOS')))
        for idx, row_idx in enumerate(existing_agenda_rows):
            row = t1.rows[row_idx]
            content_cell = row.cells[0]
            set_cell(content_cell, f'{idx + 1}. {agenda[idx]}' if idx < len(agenda) else '')

    # Acuerdos: conserva las filas existentes y clona filas con el mismo formato si hacen falta.
    agreement_header = find_row(t1, 'ACUERDOS')
    comments_header = find_row(t1, 'COMENTARIOS')
    agreements = [a for a in form.get('agreements', []) if str(a.get('text', '')).strip() or str(a.get('deadline', '')).strip()]
    if agreement_header >= 0 and comments_header >= 0:
        body_indices = list(range(agreement_header + 1, comments_header))
        if not body_indices:
            clone_row_before(t1, agreement_header, comments_header)
            comments_header = find_row(t1, 'COMENTARIOS')
            body_indices = list(range(agreement_header + 1, comments_header))
        while len(body_indices) < len(agreements):
            comments_header = find_row(t1, 'COMENTARIOS')
            clone_row_before(t1, body_indices[-1], comments_header)
            comments_header = find_row(t1, 'COMENTARIOS')
            body_indices = list(range(agreement_header + 1, comments_header))
        for i, row_idx in enumerate(body_indices):
            row = t1.rows[row_idx]
            agreement = agreements[i] if i < len(agreements) else {'text': '', 'deadline': ''}
            set_cell(row.cells[0], f'{i + 1}. {agreement.get("text", "")}'.strip())
            set_cell(row.cells[2], agreement.get('deadline') or '')

    comments_header = find_row(t1, 'COMENTARIOS')
    if comments_header >= 0 and comments_header + 1 < len(t1.rows):
        set_cell(t1.rows[comments_header + 1].cells[0], form.get('observations') or '')

    # Actualiza el cierre del documento original sin mover su ubicación.
    for para in doc.paragraphs:
        if 'Siendo las' in para.text and 'concluida la reunión' in para.text:
            para.text = f'Siendo las {form.get("endTime") or "________"}, se da por concluida la reunión. Se adjunta lista de participantes y evidencias fotográficas.'
            for run in para.runs:
                run.font.name = 'Arial'; run.font.size = Pt(9)

    # Primero el registro de asistencia, luego las fotografías, todas al final del acta.
    for item in [e for e in evidence if e.get('kind') == 'attendance'] + [e for e in evidence if e.get('kind') != 'attendance']:
        add_image(doc, item)
    output = io.BytesIO()
    doc.save(output)
    sys.stdout.write(base64.b64encode(output.getvalue()).decode('ascii'))

if __name__ == '__main__':
    main()
