from flask import Flask
from app.extensions import db
from config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    from .routes import main as main_blueprint
    from .routes import user as user_blueprint
    from .routes import notes as notes_blueprint
    from .routes import professional_development as pd_blueprint
    from .routes import folders_bp  as folders_bp_blueprint
    from .routes import files_bp  as files_bp_blueprint
    from .routes import links_bp  as links_bp_blueprint
    from .routes import schedule_bp  as schedule_bp_blueprint
    from .routes import course_bp as course_bp_blueprint
    from .routes import questions_bp as questions_bp_blueprint
    from .routes import userCourse_bp as userCourse_bp_blueprint
    from .routes import attendanceLog_bp as attendanceLog_bp_blueprint
    from .routes import assistent_bp as assistent_bp_blueprint
    app.register_blueprint(main_blueprint)
    app.register_blueprint(user_blueprint, url_prefix='/user')
    app.register_blueprint(notes_blueprint, url_prefix='/notes')
    app.register_blueprint(pd_blueprint)
    app.register_blueprint(folders_bp_blueprint)
    app.register_blueprint(files_bp_blueprint)
    app.register_blueprint(links_bp_blueprint)
    app.register_blueprint(schedule_bp_blueprint)
    app.register_blueprint(course_bp_blueprint)
    app.register_blueprint(questions_bp_blueprint)
    app.register_blueprint(userCourse_bp_blueprint)
    app.register_blueprint(attendanceLog_bp_blueprint)
    app.register_blueprint(assistent_bp_blueprint)
    return app

