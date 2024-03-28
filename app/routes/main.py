from flask import render_template, request, session, flash, redirect, url_for,Blueprint
from flask import current_app as app
from app.extensions import db
from app.models import User
import os
from werkzeug.utils import secure_filename
main = Blueprint('main', __name__)
@main.route('/')
def index():
    return render_template('index.html')
def user_login(user):
    user.is_online = True
    db.session.commit()
    session['user_id'] = user.id
@main.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user_class = request.form.get('user_class', None)
        user_subclass = request.form.get('user_subclass', None)
        existing_user = User.query.filter_by(username=username).first()

        if existing_user:
            flash('Користувач з таким логіном вже існує. Спробуйте інший!', 'error')
            return render_template('register.html')

        if 'profile_photo' in request.files and request.files['profile_photo'].filename != '':
            profile_photo = save_profile_image(request.files['profile_photo'])
        else:
            profile_photo = 'user.png'

        if len(username) < 8 or len(password) < 8:
            flash('Поля Логін та Пароль мають містити не менше 8 символів!', 'error')
        elif not username or not password:
            flash('Заповніть всі необхідні поля!', 'error')
        else:
            role = 'teacher' if username == 'admin_admin' and password == 'admin_admin' else 'student'

            new_user = User(
                username=username,
                password=password,
                profile_photo=profile_photo,
                ip_address=request.remote_addr,
                is_online=True,
                role=role,
                user_class=user_class,
                user_subclass=user_subclass
            )
            db.session.add(new_user)
            db.session.commit()
            flash('Реєстрація пройшла успішно!', 'success')
            session.clear()
            session['user_id'] = new_user.id
            return redirect(url_for(f'user.{new_user.role}_home'))

    return render_template('register.html')

def save_profile_image(image):
    filename = secure_filename(image.filename)
    file_path = os.path.join(app.config['USER_ICON'], filename)
    image.save(file_path)
    return filename
@main.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        if len(username) < 8 or len(password) < 8:
            flash('Поля Логін та Пароль мають містити не менше 8 символів!', 'error')
            return render_template('login.html')

        user = User.query.filter_by(
            username=username, password=password).first()

        if not user:
            flash('Помилка входу! Перевірте дані та спробуйте ще раз.', 'error')
            return render_template('login.html')

        if user.is_banned:
            flash('Ви заблоковані адміністратором!', 'error')
            return render_template('login.html')

        user_login(user)
        flash('Вхід успішний!', 'success')
        return redirect(url_for(f'user.{user.role}_home'))

    return render_template('login.html')
@main.route('/logout')
def logout():
    if 'user_id' in session:
        user_id = session['user_id']
        user = User.query.get(user_id)
        if user:
            user.is_online = False
            db.session.commit()

    session.clear()
    return redirect(url_for('main.index'))