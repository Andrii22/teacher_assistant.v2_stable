from flask import Blueprint, request, jsonify, current_app
from app.models import Schedule
from app.extensions import db
import os
from app.models.schedule import DayOfWeek

schedule_bp = Blueprint('schedule', __name__)

@schedule_bp.route('/schedule', methods=['GET'])
def get_schedule():
    class_number = request.args.get('class_number')
    class_letter = request.args.get('class_letter')
    try:
        class_number = int(class_number)
    except ValueError:
        return jsonify({"message": "Invalid class number!"}), 400

    schedules = Schedule.query.filter_by(
        class_number=class_number, class_letter=class_letter).all()
    print(schedules)
    print(f"Query parameters: class_number={class_number}, class_letter={class_letter}")
    return jsonify([{
        "day_of_week": schedule.day_of_week.name,
        "lesson_time": schedule.lesson_time,
        "description": schedule.description
    } for schedule in schedules])


@schedule_bp.route('/schedule', methods=['POST'])
def save_schedule():
    data = request.json
    class_number = data['class_number']
    class_letter = data['class_letter']
    day_of_week = DayOfWeek[data['day_of_week']]
    lesson_time = data['lesson_time']
    description = data.get('description')  
    
    schedule = Schedule.query.filter_by(
        class_number=class_number, 
        class_letter=class_letter, 
        day_of_week=day_of_week, 
        lesson_time=lesson_time
    ).first()
    
    if not schedule:
        new_schedule = Schedule(
            day_of_week=day_of_week, 
            lesson_time=lesson_time,
            class_number=class_number, 
            class_letter=class_letter,
            description=description  
        )
        db.session.add(new_schedule)
    else:
        schedule.description = description  

    db.session.commit()
    return jsonify({"message": "Schedule saved successfully!"})

@schedule_bp.route('/schedule', methods=['DELETE'])
def delete_schedule():
    data = request.json
    class_number = data['class_number']
    class_letter = data['class_letter']
    day_of_week = DayOfWeek[data['day_of_week']]
    lesson_time = data['lesson_time']
    
    schedule = Schedule.query.filter_by(
        class_number=class_number, 
        class_letter=class_letter, 
        day_of_week=day_of_week, 
        lesson_time=lesson_time
    ).first()
    
    if schedule:
        db.session.delete(schedule)
        db.session.commit()
        return jsonify({"message": "Schedule deleted successfully!"})
    else:
        return jsonify({"message": "Schedule not found!"}), 404
@schedule_bp.route('/update-schedule', methods=['POST'])
def update_schedule():
    data = request.json
    class_number = data['class_number']
    class_letter = data['class_letter']
    day_of_week = DayOfWeek[data['day_of_week']]
    lesson_time = data['lesson_time']
    new_description = data['description']

    schedule = Schedule.query.filter_by(
        class_number=class_number, 
        class_letter=class_letter, 
        day_of_week=day_of_week, 
        lesson_time=lesson_time
    ).first()
    
    if schedule:
        schedule.description = new_description
        db.session.commit()
        return jsonify({"message": "Schedule updated successfully!"})
    else:
        return jsonify({"message": "Schedule not found!"}), 404
