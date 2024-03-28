from app.extensions import db

class Folder(db.Model):
    __tablename__ = 'folder'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    parent_folder_id = db.Column(db.Integer, db.ForeignKey('folder.id'))

    # Зв'язки для вкладених папок, файлів і посилань
    folders = db.relationship('Folder', backref=db.backref('parent_folder', remote_side=[id]), lazy='dynamic')
    files = db.relationship('File', backref='folder', lazy='dynamic')
    links = db.relationship('Link', backref='folder', lazy='dynamic')