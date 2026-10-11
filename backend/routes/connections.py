from flask import Blueprint, request, jsonify
from backend.auth_utils import require_auth
from backend.supabase_config import get_db

connections_bp = Blueprint('connections', __name__)

@connections_bp.route('', methods=['GET'])
@require_auth
def get_connections():
    db = get_db()
    if not db: return jsonify([])
    
    uid = request.user['uid']
    conns_res = db.table('connections').select('*').contains('participants', [uid]).execute()
    
    results = []
    for c in conns_res.data:
        partner_id = c['user2'] if c['user1'] == uid else c['user1']
        
        p_res = db.table('students').select('name').eq('uid', partner_id).execute()
        p_name = p_res.data[0]['name'] if p_res.data else 'Unknown'
        
        results.append({
            'id': c['id'],
            'partnerId': partner_id,
            'partnerName': p_name,
            'createdAt': c['createdAt']
        })
            
    return jsonify(results), 200
