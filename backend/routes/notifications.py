from flask import Blueprint, request, jsonify
from backend.auth_utils import require_auth
from backend.supabase_config import get_db

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('', methods=['GET'])
@require_auth
def get_notifications():
    db = get_db()
    if not db: return jsonify([])
    
    uid = request.user['uid']
    notifs = db.table('notifications').select('*').eq('userId', uid).order('createdAt', desc=True).limit(20).execute()
    return jsonify(notifs.data), 200

@notifications_bp.route('/<notif_id>/read', methods=['PUT'])
@require_auth
def mark_read(notif_id):
    db = get_db()
    if not db: return jsonify({"error": "DB error"}), 500
    
    uid = request.user['uid']
    doc_res = db.table('notifications').select('userId').eq('id', notif_id).execute()
    
    if not doc_res.data or doc_res.data[0].get('userId') != uid:
        return jsonify({"error": "Unauthorized"}), 403
        
    db.table('notifications').update({'read': True}).eq('id', notif_id).execute()
    return jsonify({"message": "Marked read"}), 200
