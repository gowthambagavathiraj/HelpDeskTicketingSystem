# QueryQuest - Campus Helpdesk Ticketing System

> A modern, full-stack helpdesk ticketing system with AI-powered support assistant.

![Java](https://img.shields.io/badge/Java-17+-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 🌟 Features

### Core Functionality
- **🎫 Ticket Management** - Create, track, and resolve support tickets
- **👥 Role-Based Access** - USER, SUPPORT_STAFF, and ADMIN roles
- **🔔 Real-time Updates** - WebSocket notifications for ticket changes
- **📊 Analytics Dashboard** - Track ticket metrics and performance
- **📁 File Attachments** - Upload files with tickets and messages
- **🔍 Advanced Search** - Filter by status, priority, department, keywords

### AI-Powered Support (CampusBot)
- **🤖 Intelligent Assistant** - Powered by Google Gemini AI
- **📚 Academic Queries** - Answer questions about courses, schedules, policies
- **🏢 Administrative Help** - Assist with registration, fees, procedures
- **🛠️ IT Support** - Troubleshoot technical issues
- **✍️ Ticket Drafting** - Generate professional ticket descriptions

### Security & Communication
- **🔐 JWT Authentication** - Secure token-based auth
- **📧 Email Verification** - Account activation via email
- **🔄 Password Reset** - Secure password recovery flow
- **💬 Real-time Chat** - Message threads within tickets
- **🔒 Role-based Authorization** - Granular access control

---

## 🏗️ Tech Stack

### Backend
- **Framework:** Spring Boot 3.2.0
- **Language:** Java 17+
- **Database:** MySQL 8.0+
- **ORM:** Hibernate/JPA
- **Security:** Spring Security + JWT
- **WebSocket:** STOMP protocol
- **Email:** Spring Mail
- **AI:** Google Gemini API

### Frontend
- **Framework:** React 18.2
- **Styling:** Tailwind CSS 3.3
- **Routing:** React Router 6.20
- **HTTP Client:** Axios
- **Real-time:** SockJS + STOMP
- **Icons:** Lucide React
- **Charts:** Recharts
- **Notifications:** React Hot Toast

---

## 🚀 Quick Start

### Prerequisites
```bash
# Required
- Java 17+
- Maven 3.6+
- Node.js 16+
- MySQL 8.0+

# Optional
- Google Gemini API Key (for AI features)
- Gmail account (for email notifications)
```

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd helpdesk
```

2. **Setup Database**
```sql
CREATE DATABASE helpdesk_db;
```

3. **Configure Backend**
```bash
cd backend/src/main/resources
cp application-example.properties application.properties
# Edit application.properties with your credentials
```

4. **Start Backend**
```bash
cd backend
mvn spring-boot:run
```

5. **Setup Frontend**
```bash
cd frontend
npm install
npm start
```

6. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

📖 **Detailed setup instructions:** See [SETUP.md](SETUP.md)

---

## 📱 User Roles & Permissions

| Feature | USER | SUPPORT_STAFF | ADMIN |
|---------|------|---------------|-------|
| Create Tickets | ✅ | ❌ | ❌ |
| View Own Tickets | ✅ | ✅ (assigned) | ✅ (all) |
| Update Ticket Status | ❌ | ✅ | ✅ |
| Assign Tickets | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| View Analytics | ❌ | ❌ | ✅ |
| Use CampusBot AI | ✅ | ✅ | ✅ |

---

## 🎯 Ticket Workflow

```
1. USER creates ticket → Status: OPEN
2. ADMIN reviews and assigns → Assigns to SUPPORT_STAFF
3. SUPPORT_STAFF works on issue → Status: IN_PROGRESS
4. SUPPORT_STAFF resolves issue → Status: RESOLVED
5. SUPPORT_STAFF/ADMIN closes → Status: CLOSED
```

---

## 🛠️ API Endpoints

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login
GET    /api/auth/verify-email      - Verify email with token
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password
```

### Tickets
```
POST   /api/tickets                - Create ticket (USER only)
GET    /api/tickets                - List tickets (filtered by role)
GET    /api/tickets/{id}           - Get ticket details
PATCH  /api/tickets/{id}/status    - Update status
PATCH  /api/tickets/{id}/assign    - Assign ticket (ADMIN only)
```

### Messages
```
POST   /api/messages               - Add message to ticket
GET    /api/messages/ticket/{id}   - Get ticket messages
```

### AI Assistant
```
POST   /api/ai/ask                 - Query CampusBot AI
```

### Admin
```
GET    /api/admin/analytics        - System analytics (ADMIN only)
GET    /api/admin/users            - List all users (ADMIN only)
PATCH  /api/admin/users/{id}/role  - Update user role (ADMIN only)
```

---

## 🎨 Screenshots

*(Add screenshots of your application here)*

---

## 🔧 Configuration

### Environment Variables

**Backend:**
```properties
# Database
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

# Security
JWT_SECRET=your-long-jwt-secret-key

# Email
MAIL_PORT=587
MAIL_FROM=your_email@gmail.com

# AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash

# Frontend
FRONTEND_URL=http://localhost:3000
```

**Frontend:**
Uses proxy configuration in `package.json` to forward API requests to backend.

---

## 📦 Build for Production

### Backend
```bash
cd backend
mvn clean package
java -jar target/helpdesk-backend-1.0.0.jar
```

### Frontend
```bash
cd frontend
npm run build
# Deploy 'build' folder to static hosting
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🐛 Known Issues

- **npm registry**: If `npm install` fails, reset registry: 
  ```bash
  npm config set registry https://registry.npmjs.org/
  ```
- **Email sending**: Requires proper SMTP configuration; admin auto-verifies if email fails

---

## 🔮 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] File preview for attachments
- [ ] Ticket templates
- [ ] SLA (Service Level Agreement) tracking
- [ ] Knowledge base integration
- [ ] Advanced reporting
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Ticket priority auto-detection (AI)
- [ ] Voice-to-text ticket creation

---

## 💡 Acknowledgments

- Google Gemini for AI capabilities
- Spring Boot team for the excellent framework
- React community for amazing tooling
- All open-source contributors

---

## 📞 Support

For setup help, see [SETUP.md](SETUP.md)

For bug reports or feature requests, open an issue on GitHub.

---

**Made with ❤️ for campus support teams**
