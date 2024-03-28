from flask import Blueprint, request, jsonify, abort
from app.models import User, Course, UserCourse, AttendanceLog
from app.extensions import db
from datetime import datetime
import calendar
UKRAINIAN_MONTHS = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", 
                    "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"]
attendanceLog_bp = Blueprint("attendanceLog", __name__)

@attendanceLog_bp.route('/get-attendance-data')
def get_attendance_data():
    class_number = request.args.get('class_number')
    class_letter = request.args.get('class_letter')
    month_or_trimester = request.args.get('month_or_trimester')


    students = User.query.filter_by(user_class=class_number, user_subclass=class_letter).all()
    student_list = [{'student_id': student.id, 'student_name': student.username} for student in students]


    active_courses = Course.query.filter_by(is_active=True).all()
    course_list = [{'course_id': course.id, 'course_title': course.title} for course in active_courses]


    student_grades = {student.id: {} for student in students}
    for student in students:
        user_courses = UserCourse.query.filter_by(student_id=student.id).all()
        for uc in user_courses:
            student_grades[student.id][uc.course_id] = uc.grade or '0'


    trimester, month_str = month_or_trimester.split('-')
    month = int(month_str.lstrip('0')) 
    year = datetime.now().year
    num_days = calendar.monthrange(year, month)[1]
    dates = [datetime(year, month, day).strftime('%Y-%m-%d') for day in range(1, num_days + 1)]


    attendance_data = {student.id: {} for student in students}
    grades_data = {student.id: {} for student in students}


    for student in students:
        attendance_records = AttendanceLog.query.filter_by(student_id=student.id).all()
        for record in attendance_records:
            date_key = record.date.strftime('%Y-%m-%d')
            attendance_data[student.id][date_key] = record.attendance_data or 'Присутній'
            grades_data[student.id][date_key] = record.grades or 'Немає оцінки'
    month_name = UKRAINIAN_MONTHS[month - 1]
    trimester_name = ["Перший", "Другий", "Третій"][int(trimester) - 1]
    table_data = {
        'attendance_data': attendance_data,
        'grades_data': grades_data,
         'month_and_trimester': f"{trimester_name} триместр: {month_name}",
        'dates': dates,
        'students': student_list,
        'courses': course_list,
        'student_grades': student_grades
    }

    return jsonify(table_data)


@attendanceLog_bp.route('/update-grades', methods=['POST'])
def update_grades():
    data = request.json
    student_id = data['studentId']
    class_number = data['classNumber']
    class_letter = data['classLetter']
    month_or_trimester = data['monthOrTrimester']
    date_str = data['date']
    grades = data['grade']


    if grades not in ['1', '2', '3', '4', '5', 'н']:
        return jsonify({'status': 'error', 'message': 'Неправильна оцінка'}), 400

    date = datetime.strptime(date_str, '%Y-%m-%d').date()


    record = AttendanceLog.query.filter_by(
        student_id=student_id,
        class_number=class_number,
        class_letter=class_letter,
        month_or_trimester=month_or_trimester,
        date=date
    ).first()

    if not record:
        record = AttendanceLog(
            student_id=student_id,
            class_number=class_number,
            class_letter=class_letter,
            month_or_trimester=month_or_trimester,
            date=date
        )
        db.session.add(record)

    record.grades = grades

    db.session.commit()
    return jsonify({'status': 'success', 'message': 'Grade updated successfully'})

@attendanceLog_bp.route('/get-grades')
def get_grades():
    class_number = request.args.get('class_number')
    class_letter = request.args.get('class_letter')
    month_or_trimester = request.args.get('month_or_trimester')


    students = User.query.filter_by(
        user_class=class_number, 
        user_subclass=class_letter
    ).all()
    student_list = [{'student_id': student.id, 'student_name': student.username} for student in students]

    grades_data = {}
    for student in students:
        grades_data[student.id] = {}
        attendance_records = AttendanceLog.query.filter_by(
            student_id=student.id,
            class_number=class_number,
            class_letter=class_letter,
            month_or_trimester=month_or_trimester
        ).all()
        for record in attendance_records:
            date_str = record.date.strftime('%Y-%m-%d')
            grades_data[student.id][date_str] = record.grades or 'Н'

    return jsonify({
        'students': student_list,
        'grades': grades_data
    })
@attendanceLog_bp.route('/get-class-attendance-data')
def get_class_attendance_data():
    class_number = request.args.get('class_number')
    class_letter = request.args.get('class_letter')
    month_or_trimester = request.args.get('month_or_trimester')

    if not class_number or not class_letter:
        return jsonify({'status': 'error', 'message': 'Клас або підклас не вказано'}), 400

    students = User.query.filter_by(user_class=class_number, user_subclass=class_letter).all()
    if not students:
        return jsonify({'status': 'error', 'message': 'Студенти не знайдені'}), 404

    student_list = [{'student_id': student.id, 'student_name': student.username} for student in students]

    active_courses = Course.query.filter_by(is_active=True).all()
    course_list = [{'course_id': course.id, 'course_title': course.title} for course in active_courses]

    grades_data = {}
    attendance_data = {}
    student_grades = {student.id: {} for student in students}

    for student in students:
        grades_data[student.id] = {}
        attendance_data[student.id] = {}
        records = AttendanceLog.query.filter_by(
            student_id=student.id,
            class_number=class_number,
            class_letter=class_letter,
            month_or_trimester=month_or_trimester
        ).all()
        for record in records:
            date_str = record.date.strftime('%Y-%m-%d')
            grades_data[student.id][date_str] = record.grades or 'Н'
            attendance_data[student.id][date_str] = record.attendance_data or 'Присутній'

        user_courses = UserCourse.query.filter_by(student_id=student.id).all()
        for uc in user_courses:
            student_grades[student.id][uc.course_id] = uc.grade or '0'

    trimester, month_str = month_or_trimester.split('-')
    month = int(month_str.lstrip('0')) 
    year = datetime.now().year
    num_days = calendar.monthrange(year, month)[1]
    dates = [datetime(year, month, day).strftime('%Y-%m-%d') for day in range(1, num_days + 1)]
    month_name = UKRAINIAN_MONTHS[month - 1]
    trimester_name = ["Перший", "Другий", "Третій"][int(trimester) - 1]

    return jsonify({
        'students': student_list,
        'courses': course_list,
        'grades_data': grades_data,
        'attendance_data': attendance_data,
        'dates': dates,
        'month_and_trimester': f"{trimester_name} триместр: {month_name}",
        'student_grades': student_grades
    })
