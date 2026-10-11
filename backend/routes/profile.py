from flask import Blueprint, request, jsonify
from backend.auth_utils import require_auth
from backend.supabase_config import get_db
from backend.matching import calculate_profile_completion
import datetime

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('', methods=['POST'])
@require_auth
def create_profile():
    db = get_db()
    if not db:
        return jsonify({"error": "Database not initialized"}), 500
        
    uid = request.user['uid']
    data = request.json
    
    # Check if exists
    res = db.table('students').select('uid').eq('uid', uid).execute()
    if res.data:
        return jsonify({"error": "Profile already exists"}), 400
        
    profile_data = {
        'uid': uid,
        'name': data.get('name', ''),
        'email': data.get('email', request.user.get('email', '')),
        'profileComplete': 15
    }
    
    db.table('students').insert(profile_data).execute()
    return jsonify({"message": "Profile created"}), 201

@profile_bp.route('/me', methods=['GET'])
@require_auth
def get_profile():
    db = get_db()
    if not db:
        return jsonify({'name': 'Test User', 'profileComplete': 0})
        
    uid = request.user['uid']
    res = db.table('students').select('*').eq('uid', uid).execute()
    
    if not res.data:
        # Create student profile record automatically if it does not exist yet
        new_profile = {
            'uid': uid,
            'name': request.user.get('email', '').split('@')[0],
            'email': request.user.get('email', ''),
            'profileComplete': 15
        }
        db.table('students').insert(new_profile).execute()
        return jsonify(new_profile), 200
        
    return jsonify(res.data[0]), 200

@profile_bp.route('/me', methods=['PUT'])
@require_auth
def update_profile():
    db = get_db()
    if not db:
        return jsonify({"error": "Database not initialized"}), 500
        
    uid = request.user['uid']
    data = request.json
    
    completion = calculate_profile_completion(data)
    data['profileComplete'] = completion
    data['updatedAt'] = datetime.datetime.utcnow().isoformat()
    
    db.table('students').update(data).eq('uid', uid).execute()
    return jsonify({"message": "Profile updated", "completion": completion}), 200
