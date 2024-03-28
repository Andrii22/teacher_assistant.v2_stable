from datetime import datetime
from app.extensions import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    profile_photo = db.Column(db.String(120), nullable=True, default='user.png')
    ip_address = db.Column(db.String(45))
    is_online = db.Column(db.Boolean, default=False)
    role = db.Column(db.String(20), nullable=False, default='student')
    user_class = db.Column(db.String(50))
    user_subclass = db.Column(db.String(50))
    is_banned = db.Column(db.Boolean, default=False)
    def __repr__(self):
        return f"<User '{self.username}'>"