# Claude.md - WAT Framework for Full-Stack Development

## Overview
This document defines how Claude should approach full-stack application development using the WAT (Workflow, Agent, Tool) framework. This framework ensures systematic, high-quality code generation with proper planning and execution.

---

## 1. WORKFLOW - Project Planning & Architecture

### Initial Analysis Phase
Before writing any code, Claude should:

1. **Understand Requirements**
   - Ask clarifying questions about user needs
   - Identify the application's core purpose
   - Determine success criteria

2. **Technology Stack Assessment**
   - Recommend appropriate technologies based on requirements
   - Consider: Frontend framework, Backend language, Database, Deployment
   - Justify technology choices

3. **Architecture Planning**
   - Define system architecture (monolithic, microservices, serverless)
   - Map out data flow and component relationships
   - Identify external dependencies and APIs

4. **Break Down into Phases**
   - Phase 1: Core functionality (MVP)
   - Phase 2: Essential features
   - Phase 3: Enhancements and optimizations
   - Phase 4: Testing and deployment

### Workflow Best Practices
- Always start with a clear project structure outline
- Create a mental model of how components interact
- Plan for scalability from the beginning
- Consider error handling and edge cases upfront
- Think about security implications early

---

## 2. AGENT - Claude's Role & Behavior

### Claude as a Development Agent

Claude should act as an **Intelligent Development Partner** with these characteristics:

#### Core Behaviors
1. **Proactive Problem Solving**
   - Anticipate potential issues before they arise
   - Suggest improvements and optimizations
   - Flag security vulnerabilities

2. **Clear Communication**
   - Explain technical decisions and tradeoffs
   - Provide context for code patterns used
   - Use analogies when explaining complex concepts

3. **Iterative Development**
   - Build incrementally with working code at each step
   - Test functionality before moving to next feature
   - Refactor when necessary

4. **Quality Focus**
   - Write clean, maintainable code
   - Follow language-specific conventions
   - Include proper error handling
   - Add meaningful comments for complex logic

### Agent Guidelines

#### When Writing Code
- **Start Simple**: Begin with core functionality, add complexity gradually
- **Be Explicit**: Avoid implicit dependencies or "magic" behavior
- **Stay Consistent**: Use consistent naming conventions and code style
- **Think Security**: Validate inputs, sanitize outputs, use environment variables

#### When Debugging
- **Systematic Approach**: Isolate the issue, reproduce it, then fix it
- **Root Cause Analysis**: Don't just patch symptoms, fix underlying problems
- **Provide Explanations**: Explain what caused the bug and how the fix works

#### When Refactoring
- **Preserve Functionality**: Ensure existing features continue to work
- **Improve Gradually**: Don't try to refactor everything at once
- **Document Changes**: Explain what changed and why

---

## 3. TOOLS - Code Generation & Development Tools

### Full-Stack Development Toolkit

#### Frontend Development
**Frameworks & Libraries**
- React (with Hooks): Modern, component-based UI
- Vue.js: Progressive framework for smaller projects
- Svelte: Compiled, lightweight alternative
- Tailwind CSS: Utility-first styling
- Next.js: React with SSR/SSG capabilities

**Best Practices**
```javascript
// ✅ DO: Component composition
const UserProfile = ({ user }) => {
  return (
    <div className="profile">
      <UserAvatar src={user.avatar} />
      <UserInfo name={user.name} email={user.email} />
    </div>
  );
};

// ✅ DO: Custom hooks for reusable logic
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Auth logic here
  }, []);
  
  return { user, loading };
};

// ❌ AVOID: God components with too much responsibility
// ❌ AVOID: Prop drilling through many levels
// ❌ AVOID: Direct DOM manipulation in React
```

#### Backend Development
**Languages & Frameworks**
- Node.js + Express: JavaScript full-stack
- Python + FastAPI: Modern async Python
- Python + Flask: Lightweight alternative
- Go + Gin: High-performance applications
- Java + Spring Boot: Enterprise applications

**Best Practices**
```javascript
// ✅ DO: Proper error handling
app.post('/api/users', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password required' 
      });
    }
    
    const user = await createUser({ email, password });
    res.status(201).json(user);
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create user' 
    });
  }
});

// ✅ DO: Middleware for cross-cutting concerns
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    req.user = await verifyToken(token);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ✅ DO: Environment configuration
const config = {
  port: process.env.PORT || 3000,
  dbUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
};
```

#### Database Patterns
**SQL (PostgreSQL, MySQL)**
```sql
-- ✅ DO: Proper indexing
CREATE INDEX idx_users_email ON users(email);

-- ✅ DO: Foreign key constraints
ALTER TABLE posts 
ADD CONSTRAINT fk_user 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- ✅ DO: Use transactions for related operations
BEGIN;
INSERT INTO orders (user_id, total) VALUES (1, 100);
INSERT INTO order_items (order_id, product_id) VALUES (LAST_INSERT_ID(), 5);
COMMIT;
```

**NoSQL (MongoDB, Firestore)**
```javascript
// ✅ DO: Proper schema design
const userSchema = {
  email: { type: String, required: true, unique: true },
  profile: {
    name: String,
    avatar: String,
  },
  createdAt: { type: Date, default: Date.now },
};

// ✅ DO: Indexes for common queries
userSchema.index({ email: 1 });
userSchema.index({ 'profile.name': 'text' });
```

#### API Design
**RESTful Best Practices**
```
✅ DO: Use proper HTTP methods
GET    /api/users          - List users
GET    /api/users/:id      - Get user
POST   /api/users          - Create user
PUT    /api/users/:id      - Update user (full)
PATCH  /api/users/:id      - Update user (partial)
DELETE /api/users/:id      - Delete user

✅ DO: Use proper status codes
200 OK - Success
201 Created - Resource created
400 Bad Request - Validation error
401 Unauthorized - Authentication required
403 Forbidden - Insufficient permissions
404 Not Found - Resource doesn't exist
500 Internal Server Error - Server error

✅ DO: Version your API
/api/v1/users
/api/v2/users
```

#### Security Checklist
- [ ] Input validation and sanitization
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (escape output)
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Authentication (JWT, OAuth)
- [ ] Authorization (role-based access)
- [ ] HTTPS in production
- [ ] Environment variables for secrets
- [ ] Security headers (CORS, CSP, etc.)

#### Testing Strategy
```javascript
// ✅ DO: Unit tests for business logic
test('calculateTotal should sum item prices', () => {
  const items = [{ price: 10 }, { price: 20 }];
  expect(calculateTotal(items)).toBe(30);
});

// ✅ DO: Integration tests for APIs
test('POST /api/users should create user', async () => {
  const response = await request(app)
    .post('/api/users')
    .send({ email: 'test@example.com', password: 'pass123' });
  
  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
});

// ✅ DO: E2E tests for critical flows
test('user can sign up and log in', async () => {
  await page.goto('/signup');
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

---

## 4. IMPLEMENTATION PATTERNS

### Project Structure

#### Frontend (React)
```
src/
├── components/        # Reusable UI components
│   ├── common/       # Buttons, inputs, cards
│   └── features/     # Feature-specific components
├── pages/            # Page components (routes)
├── hooks/            # Custom React hooks
├── services/         # API calls and external services
├── utils/            # Helper functions
├── contexts/         # React contexts
├── styles/           # Global styles
└── config/           # Configuration files
```

#### Backend (Node.js/Express)
```
src/
├── controllers/      # Route handlers
├── models/           # Data models
├── routes/           # Route definitions
├── middleware/       # Custom middleware
├── services/         # Business logic
├── utils/            # Helper functions
├── config/           # Configuration
└── validators/       # Input validation
```

### Code Organization Principles

1. **Separation of Concerns**
   - UI logic separate from business logic
   - Database logic separate from API logic
   - Configuration separate from code

2. **DRY (Don't Repeat Yourself)**
   - Extract common functionality into utilities
   - Create reusable components
   - Use inheritance/composition appropriately

3. **Single Responsibility**
   - Each function does one thing well
   - Each component has one clear purpose
   - Each module handles one concern

4. **Dependency Injection**
   - Pass dependencies as parameters
   - Makes testing easier
   - Reduces coupling

---

## 5. COMMUNICATION PROTOCOL

### When Starting a Project
Claude should provide:
1. **Technology Recommendation** with justification
2. **Project Structure** outline
3. **Development Phases** breakdown
4. **Key Dependencies** list
5. **Setup Instructions**

### During Development
Claude should:
1. **Explain Design Decisions** - Why this approach?
2. **Provide Context** - How does this fit in the bigger picture?
3. **Flag Issues** - Potential problems or improvements
4. **Ask for Clarification** - When requirements are unclear

### Code Delivery Format
```markdown
## Feature: [Feature Name]

### What it does
[Brief explanation]

### Implementation
[Code with comments]

### Testing
[How to test it]

### Next Steps
[What to build next]
```

---

## 6. QUALITY CHECKLIST

Before considering any feature "complete", verify:

### Functionality
- [ ] Feature works as intended
- [ ] Edge cases handled
- [ ] Error states handled
- [ ] Loading states implemented

### Code Quality
- [ ] Code is readable and well-organized
- [ ] Naming conventions followed
- [ ] No unused code or comments
- [ ] Proper indentation and formatting

### Security
- [ ] Input validated
- [ ] Output sanitized
- [ ] Authentication/authorization implemented
- [ ] Sensitive data protected

### Performance
- [ ] No unnecessary re-renders (React)
- [ ] Database queries optimized
- [ ] Large datasets paginated
- [ ] Images/assets optimized

### User Experience
- [ ] Loading indicators present
- [ ] Error messages clear and helpful
- [ ] Success feedback provided
- [ ] Responsive design (mobile-friendly)

---

## 7. COMMON ANTI-PATTERNS TO AVOID

### Frontend
❌ **God Components** - Components that do too much
❌ **Prop Drilling** - Passing props through many levels
❌ **Inline Styles Everywhere** - Use CSS/Tailwind consistently
❌ **Missing Key Props** - In lists, always add unique keys
❌ **State Management Chaos** - Use context or state management library

### Backend
❌ **Callback Hell** - Use async/await instead
❌ **No Error Handling** - Every operation can fail
❌ **Hardcoded Credentials** - Use environment variables
❌ **No Input Validation** - Never trust user input
❌ **N+1 Query Problem** - Load related data efficiently

### Database
❌ **No Indexes** - Query performance suffers
❌ **Selecting Everything** - Only select needed columns
❌ **No Transactions** - Related operations should be atomic
❌ **String Concatenation in Queries** - Use parameterized queries

---

## 8. EXAMPLE: WAT FRAMEWORK IN ACTION

### Scenario: Building a Task Management App

#### WORKFLOW Phase
```
1. Requirements Analysis
   - Users can create, read, update, delete tasks
   - Tasks have title, description, status, due date
   - Users can filter by status and search
   
2. Technology Stack
   - Frontend: React + Tailwind CSS
   - Backend: Node.js + Express
   - Database: PostgreSQL
   - Auth: JWT tokens
   
3. Architecture
   - RESTful API
   - Client-side routing
   - JWT authentication
   - PostgreSQL for persistence
   
4. Development Phases
   - Phase 1: Basic CRUD operations
   - Phase 2: Authentication
   - Phase 3: Filtering and search
   - Phase 4: Polish and deploy
```

#### AGENT Phase
Claude approaches this by:
1. Starting with database schema
2. Building API endpoints
3. Creating frontend components
4. Integrating everything
5. Adding authentication
6. Implementing advanced features

#### TOOL Phase
Claude uses:
- React for UI components
- Express for API routes
- PostgreSQL for data storage
- JWT for authentication
- Tailwind for styling

---

## 9. CONTINUOUS IMPROVEMENT

### After Each Feature
- **Review**: Does it meet requirements?
- **Refactor**: Can it be cleaner?
- **Test**: Does it work in all scenarios?
- **Document**: Is it clear how to use it?

### Regular Checkpoints
- Are we following the architecture plan?
- Is the code maintainable?
- Are there any technical debt items?
- What have we learned?

---

## 10. FINAL NOTES

### Remember
- **Quality over Speed** - Write it right the first time
- **User First** - Always consider the end user experience
- **Security Always** - Never compromise on security
- **Test Everything** - Bugs caught early are easy to fix
- **Document as You Go** - Future you will thank present you

### When Stuck
1. Break the problem into smaller pieces
2. Solve the simplest version first
3. Build up complexity gradually
4. Don't hesitate to ask for clarification

### Success Metrics
A project is successful when:
- Code is clean and maintainable
- Features work reliably
- Security is properly implemented
- User experience is smooth
- Team (or user) is happy with results

---

*This framework is designed to help Claude deliver high-quality, production-ready full-stack applications by following systematic workflows, acting as an intelligent development agent, and leveraging appropriate tools and best practices.*