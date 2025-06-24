# 🎯 TalentUnlock - AI-Powered Career Bridge for Immigrants

**HackTheBrain 2025 Project** | **Category**: Community – Newcomers & Access to White-Collar Work

## 🌟 Project Overview

TalentUnlock is an AI-powered platform that helps skilled immigrants translate their international experience into Canadian job opportunities. We address the critical problem where 25% of immigrants with foreign degrees end up in jobs requiring only high school education.

### 🎯 Mission
Break down credential barriers so international professionals can contribute their expertise faster in Canada.

## 🚀 Key Features

### 1. **Smart Resume Analysis**
- AI-powered skills extraction using Google Vertex AI
- International to Canadian skills mapping
- Confidence scoring and relevance assessment

### 2. **Canadian Job Matching**
- Real-time job recommendations based on mapped skills
- Match percentage calculations
- Integration with Canadian job boards

### 3. **Career Development**
- Personalized learning recommendations
- Skills gap analysis
- Certification suggestions

### 4. **Beautiful User Experience**
- Canadian-themed design (Red/White/Blue)
- Smooth animations with Framer Motion
- Mobile-first responsive design

## 🛠 Tech Stack

- **Frontend**: Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- **UI/Animations**: Framer Motion + Lucide React Icons
- **Backend**: Next.js API Routes + Firebase Functions
- **Database**: Firestore (Canadian region: northamerica-northeast1)
- **AI**: Google Vertex AI Gemini Pro (Canadian region)
- **Storage**: Firebase Storage (resume uploads)
- **Auth**: Firebase Auth
- **Deployment**: Google Cloud Run

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router (ROUTES)
│   ├── page.tsx                  # Landing page (/)
│   ├── upload/page.tsx           # Upload page (/upload)
│   ├── analysis/[id]/page.tsx    # Analysis results (/analysis/123)
│   ├── jobs/[id]/page.tsx        # Job matching (/jobs/123)
│   ├── api/                      # API endpoints
│   │   ├── upload/route.ts       # POST /api/upload
│   │   ├── analyze/route.ts      # POST /api/analyze
│   │   └── jobs/route.ts         # GET /api/jobs
│   ├── layout.tsx                # Root layout
│   └── globals.css
├── components/                   # UI Components
│   ├── LandingPage.tsx
│   ├── Navigation.tsx
│   ├── upload/ResumeUpload.tsx
│   ├── analysis/AnalysisResults.tsx
│   ├── analysis/SkillsComparison.tsx
│   ├── jobs/JobCard.tsx
│   ├── jobs/JobList.tsx
│   └── jobs/MatchPercentage.tsx
├── lib/                          # Utilities
│   ├── firebase.ts               # Firebase config
│   ├── vertexai.ts              # Vertex AI config
│   ├── types.ts                 # TypeScript types
│   └── utils.ts                 # Helper functions
└── hooks/                        # Custom React hooks
    ├── useUpload.ts
    ├── useAnalysis.ts
    └── useJobs.ts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Cloud Project with Vertex AI enabled
- Firebase project

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd talent-unlock
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env.local` file:
```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_PROJECT_ID=hackthebrain-2025
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Vertex AI Configuration  
VERTEX_AI_PROJECT_ID=hackthebrain-2025
VERTEX_AI_LOCATION=northamerica-northeast1

# Credentials
GOOGLE_APPLICATION_CREDENTIALS=./key.json
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Design System

### Color Palette
- **Primary Red**: #DC2626 (Canadian flag red)
- **Primary Blue**: #2563EB (Canadian flag blue)
- **White**: #FFFFFF
- **Gray Scale**: Tailwind's gray palette

### Typography
- **Font**: Geist Sans (Google Fonts)
- **Headings**: Bold weights with gradient text effects
- **Body**: Regular weight for readability

### Components
- **Glassmorphism**: Backdrop blur effects for modern look
- **Smooth Animations**: Framer Motion for page transitions
- **Responsive**: Mobile-first design approach

## 🔧 API Endpoints

### POST `/api/upload`
Handles resume file uploads to Firebase Storage
```typescript
// Request
FormData: {
  file: File,
  userId?: string
}

// Response
{
  success: boolean,
  data: ResumeUpload,
  message: string
}
```

### POST `/api/analyze`
AI-powered resume analysis using Vertex AI
```typescript
// Request
{
  resumeContent: string,
  resumeId: string,
  userId?: string
}

// Response
{
  success: boolean,
  data: AnalysisResult,
  message: string
}
```

### GET `/api/jobs`
Returns job recommendations based on analysis
```typescript
// Request
/api/jobs?analysisId=123&skills=React,Node.js

// Response
{
  success: boolean,
  data: JobMatch,
  message: string
}
```

## 🎯 User Journey

1. **Landing Page** → Compelling value proposition with success stories
2. **Upload Resume** → Drag & drop with background information form
3. **AI Analysis** → Skills extraction and Canadian mapping
4. **Results Display** → Visual before/after skills comparison
5. **Job Matching** → Personalized job recommendations
6. **Career Path** → Action plan for skill development

## 🌟 Success Metrics

- **Upload to Analysis**: < 30 seconds processing time
- **Skills Mapping**: 85%+ accuracy rate
- **Job Matching**: 70%+ relevance score
- **User Engagement**: Smooth flow completion
- **Canadian Compliance**: Data residency in Canadian regions

## 🤝 Contributing

This project was built for HackTheBrain 2025 hackathon. The team has authentic immigrant experience and focuses on solving real problems faced by newcomers to Canada.

### Development Guidelines
- Follow TypeScript best practices
- Use Framer Motion for animations
- Maintain Canadian theming
- Ensure mobile responsiveness
- Write clean, documented code

## 📄 License

This project is created for HackTheBrain 2025 hackathon. All rights reserved.

## 🙏 Acknowledgments

- **HackTheBrain 2025** organizers
- **Google Cloud** for Vertex AI and Firebase
- **Next.js** team for the amazing framework
- **Canadian immigrant community** for inspiration

---

**Built with ❤️ for the Canadian immigrant community**
