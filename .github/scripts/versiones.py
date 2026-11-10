"""Pone en cada tarjeta de index.html la versión de la última Release de su app.

Las apps son privadas y su /api/version no tiene CORS, así que la página no puede preguntarla:
este script la lee de GitHub (Releases que crea el release.yml de cada app, ESTANDARES §7) y
reescribe el `<span class="app__version">` de cada tarjeta. Sin cambios no toca el archivo.
"""
import json
import os
import re
import sys
import urllib.request

APPS = {
    "OmniStory": "michel_andrade__OMNISTORY",
    "Core": "michel_andrade__CORE",
    "MyHub": "michel_andrade__MYHUB",
    "LifeOS": "michel_andrade__LIFEOS",
    "Comidonga": "michel_andrade__COMIDONGA",
    "Flow": "michel_andrade__FLOW",
    "Brain": "michel_andrade__BRAIN",
    "HomeLab": "michel_andrade__HOMELAB",
}

token = os.environ.get("APPS_TOKEN", "").strip()
if not token:
    print("::notice::Falta el secreto APPS_TOKEN; no se actualizan las versiones.")
    sys.exit(0)


def ultima(repo):
    req = urllib.request.Request(
        f"https://api.github.com/repos/Almlett/{repo}/releases/latest",
        headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as res:
            return json.load(res)["tag_name"].lstrip("v")
    except Exception as err:  # una app sin Release o sin acceso no detiene a las demás
        print(f"::warning::{repo}: {err}")
        return None


html = open("index.html", encoding="utf-8").read()
nuevo = html
for nombre, repo in APPS.items():
    version = ultima(repo)
    if not version:
        continue
    nuevo = re.sub(
        rf'(<span class="app__version" title="Versión de {nombre}">)v[\d.]+(</span>)',
        rf"\g<1>v{version}\g<2>",
        nuevo,
    )

if nuevo != html:
    open("index.html", "w", encoding="utf-8").write(nuevo)
    print("Versiones actualizadas")
else:
    print("Sin cambios")
