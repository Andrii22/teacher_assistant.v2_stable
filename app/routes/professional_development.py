from flask import Blueprint, request, jsonify
from app.models import ProfessionalDevelopment
from app.extensions import db
from datetime import datetime

professional_development = Blueprint('professional_development', __name__)

@professional_development.route('/add_professional_development', methods=['POST'])
def add_professional_development():
    data = request.json
    new_entry = ProfessionalDevelopment(**data)
    db.session.add(new_entry)
    db.session.commit()
    return jsonify(success=True, message="Entry added successfully!")

@professional_development.route('/update_professional_development/<int:id>', methods=['POST'])
def update_professional_development(id):
     data = request.json
     print("Received data:", data)
     entry = ProfessionalDevelopment.query.get_or_404(id)
     try:
         for key, value in data.items():
             setattr(entry, key, value)
         db.session.commit()
     except Exception as e:
         print
         return jsonify(success=False, message="Error updating entry.")
     updated_entry = ProfessionalDevelopment.query.get_or_404(id)
     return jsonify(success=True, message="Entry updated successfully!", updated_data=updated_entry.to_dict())

@professional_development.route('/get_all_entries', methods=['GET'])
def get_all_entries():
    entries = ProfessionalDevelopment.query.all()
    return jsonify([entry.to_dict() for entry in entries])