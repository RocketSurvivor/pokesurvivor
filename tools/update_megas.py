#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Busca megaevoluciones nuevas en SpriteCollab y las mete en el juego.

    python tools/update_megas.py [carpeta de trabajo]     (por defecto ../ext)

1. Baja (con git, sparse y sin historial) lo justo de SpriteCollab (tracker.json,
   credit_names.txt y las carpetas de las formas Mega) y de PokeAPI (el índice y
   los datos de las formas Mega).
2. Ejecuta tools/fetch_megas.py, que rehace js/data/megas.js, los nombres
   traducidos (lang-megas*.js), los sprites y los créditos.
3. Dice qué megas son nuevas respecto a las que ya había. Si no hay ninguna,
   termina con código 3 (para que una tarea programada sepa que no hay nada).
"""
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FORMS = ('Mega', 'Mega_X', 'Mega_Y', 'Mega_Z')


def git(*args, cwd=None):
    subprocess.run(['git', *args], cwd=cwd, check=True)


def sparse(url, dest, paths):
    if not os.path.isdir(os.path.join(dest, '.git')):
        git('clone', '-q', '--depth', '1', '--filter=blob:none', '--sparse', url, dest)
    else:
        git('fetch', '-q', '--depth', '1', 'origin', cwd=dest)
        git('reset', '-q', '--hard', 'FETCH_HEAD', cwd=dest)
    git('sparse-checkout', 'set', '--no-cone', *paths, cwd=dest)


def current():
    path = os.path.join(ROOT, 'js', 'data', 'megas.js')
    if not os.path.exists(path):
        return set()
    return set(re.findall(r'"name":"([^"]+)","base"', open(path, encoding='utf-8').read()))


def main():
    work = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '..', 'ext'))
    os.makedirs(work, exist_ok=True)
    sc, pa = os.path.join(work, 'sc'), os.path.join(work, 'pa')
    before = current()

    print('SpriteCollab: tracker...')
    sparse('https://github.com/PMDCollab/SpriteCollab.git', sc, ['/tracker.json', '/credit_names.txt'])
    tracker = json.load(open(os.path.join(sc, 'tracker.json'), encoding='utf-8'))
    folders = []
    for tag, node in tracker.items():
        for fid, sub in (node.get('subgroups') or {}).items():
            if sub.get('name') in FORMS and 'Idle' in (sub.get('sprite_files') or {}):
                folders.append(f'/sprite/{tag}/{fid}/')
    print(f'SpriteCollab: {len(folders)} formas Mega con sprite')
    sparse('https://github.com/PMDCollab/SpriteCollab.git', sc, ['/tracker.json', '/credit_names.txt'] + folders)

    print('PokeAPI: datos de las megas...')
    sparse('https://github.com/PokeAPI/api-data.git', pa, ['/data/api/v2/pokemon/index.json'])
    idx = json.load(open(os.path.join(pa, 'data/api/v2/pokemon/index.json'), encoding='utf-8'))['results']
    ids = [x['url'].rstrip('/').split('/')[-1] for x in idx if '-mega' in x['name']]
    sparse('https://github.com/PokeAPI/api-data.git', pa,
           ['/data/api/v2/pokemon/index.json'] + [f'/data/api/v2/pokemon/{i}/index.json' for i in ids])

    subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'fetch_megas.py'), sc, pa], check=True)
    new = sorted(current() - before)
    if not new:
        print('\nNo hay megas nuevas.')
        sys.exit(3)
    print('\nMEGAS NUEVAS: ' + ', '.join(new))


if __name__ == '__main__':
    main()
