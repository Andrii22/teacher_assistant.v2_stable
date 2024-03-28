from app.extensions import db

class ProfessionalDevelopment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    topic = db.Column(db.String(255))
    form_of_training = db.Column(db.String(255))
    type_of_training = db.Column(db.String(255))
    subject_of_improvement = db.Column(db.String(255))
    certificate_number = db.Column(db.String(50))
    hours = db.Column(db.String(255))
    date = db.Column(db.String(100))
    certificate = db.Column(db.String(255))
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    def to_dict(self):
        return {
            'id': self.id,
            'topic': self.topic,
            'form_of_training': self.form_of_training,
            'type_of_training': self.type_of_training,
            'subject_of_improvement': self.subject_of_improvement,
            'certificate_number': self.certificate_number,
            'hours': self.hours,
            'date': self.date,
            'certificate': self.certificate,
            'teacher_id': self.teacher_id
        }
def __repr__(self):
    return f"<ProfessionalDevelopment {self.id} - Topic: {self.topic}>"