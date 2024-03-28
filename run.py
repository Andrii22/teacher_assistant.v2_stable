from app import create_app
from app.extensions import db

app = create_app()
@app.cli.command("initdb")
def initdb_command():
    """Initializes the database."""
    db.create_all()
    print("Database initialized.")
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000)


