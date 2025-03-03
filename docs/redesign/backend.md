# HabitJoy Backend Redesign Specification

## 1. Architecture Overview

The HabitJoy backend is being completely reimagined as a scalable, cloud-native platform using a microservices architecture. This approach allows for independent scaling, focused development, and improved maintainability.

### System Architecture
- **API Gateway**: Single entry point for all client requests with routing
- **Service Mesh**: Inter-service communication with observability
- **Microservices**: Domain-specific services with own datastores
- **Event Bus**: Asynchronous communication between services
- **Caching Layer**: Performance optimization for frequent queries
- **Storage Services**: Specialized data persistence solutions
- **Background Workers**: Asynchronous processing for heavy tasks

### Technology Selection
- **Language**: TypeScript for type safety and developer experience
- **Framework**: NestJS for structured, decorator-based development
- **API**: REST for standard operations + GraphQL for complex queries
- **Database**: MongoDB (primary) + specialized stores for specific needs
- **Caching**: Redis for in-memory data and distributed locks
- **Search**: Elasticsearch for full-text and complex queries
- **Message Queue**: Apache Kafka for reliable event processing
- **File Storage**: AWS S3 or equivalent for media and exports
- **Deployment**: Docker containers with Kubernetes orchestration

## 2. Core Service Domains

### Authentication Service
- **Responsibilities**:
  - User registration and verification
  - Authentication (JWT + refresh tokens)
  - OAuth provider integration
  - Multi-factor authentication
  - Session management
  - Password recovery
- **APIs**:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/refresh-token`
  - `POST /auth/logout`
  - `POST /auth/forgot-password`
  - `POST /auth/reset-password`
  - `GET /auth/oauth/{provider}`
  - `POST /auth/mfa/setup`
  - `POST /auth/mfa/verify`
- **Data Store**: MongoDB with encryption
- **Integration Points**:
  - Email service for verification
  - User service for profile data
  - OAuth providers (Google, Apple, etc.)

### User Service
- **Responsibilities**:
  - Profile management
  - Preference settings
  - Notification configuration
  - Subscription management
  - Privacy settings
  - Activity tracking
- **APIs**:
  - `GET /users/{id}`
  - `PATCH /users/{id}`
  - `GET /users/{id}/preferences`
  - `PATCH /users/{id}/preferences`
  - `GET /users/{id}/notifications/settings`
  - `PATCH /users/{id}/notifications/settings`
  - `GET /users/{id}/subscription`
  - `GET /users/{id}/activity`
- **Data Store**: MongoDB (primary)
- **Integration Points**:
  - Payment service for subscriptions
  - Notification service for preferences
  - Analytics service for activity data

### Habit Service
- **Responsibilities**:
  - Habit definition and configuration
  - Habit tracking and check-ins
  - Streak calculation and management
  - Habit categories and organization
  - Habit recommendations
  - Habit statistics
- **APIs**:
  - `GET /habits`
  - `POST /habits`
  - `GET /habits/{id}`
  - `PATCH /habits/{id}`
  - `DELETE /habits/{id}`
  - `POST /habits/{id}/check-in`
  - `GET /habits/{id}/streak`
  - `GET /habits/{id}/stats`
  - `GET /habits/categories`
  - `GET /habits/recommendations`
- **Data Store**: MongoDB + Redis for streaks
- **Integration Points**:
  - User service for ownership
  - Analytics service for insights
  - Notification service for reminders
  - Social service for challenges

### Mood Service
- **Responsibilities**:
  - Mood tracking and logging
  - Emotion categorization
  - Mood trends and patterns
  - Journal entry management
  - Mood correlations
  - Prompt suggestions
- **APIs**:
  - `GET /moods`
  - `POST /moods`
  - `GET /moods/{id}`
  - `PATCH /moods/{id}`
  - `GET /moods/trends`
  - `GET /journals`
  - `POST /journals`
  - `GET /journals/{id}`
  - `PATCH /journals/{id}`
  - `GET /prompts/suggestions`
- **Data Store**: MongoDB + Elasticsearch
- **Integration Points**:
  - Analytics service for pattern detection
  - Habit service for correlation
  - AI service for content analysis
  - Notification service for journaling reminders

### Analytics Service
- **Responsibilities**:
  - Data aggregation and processing
  - Statistical analysis
  - Insight generation
  - Report compilation
  - Trend detection
  - Data visualization preparation
- **APIs**:
  - `GET /analytics/dashboard`
  - `GET /analytics/habits`
  - `GET /analytics/moods`
  - `GET /analytics/correlations`
  - `GET /analytics/insights`
  - `GET /analytics/reports`
  - `POST /analytics/reports/custom`
- **Data Store**: MongoDB + Time-series DB
- **Integration Points**:
  - Habit service for raw data
  - Mood service for emotional data
  - AI service for advanced analysis
  - User service for personalization

### Social Service
- **Responsibilities**:
  - Friend connections
  - Group management
  - Content sharing
  - Activity feeds
  - Challenge management
  - Privacy enforcement
- **APIs**:
  - `GET /social/connections`
  - `POST /social/connections`
  - `GET /social/groups`
  - `POST /social/groups`
  - `GET /social/feed`
  - `POST /social/posts`
  - `GET /social/challenges`
  - `POST /social/challenges`
- **Data Store**: MongoDB + Redis for feeds
- **Integration Points**:
  - User service for profiles
  - Habit service for challenges
  - Notification service for social alerts
  - Content service for media

### Notification Service
- **Responsibilities**:
  - Push notification delivery
  - Email communication
  - In-app messaging
  - Notification scheduling
  - Delivery optimization
  - Template management
- **APIs**:
  - `POST /notifications`
  - `GET /notifications`
  - `GET /notifications/unread`
  - `POST /notifications/{id}/read`
  - `GET /notifications/settings`
  - `PATCH /notifications/settings`
- **Data Store**: MongoDB + Redis
- **Integration Points**:
  - User service for preferences
  - Push notification providers
  - Email service for delivery
  - All services for triggering events

### Payment Service
- **Responsibilities**:
  - Subscription management
  - Payment processing
  - Invoice generation
  - Pricing management
  - Discount handling
  - Refund processing
- **APIs**:
  - `GET /subscriptions`
  - `POST /subscriptions`
  - `PATCH /subscriptions/{id}`
  - `DELETE /subscriptions/{id}`
  - `GET /payments`
  - `POST /payments`
  - `GET /invoices`
  - `GET /pricing`
- **Data Store**: MongoDB (transactional)
- **Integration Points**:
  - Stripe/payment processor
  - User service for account linking
  - Notification service for billing alerts

### AI Service
- **Responsibilities**:
  - Natural language processing
  - Sentiment analysis
  - Recommendation generation
  - Pattern recognition
  - Anomaly detection
  - Content generation
- **APIs**:
  - `POST /ai/analyze/text`
  - `POST /ai/analyze/mood`
  - `GET /ai/recommend/habits`
  - `POST /ai/generate/insights`
  - `POST /ai/generate/prompts`
  - `POST /ai/detect/patterns`
- **Data Store**: MongoDB + Vector DB
- **Integration Points**:
  - Analytics service for data
  - Mood service for journal entries
  - Habit service for recommendations
  - Machine learning platforms

## 3. Database Schema Redesign

### Users Collection
```typescript
interface User {
  _id: ObjectId;
  email: string;
  hashedPassword?: string; // Nullable for OAuth-only users
  authProviders: {
    type: "google" | "apple" | "email" | "facebook";
    id: string;
    lastUsed: Date;
  }[];
  personalInfo: {
    firstName: string;
    lastName: string;
    displayName: string;
    avatarUrl?: string;
    timezone: string;
    locale: string;
    dateOfBirth?: Date;
    gender?: string;
  };
  preferences: {
    theme: "light" | "dark" | "system";
    emailFrequency: "daily" | "weekly" | "important" | "none";
    pushNotifications: boolean;
    reminderTimes: {
      morning?: string; // HH:MM format
      afternoon?: string;
      evening?: string;
    };
    privacySettings: {
      shareActivity: boolean;
      showInSearch: boolean;
      allowFriendRequests: boolean;
    };
  };
  subscription: {
    plan: "free" | "premium" | "family";
    startDate: Date;
    endDate?: Date;
    autoRenew: boolean;
    paymentMethod?: string;
    customerId?: string; // Payment processor customer ID
  };
  stats: {
    totalHabits: number;
    activeHabits: number;
    longestStreak: number;
    currentLoginStreak: number;
    lastLoginDate: Date;
    accountCreated: Date;
    totalMoodEntries: number;
    totalJournalEntries: number;
  };
  deviceTokens: { // For push notifications
    token: string;
    device: string;
    lastUsed: Date;
  }[];
  status: "active" | "suspended" | "deleted";
  emailVerified: boolean;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Habits Collection
```typescript
interface Habit {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  category: string; // Reference to categories collection
  tags: string[];
  schedule: {
    frequency: "daily" | "weekly" | "monthly" | "custom";
    daysOfWeek?: number[]; // 0-6 for Sunday-Saturday
    daysOfMonth?: number[]; // 1-31
    specificDates?: Date[];
    timeOfDay?: string; // HH:MM format
    startDate: Date;
    endDate?: Date;
    timezone: string;
  };
  tracking: {
    type: "boolean" | "counter" | "timer" | "value";
    unit?: string; // For value type
    target?: number; // For counter/timer/value
    minTarget?: number; // Minimum acceptable value
  };
  reminders: {
    enabled: boolean;
    times: string[]; // HH:MM format
    smartReminder: boolean; // Use ML to determine optimal time
    location?: {
      latitude: number;
      longitude: number;
      radius: number; // meters
      name: string;
    };
  };
  accountability: {
    partnerId?: ObjectId; // User ID of accountability partner
    visible: boolean; // Publicly viewable
    groupIds: ObjectId[]; // Groups this habit is shared with
  };
  progress: {
    streak: {
      current: number;
      longest: number;
      lastCheckIn: Date;
      protected: boolean; // Using streak protection
      recoveryUsed: number; // Times streak protection was used
    };
    completionRate: number; // Percentage of successful check-ins
    totalCheckIns: number;
    totalSkips: number;
  };
  status: "active" | "paused" | "archived" | "deleted";
  difficulty: number; // 1-10 scale
  priority: number; // 1-10 scale
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### CheckIns Collection
```typescript
interface CheckIn {
  _id: ObjectId;
  habitId: ObjectId;
  userId: ObjectId;
  date: Date; // The date this check-in is for
  timestamp: Date; // When the check-in was recorded
  status: "completed" | "missed" | "skipped";
  value?: number; // For counter/timer/value habits
  notes?: string;
  mood?: {
    rating: number; // 1-5
    emotion: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    name: string;
  };
  media?: {
    type: "image" | "video" | "audio";
    url: string;
  }[];
  source: "manual" | "automatic" | "partner" | "imported";
  difficulty?: number; // 1-10 subjective rating
  createdAt: Date;
  updatedAt: Date;
}
```

### Moods Collection
```typescript
interface Mood {
  _id: ObjectId;
  userId: ObjectId;
  date: Date;
  timestamp: Date;
  primary: string; // Primary emotion
  secondary?: string[]; // Additional emotions
  intensity: number; // 1-10 rating
  valence: number; // -5 to 5 (negative to positive)
  arousal: number; // 1-10 (low to high energy)
  dominance?: number; // 1-10 (feeling in/out of control)
  triggers: {
    category: string;
    description: string;
  }[];
  context: {
    location?: string;
    activity?: string;
    social?: string;
    weather?: string;
  };
  symptoms?: {
    type: string;
    intensity: number;
  }[];
  notes?: string;
  journalId?: ObjectId; // Associated journal entry
  createdAt: Date;
  updatedAt: Date;
}
```

### Journals Collection
```typescript
interface Journal {
  _id: ObjectId;
  userId: ObjectId;
  title?: string;
  content: string; // Rich text content
  contentType: "markdown" | "richtext" | "plain";
  mood?: {
    rating: number;
    emotion: string;
  };
  promptId?: ObjectId; // If created from a prompt
  tags: string[];
  categories: string[];
  mentions: {
    type: "habit" | "user" | "goal";
    id: ObjectId;
  }[];
  visibility: "private" | "friends" | "public";
  encryptionKey?: string; // For end-to-end encrypted entries
  media: {
    type: "image" | "video" | "audio" | "file";
    url: string;
    mimeType: string;
    size: number;
    dimensions?: {
      width: number;
      height: number;
    };
  }[];
  analysis?: {
    sentiment: number; // -1 to 1
    topics: string[];
    entities: string[];
    keywords: string[];
    summary?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Analytics Collection
```typescript
interface Analytics {
  _id: ObjectId;
  userId: ObjectId;
  type: "daily" | "weekly" | "monthly" | "yearly";
  date: Date; // Reference date for this period
  habits: {
    totalActive: number;
    totalCompleted: number;
    completionRate: number;
    byCategory: {
      category: string;
      count: number;
      completionRate: number;
    }[];
    mostConsistent: {
      habitId: ObjectId;
      habitName: string;
      streak: number;
      completionRate: number;
    }[];
    improvedHabits: {
      habitId: ObjectId;
      habitName: string;
      improvement: number; // percentage points
    }[];
    declinedHabits: {
      habitId: ObjectId;
      habitName: string;
      decline: number; // percentage points
    }[];
  };
  mood: {
    average: number;
    distribution: {
      emotion: string;
      count: number;
      percentage: number;
    }[];
    trend: number; // -1 to 1, declining to improving
    topTriggers: {
      category: string;
      count: number;
    }[];
  };
  correlations: {
    habitToMood: {
      habitId: ObjectId;
      habitName: string;
      moodImpact: number; // -1 to 1
      confidence: number; // 0-1
    }[];
    contextToMood: {
      factor: string;
      type: "location" | "time" | "social" | "weather";
      moodImpact: number; // -1 to 1
    }[];
    habitInteractions: {
      source: ObjectId;
      target: ObjectId;
      relationship: "positive" | "negative" | "neutral";
      strength: number; // 0-1
    }[];
  };
  insights: string[]; // AI-generated insights
  createdAt: Date;
}
```

### Social Collection
```typescript
interface Connection {
  _id: ObjectId;
  userId: ObjectId;
  connectedId: ObjectId;
  type: "friend" | "accountability" | "mentor" | "family";
  status: "pending" | "accepted" | "declined" | "blocked";
  visibleHabits: ObjectId[];
  visibleMoods: boolean;
  visibleJournals: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Group {
  _id: ObjectId;
  name: string;
  description?: string;
  avatarUrl?: string;
  cover?: string;
  privacy: "public" | "private" | "secret";
  category: string;
  tags: string[];
  rules?: string[];
  members: {
    userId: ObjectId;
    role: "admin" | "moderator" | "member";
    joinedAt: Date;
  }[];
  challenges: ObjectId[]; // Reference to challenges
  posts: ObjectId[]; // Reference to posts
  stats: {
    memberCount: number;
    activeMembers: number;
    totalPosts: number;
    engagementRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface Challenge {
  _id: ObjectId;
  creatorId: ObjectId;
  groupId?: ObjectId;
  title: string;
  description: string;
  imageUrl?: string;
  startDate: Date;
  endDate: Date;
  habits: {
    title: string;
    description?: string;
    frequency: "daily" | "weekly" | "custom";
    schedule: any; // Same as habit schedule
  }[];
  participants: {
    userId: ObjectId;
    joinedAt: Date;
    progress: number; // 0-100%
    streakDays: number;
    lastCheckIn: Date;
    completions: number;
  }[];
  rewards?: {
    type: "badge" | "points" | "prize";
    description: string;
    imageUrl?: string;
  }[];
  status: "upcoming" | "active" | "completed" | "canceled";
  visibility: "public" | "group" | "invite";
  createdAt: Date;
  updatedAt: Date;
}
```

### Notification Collection
```typescript
interface Notification {
  _id: ObjectId;
  userId: ObjectId;
  type: "habit_reminder" | "streak_alert" | "social_mention" | "challenge_invite" | "milestone" | "insight" | "system";
  title: string;
  message: string;
  timestamp: Date;
  referenceId?: ObjectId; // ID of related object
  referenceType?: string; // Type of related object
  action?: {
    type: "open" | "confirm" | "dismiss";
    route?: string;
    data?: Record<string, any>;
  };
  status: "unread" | "read" | "clicked" | "dismissed";
  priority: "low" | "normal" | "high" | "urgent";
  expiration?: Date;
  deliveryStatus: {
    pushed: boolean;
    pushSentAt?: Date;
    emailed: boolean;
    emailSentAt?: Date;
    inApp: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## 4. API Design Principles

### RESTful API Design
- **Resource-Oriented**: APIs organized around domain resources
- **Standard HTTP Methods**: GET, POST, PATCH, DELETE for CRUD operations
- **Consistent URL Structure**: `/resources` for collections, `/resources/{id}` for specific resources
- **HTTP Status Codes**: Proper usage of status codes (200, 201, 204, 400, 401, 403, 404, 500)
- **Query Parameters**: Consistent approach to filtering, sorting, and pagination
- **Versioning**: API versioning via URL path (/v1/resources)

### GraphQL Interface
- **Single Endpoint**: /graphql for all complex queries
- **Type System**: Strongly typed schema with proper relationships
- **Query Flexibility**: Client-specified field selection
- **Batching**: Multiple operations in a single request
- **Subscriptions**: Real-time updates for relevant data
- **Directives**: Cache control and authorization constraints

### API Response Format
```json
{
  "status": "success",
  "data": {...},
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "pages": 8
    }
  }
}
```

### Error Response Format
```json
{
  "status": "error",
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource could not be found",
    "details": {...}
  }
}
```

## 5. Authentication & Authorization

### Authentication Flow
- **Registration**: Email/password or OAuth provider
- **Verification**: Email verification link
- **Login**: Credentials or OAuth with MFA option
- **Token Issuance**:
  - Access token (JWT, short-lived)
  - Refresh token (HTTP-only cookie, longer lifespan)
- **Token Refresh**: Automatic refresh when access token expires
- **Logout**: Client-side token removal + server-side invalidation

### Authorization Model
- **Role-Based Access Control**:
  - User roles (free, premium, admin)
  - Fine-grained permissions per resource
- **Ownership-Based Access**:
  - Resource creators have full access
  - Shared resources with custom permissions
- **Policy Enforcement**:
  - Centralized policy definition
  - Consistent enforcement across services
- **Attribute-Based Access Control**:
  - Dynamic permissions based on user and resource attributes

### Security Measures
- **API Rate Limiting**: Prevent abuse and DDoS attacks
- **CORS Configuration**: Proper origin restrictions
- **Content Security Policy**: Prevent XSS attacks
- **Input Validation**: Thorough request validation
- **Output Sanitization**: Safe response data
- **Sensitive Data Handling**:
  - Encryption at rest and in transit
  - Data masking for sensitive fields
  - PII protection and compliance

## 6. Real-time Features

### WebSocket Implementation
- **Connection Management**: Authentication and session tracking
- **Channel Subscriptions**: Topic-based messaging
- **Presence Awareness**: Online status and activity
- **Message Types**:
  - Notifications
  - Live updates
  - Activity streams
  - Collaborative features
- **Scaling Strategy**: Redis-backed pub/sub for cluster support

### Event-Driven Architecture
- **Event Types**:
  - Domain events (resource created/updated/deleted)
  - System events (errors, thresholds, alerts)
  - User events (actions, achievements, milestones)
- **Event Schema**: Standardized format with versioning
- **Producers**: Services emitting domain events
- **Consumers**: Services reacting to events
- **Event Store**: Kafka for persistence and replay

## 7. Performance Optimizations

### Caching Strategy
- **Multi-Level Caching**:
  - Application-level (in-memory)
  - Distributed (Redis)
  - CDN for static resources
- **Cache Invalidation**:
  - TTL-based expiration
  - Event-based invalidation
  - Selective field updates
- **Caching Policies**:
  - Public vs. private content
  - User-specific customization
  - Frequently accessed data

### Database Optimization
- **Indexing Strategy**:
  - Compound indexes for common queries
  - Partial indexes for filtered queries
  - Text indexes for search functionality
- **Data Partitioning**:
  - Horizontal sharding by user
  - Time-based partitioning for historical data
- **Query Optimization**:
  - Projection to limit returned fields
  - Pagination for large result sets
  - Aggregation pipeline optimization

### Request Processing
- **Compression**: gzip/Brotli for response payload
- **Batch Processing**: Combined operations for efficiency
- **Background Jobs**: Deferred processing for heavy tasks
- **Connection Pooling**: Reuse connections to databases
- **Circuit Breaking**: Fail fast for dependent service issues

## 8. Scalability Approach

### Horizontal Scaling
- **Stateless Services**: No server-specific user state
- **Load Balancing**: Equal distribution across instances
- **Auto-Scaling**: Dynamic adjustment based on load
- **Regional Deployment**: Geographic distribution for latency

### Data Scaling
- **Read Replicas**: Scale read operations
- **Write Sharding**: Distribute write operations
- **Eventual Consistency**: Where appropriate
- **CQRS Pattern**: Separate read and write models

### Service Isolation
- **Bulkhead Pattern**: Failure containment
- **Service Boundaries**: Clear domain separation
- **Independent Deployment**: Service-specific release cycles
- **Resource Allocation**: Service-appropriate sizing

## 9. Observability & Monitoring

### Logging Architecture
- **Structured Logging**: JSON format with consistent fields
- **Log Levels**: ERROR, WARN, INFO, DEBUG, TRACE
- **Correlation IDs**: Request tracing across services
- **Contextual Data**: User ID, resource ID, operation type
- **Sensitive Data Handling**: Masking or omission

### Metrics Collection
- **System Metrics**:
  - CPU, memory, disk, network
  - Request rates and error rates
  - Response times (p50, p95, p99)
- **Business Metrics**:
  - User acquisition and retention
  - Feature usage and engagement
  - Conversion and revenue
- **Custom Metrics**:
  - Domain-specific indicators
  - SLA/SLO monitoring

### Alerting System
- **Threshold Alerts**: Static or dynamic thresholds
- **Anomaly Detection**: Machine learning-based outlier detection
- **Error Budgets**: SLO-based alerting
- **Alert Routing**: Team-specific notification channels
- **Incident Management**: Automated response procedures

## 10. Deployment & DevOps

### Container Strategy
- **Docker Images**: Optimized, minimal images
- **Multi-Stage Builds**: Efficient build process
- **Image Versioning**: Semantic versioning
- **Security Scanning**: Vulnerability detection

### Kubernetes Configuration
- **Deployment Manifests**: Service-specific configurations
- **Resource Limits**: CPU and memory constraints
- **Health Checks**: Liveness and readiness probes
- **Autoscaling**: Horizontal pod autoscaling
- **Service Mesh**: Istio for traffic management

### CI/CD Pipeline
- **Automated Testing**:
  - Unit tests
  - Integration tests
  - Performance tests
  - Security scans
- **Deployment Stages**:
  - Development
  - Staging
  - Production
- **Deployment Strategies**:
  - Blue/green deployments
  - Canary releases
  - Feature flags

## 11. Security Considerations

### Data Protection
- **Encryption**:
  - Data in transit (TLS 1.3)
  - Data at rest (AES-256)
  - End-to-end for sensitive content
- **Key Management**: Secure storage and rotation
- **Data Classification**: Sensitivity levels and handling
- **Retention Policies**: Appropriate storage duration

### Vulnerability Management
- **Dependency Scanning**: Regular audit of libraries
- **SAST/DAST**: Code and deployment scanning
- **Penetration Testing**: Regular security assessments
- **Bug Bounty Program**: Crowdsourced security testing

### Compliance Framework
- **GDPR Compliance**:
  - Data subject rights
  - Consent management
  - Data portability
- **HIPAA Considerations**: For health-related data
- **SOC 2**: Security, availability, processing integrity

## 12. Implementation Roadmap

### Phase 1: Foundation (2-3 months)
- Core service architecture setup
- Authentication system implementation
- Basic database schema
- API gateway configuration

### Phase 2: Core Functionality (2-3 months)
- Habit and mood tracking services
- Basic analytics functionality
- Initial notification system
- MVP API endpoints

### Phase 3: Advanced Features (2-3 months)
- Social features implementation
- Advanced analytics and insights
- AI service integration
- Real-time capabilities

### Phase 4: Performance & Scale (2-3 months)
- Caching implementation
- Performance optimization
- Scalability enhancements
- Observability improvements

### Phase 5: Enterprise Readiness (Ongoing)
- Enhanced security features
- Compliance certifications
- Enterprise integration options
- White-label capabilities

---

This backend redesign specification provides a comprehensive blueprint for transforming HabitJoy's server-side architecture. Implementation should follow modern development practices with a focus on maintainability, scalability, and security.