# API Endpoints Documentation

## Auth Endpoints

### POST /api/auth/register
- Registers a new user.
- Request Body: RegisterRequest (username, password, etc.)
- Response: 200 OK or error

### POST /api/auth/login
- Authenticates a user and returns a token.
- Request Body: LoginRequest (username, password)
- Response: AuthResponse (token, user info)

---

## Meetings Endpoints

### POST /api/meetings/upload
- Uploads a meeting file.
- Request: Multipart form-data (file, optional title)
- Response: MeetingResponse (meeting details)

### GET /api/meetings
- Gets all meetings.
- Response: List of MeetingResponse

### GET /api/meetings/{id}
- Gets a specific meeting by ID.
- Response: MeetingResponse

---

## Notes
- All endpoints are under `/api/`.
- Auth endpoints require no authentication for register/login.
- Meetings endpoints may require authentication.
