from flask import (
    Blueprint,
    request,
    session,
    render_template,
    flash,
    redirect,
    url_for,
    send_from_directory,
    jsonify
)
from flask import current_app as app
from app.models import Question, Course
from app.extensions import db
import os
from config import Config
from werkzeug.utils import secure_filename

questions_bp = Blueprint("questions", __name__)
    
@questions_bp.route('/questions', methods=['POST'])
def create_question():
    data = request.json
    text = data.get('text')
    course_id = data.get('course_id')
    answers = data.get('answers', [])

    question = Question(text=text, course_id=course_id)
    question.set_answers(answers)

    db.session.add(question)
    db.session.commit()

    return jsonify({'message': 'Question created successfully'}), 201


@questions_bp.route('/questions/<int:question_id>', methods=['PUT'])
def update_question(question_id):
    data = request.json
    text = data.get('text')
    answers = data.get('answers', [])

    question = Question.query.get(question_id)

    if not question:
        return jsonify({'error': 'Question not found'}), 404

    question.text = text
    question.set_answers(answers)

    db.session.commit()

    return jsonify({'message': 'Question updated successfully'}), 200

# Delete a question
@questions_bp.route('/questions/<int:question_id>', methods=['DELETE'])
def delete_question(question_id):
    question = Question.query.get(question_id)

    if not question:
        return jsonify({'error': 'Question not found'}), 404

    db.session.delete(question)
    db.session.commit()

    return jsonify({'message': 'Question deleted successfully'}), 200


@questions_bp.route('/questions/<int:question_id>', methods=['GET'])
def get_question(question_id):
    question = Question.query.get(question_id)

    if not question:
        return jsonify({'error': 'Question not found'}), 404

    return jsonify({
        'id': question.id,
        'text': question.text,
        'answers': question.get_answers()
    }), 200