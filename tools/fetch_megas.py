#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Megaevoluciones: baja sus sprites de SpriteCollab y sus datos de PokeAPI y
genera js/data/megas.js (más assets/pokemon/<id>/).

Sólo entran las megas que tienen sprite en SpriteCollab (formas "Mega",
"Mega_X", "Mega_Y" o "Mega_Z" con al menos Idle y Walk). Cada una lleva el
número de PokeAPI de su forma (10034 = Mega-Charizard X...) y apunta a su
Pokémon base con `base`.

    python tools/fetch_megas.py <SpriteCollab> <api-data>

Los dos argumentos son copias locales de los repositorios (bastan sparse
checkouts):
  https://github.com/PMDCollab/SpriteCollab   tracker.json y sprite/<dex>/<forma>/
  https://github.com/PokeAPI/api-data          data/api/v2/pokemon/

Para relanzar cuando SpriteCollab dibuje más megas: actualiza las copias
y vuelve a ejecutarlo.
"""
import io
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_sprites as FS  # noqa: E402  (parseo y guardado de las hojas)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_JS = os.path.join(ROOT, 'js', 'data', 'megas.js')
FORMS = {'Mega': '', 'Mega_X': ' X', 'Mega_Y': ' Y', 'Mega_Z': ' Z'}
# Formas especiales de legendarios (25-10-2026) que se tratan como las megas: se
# coleccionan en el gacha de su región y, en la partida, el legendario se transforma
# en ellas al nivel 40. También son la 2.ª fase de esos legendarios como jefes.
SPECIAL = {
    'Primal': {'only': {382, 383}, 'slug': '-primal',
               'names': lambda b, fr, zs, zt: [b + ' Primigenio', 'Primo-' + fr, b + ' Archeo', b + ' Primitivo', '原始' + zs, '原始' + zt, 'Primal ' + b]},
    'Origin': {'only': {483, 484, 487}, 'slug': '-origin',
               'names': lambda b, fr, zs, zt: [b + ' Origen', fr + ' Forme Originelle', b + ' Forma Originale', b + ' Forma Original', zs + '（起源形态）', zt + '（起源形態）', b + ' (Origin Forme)']},
}
# Formas de PokeAPI que no siguen la regla <nombre>-mega[-x|-y|-z].
SLUG = {978: 'tatsugiri-curly-mega'}
# Habilidades de mega que el juego ya sabe nombrar (data/abilities.js) o que se
# añaden aquí; las demás (nuevas de Leyendas Z-A) usan la primera de su base.
EXTRA_ABIL = {
    'parental-bond': ['Amor Filial', 'Parental Bond', 'Amour Filial', 'Amore Filiale', '亲子爱', '親子愛'],
    'delta-stream': ['Ráfaga Delta', 'Delta Stream', 'Souffle Delta', 'Flusso Delta', '德尔塔气流', '德爾塔氣流'],
}


def write_credits(sc, megas):
    """Rehace la tabla de artistas de las megas en CREDITS.md (licencia CC BY-NC 4.0)."""
    import collections
    names = {}
    cn = os.path.join(sc, 'credit_names.txt')
    if os.path.exists(cn):
        for line in open(cn, encoding='utf-8'):
            p = line.rstrip('\n').split('\t')
            if len(p) >= 2 and p[0] != 'Name':
                names[p[1]] = (p[0], p[2] if len(p) > 2 else '')
    art = collections.defaultdict(set)
    for m in megas:
        for folder in (m['_folder'], os.path.join(m['_folder'], '0001')):
            f = os.path.join(folder, 'credits.txt')
            if os.path.exists(f):
                for line in open(f, encoding='utf-8'):
                    p = line.rstrip('\n').split('\t')
                    if len(p) >= 2:
                        art[p[1]].add(m['name'])
    rows = []
    for who, mons in sorted(art.items(), key=lambda x: names.get(x[0], (x[0], ''))[0].lower()):
        nm, contact = names.get(who, (who, ''))
        if nm == who and who.startswith('<@'):
            nm, contact = 'Anónimo', who
        rows.append(f'| {nm} | {contact} | {", ".join(sorted(mons))} |')
    block = ('### Megaevoluciones\n\nSprites de las megaevoluciones (`tools/fetch_megas.py`), también de SpriteCollab (CC BY-NC 4.0).\n\n'
             '| Artista | Contacto | Megaevoluciones |\n|---|---|---|\n' + '\n'.join(rows) + '\n')
    path = os.path.join(ROOT, 'CREDITS.md')
    s = open(path, encoding='utf-8').read()
    i = s.find('### Megaevoluciones')
    j = s.index('\n## Datos')
    s = (s[:i] if i >= 0 else s[:j].rstrip() + '\n\n') + block + s[j:]
    open(path, 'w', encoding='utf-8').write(s)


def main():
    sc, pa = sys.argv[1], sys.argv[2]
    tracker = json.load(open(os.path.join(sc, 'tracker.json'), encoding='utf-8'))
    pidx = {x['name']: int(x['url'].rstrip('/').split('/')[-1])
            for x in json.load(open(os.path.join(pa, 'data/api/v2/pokemon/index.json')))['results']}

    dex_src = open(os.path.join(ROOT, 'js/data/pokedex.js'), encoding='utf-8').read()
    DEX = {}
    for m in re.finditer(r'\{"dex":(\d+),.*?\}(?=,\n)', dex_src):
        p = json.loads(m.group(0))
        DEX[p['dex']] = p
    abil_src = open(os.path.join(ROOT, 'js/data/abilities.js'), encoding='utf-8').read()
    known_abil = set(re.findall(r'^  "([a-z0-9-]+)":\[', abil_src, re.M))
    base_abil = {int(d): json.loads('[' + a + ']') for d, a in re.findall(r'^  (\d+):\[(.*?)\]', abil_src, re.M)}
    meta_src = open(os.path.join(ROOT, 'js/data/sprites-meta.js'), encoding='utf-8').read()
    base_meta = {int(d): json.loads(j) for d, j in re.findall(r'^  (\d+): (\{.*\}),$', meta_src, re.M)}

    # Diccionarios de nombres de otros idiomas (para "Méga-Dracaufeu", "超级喷火龙"...).
    def names(path):
        txt = open(os.path.join(ROOT, path), encoding='utf-8').read()
        return dict(re.findall(r'^\s*"([^"]+)":\s*"([^"]+)",?$', txt, re.M))
    fr, zhs, zht = names('js/data/lang-fr.js'), names('js/data/lang-zh-cn-names.js'), names('js/data/lang-zh-hant-names.js')

    megas, metas, abil, langs = [], {}, {}, []
    for tag, node in sorted(tracker.items()):
        dex = int(tag) if tag.isdigit() else 0
        if dex not in DEX:
            continue
        for fid, sub in sorted((node.get('subgroups') or {}).items()):
            kind = sub.get('name', '')
            spec = SPECIAL.get(kind)
            if kind not in FORMS and not (spec and dex in spec['only']):
                continue
            files = set((sub.get('sprite_files') or {}).keys())
            if 'Idle' not in files:
                continue
            base = DEX[dex]
            if spec:
                slug = re.sub(r'[^a-z0-9]+', '-', base['name'].lower()).strip('-') + spec['slug']
            else:
                slug = SLUG.get(dex) or re.sub(r'[^a-z0-9]+', '-', base['name'].lower()).strip('-') + '-mega' + FORMS[kind].strip().lower().replace('x', '-x').replace('y', '-y').replace('z', '-z')
            pid = pidx.get(slug)
            if not pid:
                print(f'  ! sin datos en PokeAPI: {slug}')
                continue
            pk = json.load(open(os.path.join(pa, f'data/api/v2/pokemon/{pid}/index.json'), encoding='utf-8'))
            st = {s['stat']['name']: s['base_stat'] for s in pk['stats']}

            # --- sprites (normal y shiny), con el mismo proceso que fetch_sprites ---
            folder = os.path.join(sc, 'sprite', tag, fid)
            FS.fetch = lambda url, retries=0: (open(url, 'rb').read() if os.path.exists(url) else None)
            xml = FS.fetch(os.path.join(folder, 'AnimData.xml'))
            if not xml:
                print(f'  ! sin AnimData: {tag}/{fid}')
                continue
            anims, shadow = FS.parse_animdata(xml.decode('utf-8', 'replace'))
            out_dir = os.path.join(FS.OUT_ASSETS, str(pid))
            normal = FS.download_set(folder, out_dir, anims)
            if not {'Idle', 'Walk'} <= set(normal):
                print(f'  ! sprite incompleto: {tag}/{fid}')
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
                meta['hv'] = 1                      # flota como su base
            metas[pid] = meta

            # --- datos de juego, con las fórmulas de fetch_pokedex.py ---
            if spec:
                nm = spec['names'](base['name'], fr.get(base['name'], base['name']), zhs.get(base['name'], base['name']), zht.get(base['name'], base['name']))
                name_es, name_en = nm[0], nm[6]
                langs.append(nm)
            else:
                name_en = 'Mega ' + base['name'] + FORMS[kind]
                name_es = 'Mega-' + base['name'] + FORMS[kind]
                wide = FORMS[kind].replace('X', 'Ｘ').replace('Y', 'Ｙ').replace('Z', 'Ｚ').strip()
                langs.append([name_es,
                              'Méga-' + fr.get(base['name'], base['name']) + FORMS[kind],
                              name_en, name_en,
                              '超级' + zhs.get(base['name'], base['name']) + wide,
                              '超級' + zht.get(base['name'], base['name']) + wide,
                              name_en])
            bst = sum(st.values())
            megas.append({
                'dex': pid, 'name': name_es, 'base': dex, 'mega': True,
                'types': [t['type']['name'] for t in pk['types']],
                'hp': round(70 + st['hp'] * 0.45), 'spd': round(78 + st['speed'] * 0.42),
                'atk': round(0.70 + max(st['attack'], st['special-attack']) / 100 * 0.55, 2),
                'pa': round(0.70 + st['attack'] / 100 * 0.55, 2), 'sa': round(0.70 + st['special-attack'] / 100 * 0.55, 2),
                'df': st['defense'], 'sd': st['special-defense'],
                'rarity': 5, 'bst': bst, 'starter': False, 'gen': base['gen'], '_folder': folder,
            })
            ab = [a['ability']['name'] for a in pk['abilities']]
            ok = [a for a in ab if a in known_abil or a in EXTRA_ABIL]
            first = ok[0] if ok else (base_abil.get(dex) or [''])[0]
            abil[pid] = [first, 0, 0]
            print(f'  {name_es:28s} #{pid}  {"/".join(megas[-1]["types"]):16s} BST {bst}  {first}'
                  f'{"  shiny" if meta.get("sh") else ""}')

    megas.sort(key=lambda p: (p['base'], p['dex']))
    L = [
        '/* ============ megas.js — GENERADO, no editar a mano ============',
        ' * Lo produce tools/fetch_megas.py (sprites de SpriteCollab, datos de PokeAPI).',
        ' * Las megaevoluciones son Pokémon de la colección: salen sólo en el gacha',
        ' * (rareza 5, en el banner de la región de su Pokémon base). No salen como',
        ' * enemigos, jefes ni legendarios de grieta. `dex` es el número de su forma',
        ' * en PokeAPI y `base`, el de su Pokémon; en la colección se ordenan y se',
        ' * numeran como su base. Aprenden las MT de su base.',
        ' */',
        'G.MEGAS = [',
    ]
    L += ['  ' + json.dumps({k: v for k, v in p.items() if not k.startswith('_')}, ensure_ascii=False, separators=(',', ':')) + ',' for p in megas]
    L += ['];', '', 'Object.assign(G.SPRITE_META, {']
    L += [f'  {d}: {json.dumps(metas[d], separators=(",", ":"))},' for d in sorted(metas)]
    L += ['});', '', 'if (G.DEX_ABIL) Object.assign(G.DEX_ABIL, {']
    L += [f'  {d}:{json.dumps(abil[d])},' for d in sorted(abil)]
    L += ['});', '', 'if (G.ABIL) Object.assign(G.ABIL, {']
    L += [f'  "{k}":{json.dumps(v, ensure_ascii=False)},' for k, v in EXTRA_ABIL.items()]
    L += ['});', '',
          '// Dentro de la Pokédex, cada mega justo detrás de su Pokémon base.',
          'for (const m of G.MEGAS) {',
          '  const i = G.DEX.findIndex(p => p.dex === m.base);',
          '  let j = i + 1;',
          '  while (j < G.DEX.length && G.DEX[j].mega && G.DEX[j].base === m.base) j++;',
          '  G.DEX.splice(i < 0 ? G.DEX.length : j, 0, m);',
          '  G.DEX_BY[m.dex] = m;',
          '}',
          '/** Número de Pokédex que se enseña (las megas, el de su base). */',
          'G.dexNo = p => (p && (p.mega || p.form) ? p.base : p ? p.dex : 0);',
          '/** Orden en la colección: cada mega justo detrás de su base. */',
          'G.dexOrder = p => (p.mega || p.form ? p.base + (p.form ? 0.7 : 0.5) + (p.dex % 1000) / 1e6 : p.dex);',
          '// Las MT: las de su Pokémon base.',
          'if (G.TM_OF) {',
          '  const of = G.TM_OF;',
          '  G.TM_OF = dex => { const p = G.DEX_BY[dex]; return of(p && (p.mega || p.form) ? p.base : dex); };',
          '}',
          '']
    with io.open(OUT_JS, 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(L))
    # Nombres: el inglés va en el juego (lang-megas.js) y los otros cinco, en
    # lang-megas-i18n.js (tools/build_langs.js los reparte por idioma).
    langs.sort()
    head = ['/* ============ GENERADO por tools/fetch_megas.py: no editar a mano ============',
            ' * Nombres de las megaevoluciones (clave en español). */']
    en = {r[0]: r[6] for r in langs}
    with io.open(os.path.join(ROOT, 'js', 'data', 'lang-megas.js'), 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(head) + '\nG.I18n.add(' + json.dumps(en, ensure_ascii=False, indent=1) + ', \'en\');\n')
    with io.open(os.path.join(ROOT, 'js', 'data', 'lang-megas-i18n.js'), 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(head) + '\n')
        for i, lang in enumerate(['fr', 'it', 'pt-BR', 'zh-Hans', 'zh-Hant']):
            f.write('G.I18n.add(' + json.dumps({r[0]: r[i + 1] for r in langs}, ensure_ascii=False, indent=1) + ', \'' + lang + '\');\n')
    write_credits(sc, megas)
    print(f'\n{len(megas)} megaevoluciones ({sum(1 for m in metas.values() if m.get("sh"))} con shiny) -> {OUT_JS}')


if __name__ == '__main__':
    main()
