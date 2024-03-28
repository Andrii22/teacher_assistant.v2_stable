from app.extensions import db
from enum import Enum

class DayOfWeek(Enum):
    Понеділок = "Понеділок"
    Вівторок = "Вівторок"
    Середа = "Середа"
    Четвер = "Четвер"
    Пятниця = "П'ятниця"
    
class Schedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    day_of_week = db.Column(db.Enum(DayOfWeek), nullable=False)
    lesson_time = db.Column(db.String(50), nullable=False)
    class_number = db.Column(db.Integer, nullable=False)
    class_letter = db.Column(db.String(1), nullable=False)
    description = db.Column(db.Text, nullable=True)

def to_dict(self):
    return {
            'day_of_week': self.day_of_week.name, 
            'lesson_time': self.lesson_time,
            'class_number': self.class_number,
            'class_letter': self.class_letter,
            'description': self.description
            }