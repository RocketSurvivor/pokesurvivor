#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genera js/data/evos.js: qué evoluciona en qué (sólo Pokémon que hay en el juego).

    python tools/fetch_evos.py <api-data>

<api-data> es una copia local de https://github.com/PokeAPI/api-data (basta un
sparse checkout de data/api/v2/pokemon-species/). Se usa evolves_from_species.
"""
import io
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    pa = sys.argv[1]
    src = open(os.path.join(ROOT, 'js/data/pokedex.js'), encoding='utf-8').read()
    dex = {int(m.group(1)) for m in re.finditer(r'\{"dex":(\d+),', src)}
    nxt = {}
    for d in sorted(dex):
        f = os.path.join(pa, f'data/api/v2/pokemon-species/{d}/index.json')
        if not os.path.exists(f):
            continue
        frm = json.load(open(f, encoding='utf-8')).get('evolves_from_species')
        if frm:
            fd = int(frm['url'].rstrip('/').split('/')[-1])
            if fd in dex:
                nxt.setdefault(fd, []).append(d)
    L = ['/* ============ evos.js — GENERADO por tools/fetch_evos.py, no editar a mano ============',
         ' * G.EVOS[dex] = [en qué puede evolucionar] (datos de PokeAPI; sólo Pokémon',
         ' * que hay en el juego). Lo usa la evolución durante la partida (entities/player.js).',
         ' */',
         'G.EVOS = {']
    L += [f'  {k}: {json.dumps(sorted(v))},' for k, v in sorted(nxt.items())]
    L += ['};', '']
    with io.open(os.path.join(ROOT, 'js/data/evos.js'), 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(L))
    print(f'{len(nxt)} Pokémon con evolución -> js/data/evos.js')


if __name__ == '__main__':
    main()
