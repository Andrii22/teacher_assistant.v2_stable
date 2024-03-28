from flask import render_template, request, session, Blueprint, jsonify
from flask import current_app as app
from app.extensions import db
from app.models import Notes
import logging
notes = Blueprint('notes', __name__)
logging.basicConfig(level=logging.DEBUG)
@notes.route('/save_notes', methods=['POST'])
def save_notes():
    logging.debug("Entering save_notes route...")
    user_id = session.get('user_id')
    if not user_id:
        return jsonify(success=False, message="User not logged in")

    title = request.form.get('title')
    content = request.form.get('content')

    new_note = Notes(user_id=user_id, title=title, content=content)
    db.session.add(new_note)
    db.session.commit()

    return jsonify(success=True)

@notes.route('/get_saved_notes', methods=['GET'])
def get_saved_notes():
    logging.debug("Entering save_notes route...")
    user_id = session.get('user_id')
    if not user_id:
        return jsonify(success=False, message="User not logged in")

    note_entries = Notes.query.filter_by(user_id=user_id).all()

    if note_entries:
        notes_list = [
            {'id': note.id, 'title': note.title, 'content': note.content,
             'timestamp': note.timestamp.strftime('%Y-%m-%d %H:%M:%S')}
            for note in note_entries
        ]
        return jsonify(success=True, notes=notes_list)
    else:
        return jsonify(success=True, notes=[])


@notes.route('/delete_note', methods=['POST'])
def delete_note():
    logging.debug("Entering save_notes route...")
    note_id = request.form.get('note_id')

    note_entry = Notes.query.filter_by(id=note_id).first()
    if note_entry:
        db.session.delete(note_entry)
        db.session.commit()
        return jsonify(success=True)
    else:
        return jsonify(success=False, message="Note not found")

@notes.route('//update_note', methods=['POST'])
def update_note():
    logging.debug("Entering save_notes route...")
    note_id = request.form['note_id']
    title = request.form['title']
    content = request.form['content']

    note = Notes.query.get(note_id)
    if not note:
        return jsonify(success=False, message="Note not found")

    note.title = title
    note.content = content
    db.session.commit()

    return jsonify(success=True) 