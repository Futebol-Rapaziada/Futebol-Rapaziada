from flask import Flask, jsonify, request, Response
from flask_jwt_extended import JWTManager, create_access_token
from database import obter_conexao
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)

# ─── CORS ────────────────────────────────────────────────────────────────────────

def origem_permitida(origin):
    if not origin:
        return False
    allowed = [
        "http://localhost:5173",
        "http://192.168.3.247:5173",
        "http://192.168.2.105:5173",
        "https://futebol-rapaziada.vercel.app",
    ]
    if origin in allowed:
        return True
    if origin.endswith(".vercel.app"):  # libera todos os previews da Vercel
        return True
    return False

@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin")
    if origem_permitida(origin):
        response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        origin = request.headers.get("Origin")
        res = Response()
        if origem_permitida(origin):
            res.headers["Access-Control-Allow-Origin"] = origin
        res.headers["Access-Control-Allow-Credentials"] = "true"
        res.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        res.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return res, 204


# ─── CADASTRO ───────────────────────────────────────────────────────────────────

@app.route("/cadastro", methods=["POST"])
def cadastro():
    dados = request.json
    senha_hash = bcrypt.hashpw(dados["senha"].encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO usuarios (nome, email, senha) VALUES (%s, %s, %s)",
        (dados["nome"], dados["email"], senha_hash)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"mensagem": "Usuário cadastrado!"}), 201


# ─── LOGIN ───────────────────────────────────────────────────────────────────────

@app.route("/login", methods=["POST"])
def login():
    dados = request.json
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM usuarios WHERE email = %s", (dados["email"],))
    usuario = cursor.fetchone()
    cursor.close()
    conn.close()

    if not usuario:
        return jsonify({"erro": "Usuário não encontrado!"}), 404

    senha_correta = bcrypt.checkpw(dados["senha"].encode("utf-8"), usuario["senha"].encode("utf-8"))
    if not senha_correta:
        return jsonify({"erro": "Senha incorreta!"}), 401

    token = create_access_token(identity=str(usuario["id"]))
    return jsonify({"token": token})

@app.route("/")
def home():
    return "API Flask no Railway!"


# ─── USUÁRIOS ────────────────────────────────────────────────────────────────────

@app.route("/usuarios", methods=["GET"])
def get_usuarios():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM usuarios")
    resultado = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(resultado)

@app.route("/usuarios/<int:id>", methods=["GET"])
def get_usuario(id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM usuarios WHERE id = %s", (id,))
    resultado = cursor.fetchone()
    cursor.close()
    conn.close()
    return jsonify(resultado)

@app.route("/usuarios/<int:id>", methods=["PUT"])
def atualizar_usuario(id):
    dados = request.json
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE usuarios SET nome = %s, email = %s WHERE id = %s",
        (dados["nome"], dados["email"], id)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"mensagem": "Usuário atualizado!"})

@app.route("/usuarios/<int:id>", methods=["DELETE"])
def deletar_usuario(id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM usuarios WHERE id = %s", (id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"mensagem": "Usuário deletado!"})


# ─── CAMPEONATOS ─────────────────────────────────────────────────────────────────

@app.route('/campeonatos', methods=['GET'])
def get_campeonatos():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM campeonatos")
    dados = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(dados)


# ─── CLASSIFICAÇÃO ───────────────────────────────────────────────────────────────

@app.route('/classificacao', methods=['GET'])
def get_classificacao():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM classificacao")
    dados = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(dados)


# ─── FINANCEIRO ──────────────────────────────────────────────────────────────────

@app.route('/financeiro', methods=['GET'])
def get_financeiro():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM financeiro")
    dados = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(dados)


# ─── JOGADORES ───────────────────────────────────────────────────────────────────

@app.route('/jogadores', methods=['GET'])
def get_jogadores():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM jogadores")
    dados = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(dados)

@app.route('/jogadores', methods=['POST'])
def criar_jogador():
    dados = request.json
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO jogadores (nome, posicao, time, idade, perna_boa, overall, fotoUrl, gols, assistencias, jogos, cartoes) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
        (
            dados["nome"],
            dados["posicao"],
            dados["time"],
            dados["idade"],
            dados["perna_boa"],
            dados.get("overall", 0),
            dados["fotoUrl"],
            dados["gols"],
            dados["assistencias"],
            dados["jogos"],
            dados["cartoes"]
        )
    )
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"mensagem": "Jogador cadastrado!"}), 201

@app.route('/jogadores/<int:id>', methods=['DELETE'])
def deletar_jogador(id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM jogadores WHERE id = %s", (id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"mensagem": "Jogador deletado!"})


# ─── JOGOS ───────────────────────────────────────────────────────────────────────

@app.route('/jogos', methods=['GET'])
def get_jogos():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM jogos")
    dados = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(dados)


# ─── RANKING ─────────────────────────────────────────────────────────────────────

@app.route('/ranking', methods=['GET'])
def get_ranking():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM ranking")
    dados = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(dados)


# ─── RECORDES ────────────────────────────────────────────────────────────────────

@app.route('/recordes', methods=['GET'])
def get_recordes():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM recordes")
    dados = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(dados)


# ─── TIMES ───────────────────────────────────────────────────────────────────────

@app.route('/times', methods=['GET'])
def get_times():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM times")
    dados = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(dados)


# ─── MAIN ─────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)