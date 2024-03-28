from app.extensions import db

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    is_active = db.Column(db.Boolean, default=True) 
    time_limit = db.Column(db.Integer, nullable=True) 
    attempt_limit = db.Column(db.Integer, default=1) 
    questions = db.relationship('Question', backref='course', lazy='dynamic', cascade="all, delete, delete-orphan")
