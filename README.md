# Smart Helpdesk Ticketing System

A full-stack helpdesk ticketing system built with Spring Boot and React.

## Features

### User Features
- User registration with email verification
- Create support tickets with title, description, priority, and department
- Upload file attachments to tickets
- View all created tickets with status tracking
- Real-time chat with support staff within tickets
- Receive email notifications on ticket creation and status changes
- Filter and search tickets

### Support Staff Features
- View all assigned tickets
- Real-time messaging with ticket creators
- Update ticket status (Open → In Progress → Resolved → Closed)
- Receive email notifications when tickets are assigned

### Admin Features
- Assign tickets to support staff members
- Manage departments (create, delete)
- Manage users (view all, update roles, activate/deactivate)
- View comprehensive analytics dashboard:
  - Total tickets, open, in progress, resolved, closed
  - Average resolution time
  - Tickets by priority
  - Tickets by department
  - Tickets by status
- Full system oversight

## Tech Stack

### Backend
- Java Spring Boot 3.2.0
- Spring Security with JWT authentication
- Spring Data JPA
- MySQL Database
- WebSocket (STOMP) for real-time messaging
- JavaMailSender for email notifications

### Frontend
- React 18 (Create React App)
- React Router for navigation
- Axios for API calls
- Tailwind CSS for styling
- SockJS + STOMP for WebSocket
- React Hot Toast for notifications
- Recharts for analytics visualization

## Getting Started

### Prerequisites
- Java 17 or higher
- Maven
- MySQL 8.0
- Node.js 18+ and npm

### Database Setup
1. Start MySQL server
2. Create database (or let Spring Boot create it automatically):
   ```sql
   CREATE DATABASE helpdesk_db;
   ```
3. Update MySQL credentials in `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=your_mysql_password
   ```

### Email Configuration
Configure email settings in `backend/src/main/resources/application.properties`:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
app.mail.from=your_email@gmail.com
```

For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an App Password from Google Account settings
3. Use the App Password in the configuration

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Configure admin credentials in `backend/src/main/resources/application.properties`:
   ```properties
   # Admin Configuration
   app.admin.name=System Administrator
   app.admin.email=your_admin_email@gmail.com
   app.admin.password=YourSecurePassword123
   ```
3. Run the application: `mvn spring-boot:run`
4. Backend will start on http://localhost:8080
5. The admin account will be automatically created and a verification email will be sent
6. Check your email inbox and click the verification link before logging in

### Admin Account Management
The admin account is configured in `application.properties`:
- Name: `app.admin.name`
- Email: `app.admin.email`
- Password: `app.admin.password`

**Important:** Admin users must verify their email before they can log in to the dashboard.

To create a fresh admin account:
1. Stop the backend server
2. Update the admin credentials in `application.properties`
3. Delete the old admin user from the database (or use the admin panel to delete users)
4. Restart the backend - the new admin will be created and a verification email will be sent
5. Verify the email before logging in

You can also delete users (including old admin accounts) through the admin panel once logged in.

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start development server: `npm start`
4. Frontend will start on http://localhost:3000

## Default Admin Account
The admin account is configured in `backend/src/main/resources/application.properties`:
```properties
app.admin.name=System Administrator
app.admin.email=gowthambagavthiraj@gmail.com
app.admin.password=Admin@123
```

Change these values before running the application for the first time.

**Important:** When the backend starts, it will create the admin account and send a verification email. You must verify your email before you can log in to the dashboard.

## Email Verification
All users (including admins) must verify their email before logging in:
1. Register or wait for admin account creation
2. Check your email inbox for the verification link
3. Click the verification link to activate your account
4. Log in with your credentials

If you don't receive the verification email, click "Resend verification email" on the login page.

## Forgot Password
If you forget your password:
1. Click "Forgot password?" on the login page
2. Enter your email address
3. Check your email for the password reset link
4. Click the link and enter your new password
5. Log in with your new password

The password reset link expires after 1 hour.
