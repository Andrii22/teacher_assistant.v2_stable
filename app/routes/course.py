from flask import Blueprint, request, jsonify, abort
from app.models import Course, Question, UserCourse
from app.extensions import db

course_bp = Blueprint("course", __name__)

@course_bp.route('/courses', methods=['POST'])
def add_course():
    try:
        data = request.json
        course = Course(
            title=data['title'],
            is_active=data.get('is_active', True),
            time_limit=data.get('time_limit'),
            attempt_limit=data.get('attempt_limit', 1)
        )
        db.session.add(course)

        for question_data in data['questions']:
            question = Question(
                text=question_data['text'],  
                course=course
            )

            for answer_data in question_data['answers']:
                question.add_answer(answer_data['text'], answer_data.get('score', 0))

            db.session.add(question)
        
        db.session.commit()
        return jsonify({"message": "Course with questions and answers added successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@course_bp.route('/courses/<int:course_id>', methods=['GET'])
def get_course(course_id):
    try:
        course = Course.query.get_or_404(course_id)
        course_data = {
            "id": course.id,
            "title": course.title,
            "is_active": course.is_active,
            "time_limit": course.time_limit,
            "attempt_limit": course.attempt_limit,
            "questions": [
                {
                    "id": question.id,
                    "text": question.text,
                    "answers": question.get_answers()  
                }
                for question in course.questions.all()  
            ]
        }
        return jsonify(course_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@course_bp.route('/courseslist', methods=['GET'])
def get_courses():
    try:
        courses = Course.query.all()
        courses_data = [{
            "id": course.id,
            "title": course.title,
            "is_active": course.is_active,
            "time_limit": course.time_limit,
            "attempt_limit": course.attempt_limit,
            "questions": [
                {
                    "id": question.id,
                    "text": question.text,
                    "answers": question.get_answers()
                }
                for question in course.questions.all()  
            ]
        } for course in courses]

        return jsonify({"courses": courses_data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@course_bp.route('/courses/<int:course_id>', methods=['DELETE'])
def delete_course(course_id):
    try:
        UserCourse.query.filter_by(course_id=course_id).delete()
        course = Course.query.get_or_404(course_id)
        db.session.delete(course)
        db.session.commit()
        return jsonify({"message": "Курс успішно видалено"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@course_bp.route('/courses/<int:course_id>/toggle-status', methods=['PATCH'])
def toggle_course_status(course_id):
    try:
        course = Course.query.get_or_404(course_id)
        course.is_active = not course.is_active 
        db.session.commit()
        return jsonify({
            "message": "Статус курсу успішно оновлено",
            "is_active": course.is_active
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500