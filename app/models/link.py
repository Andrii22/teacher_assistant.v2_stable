from app.extensions import db

class Link(db.Model):
    __tablename__ = 'link'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    folder_id = db.Column(db.Integer, db.ForeignKey('folder.id'))
    url = db.Column(db.String(512), nullable=False)
    creation_date = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())