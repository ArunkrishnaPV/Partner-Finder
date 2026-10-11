from flask import Flask, jsonify
from flask_cors import CORS
from backend.routes.profile import profile_bp
from backend.routes.partners import partners_bp
from backend.routes.requests import requests_bp
from backend.routes.connections import connections_bp
from backend.routes.notifications import notifications_bp

app = Flask(__name__)
CORS(app) # Restrict in production

# Register blueprints
app.register_blueprint(profile_bp, url_prefix='/api/profile')
app.register_blueprint(partners_bp, url_prefix='/api/partners')
app.register_blueprint(requests_bp, url_prefix='/api/requests')
app.register_blueprint(connections_bp, url_prefix='/api/connections')
app.register_blueprint(notifications_bp, url_prefix='/api/notifications')

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"}), 200

if __name__ == '__main__':
    import os
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', debug=debug, port=port)
