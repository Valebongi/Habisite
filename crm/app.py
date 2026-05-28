from flask import Flask, request, jsonify, render_template_string
import json, os, requests
from datetime import datetime, timezone, timedelta

ARG = timezone(timedelta(hours=-3))

app = Flask(__name__)

PHONE_ID     = "1201069343078916"
ACCESS_TOKEN = "EAAL3LD65H8IBRrDcQrM1l1ZBbLrSAZB3LQUBZCMGGehFHJZAKwgNCyrI2UsEu2bFWyLO2rd3G6EkMNdI2oX834yCmTGASmaadu5scqH1ZBxzHjVKnkEZBvEbfF1luUmRKxop5YIOwKtRtuX3ZCcXFMVYOKZBuZC0UgUT5JIIkJlX15DGo6dO8yJLyVUEOwmGUZCmsLCoRtUjk5g46pkPzcD3gtboLwasJiqDZC7xtfvGBkpxrITzEKmZCu8uX340rVj4DxcEP4LwmmvwIzLANhw6ov535wZDZD"
VERIFY_TOKEN = "habisite_crm_2026"
DB_FILE      = "/app/crm/mensajes.json"

WA_URL = f"https://graph.facebook.com/v21.0/{PHONE_ID}/messages"
WA_HEADERS = {"Authorization": f"Bearer {ACCESS_TOKEN}", "Content-Type": "application/json"}

# ── DB simple en JSON ──────────────────────────────────────────
def cargar_db():
    if os.path.exists(DB_FILE):
        with open(DB_FILE, encoding="utf-8") as f:
            return json.load(f)
    return {}

def guardar_db(db):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)

def agregar_mensaje(numero, texto, direccion, nombre=None):
    db = cargar_db()
    if numero not in db:
        db[numero] = {"nombre": nombre or numero, "mensajes": []}
    if nombre and db[numero]["nombre"] == numero:
        db[numero]["nombre"] = nombre
    db[numero]["mensajes"].append({
        "texto": texto,
        "dir": direccion,  # "in" o "out"
        "hora": datetime.now(ARG).isoformat()
    })
    guardar_db(db)

# ── Webhook Meta ───────────────────────────────────────────────
@app.route("/webhook", methods=["GET"])
def webhook_verify():
    if request.args.get("hub.verify_token") == VERIFY_TOKEN:
        return request.args.get("hub.challenge", "")
    return "forbidden", 403

@app.route("/webhook", methods=["POST"])
def webhook_receive():
    data = request.json
    try:
        for entry in data.get("entry", []):
            for change in entry.get("changes", []):
                val = change.get("value", {})
                messages = val.get("messages", [])
                contacts = val.get("contacts", [])
                nombre = contacts[0]["profile"]["name"] if contacts else None
                for msg in messages:
                    numero = msg.get("from")
                    texto = msg.get("text", {}).get("body", "[multimedia]")
                    agregar_mensaje(numero, texto, "in", nombre)
    except Exception as e:
        print(f"Error webhook: {e}")
    return "ok", 200

# ── API enviar ─────────────────────────────────────────────────
@app.route("/enviar", methods=["POST"])
def enviar():
    data = request.json
    numero = data.get("numero")
    texto  = data.get("texto")

    r = requests.post(WA_URL, headers=WA_HEADERS, json={
        "messaging_product": "whatsapp",
        "to": numero,
        "type": "text",
        "text": {"body": texto}
    })

    agregar_mensaje(numero, texto, "out")  # guardar siempre para que aparezca en UI
    if r.status_code == 200:
        return jsonify({"ok": True})
    return jsonify({"ok": False, "error": r.json(), "guardado": True}), 400

# ── API importar (desde log_envios.json local) ─────────────────
@app.route("/importar", methods=["POST"])
def importar():
    data   = request.json
    numero = data.get("numero")
    texto  = data.get("texto")
    dir_   = data.get("dir", "out")
    hora   = data.get("hora")
    db = cargar_db()
    if numero not in db:
        db[numero] = {"nombre": numero, "mensajes": []}
    # No duplicar si ya existe
    existe = any(m["texto"] == texto and m["hora"] == hora for m in db[numero]["mensajes"])
    if not existe:
        db[numero]["mensajes"].append({"texto": texto, "dir": dir_, "hora": hora})
    guardar_db(db)
    return jsonify({"ok": True})

# ── API conversaciones ─────────────────────────────────────────
@app.route("/conversaciones")
def conversaciones():
    return jsonify(cargar_db())

# ── UI ─────────────────────────────────────────────────────────
HTML = """
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Habisite CRM</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, sans-serif; }
  body { display: flex; height: 100vh; background: #f0f2f5; }

  /* Sidebar */
  #sidebar { width: 320px; background: #fff; border-right: 1px solid #e0e0e0; display: flex; flex-direction: column; }
  #sidebar-header { padding: 16px; background: #075e54; color: #fff; font-size: 18px; font-weight: 600; }
  #search { padding: 8px 12px; border: none; border-bottom: 1px solid #e0e0e0; width: 100%; font-size: 14px; outline: none; }
  #lista { flex: 1; overflow-y: auto; }
  .contacto { padding: 14px 16px; border-bottom: 1px solid #f0f0f0; cursor: pointer; display: flex; align-items: center; gap: 12px; }
  .contacto:hover, .contacto.activo { background: #f0f2f5; }
  .avatar { width: 46px; height: 46px; border-radius: 50%; background: #25d366; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 18px; flex-shrink: 0; }
  .contacto-info { flex: 1; min-width: 0; }
  .contacto-nombre { font-weight: 600; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .contacto-ultimo { font-size: 13px; color: #667; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  /* Chat */
  #chat { flex: 1; display: flex; flex-direction: column; }
  #chat-header { padding: 14px 20px; background: #075e54; color: #fff; font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 12px; }
  #chat-header .avatar { width: 38px; height: 38px; font-size: 15px; }
  #mensajes { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 8px; background: #e5ddd5; }
  .burbuja { max-width: 65%; padding: 8px 12px; border-radius: 8px; font-size: 14px; line-height: 1.4; position: relative; }
  .burbuja .hora { font-size: 11px; color: #999; text-align: right; margin-top: 4px; }
  .in { background: #fff; align-self: flex-start; border-top-left-radius: 0; }
  .out { background: #dcf8c6; align-self: flex-end; border-top-right-radius: 0; }
  #input-area { padding: 12px 16px; background: #f0f2f5; display: flex; gap: 10px; }
  #input-texto { flex: 1; padding: 10px 16px; border-radius: 24px; border: none; outline: none; font-size: 15px; }
  #btn-send { background: #075e54; color: #fff; border: none; border-radius: 50%; width: 44px; height: 44px; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; }
  #btn-send:hover { background: #128c7e; }
  #placeholder { flex: 1; display: flex; align-items: center; justify-content: center; color: #999; font-size: 16px; background: #e5ddd5; }
</style>
</head>
<body>

<div id="sidebar">
  <div id="sidebar-header">Habisite CRM</div>
  <input id="search" placeholder="Buscar contacto..." oninput="filtrar()">
  <div id="lista"></div>
</div>

<div id="chat" style="display:none">
  <div id="chat-header">
    <div class="avatar" id="chat-avatar"></div>
    <span id="chat-nombre"></span>
  </div>
  <div id="mensajes"></div>
  <div id="input-area">
    <input id="input-texto" placeholder="Escribi un mensaje..." onkeydown="if(event.key==='Enter') enviar()">
    <button id="btn-send" onclick="enviar()">&#9658;</button>
  </div>
</div>

<div id="placeholder">Selecciona una conversacion</div>

<script>
let db = {};
let numeroActivo = null;

async function cargar() {
  const r = await fetch("/conversaciones");
  db = await r.json();
  renderLista();
  if (numeroActivo) renderChat(numeroActivo);
}

function renderLista(filtro = "") {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";
  const numeros = Object.keys(db).filter(n => {
    const c = db[n];
    return c.nombre.toLowerCase().includes(filtro.toLowerCase()) || n.includes(filtro);
  });
  // Ordenar por ultimo mensaje
  numeros.sort((a, b) => {
    const ma = db[a].mensajes, mb = db[b].mensajes;
    const ha = ma.length ? ma[ma.length-1].hora : "";
    const hb = mb.length ? mb[mb.length-1].hora : "";
    return hb.localeCompare(ha);
  });
  numeros.forEach(n => {
    const c = db[n];
    const ultimo = c.mensajes.length ? c.mensajes[c.mensajes.length-1].texto : "";
    const div = document.createElement("div");
    div.className = "contacto" + (n === numeroActivo ? " activo" : "");
    div.innerHTML = `
      <div class="avatar">${c.nombre[0].toUpperCase()}</div>
      <div class="contacto-info">
        <div class="contacto-nombre">${c.nombre}</div>
        <div class="contacto-ultimo">${ultimo}</div>
      </div>`;
    div.onclick = () => abrirChat(n);
    lista.appendChild(div);
  });
}

function abrirChat(numero) {
  numeroActivo = numero;
  document.getElementById("chat").style.display = "flex";
  document.getElementById("placeholder").style.display = "none";
  document.getElementById("chat-nombre").textContent = db[numero].nombre + " · +" + numero;
  document.getElementById("chat-avatar").textContent = db[numero].nombre[0].toUpperCase();
  renderChat(numero);
  renderLista(document.getElementById("search").value);
}

function renderChat(numero) {
  const cont = document.getElementById("mensajes");
  const msgs = db[numero]?.mensajes || [];
  cont.innerHTML = msgs.map(m => `
    <div class="burbuja ${m.dir}">
      ${m.texto}
      <div class="hora">${m.hora.substring(11,16)}</div>
    </div>`).join("");
  cont.scrollTop = cont.scrollHeight;
}

async function enviar() {
  const input = document.getElementById("input-texto");
  const texto = input.value.trim();
  if (!texto || !numeroActivo) return;
  input.value = "";
  const r = await fetch("/enviar", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({numero: numeroActivo, texto})
  });
  const data = await r.json();
  if (!data.ok) {
    const err = data.error?.error?.message || "Error al enviar por WhatsApp";
    alert("Mensaje guardado pero no entregado por WA: " + err);
  }
  await cargar();
}

function filtrar() {
  renderLista(document.getElementById("search").value);
}

// Actualizar cada 5 segundos
cargar();
setInterval(cargar, 5000);
</script>
</body>
</html>
"""

@app.route("/")
def index():
    return render_template_string(HTML)

if __name__ == "__main__":
    os.makedirs("/app/crm", exist_ok=True)
    app.run(port=8080, debug=False)
