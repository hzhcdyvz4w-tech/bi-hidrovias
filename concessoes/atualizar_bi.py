#!/usr/bin/env python3
"""Rotina segura: candidatos -> comparação -> fila de validação. Não publica automaticamente."""
from pathlib import Path
import json,csv,datetime,shutil
ROOT=Path(__file__).resolve().parent
BASE=ROOT/"public"/"dados_concessoes.json"
CAND=ROOT/"candidatos.json"
QUEUE=ROOT/"fila_validacao.csv"
def load(path): return json.loads(path.read_text(encoding="utf-8"))
def index_projects(base): return {p["id"]:p for p in base.get("projetos",[])}
def compare():
    if not CAND.exists():
        print("Sem candidatos.json. Nenhuma alteração proposta."); return
    b=index_projects(load(BASE)); c=index_projects(load(CAND)); rows=[]
    for pid,new in c.items():
        old=b.get(pid,{})
        for field,val in new.items():
            if field=="id" or field.startswith("_"): continue
            if old.get(field)!=val:
                rows.append([datetime.date.today().isoformat(),pid,field,old.get(field,""),val,new.get("_fonte",""),new.get("_tipo_evidencia",""),"PENDENTE","Requer validação antes da publicação"])
    if rows:
        with QUEUE.open("a",newline="",encoding="utf-8-sig") as f: csv.writer(f,delimiter=";").writerows(rows)
    print(f"{len(rows)} alteração(ões) candidata(s) enviada(s) para validação.")
def export_snapshot():
    stamp=datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    shutil.copy2(BASE,ROOT/f"snapshot_dados_{stamp}.json")
if __name__=="__main__":
    export_snapshot(); compare()
