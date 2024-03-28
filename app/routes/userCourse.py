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
from app.models import UserCourse, Course
from app.extensions import db
import os
from config import Config
from werkzeug.utils import secure_filename
from sqlalchemy.exc import SQLAlchemyError

userCourse_bp = Blueprint("userCourse", __name__)

@userCourse_bp.route('/student/<int:student_id>/register-course/<int:course_id>', methods=['POST'])
def register_student_to_course(student_id, course_id):
    try:
        existing_student_course = UserCourse.query.filter_by(
            student_id=student_id,
            course_id=course_id
        ).first()
        
        if existing_student_course:
            return jsonify({"message": "Student is already registered to course"}), 200
        
        new_student_course = UserCourse(
            student_id=student_id,
            course_id=course_id,
            grade=None,
        )
        db.session.add(new_student_course)
        db.session.commit()
        return jsonify({"message": "Student registered to course successfully"}), 201
    
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e.__dict__['orig'])}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@userCourse_bp.route('/student/<int:student_id>/course/<int:course_id>/submit-result', methods=['POST'])
def submit_course_result(student_id, course_id):
    try:
        data = request.get_json()
        grade = data['grade']

        student_course = UserCourse.query.filter_by(
            student_id=student_id,
            course_id=course_id
        ).first()

        if student_course:
            student_course.grade = grade
        else:
            new_student_course = UserCourse(
                student_id=student_id,
                course_id=course_id,
                grade=grade
            )
            db.session.add(new_student_course)
        db.session.commit()
        return jsonify({"message": "Course result submitted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
@userCourse_bp.route('/student/<int:student_id>/course/<int:course_id>/update-attempt', methods=['POST'])
def update_attempt(student_id, course_id):
    try:
        student_course = UserCourse.query.filter_by(
            student_id=student_id,
            course_id=course_id
        ).first_or_404(description='Course record not found for the student.')

        if student_course.attempts_left > 0:
            student_course.attempts_left -= 1
            db.session.commit()
            return jsonify({"message": "Attempt updated successfully", "attempts_left": student_course.attempts_left}), 200
        else:
            return jsonify({"message": "No attempts left"}), 400
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@userCourse_bp.route('/student/<int:student_id>/courses-results', methods=['GET'])
def get_student_courses_results(student_id):
    try:
        student_courses = UserCourse.query.filter_by(student_id=student_id).all()
        return jsonify([{
            "course_id": student_course.course_id,
            "title": student_course.course.title,  
            "grade": student_course.grade,
            "attempts_left": student_course.attempts_left  
        } for student_course in student_courses])
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@userCourse_bp.route('/student/<int:student_id>/course/<int:course_id>/access-course', methods=['POST'])
def access_course(student_id, course_id):
    try:
        student_course = UserCourse.query.filter_by(student_id=student_id, course_id=course_id).first()

        if not student_course:
            course = Course.query.get_or_404(course_id)
            new_student_course = UserCourse(student_id=student_id, course_id=course_id, attempts_left=course.attempt_limit)
            db.session.add(new_student_course)
            db.session.commit()
            return jsonify({"message": "Course accessed for the first time", "attempts_left": course.attempt_limit}), 200
        else:
            if student_course.attempts_left > 0:
                student_course.attempts_left -= 1
                db.session.commit()
                return jsonify({"attempts_left": student_course.attempts_left}), 200
            else:
                return jsonify({"error": "No attempts left"}), 400

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Error in access_course: {str(e)}')
        return jsonify({"error": str(e)}), 500

