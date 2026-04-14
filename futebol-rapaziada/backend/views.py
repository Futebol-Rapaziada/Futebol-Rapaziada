from main import app

@app.route("/")
def homepage():
    return "Meu Site no Flask"

@app.route("/blog")
def blog():
    return "Bem vindo ao Blog"