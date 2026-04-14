from flask import Flask, jsonify, request
from flask_cors import CORS
from database import get_connection

app = Flask(__name__)
CORS(app)  

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

@app.route("/usuarios", methods=["POST"])
def criar_usuario():
    dados = request.json
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO usuarios (nome, email) VALUES (%s, %s)",
                   (dados["nome"], dados["email"]))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"mensagem": "Usuário criado!"}), 201

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