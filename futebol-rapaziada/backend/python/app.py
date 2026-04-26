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

@app.route('/cadastro', methods=['POST'])
def cadastro():
    dados = request.get_json()
    nome = dados.get('nome')
    email = dados.get('email')
    senha = dados.get('senha')

    conn = obter_conexao()
    cursor = conn.cursor()

    cursor.execute("SELECT id_usuarios FROM cadastro WHERE email = %s", (email,))
    usuario_existente = cursor.fetchone()

    if usuario_existente:
        cursor.close()
        conn.close()
        return jsonify({'erro': 'Email já cadastrado'}), 409

    senha_hash = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt())
    
    cursor.execute(
        "INSERT INTO cadastro (nome, email, senha) VALUES (%s, %s, %s)",
        (nome, email, senha_hash)
    )
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'mensagem': 'Usuário cadastrado com sucesso'}), 201


# ─── LOGIN ───────────────────────────────────────────────────────────────────────

@app.route("/login", methods=["POST"])
def login():
    dados = request.json
    conn = obter_conexao()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM cadastro WHERE email = %s", (dados["email"],))
    usuario = cursor.fetchone()
    cursor.close()
    conn.close()

    if not usuario:
        return jsonify({"erro": "Usuário não encontrado!"}), 404

    senha_correta = bcrypt.checkpw(dados["senha"].encode("utf-8"), usuario["senha"].encode("utf-8"))
    if not senha_correta:
        return jsonify({"erro": "Senha incorreta!"}), 401

    token = create_access_token(identity=str(usuario["id_usuarios"]))
    return jsonify({
        "token": token,
        "user": {
            "id": usuario["id_usuarios"],
            "nome": usuario["nome"],
            "email": usuario["email"]
        }
    })


# ─── USUÁRIOS ────────────────────────────────────────────────────────────────────

@app.route("/usuarios", methods=["GET"])
def get_usuarios():
    conn = obter_conexao()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM usuarios")
    resultado = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(resultado)

@app.route("/usuarios/<int:id>", methods=["GET"])
def get_usuario(id):
    conn = obter_conexao()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM usuarios WHERE id = %s", (id,))
    resultado = cursor.fetchone()
    cursor.close()
    conn.close()
    return jsonify(resultado)

@app.route("/usuarios/<int:id>", methods=["PUT"])
def atualizar_usuario(id):
    dados = request.json
    conn = obter_conexao()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE usuarios SET nome = %s, email = %s WHERE id = %s",
        (dados["nome"], dados["email"], id)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"mensagem": "Usuário atualizado!"})

# ─── DELETAR USUARIO ─────────────────────────────────────────────────────────────────

@app.route("/usuarios/<int:id>", methods=["DELETE"])
def deletar_usuario(id):
    conn = obter_conexao()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM usuarios WHERE id = %s", (id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"mensagem": "Usuário deletado!"})

# ─── ALTERAR OS DADOS ─────────────────────────────────────────────────────────────────

@app.route('/jogadores/<int:id>', methods=['PUT'])
def atualizar_jogador(id):
    dados = request.json
    conn = obter_conexao()
    cursor = conn.cursor()
    cursor.execute(
        """
        UPDATE jogadores
        SET nome = %s, posicao = %s, idade = %s, perna_boa = %s,
            fotoUrl = %s, gols = %s, assistencias = %s, jogos = %s, cartoes = %s
        WHERE id = %s
        """,
        (
            dados["nome"],
            dados["posicao"],
            dados["idade"],
            dados["perna_boa"],
            dados["fotoUrl"],
            dados["gols"],
            dados["assistencias"],
            dados["jogos"],
            dados["cartoes"],
            id,
        )
    )
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"mensagem": "Jogador atualizado!"})

# ─── CAMPEONATOS ─────────────────────────────────────────────────────────────────

@app.route('/campeonatos', methods=['GET'])
def get_campeonatos():
    conn = obter_conexao()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM campeonatos")
    dados = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(dados)


# ─── CLASSIFICAÇÃO ───────────────────────────────────────────────────────────────

@app.route('/classificacao', methods=['GET'])
def get_classificacao():
    conn = obter_conexao()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM classificacao")
    dados = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(dados)


# ─── FINANCEIRO ──────────────────────────────────────────────────────────────────

@app.route('/financeiro', methods=['GET'])
def get_financeiro():
    conn = obter_conexao()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM financeiro")
    dados = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(dados)


# ─── JOGADORES ───────────────────────────────────────────────────────────────────

@app.route('/jogadores', methods=['GET'])
def get_jogadores():
    conn = obter_conexao()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM jogadores")
    dados = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(dados)

@app.route('/jogadores', methods=['POST'])
def criar_jogador():
    dados = request.json
    id_time = dados.get("time") or None
    conn = obter_conexao()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO jogadores (nome, posicao, id_time, idade, perna_boa, overall, fotoUrl, gols, assistencias, jogos, cartoes) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
        (
            dados["nome"][:90],
            dados["posicao"],
            id_time,
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
    conn = obter_conexao()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM jogadores WHERE id = %s", (id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"mensagem": "Jogador deletado!"})


# ─── JOGOS ───────────────────────────────────────────────────────────────────────

@app.route('/jogos', methods=['GET'])
def get_jogos():
    conn = obter_conexao()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM jogos")
    dados = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(dados)


# ─── RANKING ─────────────────────────────────────────────────────────────────────

@app.route('/ranking', methods=['GET'])
def get_ranking():
    conn = obter_conexao()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM ranking")
    dados = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(dados)


# ─── RECORDES ────────────────────────────────────────────────────────────────────

@app.route('/recordes', methods=['GET'])
def get_recordes():
    conn = obter_conexao()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM recordes")
    dados = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(dados)


# ─── TIMES ───────────────────────────────────────────────────────────────────────

@app.route('/times', methods=['GET'])
def get_times():
    conn = obter_conexao()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM times")
    dados = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(dados)

@app.route('/jogadores/<int:id>/confirmar', methods=['PATCH'])
def confirmar_jogador(id):
    dados = request.json
    confirmado = 1 if dados.get("confirmado") else 0
    conn = obter_conexao()
    cursor = conn.cursor()
    cursor.execute("UPDATE jogadores SET confirmado = %s WHERE id = %s", (confirmado, id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"mensagem": "Presença atualizada!", "confirmado": confirmado})

# ─── TIMES DO JOGO ───────────────────────────────────────────────────────────────

@app.route('/times-jogo', methods=['GET'])
def get_times_jogo():
    conn = obter_conexao()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM times_jogo ORDER BY id")
    times = cursor.fetchall()

    for time in times:
        cursor.execute("""
            SELECT e.id, e.posicao_campo, e.reserva,
                j.id as jogador_id, j.nome, j.posicao, j.fotoUrl, j.overall
            FROM escalacao e
            LEFT JOIN jogadores j ON e.id_jogador = j.id
            WHERE e.id_time = %s
            ORDER BY e.reserva, e.posicao_campo
        """, (time["id"],))
        time["escalacao"] = cursor.fetchall()

    cursor.close(); conn.close()
    return jsonify(times)

@app.route('/times-jogo', methods=['POST'])
def criar_time_jogo():
    dados = request.json
    conn = obter_conexao()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO times_jogo (nome, cor) VALUES (%s, %s)",
                (dados.get("nome","Time"), dados.get("cor","#00ff87")))
    conn.commit()
    novo_id = cursor.lastrowid
    cursor.close(); conn.close()
    return jsonify({"mensagem": "Time criado!", "id": novo_id}), 201

@app.route('/times-jogo/<int:id>', methods=['DELETE'])
def deletar_time_jogo(id):
    conn = obter_conexao()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM escalacao WHERE id_time = %s", (id,))
    cursor.execute("DELETE FROM times_jogo WHERE id = %s", (id,))
    conn.commit()
    cursor.close(); conn.close()
    return jsonify({"mensagem": "Time deletado!"})


# ─── ESCALAÇÃO ───────────────────────────────────────────────────────────────────

@app.route('/escalacao', methods=['POST'])
def salvar_escalacao():
    dados = request.json
    id_time = dados.get("id_time")
    slots   = dados.get("slots", [])  # [{ posicao_campo, id_jogador, reserva }]

    conn = obter_conexao()
    cursor = conn.cursor()

    # Deleta escalação atual do time
    cursor.execute("DELETE FROM escalacao WHERE id_time = %s", (id_time,))

    # Insere nova escalação
    for slot in slots:
        cursor.execute(
            "INSERT INTO escalacao (id_time, id_jogador, posicao_campo, reserva) VALUES (%s, %s, %s, %s)",
            (id_time,
            slot.get("id_jogador") or None,
            slot.get("posicao_campo"),
            1 if slot.get("reserva") else 0)
        )

    conn.commit()
    cursor.close(); conn.close()
    return jsonify({"mensagem": "Escalação salva!"})

@app.route('/escalacao/<int:id_time>', methods=['DELETE'])
def limpar_escalacao(id_time):
    conn = obter_conexao()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM escalacao WHERE id_time = %s", (id_time,))
    conn.commit()
    cursor.close(); conn.close()
    return jsonify({"mensagem": "Escalação limpa!"})

# ─── MÍDIAS ──────────────────────────────────────────────────────────────────────

@app.route('/midias', methods=['GET', 'OPTIONS'])
def get_midias():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    tag    = request.args.get('tag')
    busca  = request.args.get('busca')
    ordem  = request.args.get('ordem', 'recente')
    pagina = int(request.args.get('pagina', 1))
    por_pagina = 10
    offset = (pagina - 1) * por_pagina

    conn = obter_conexao()
    cursor = conn.cursor(dictionary=True)

    where = "WHERE 1=1"
    params = []

    if tag:
        where += " AND m.tag = %s"
        params.append(tag)
    if busca:
        where += " AND (m.titulo LIKE %s OR j.nome LIKE %s)"
        params.extend([f"%{busca}%", f"%{busca}%"])

    order_map = {
        "curtidas": "m.curtidas DESC",
        "views":    "m.visualizacoes DESC",
        "recente":  "m.criado_em DESC"
    }
    order_sql = order_map.get(ordem, "m.criado_em DESC")

    cursor.execute(f"""
        SELECT COUNT(*) as total FROM midias m
        JOIN jogadores j ON j.id_jogador = m.jogador_id
        {where}
    """, params)
    total = cursor.fetchone()["total"]

    cursor.execute(f"""
        SELECT m.*, j.nome as autor_nome, j.id_jogador as autor_id
        FROM midias m
        JOIN jogadores j ON j.id_jogador = m.jogador_id
        {where}
        ORDER BY {order_sql}
        LIMIT %s OFFSET %s
    """, params + [por_pagina, offset])
    videos = cursor.fetchall()

    cursor.close()
    conn.close()

    for v in videos:
        v["autor"] = {"id": v.pop("autor_id"), "nome": v.pop("autor_nome")}

    return jsonify({"total": total, "pagina": pagina, "por_pagina": por_pagina, "videos": videos})


@app.route('/midias/<int:id>', methods=['GET', 'OPTIONS'])
def get_midia(id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    conn = obter_conexao()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("UPDATE midias SET visualizacoes = visualizacoes + 1 WHERE id = %s", (id,))
    conn.commit()

    cursor.execute("""
        SELECT m.*, j.nome as autor_nome, j.id_jogador as autor_id
        FROM midias m
        JOIN jogadores j ON j.id_jogador = m.jogador_id
        WHERE m.id = %s
    """, (id,))
    video = cursor.fetchone()
    cursor.close()
    conn.close()

    if not video:
        return jsonify({"erro": "Vídeo não encontrado"}), 404

    video["autor"] = {"id": video.pop("autor_id"), "nome": video.pop("autor_nome")}
    return jsonify(video)


@app.route('/midias/<int:id>/curtir', methods=['POST', 'OPTIONS'])
def curtir_midia(id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
    verify_jwt_in_request()
    jogador_id = int(get_jwt_identity())

    conn = obter_conexao()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT id FROM midia_curtidas WHERE midia_id = %s AND jogador_id = %s",
        (id, jogador_id)
    )
    ja_curtiu = cursor.fetchone()

    if ja_curtiu:
        cursor.execute(
            "DELETE FROM midia_curtidas WHERE midia_id = %s AND jogador_id = %s",
            (id, jogador_id)
        )
        cursor.execute("UPDATE midias SET curtidas = curtidas - 1 WHERE id = %s", (id,))
        curtido = False
    else:
        cursor.execute(
            "INSERT INTO midia_curtidas (midia_id, jogador_id) VALUES (%s, %s)",
            (id, jogador_id)
        )
        cursor.execute("UPDATE midias SET curtidas = curtidas + 1 WHERE id = %s", (id,))
        curtido = True

    conn.commit()
    cursor.execute("SELECT curtidas FROM midias WHERE id = %s", (id,))
    total = cursor.fetchone()["curtidas"]
    cursor.close()
    conn.close()

    return jsonify({"curtido": curtido, "total_curtidas": total})


@app.route('/midias/<int:id>', methods=['DELETE', 'OPTIONS'])
def deletar_midia(id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
    verify_jwt_in_request()
    jogador_id = int(get_jwt_identity())

    conn = obter_conexao()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM midias WHERE id = %s", (id,))
    midia = cursor.fetchone()

    if not midia:
        cursor.close(); conn.close()
        return jsonify({"erro": "Vídeo não encontrado"}), 404

    if midia["jogador_id"] != jogador_id:
        cursor.close(); conn.close()
        return jsonify({"erro": "Sem permissão"}), 403

    cursor.execute("DELETE FROM midias WHERE id = %s", (id,))
    conn.commit()
    cursor.close(); conn.close()
    return jsonify({"mensagem": "Vídeo deletado!"})


@app.route('/midias', methods=['POST', 'OPTIONS'])
def criar_midia():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
    verify_jwt_in_request()
    id_usuario = int(get_jwt_identity())

    titulo    = request.form.get("titulo")
    descricao = request.form.get("descricao", "")
    tag       = request.form.get("tag")
    arquivo   = request.files.get("video")

    if not titulo or not tag or not arquivo:
        return jsonify({"erro": "titulo, tag e video são obrigatórios"}), 400

    conn = obter_conexao()
    cursor = conn.cursor(dictionary=True)

    # Busca o nome do usuário logado na tabela cadastro
    cursor.execute("SELECT nome FROM cadastro WHERE id_usuarios = %s", (id_usuario,))
    usuario = cursor.fetchone()
    if not usuario:
        cursor.close(); conn.close()
        return jsonify({"erro": "Usuário não encontrado"}), 404

    # Busca o jogador com o mesmo nome
    cursor.execute("SELECT id_jogador FROM jogadores WHERE nome = %s LIMIT 1", (usuario["nome"],))
    jogador = cursor.fetchone()
    if not jogador:
        cursor.close(); conn.close()
        return jsonify({"erro": "Jogador não encontrado. Peça para um admin te cadastrar como jogador."}), 404

    jogador_id = jogador["id_jogador"]
    video_url = ""

    cursor.execute(
        "INSERT INTO midias (titulo, descricao, tag, video_url, jogador_id) VALUES (%s, %s, %s, %s, %s)",
        (titulo, descricao, tag, video_url, jogador_id)
    )
    conn.commit()
    novo_id = cursor.lastrowid

    cursor.execute("""
        SELECT m.*, j.nome as autor_nome, j.id_jogador as autor_id
        FROM midias m
        JOIN jogadores j ON j.id_jogador = m.jogador_id
        WHERE m.id = %s
    """, (novo_id,))
    midia = cursor.fetchone()
    cursor.close()
    conn.close()

    midia["autor"] = {"id": midia.pop("autor_id"), "nome": midia.pop("autor_nome")}
    return jsonify(midia), 201

# ─── MAIN ─────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)