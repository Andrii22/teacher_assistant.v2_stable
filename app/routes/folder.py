from flask import Blueprint, request, session, render_template, flash, redirect, url_for, jsonify
from app.models import Folder
from app.extensions import db



folders_bp = Blueprint("folders", __name__)


@folders_bp.route("/folder/create", methods=["POST"])
def create_folder():
    data = request.json
    folder_name = data.get("name")
    parent_folder_id = data.get("parent_folder_id", None)

    if not folder_name:
        return jsonify({"error": "Folder name is required!"}), 400

    folder = Folder(name=folder_name, parent_folder_id=parent_folder_id)
    db.session.add(folder)
    db.session.commit()

    return jsonify({"message": "Folder created!", "folder_id": folder.id}), 201

@folders_bp.route("/folders", methods=["GET"])
def get_all_folders():
    folders = Folder.query.filter(Folder.parent_folder_id.is_(None)).all()
    return jsonify([folder.name for folder in folders])




@folders_bp.route("/folder/<int:folder_id>/update", methods=["PUT"])
def update_folder(folder_id):
    folder = Folder.query.get_or_404(folder_id)
    data = request.json
    folder_name = data.get("name")

    if not folder_name:
        return jsonify({"error": "Folder name is required!"}), 400

    folder.name = folder_name
    db.session.commit()

    return jsonify({"message": "Folder updated!"})


@folders_bp.route("/folder/<int:folder_id>/delete", methods=["DELETE"])
def delete_folder(folder_id):
    folder = Folder.query.get_or_404(folder_id)
    db.session.delete(folder)
    db.session.commit()
    return jsonify({"message": "Folder deleted!"}), 200
def folder_to_dict(folder):
    """Convert a folder to a dictionary with its children."""
    return {
        "id": folder.id,
        "name": folder.name,
        "children": [folder_to_dict(child) for child in Folder.query.filter_by(parent_folder_id=folder.id).all()]
    }

@folders_bp.route("/folder/getAll", methods=["GET"])
def get_all_folders_recursive():
    """Get all folders and their children."""
    root_folders = Folder.query.filter(Folder.parent_folder_id.is_(None)).all()
    return jsonify([folder_to_dict(root_folder) for root_folder in root_folders])