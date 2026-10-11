from flask import Blueprint, request, jsonify
from backend.auth_utils import require_auth
from backend.supabase_config import get_db
import datetime

requests_bp = Blueprint('requests', __name__)

@requests_bp.route('', methods=['POST'])
@require_auth
def create_request():
    db = get_db()
    if not db: return jsonify({"error": "DB err"}), 500
    
    uid = request.user['uid']
    data = request.json
    receiver_id = data.get('receiverId')
    
    if not receiver_id or uid == receiver_id:
        return jsonify({"error": "Invalid receiver"}), 400
        
    existing = db.table('requests').select('*').eq('senderId', uid).eq('receiverId', receiver_id).execute()
    if existing.data:
        return jsonify({"error": "Request already sent"}), 400
        
    db.table('requests').insert({
        'senderId': uid,
        'receiverId': receiver_id,
        'status': 'pending'
    }).execute()
    
    sender_res = db.table('students').select('name').eq('uid', uid).execute()
    sender_name = sender_res.data[0]['name'] if sender_res.data else 'Someone'
    
    db.table('notifications').insert({
        'userId': receiver_id,
        'title': 'New Partner Request',
        'message': f'{sender_name} has sent you a partner request.',
        'type': 'request'
    }).execute()
    
    return jsonify({"message": "Request sent"}), 201

@requests_bp.route('', methods=['GET'])
@require_auth
def get_requests():
    db = get_db()
    if not db: return jsonify([])
    
    uid = request.user['uid']
    req_type = request.args.get('type', 'incoming')
    
    if req_type == 'incoming':
        reqs = db.table('requests').select('*').eq('receiverId', uid).execute()
    else:
        reqs = db.table('requests').select('*').eq('senderId', uid).execute()
        
    results = []
    for r in reqs.data:
        other_id = r['senderId'] if req_type == 'incoming' else r['receiverId']
        other_doc = db.table('students').select('name').eq('uid', other_id).execute()
        r['partnerName'] = other_doc.data[0]['name'] if other_doc.data else 'Unknown'
        results.append(r)
        
    return jsonify(results), 200

@requests_bp.route('/<req_id>', methods=['PUT'])
@require_auth
def update_request(req_id):
    db = get_db()
    if not db: return jsonify({"error": "DB missing"}), 500
    
    uid = request.user['uid']
    data = request.json
    status = data.get('status')
    
    if status not in ['accepted', 'rejected', 'withdrawn']:
        return jsonify({"error": "Invalid status"}), 400
        
    req_res = db.table('requests').select('*').eq('id', req_id).execute()
    if not req_res.data:
        return jsonify({"error": "Not found"}), 404
        
    req_data = req_res.data[0]
    
    if status in ['accepted', 'rejected'] and req_data['receiverId'] != uid:
        return jsonify({"error": "Unauthorized"}), 403
    if status == 'withdrawn' and req_data['senderId'] != uid:
        return jsonify({"error": "Unauthorized"}), 403
        
    db.table('requests').update({
        'status': status,
        'updatedAt': datetime.datetime.utcnow().isoformat()
    }).eq('id', req_id).execute()
    
    if status == 'accepted':
        u1, u2 = sorted([req_data['senderId'], req_data['receiverId']])
        conn_id = f"{u1}_{u2}"
        db.table('connections').insert({
            'id': conn_id,
            'user1': u1,
            'user2': u2,
            'participants': [u1, u2]
        }).execute()
        
    return jsonify({"message": f"Request {status}"}), 200
