#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Formas regionales y alternativas como Pokémon propios (25-10-2026): baja sus
sprites de SpriteCollab y sus datos de PokeAPI y genera js/data/forms.js,
js/data/lang-forms.js y js/data/lang-forms-i18n.js (más assets/pokemon/<id>/).

Entran las formas que:
  - tienen sprite en SpriteCollab (con Idle y Walk),
  - son un Pokémon propio en PokeAPI (vulpix-alola, rotom-heat, deoxys-attack...),
  - y cambian algo de verdad: tipos o estadísticas distintos de su forma base
    (las que sólo cambian de color o de ropa, como Pikachu Libre, no entran).
Las megas, Primigenios y formas Origen van aparte (tools/fetch_megas.py).

    python tools/fetch_forms.py <SpriteCollab> <api-data> <forms_keep.json>

forms_keep.json: [[dex, carpeta de SpriteCollab, nombre de la forma, slug de PokeAPI, id de PokeAPI], ...]
(la lista que salió de cruzar tracker.json con el índice de PokeAPI).

Gacha: las regionales salen en el banner de su región (Alola 7, Galar 8,
Hisui 4 —la antigua Sinnoh—, Paldea 9); las demás, en el de su Pokémon base.
Misma rareza que su base. Son Pokémon normales: también salen como enemigos
(y los legendarios, en las grietas). Aprenden las MT de su base y evolucionan
como ella si la forma siguiente existe (Vulpix de Alola -> Ninetales de Alola).
"""
import io
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_sprites as FS  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REGION = {'Alola': (7, 'Alola'), 'Galar': (8, 'Galar'), 'Hisui': (4, 'Hisui'), 'Paldea': (9, 'Paldea')}


def write_credits(sc, forms):
    """Tabla de artistas de las formas en CREDITS.md (licencia CC BY-NC 4.0)."""
    import collections
    names = {}
    cn = os.path.join(sc, 'credit_names.txt')
    if os.path.exists(cn):
        for line in open(cn, encoding='utf-8'):
            p = line.rstrip('\n').split('\t')
            if len(p) >= 2 and p[0] != 'Name':
                names[p[1]] = (p[0], p[2] if len(p) > 2 else '')
    art = collections.defaultdict(set)
    for name, folder in forms:
        for fd in (folder, os.path.join(folder, '0001')):
            f = os.path.join(fd, 'credits.txt')
            if os.path.exists(f):
                for line in open(f, encoding='utf-8'):
                    p = line.rstrip('\n').split('\t')
                    if len(p) >= 2:
                        art[p[1]].add(name)
    rows = []
    for who, mons in sorted(art.items(), key=lambda x: names.get(x[0], (x[0], ''))[0].lower()):
        nm, contact = names.get(who, (who, ''))
        if nm == who and who.startswith('<@'):
            nm, contact = 'Anónimo', who
        rows.append(f'| {nm} | {contact} | {", ".join(sorted(mons))} |')
    block = ('### Formas regionales y alternativas\n\nSprites de las formas regionales y alternativas (`tools/fetch_forms.py`), también de SpriteCollab (CC BY-NC 4.0).\n\n'
             '| Artista | Contacto | Formas |\n|---|---|---|\n' + '\n'.join(rows) + '\n')
    path = os.path.join(ROOT, 'CREDITS.md')
    s = open(path, encoding='utf-8').read()
    i = s.find('### Formas regionales y alternativas')
    j = s.index('\n## Datos')
    s = (s[:i] if i >= 0 else s[:j].rstrip() + '\n\n') + block + s[j:]
    open(path, 'w', encoding='utf-8').write(s)


def main():
    sc, pa, keep_f = sys.argv[1], sys.argv[2], sys.argv[3]
    keep = json.load(open(keep_f))
    dex_src = open(os.path.join(ROOT, 'js/data/pokedex.js'), encoding='utf-8').read()
    DEX = {}
    for m in re.finditer(r'\{"dex":(\d+),.*?\}(?=,\n)', dex_src):
        p = json.loads(m.group(0))
        DEX[p['dex']] = p
    evo_src = open(os.path.join(ROOT, 'js/data/evos.js'), encoding='utf-8').read()
    EVOS = {int(a): json.loads(b) for a, b in re.findall(r'^  (\d+): (\[.*?\]),?$', evo_src, re.M)}
    abil_src = open(os.path.join(ROOT, 'js/data/abilities.js'), encoding='utf-8').read()
    known_abil = set(re.findall(r'^  "([a-z0-9-]+)":\[', abil_src, re.M))
    base_abil = {int(d): json.loads('[' + a + ']') for d, a in re.findall(r'^  (\d+):\[(.*?)\]', abil_src, re.M)}
    meta_src = open(os.path.join(ROOT, 'js/data/sprites-meta.js'), encoding='utf-8').read()
    base_meta = {int(d): json.loads(j) for d, j in re.findall(r'^  (\d+): (\{.*\}),$', meta_src, re.M)}

    def names(path):
        txt = open(os.path.join(ROOT, path), encoding='utf-8').read()
        return dict(re.findall(r'^\s*"([^"]+)":\s*"([^"]+)",?$', txt, re.M))
    fr, zhs, zht = names('js/data/lang-fr.js'), names('js/data/lang-zh-cn-names.js'), names('js/data/lang-zh-hant-names.js')

    out, metas, abil, langs, cred = [], {}, {}, [], []
    kind_of = {}
    for dex, fid, kind, slug, pid in keep:
        base = DEX.get(dex)
        if not base:
            continue
        pk = json.load(open(os.path.join(pa, f'data/api/v2/pokemon/{pid}/index.json'), encoding='utf-8'))
        st = {s['stat']['name']: s['base_stat'] for s in pk['stats']}
        folder = os.path.join(sc, 'sprite', f'{dex:04d}', fid)
        FS.fetch = lambda url, retries=0: (open(url, 'rb').read() if os.path.exists(url) else None)
        xml = FS.fetch(os.path.join(folder, 'AnimData.xml'))
        if not xml:
            print(f'  ! sin AnimData: {dex}/{fid}')
            continue
        anims, shadow = FS.parse_animdata(xml.decode('utf-8', 'replace'))
        out_dir = os.path.join(FS.OUT_ASSETS, str(pid))
        normal = FS.download_set(folder, out_dir, anims)
        if not {'Idle', 'Walk'} <= set(normal):
            print(f'  ! sprite incompleto: {dex}/{fid}')
            continue
        meta = {'s': shadow, 'a': normal}
        sfold = os.path.join(folder, '0001')
        sxml = FS.fetch(os.path.join(sfold, 'AnimData.xml'))
        if os.path.isdir(sfold):
            sanims = FS.parse_animdata(sxml.decode('utf-8', 'replace'))[0] if sxml else anims
            shiny = FS.download_set(sfold, os.path.join(out_dir, 's'), sanims, normal)
            if 'Idle' in shiny and 'Walk' in shiny:
                meta['sh'] = 1
                diff = {k: v for k, v in shiny.items() if normal.get(k) != v}
                if diff:
                    meta['sa'] = diff
                miss = [k for k in normal if k not in shiny]
                if miss:
                    meta['sm'] = miss
        if base_meta.get(dex, {}).get('hv'):
            meta['hv'] = 1
        metas[pid] = meta

        # --- nombres (clave en español) ---
        fu = pk['forms'][0]['url'].rstrip('/').split('/')[-1]
        pf = json.load(open(os.path.join(pa, f'data/api/v2/pokemon-form/{fu}/index.json'), encoding='utf-8'))
        nm = {n['language']['name']: n['name'] for n in pf.get('names', [])}
        fn = {n['language']['name']: n['name'] for n in pf.get('form_names', [])}
        b = base['name']
        reg = next((r for r in REGION if kind.startswith(r)), None)
        if reg and kind == reg:
            es = f'{b} de {REGION[reg][1]}'
        else:
            fes = fn.get("es") or fn.get("en") or kind.replace("_", " ")
            # (Si la forma ya lleva el nombre, como "Hoopa Desatado", va sola.)
            es = fes if b.lower() in fes.lower() else f'{b} ({fes})'
        en = nm.get('en') or f'{b} ({fn.get("en") or kind})'
        frn = nm.get('fr') or f'{fr.get(b, b)} ({fn.get("fr") or fn.get("en") or kind})'
        itn = f'{b} ({fn.get("it") or fn.get("en") or kind})' if not (reg and kind == reg) else f'{b} di {REGION[reg][1]}'
        ptn = f'{b} ({fn.get("en") or kind})' if not (reg and kind == reg) else f'{b} de {REGION[reg][1]}'
        zs = f'{zhs.get(b, b)}（{fn.get("zh-hans") or fn.get("zh-hant") or fn.get("en") or kind}）'
        zt = f'{zht.get(b, b)}（{fn.get("zh-hant") or fn.get("zh-hans") or fn.get("en") or kind}）'
        langs.append([es, frn, itn, ptn, zs, zt, en])

        bst = sum(st.values())
        p = {
            'dex': pid, 'name': es, 'base': dex, 'form': True,
            'types': [t['type']['name'] for t in pk['types']],
            'hp': round(70 + st['hp'] * 0.45), 'spd': round(78 + st['speed'] * 0.42),
            'atk': round(0.70 + max(st['attack'], st['special-attack']) / 100 * 0.55, 2),
            'pa': round(0.70 + st['attack'] / 100 * 0.55, 2), 'sa': round(0.70 + st['special-attack'] / 100 * 0.55, 2),
            'df': st['defense'], 'sd': st['special-defense'],
            'rarity': base['rarity'], 'bst': bst, 'starter': False,
            'gen': REGION[reg][0] if reg else base['gen'],
        }
        if base.get('leg'):
            p['leg'] = True
        out.append(p)
        cred.append((es, folder))
        kind_of[pid] = (dex, kind)
        ab = [a['ability']['name'] for a in pk['abilities']]
        ok = [a for a in ab if a in known_abil]
        abil[pid] = [ok[0] if ok else (base_abil.get(dex) or [''])[0], 0, 0]
        print(f'  {es:40s} #{pid}  {"/".join(p["types"]):18s} BST {bst}  gen {p["gen"]}{"  shiny" if meta.get("sh") else ""}')

    # Evoluciones: la forma de la evolución de su base con el mismo nombre de forma.
    by_base_kind = {(d, k): pid for pid, (d, k) in kind_of.items()}
    evos = {}
    for pid, (d, k) in kind_of.items():
        nxt = [by_base_kind[(t, k)] for t in EVOS.get(d, []) if (t, k) in by_base_kind]
        if nxt:
            evos[pid] = nxt

    out.sort(key=lambda p: (p['base'], p['dex']))
    L = [
        '/* ============ forms.js — GENERADO por tools/fetch_forms.py, no editar a mano ============',
        ' * Formas regionales y alternativas como Pokémon propios (sprites de SpriteCollab,',
        ' * datos de PokeAPI). `dex` es su número en PokeAPI y `base`, el de su Pokémon;',
        ' * en la colección van justo detrás de su base y con su número. Salen en el gacha',
        ' * (las regionales, en el banner de su región), como enemigos y, las legendarias,',
        ' * en las grietas. Aprenden las MT de su base.',
        ' */',
        'G.FORMS = [',
    ]
    L += ['  ' + json.dumps(p, ensure_ascii=False, separators=(',', ':')) + ',' for p in out]
    L += ['];', '', 'Object.assign(G.SPRITE_META, {']
    L += [f'  {d}: {json.dumps(metas[d], separators=(",", ":"))},' for d in sorted(metas)]
    L += ['});', '', 'if (G.DEX_ABIL) Object.assign(G.DEX_ABIL, {']
    L += [f'  {d}:{json.dumps(abil[d])},' for d in sorted(abil)]
    L += ['});', '', '// Evoluciones de las formas (Vulpix de Alola -> Ninetales de Alola...).', 'if (G.EVOS) Object.assign(G.EVOS, {']
    L += [f'  {d}: {json.dumps(evos[d])},' for d in sorted(evos)]
    L += ['});', '',
          '// Dentro de la Pokédex, cada forma justo detrás de su Pokémon base (y de sus megas).',
          'for (const f of G.FORMS) {',
          '  const i = G.DEX.findIndex(p => p.dex === f.base);',
          '  let j = i + 1;',
          '  while (j < G.DEX.length && (G.DEX[j].mega || G.DEX[j].form) && G.DEX[j].base === f.base) j++;',
          '  G.DEX.splice(i < 0 ? G.DEX.length : j, 0, f);',
          '  G.DEX_BY[f.dex] = f;',
          '}',
          '']
    with io.open(os.path.join(ROOT, 'js', 'data', 'forms.js'), 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(L))
    langs.sort()
    head = ['/* ============ GENERADO por tools/fetch_forms.py: no editar a mano ============',
            ' * Nombres de las formas regionales y alternativas (clave en español). */']
    with io.open(os.path.join(ROOT, 'js', 'data', 'lang-forms.js'), 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(head) + '\nG.I18n.add(' + json.dumps({r[0]: r[6] for r in langs}, ensure_ascii=False, indent=1) + ', \'en\');\n')
    with io.open(os.path.join(ROOT, 'js', 'data', 'lang-forms-i18n.js'), 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(head) + '\n')
        for i, lang in enumerate(['fr', 'it', 'pt-BR', 'zh-Hans', 'zh-Hant']):
            f.write('G.I18n.add(' + json.dumps({r[0]: r[i + 1] for r in langs}, ensure_ascii=False, indent=1) + ', \'' + lang + '\');\n')
    write_credits(sc, cred)
    print(f'\n{len(out)} formas ({sum(1 for m in metas.values() if m.get("sh"))} con shiny), {len(evos)} con evolución')


if __name__ == '__main__':
    main()
