# -*- coding: utf-8 -*-
"""Tipa params de los services de Academy por convención de nombres."""
import io, re, os

BASE = r'C:/LEO/EMPRESAS/QAWAY LAB/1-QawayLab-Digital/2-qawaylab-academy/src/lib/services'

STRING_PARAMS = {
    'slug', 'name', 'title', 'email', 'password', 'role', 'action', 'type',
    'status', 'search', 'provider', 'currency', 'channel', 'kind', 'text',
    'notes', 'transcript', 'question', 'explanation', 'description', 'message',
    'videoUrl', 'fileUrl', 'fileName', 'mimeType', 'paymentMethod', 'proofUrl',
    'templateText', 'model', 'prompt', 'content', 'lessonTitle', 'courseSlug',
    'query', 'source', 'fullName', 'avatarUrl', 'category', 'level', 'format',
}
NUMBER_PARAMS = {'limit', 'score', 'amount', 'quantity', 'total', 'currentTime',
                 'duration', 'bytes', 'sortOrder', 'passingScore', 'maxAttempts'}
BOOL_PARAMS = {'activeOnly', 'allowed', 'completed', 'featured', 'isGlobal', 'isFree'}
FUNC_PARAMS = {'onChange'}

def type_for(p: str) -> str | None:
    if p in STRING_PARAMS:
        return 'string'
    if p in NUMBER_PARAMS:
        return 'number'
    if p in BOOL_PARAMS:
        return 'boolean'
    if p in FUNC_PARAMS:
        return '() => void'
    if p == 'file':
        return 'File'
    if p in ('data', 'updates', 'metadata', 'payload', 'options', 'filter', 'filters'):
        return 'Record<string, unknown>'
    if p in ('items', 'answers', 'orderItems', 'segments', 'questions'):
        return 'unknown[]'
    if p.endswith('Id'):
        return 'string'
    if p.endswith('Url') or p.endswith('URL'):
        return 'string'
    if p == 'body':
        return 'Record<string, unknown>'
    return None

def process(path: str):
    with io.open(path, encoding='utf-8-sig') as f:
        src = f.read()
    # No reprocesar archivos que ya tengan anotaciones (: string, : number...)
    if re.search(r'\(\s*[a-zA-Z_$][\w$]*\s*:', src):
        print(f'  (ya tipado parcial) {os.path.basename(path)}')
        return
    # Encuentra firmas: function name(p1, p2 = x, { a, b } = {}) o name: async
    def repl(m):
        fn = m.group(0)
        params_part = m.group(4)
        if not params_part or not params_part.strip():
            return fn
        # Procesar cada param (maneja destructuring simple y defaults)
        out_params = []
        # Split respetando llaves anidadas y strings simples
        parts = split_params(params_part)
        for raw in parts:
            raw = raw.strip()
            if not raw:
                continue
            # Destructuring object: { a, b } = {} o { a }
            dm = re.match(r'^\{([^}]*)\}\s*(=\s*\{\})?$', raw)
            if dm:
                inner = dm.group(1)
                typed_inner = []
                for sub in [s.strip() for s in inner.split(',') if s.strip()]:
                    sname = re.sub(r'\s*:\s*.*$', '', sub).strip()
                    t = type_for(sname)
                    typed_inner.append(f'{sub}{f": {t}" if t else ""}')
                out_params.append('{ ' + ', '.join(typed_inner) + ' }' + (dm.group(2) or ''))
                continue
            # Param simple con default: name = value
            m2 = re.match(r'^([a-zA-Z_$][\w$]*)\s*(=.*)?$', raw)
            if m2:
                pname = m2.group(1)
                t = type_for(pname)
                if t:
                    out_params.append(f'{pname}: {t}{m2.group(2) or ""}')
                else:
                    out_params.append(raw)
                continue
            # Algo complejo (callback, etc.) — dejar igual
            out_params.append(raw)
        return f'{m.group(3)}({", ".join(out_params)})'

    new_src = re.sub(r'(export\s+)?(async\s+)?function\s+([a-zA-Z_$][\w$]*)\s*\(([^)]*)\)', lambda m: repl(m), src, flags=re.S)
    if new_src != src:
        with io.open(path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(new_src)
        print(f'  OK {os.path.basename(path)}')
    else:
        print(f'  sin cambios {os.path.basename(path)}')

def split_params(s: str):
    parts = []
    depth = 0
    cur = ''
    for ch in s:
        if ch in '{(':
            depth += 1
        elif ch in '})':
            depth -= 1
        if ch == ',' and depth == 0:
            parts.append(cur)
            cur = ''
        else:
            cur += ch
    if cur.strip():
        parts.append(cur)
    return parts

for fn in sorted(os.listdir(BASE)):
    if fn.endswith('.ts'):
        process(os.path.join(BASE, fn))
print('LISTO')
