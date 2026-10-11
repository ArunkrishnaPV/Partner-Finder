from flask import Blueprint, request, jsonify
from backend.auth_utils import require_auth
from backend.supabase_config import get_db
from backend.matching import calculate_match_score

partners_bp = Blueprint('partners', __name__)

@partners_bp.route('', methods=['GET'])
@require_auth
def get_partners():
    db = get_db()
    if not db: return jsonify([])
        
    uid = request.user['uid']
    
    # Get current user profile
    user_res = db.table('students').select('*').eq('uid', uid).execute()
    if not user_res.data:
        return jsonify({"error": "Complete profile first"}), 400
    user_profile = user_res.data[0]
    
    # Get connections to exclude
    conn_res = db.table('connections').select('participants').contains('participants', [uid]).execute()
    connected_uids = {uid}
    for c in conn_res.data:
        connected_uids.update(c.get('participants', []))
        
    # Query other students
    query = db.table('students').select('*')
    
    dept_filter = request.args.get('dept')
    if dept_filter: query = query.eq('department', dept_filter)
    year_filter = request.args.get('year')
    if year_filter: query = query.eq('year', year_filter)
    type_filter = request.args.get('type')
    if type_filter: query = query.eq('partnerType', type_filter)
        
    students_res = query.execute()
    
    q = request.args.get('q', '').lower()
    results = []
    
    for partner_profile in students_res.data:
        if partner_profile['uid'] in connected_uids:
            continue
            
        if q:
            searchable = " ".join(partner_profile.get('subjects', []) + partner_profile.get('skills', []) + partner_profile.get('interests', [])).lower()
            if q not in searchable:
                continue
                
        match_data = calculate_match_score(user_profile, partner_profile)
        partner_profile.pop('email', None)
        partner_profile.update(match_data)
        results.append(partner_profile)
        
    results.sort(key=lambda x: x['score'], reverse=True)
    return jsonify(results), 200

@partners_bp.route('/<partner_id>', methods=['GET'])
@require_auth
def get_partner_profile(partner_id):
    db = get_db()
    if not db: return jsonify({"error": "DB missing"}), 500
        
    uid = request.user['uid']
    user_res = db.table('students').select('*').eq('uid', uid).execute()
    partner_res = db.table('students').select('*').eq('uid', partner_id).execute()
    
    if not user_res.data or not partner_res.data:
        return jsonify({"error": "Profile not found"}), 404
        
    user_profile = user_res.data[0]
    partner_profile = partner_res.data[0]
    
    match_data = calculate_match_score(user_profile, partner_profile)
    partner_profile.pop('email', None)
    partner_profile.update(match_data)
    
    return jsonify(partner_profile), 200
