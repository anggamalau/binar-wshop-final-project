# Product Requirements Document (PRD)
## Diary Book - Personal Digital Diary Application

### 1. Product Overview

#### 1.1 Product Name
**Diary Book**

#### 1.2 Product Description
Diary Book is a monolithic web application that allows users to create, manage, and search their personal diary entries. Built with Express.js and EJS templates, it provides a simple, secure, and responsive interface for users to document their daily thoughts and experiences.

#### 1.3 Target Users
- Individuals who want to maintain a digital diary
- People looking for a private, secure platform to record their thoughts
- Users who prefer a simple, distraction-free writing experience

#### 1.4 Key Features
- User authentication with JWT
- Create, read, update, and delete diary entries
- Search functionality by content and date
- Simple dashboard with diary list
- Responsive web interface

### 2. Technical Stack 

#### 2.1 Backend
- **Framework**: Express.js (Node.js)
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **ORM**: Sequelize or raw SQL queries

#### 2.2 Frontend
- **Template Engine**: EJS (Embedded JavaScript)
- **CSS Framework**: Bootstrap 5 or custom CSS
- **JavaScript**: Vanilla JS for client-side interactions

#### 2.3 Development Tools
- **Environment Variables**: dotenv
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **Session Management**: express-session (optional with JWT)

### 3. User Stories

#### 3.1 Authentication
**US-001: User Registration**
- **As a** new user
- **I want to** create an account
- **So that** I can start writing my diary entries

**Acceptance Criteria:**
- User can register with email and password
- Email must be unique and valid format
- Password must be at least 8 characters
- Password is hashed before storage
- User receives success message after registration
- Automatic redirect to login page after registration

**US-002: User Login**
- **As a** registered user
- **I want to** login to my account
- **So that** I can access my diary entries

**Acceptance Criteria:**
- User can login with email and password
- Invalid credentials show error message
- Successful login generates JWT token
- Token is stored in HTTP-only cookie
- User is redirected to dashboard after login

**US-003: User Logout**
- **As a** logged-in user
- **I want to** logout from my account
- **So that** my diary remains secure

**Acceptance Criteria:**
- Logout button available on all authenticated pages
- JWT token is cleared on logout
- User is redirected to login page
- Cannot access protected routes after logout

#### 3.2 Diary Entry Management
**US-004: Create Diary Entry**
- **As a** logged-in user
- **I want to** create a new diary entry
- **So that** I can record my thoughts

**Acceptance Criteria:**
- Form with title and content fields
- Title is optional, auto-generate if empty (e.g., "Entry - Date")
- Content is required (minimum 10 characters)
- Automatic timestamp on creation
- Success message after saving
- Redirect to entry view page

**US-005: View Diary Entries**
- **As a** logged-in user
- **I want to** view my diary entries
- **So that** I can read my past thoughts

**Acceptance Criteria:**
- Dashboard displays list of all user's entries
- Shows title, date, and content preview (first 100 characters)
- Entries sorted by date (newest first)
- Click on entry to view full content
- Pagination for more than 10 entries

**US-006: Edit Diary Entry**
- **As a** logged-in user
- **I want to** edit my diary entries
- **So that** I can update or correct them

**Acceptance Criteria:**
- Edit button on entry view page
- Pre-filled form with current content
- Can update title and content
- Shows last modified timestamp
- Success message after update
- Can only edit own entries

**US-007: Delete Diary Entry**
- **As a** logged-in user
- **I want to** delete diary entries
- **So that** I can remove unwanted content

**Acceptance Criteria:**
- Delete button on entry view page
- Confirmation dialog before deletion
- Success message after deletion
- Redirect to dashboard after deletion
- Can only delete own entries

#### 3.3 Search Functionality
**US-008: Search by Content**
- **As a** logged-in user
- **I want to** search diary entries by content
- **So that** I can find specific memories

**Acceptance Criteria:**
- Search bar on dashboard
- Case-insensitive search
- Searches in both title and content
- Highlights matching text in results
- Shows "No results found" if empty

**US-009: Search by Date**
- **As a** logged-in user
- **I want to** filter entries by date
- **So that** I can find entries from specific periods

**Acceptance Criteria:**
- Date picker or date range selector
- Can filter by single date or date range
- Combined with text search if needed
- Clear filter option available

### 4. Database Schema

#### 4.1 Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4.2 Diary Entries Table
```sql
CREATE TABLE diary_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. API Endpoints

#### 5.1 Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

#### 5.2 Diary Entries
- `GET /diary` - Get all user's diary entries
- `GET /diary/:id` - Get specific diary entry
- `POST /diary` - Create new diary entry
- `PUT /diary/:id` - Update diary entry
- `DELETE /diary/:id` - Delete diary entry
- `GET /diary/search` - Search diary entries

### 6. Page Routes

#### 6.1 Public Routes
- `GET /` - Landing page
- `GET /login` - Login page
- `GET /register` - Registration page

#### 6.2 Protected Routes
- `GET /dashboard` - User dashboard with diary list
- `GET /diary/new` - Create new diary entry page
- `GET /diary/:id` - View diary entry page
- `GET /diary/:id/edit` - Edit diary entry page

### 7. Security Requirements

- All passwords must be hashed using bcrypt
- JWT tokens expire after 24 hours
- Implement rate limiting for authentication endpoints
- Use HTTPS in production
- Sanitize all user inputs
- Implement CSRF protection
- Use HTTP-only cookies for JWT storage

### 8. UI/UX Requirements

#### 8.1 Responsive Design
- Mobile-first approach
- Works on devices 320px and above
- Readable typography
- Touch-friendly buttons and links

#### 8.2 Layout Components
- **Header**: Logo, navigation, user menu
- **Dashboard**: Entry list, search bar, create button
- **Entry Form**: Title field, rich text editor for content
- **Entry View**: Full content display, edit/delete buttons

#### 8.3 Design Principles
- Clean, minimalist interface
- Focus on content readability
- Consistent color scheme
- Clear visual hierarchy
- Intuitive navigation

### 9. Non-Functional Requirements

#### 9.1 Performance
- Page load time < 3 seconds
- Database queries optimized with indexes
- Implement pagination for large datasets

#### 9.2 Reliability
- 99.9% uptime
- Daily database backups
- Error logging and monitoring

#### 9.3 Scalability
- Support up to 10,000 users initially
- Database can handle 1 million entries
- Modular code structure for future features

### 10. Future Enhancements (Out of Scope for MVP)

- Rich text editor with formatting options
- Image attachments for diary entries
- Export diary to PDF/Word
- Email reminders to write daily
- Mood tracking and visualization
- Tags and categories for entries
- Share specific entries publicly
- Mobile application

### 11. Success Metrics

- User registration rate
- Daily active users
- Average entries per user
- User retention rate (30-day)
- Search usage frequency
- Page load performance

### 12. Project Timeline

#### Phase 1: Setup & Authentication (2 days)
- Project setup and database configuration
- User authentication implementation
- Basic page layouts

#### Phase 2: Core Features (3 days)
- CRUD operations for diary entries
- Dashboard implementation
- Entry management pages

#### Phase 3: Search & Polish (2 days)
- Search functionality
- UI/UX improvements
- Testing and bug fixes

#### Phase 4: Deployment (1 day)
- Production deployment
- Performance optimization
- Documentation

**Total estimated time: 8 days**

### 13. Acceptance Testing Checklist

- [ ] User can register with valid email
- [ ] User can login with correct credentials
- [ ] User can create diary entries
- [ ] User can view all their entries
- [ ] User can edit their entries
- [ ] User can delete their entries
- [ ] Search by content works correctly
- [ ] Search by date works correctly
- [ ] Responsive design works on mobile
- [ ] JWT authentication is secure
- [ ] All forms have proper validation
- [ ] Error messages are user-friendly
- [ ] Performance meets requirements
- [ ] Security requirements are met