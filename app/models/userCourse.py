from app.extensions import db
class UserCourse(db.Model):
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), primary_key=True)
    grade = db.Column(db.Float)
    attempts_left = db.Column(db.Integer) 
    student = db.relationship('User', backref='student_courses')
    course = db.relationship('Course', backref='course_students')