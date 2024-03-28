from app.extensions import db
import json

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    answers = db.Column(db.Text, nullable=False)  

    def set_answers(self, answers):
        self.answers = json.dumps(answers)

    def get_answers(self):
        return json.loads(self.answers) if self.answers else []

    def add_answer(self, answer, score):
        current_answers = self.get_answers()
        current_answers.append({"text": answer, "score": score})
        self.set_answers(current_answers)

    def remove_answer(self, index):
        current_answers = self.get_answers()
        if 0 <= index < len(current_answers):
            del current_answers[index]
            self.set_answers(current_answers)

    def update_answer(self, index, answer, score):
        current_answers = self.get_answers()
        if 0 <= index < len(current_answers):
            current_answers[index] = {"text": answer, "score": score}
            self.set_answers(current_answers)
