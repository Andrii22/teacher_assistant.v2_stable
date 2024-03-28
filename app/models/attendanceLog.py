from app.extensions import db
from datetime import date
class AttendanceLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    class_number = db.Column(db.Integer, nullable=False)
    class_letter = db.Column(db.String(1), nullable=False)
    month_or_trimester = db.Column(db.String(50), nullable=False)
    date = db.Column(db.Date, default=date.today, nullable=False)
    attendance_data = db.Column(db.String(255), nullable=True)
    grades = db.Column(db.String(255), nullable=True)  
    student = db.relationship('User', backref='attendance_records')