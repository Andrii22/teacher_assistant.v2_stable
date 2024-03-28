from app.extensions import db

class File(db.Model):
    __tablename__ = 'file'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    folder_id = db.Column(db.Integer, db.ForeignKey('folder.id'))
    file_path = db.Column(db.String(512))
    creation_date = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp())
    last_modified_date = db.Column(db.DateTime, nullable=False, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    size = db.Column(db.Integer)
    icon_path = db.Column(db.String, nullable=True) 

