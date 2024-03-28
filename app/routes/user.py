from flask import render_template, request, session, flash, redirect, url_for,Blueprint
from flask import current_app as app
from app.extensions import db
from app.models import User
user = Blueprint('user', __name__)
@user.route('/student_home')
def student_home():
    if 'user_id' in session:
        user_id = session['user_id']
        user = User.query.get(user_id)
        if user:

            profile_photo = user.profile_photo

            return render_template('student_home.html', user=user, profile_photo=profile_photo)
        else:
            return "Користувача не знайдено, будь-ласка увійдіть ще раз!", 404
    else:
        return "Користувача не знайдено, будь-ласка увійдіть ще раз!", 404
@user.route('/teacher_home')
def teacher_home():
    if 'user_id' in session:
        user_id = session['user_id']

        user = User.query.get(user_id)
        if user:

            profile_photo = user.profile_photo
            return render_template('teacher_home.html', user=user, profile_photo=profile_photo)
        else:
            return "Користувача не знайдено, будь-ласка увійдіть ще раз!", 404
    else:
        return "Користувача не знайдено, будь-ласка увійдіть ще раз!", 404
    
@user.route("/update_user_status", methods=["POST"])
def update_user_status():
    user_ids = request.form.getlist("user_ids[]")
    new_status = request.form.get("new_status")

    for user_id in user_ids:
        user = User.query.get(user_id)
        if user:
            user.is_banned = (new_status == "Заблоковано")
            db.session.add(user)

    try:
        db.session.commit()
        print("Changes committed to the database successfully")
        return "success"
    except Exception as e:
        db.session.rollback()
        print("Error while committing changes to the database:", str(e))
        return "error", 500
@user.route('/delete_selected_users', methods=['POST'])
def delete_selected_users():
    user_ids = request.form.getlist('user_ids[]')

    for user_id in user_ids:
        user = User.query.get(user_id)
        if user:
            db.session.delete(user)

    db.session.commit()
    return "success"
@user.route('/get_students')
def get_students():

    students = User.query.filter_by(role='student').all()
    student_data = []

    for student in students:
        student_data.append({
            'username': student.username,
            'user_class': f"{student.user_class} {student.user_subclass}",
            'is_online': student.is_online,
            'ip_address': student.ip_address,
            'status': 'Заблоковано' if student.is_banned else 'Активний',
            'id': student.id
        })
    return render_template('student_list.html', students=student_data)
@user.before_request
def check_banned_status():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user and user.is_banned:
            flash('You have been blockedby the administrator!', 'error')
            session.clear()
            return redirect(url_for('main.login'))
