from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token
from database import get_connection
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)

# CADASTRO
@app.route("/cadastro", methods=["POST"])
def cadastro():
    dados = request.json
    senha_hash = bcrypt.hashpw(dados["senha"].encode("utf-8"), bcrypt.gensalt()).decode("utf-8")  # ← corrigido
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO usuarios (nome, email, senha) VALUES (%s, %s, %s)",
                   (dados["nome"], dados["email"], senha_hash))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"mensagem": "Usuário cadastrado!"}), 201

# LOGIN
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

# USUÁRIOS
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
    cursor.execute("UPDATE usuarios SET nome = %s, email = %s WHERE id = %s",
                   (dados["nome"], dados["email"], id))
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

if __name__ == "__main__":
    app.run(debug=True)
