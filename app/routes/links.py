from flask import Blueprint, request, session, render_template, flash,redirect,url_for, jsonify
from app.models import  Link,Folder
from app.extensions import db
import os


from config import Config

links_bp = Blueprint('links', __name__)

@links_bp.route('/link/create', methods=['POST'])
def create_link():
    data = request.json
    link_name = data.get('name')
    link_url = data.get('url')
    folder_id = data.get('folder_id')
    
    if not all([link_name, link_url, folder_id]):
        return jsonify({'error': 'Link name, URL, and folder ID are required!'}), 400

    link = Link(name=link_name, url=link_url, folder_id=folder_id)
    db.session.add(link)
    db.session.commit()
    
    return jsonify({'message': 'Link created!', 'link_id': link.id}), 201

@links_bp.route('/folder/<int:folder_id>/links', methods=['GET'])
def get_links(folder_id):
    links = Link.query.filter_by(folder_id=folder_id).all()
    return jsonify([{'id': link.id, 'name': link.name, 'url': link.url} for link in links])

@links_bp.route('/all-links', methods=['GET'])
def get_all_links():
    links = Link.query.all()
    return jsonify([{'id': link.id, 'name': link.name, 'url': link.url, 'folder_id': link.folder_id} for link in links])


@links_bp.route('/link/<int:link_id>/update', methods=['PUT'])
def update_link(link_id):
    link = Link.query.get_or_404(link_id)
    data = request.json
    link_name = data.get('name')
    link_url = data.get('url')

    if not all([link_name, link_url]):
        return jsonify({'error': 'Link name and URL are required!'}), 400

    link.name = link_name
    link.url = link_url
    db.session.commit()
    
    return jsonify({'message': 'Link updated!'})

@links_bp.route('/link/<int:link_id>/delete', methods=['DELETE'])
def delete_link(link_id):
    link = Link.query.get_or_404(link_id)
    db.session.delete(link)
    db.session.commit()
    return jsonify({'message': 'Link deleted!'}), 200