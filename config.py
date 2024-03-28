import secrets



class Config:
    SQLALCHEMY_DATABASE_URI = 'sqlite:///users.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SYSTEM_ICON = 'app/static/uploads/system_icon'
    USER_ICON = 'app/static/uploads/user_icon'
    UPLOADS_FILE = 'app/static/uploads/uploads_file'
    SECRET_KEY = secrets.token_hex(16)
    ALLOWED_EXTENSIONS = {'jpg', 'png', 'jpeg'}
    ALLOWED_EXTENSIONS2 = {'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'}