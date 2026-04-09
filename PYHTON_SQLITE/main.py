import sqlite3

conexao = sqlite3.connect("banco.db")
cursor =  conexao.cursor()

cursor.execute("""CREATE TABLE IF NOT EXISTS contas_bancarias (
                id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                time TEXT NOT NULL,
                over FLOAT NOT NULL,
                 TEXT NOT NULL UNIQUE
                )""")

#cursor.execute("""INSERT INTO contas_bancarias
#              (titular, saldo, cpf) VALUES
#              ('MK', 140, '80046330992')""")

cursor.execute("""UPDATE contas_bancarias
                SET saldo = -5000
                WHERE id = 2""")
cursor.execute("""SELECT titular, saldo FROM contas_bancarias""")
contas = cursor.fetchall()

print(contas)
for conta in contas:
    titular, saldo = conta
    print(f"""Titular: {titular}
Saldo: {saldo}""")
    print("\n")

conexao.commit()  