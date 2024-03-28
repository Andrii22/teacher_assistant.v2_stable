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
from app.models import File, Folder
from app.extensions import db
import os
from config import Config
from werkzeug.utils import secure_filename

files_bp = Blueprint("files", __name__)



def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS2

@files_bp.route('/file/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    folder_id = request.form.get('folder_id')
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(Config.UPLOADS_FILE, filename)
        file.save(file_path)
        new_file = File(name=filename, folder_id=folder_id, file_path=file_path)
        db.session.add(new_file)
        db.session.commit()
        return jsonify({'message': 'File uploaded!', 'file_id': new_file.id}), 201

@files_bp.route('/folder/<int:folder_id>/files', methods=['GET'])
def get_files(folder_id):
    files = File.query.filter_by(folder_id=folder_id).all()
    return jsonify([{'id': file.id, 'name': file.name, 'size': file.size} for file in files])



@files_bp.route('/file/<int:file_id>/delete', methods=['DELETE'])
def delete_file(file_id):
    file = File.query.get(file_id)
    if file:
        try:
            os.remove(file.file_path) 
            db.session.delete(file)
            db.session.commit()
            return jsonify({'message': 'File deleted!'}), 200
        except Exception as e:
            print(e)
            return jsonify({'error': 'Error deleting file'}), 500
    else:
        return jsonify({'error': 'File not found'}), 404

@files_bp.route("/file/<int:file_id>/download", methods=["GET"])
def download_file(file_id):
     file = File.query.get_or_404(file_id)
     directory = os.path.join("app", "static", "uploads")
     filename = os.path.basename(file.file_path)
     full_path = os.path.join(directory, filename)

     #  debug info
     print(f"Attempting to access file at: {full_path}")
     if not os.path.exists(full_path):
         print(f"File not found at: {full_path}")
         return "File not found", 404

     return send_from_directory(directory, filename, as_attachment=True)

@files_bp.route("/all-files", methods=["GET"])
def get_all_files():
    files = File.query.all()
    return jsonify(
        [{"id": file.id, "name": file.name, "size": file.size, "folder_id": file.folder_id} for file in files]
    )