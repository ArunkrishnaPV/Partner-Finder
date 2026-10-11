import os
from functools import wraps
from flask import request, jsonify
import jwt
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path=env_path)
load_dotenv()

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid Authorization header'}), 401
            
        token = auth_header.split('Bearer ')[1].strip()
        
        # 1. First attempt: Verify using Supabase Auth API
        try:
            from backend.supabase_config import get_db
            db = get_db()
            if db:
                user_res = db.auth.get_user(token)
                if user_res and user_res.user:
                    request.user = {
                        'uid': user_res.user.id,
                        'email': getattr(user_res.user, 'email', '')
                    }
                    return f(*args, **kwargs)
        except Exception as e:
            # Fall back to JWT decoding
            pass

        # 2. Second attempt: Decode JWT with secret if configured
        jwt_secret = os.getenv('SUPABASE_JWT_SECRET')
        if jwt_secret:
            try:
                decoded_token = jwt.decode(
                    token,
                    jwt_secret,
                    algorithms=["HS256"],
                    options={"verify_aud": False}
                )
                request.user = {
                    'uid': decoded_token.get('sub'),
                    'email': decoded_token.get('email', '')
                }
                return f(*args, **kwargs)
            except Exception:
                pass

        # 3. Third attempt: Decode without signature verification
        try:
            decoded_token = jwt.decode(token, options={"verify_signature": False})
            request.user = {
                'uid': decoded_token.get('sub'),
                'email': decoded_token.get('email', '')
            }
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': f'Unauthorized: {str(e)}'}), 401
            
    return decorated_function
