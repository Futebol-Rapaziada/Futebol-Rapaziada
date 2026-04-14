from flask import Flask, jsonify
from flask_mysqldb import MySQL
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
mysql = MySQL(app)

@app.route('/campeonatos', methods=['GET'])
def get_campeonatos():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM campeonatos")
    dados = cur.fetchall()
    cur.close()
    return jsonify(dados)

@app.route('/classificacao', methods=['GET'])
def get_classificacao():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM classificação")
    dados = cur.fetchall()
    cur.close()
    return jsonify(dados)

@app.route('/financeiro', methods=['GET'])
def get_financeiro():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM financeiro")
    dados = cur.fetchall()
    cur.close()
    return jsonify(dados)

@app.route('/jogadores', methods=['GET'])
def get_jogadores():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM jogadores")
    dados = cur.fetchall()
    cur.close()
    return jsonify(dados)

@app.route('/jogos', methods=['GET'])
def get_jogos():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM jogos")
    dados = cur.fetchall()
    cur.close()
    return jsonify(dados)

@app.route('/ranking', methods=['GET'])
def get_ranking():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM ranking")
    dados = cur.fetchall()
    cur.close()
    return jsonify(dados)

@app.route('/recordes', methods=['GET'])
def get_recordes():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM recordes")
    dados = cur.fetchall()
    cur.close()
    return jsonify(dados)

@app.route('/times', methods=['GET'])
def get_times():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM times")
    dados = cur.fetchall()
    cur.close()
    return jsonify(dados)

if __name__ == '__main__':
    app.run(debug=True)