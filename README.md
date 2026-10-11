# PartnerFinder

"Find the right partner. Learn together. Build together."

PartnerFinder helps college students discover compatible study or project partners based on subjects, skills, interests, and availability. It uses a deterministic matching algorithm to calculate a compatibility score, focusing entirely on objective alignment without LLMs or AI magic.

## Features
- **Deterministic Matching**: Find peers based on complementary skills, shared subjects, overlapping interests, and synchronized availability.
- **Academic Focus**: Built specifically for engineering students with department, year, and subject filtering.
- **Interactions**: Send partner requests, manage connections, and receive notifications.

## Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript, Firebase Authentication (CDN).
- **Backend**: Python 3, Flask, Firebase Admin SDK.
- **Database**: Firestore.

## Folder Structure
- `frontend/`: Contains all HTML, CSS, and vanilla JS for the UI.
- `backend/`: Contains the Flask API, matching algorithm, and routing logic.
- `firestore.rules`: Security rules for Firestore.
- `firestore.indexes.json`: Composite indexes required for the database.

## Setup Instructions

### 1. Firebase Authentication and Firestore Setup
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project.
3. Enable **Authentication** (Email/Password).
4. Enable **Firestore Database**.
5. Deploy `firestore.rules` and `firestore.indexes.json` via the Firebase CLI:
   ```bash
   firebase deploy --only firestore
   ```

### 2. Frontend Configuration
1. In Firebase Console, go to Project Settings > General.
2. Add a Web App and copy the Firebase configuration object.
3. Open `frontend/js/firebase-config.js` and replace the placeholder `firebaseConfig` object with your actual keys.

### 3. Backend Configuration
1. In Firebase Console, go to Project Settings > Service Accounts.
2. Click "Generate new private key". Save the JSON file securely on your machine (e.g., in the backend folder, but **do not commit it to version control**).
3. Navigate to the `backend/` directory.
4. Copy `.env.example` to `.env`.
5. Set `FIREBASE_SERVICE_ACCOUNT_PATH` in `.env` to the absolute path of your downloaded JSON key file.

### 4. Running the Backend
1. Ensure Python 3 is installed.
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
4. Run the Flask server:
   ```bash
   set PYTHONPATH=.
   python backend/app.py
   ```
The backend will run on `http://127.0.0.1:5000`.

### 5. Running the Frontend
You must serve the frontend files using a local HTTP server (do not just open the HTML files in the browser).
```bash
cd frontend
python -m http.server 8000
```
Open `http://localhost:8000/index.html` in your browser.

## API Documentation
All endpoints (except `/health`) require an `Authorization` header containing a valid Firebase ID token:
`Authorization: Bearer <YOUR_ID_TOKEN>`

### Endpoints
- `POST /api/profile`: Create user profile.
- `GET /api/profile/me`: Get current profile.
- `PUT /api/profile/me`: Update profile.
- `GET /api/partners`: Search ranked matches (`?dept=`, `?year=`, `?type=`, `?q=`).
- `GET /api/partners/<id>`: Get partner profile with match score.
- `POST /api/requests`: Send a connection request.
- `GET /api/requests`: Get requests (`?type=incoming|outgoing`).
- `PUT /api/requests/<id>`: Accept/Reject/Withdraw request (`{"status": "accepted"}`).
- `GET /api/connections`: Get connections.
- `GET /api/notifications`: Get recent notifications.
- `PUT /api/notifications/<id>/read`: Mark notification as read.

## Matching Algorithm details
The algorithm calculates compatibility out of 100 based on exact Jaccard similarity across four axes:
- Subjects (40%)
- Skills (30%)
- Interests (15%)
- Availability Slots (15%)

Labels provided:
- Excellent (80-100)
- Good (60-79)
- Moderate (40-59)
- Low (0-39)

## Testing
Run unit tests for the matching algorithm from the root directory:
```bash
set PYTHONPATH=.
python -m unittest backend/tests/test_matching.py
```
