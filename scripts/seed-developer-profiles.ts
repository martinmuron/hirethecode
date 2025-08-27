import { db } from '../src/lib/db'
import { users, profiles, developerProfiles, developerSkills, skills } from '../src/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

// First, let's ensure we have the skills we need
const CORE_SKILLS = [
  { slug: 'javascript', label: 'JavaScript' },
  { slug: 'typescript', label: 'TypeScript' },
  { slug: 'react', label: 'React' },
  { slug: 'nextjs', label: 'Next.js' },
  { slug: 'nodejs', label: 'Node.js' },
  { slug: 'python', label: 'Python' },
  { slug: 'django', label: 'Django' },
  { slug: 'flask', label: 'Flask' },
  { slug: 'java', label: 'Java' },
  { slug: 'spring', label: 'Spring Framework' },
  { slug: 'csharp', label: 'C#' },
  { slug: 'dotnet', label: '.NET' },
  { slug: 'php', label: 'PHP' },
  { slug: 'laravel', label: 'Laravel' },
  { slug: 'golang', label: 'Go' },
  { slug: 'rust', label: 'Rust' },
  { slug: 'ruby', label: 'Ruby' },
  { slug: 'rails', label: 'Ruby on Rails' },
  { slug: 'swift', label: 'Swift' },
  { slug: 'kotlin', label: 'Kotlin' },
  { slug: 'dart', label: 'Dart' },
  { slug: 'flutter', label: 'Flutter' },
  { slug: 'vue', label: 'Vue.js' },
  { slug: 'angular', label: 'Angular' },
  { slug: 'svelte', label: 'Svelte' },
  { slug: 'aws', label: 'AWS' },
  { slug: 'docker', label: 'Docker' },
  { slug: 'kubernetes', label: 'Kubernetes' },
  { slug: 'postgresql', label: 'PostgreSQL' },
  { slug: 'mongodb', label: 'MongoDB' },
  { slug: 'mysql', label: 'MySQL' },
  { slug: 'redis', label: 'Redis' },
  { slug: 'graphql', label: 'GraphQL' },
  { slug: 'rest', label: 'REST APIs' },
  { slug: 'git', label: 'Git' },
  { slug: 'linux', label: 'Linux' },
  { slug: 'devops', label: 'DevOps' },
  { slug: 'terraform', label: 'Terraform' },
  { slug: 'express', label: 'Express.js' },
  { slug: 'nestjs', label: 'NestJS' },
  { slug: 'electron', label: 'Electron' },
  { slug: 'reactnative', label: 'React Native' },
  { slug: 'ios', label: 'iOS Development' },
  { slug: 'android', label: 'Android Development' },
  { slug: 'firebase', label: 'Firebase' },
  { slug: 'supabase', label: 'Supabase' },
  { slug: 'prisma', label: 'Prisma' },
  { slug: 'drizzle', label: 'Drizzle ORM' },
  { slug: 'tailwindcss', label: 'Tailwind CSS' },
  { slug: 'sass', label: 'SASS/SCSS' }
]

const DEVELOPER_PROFILES = [
  // JavaScript/TypeScript Specialists (10)
  {
    name: "Alex Rodriguez",
    email: "alex.rodriguez@email.com",
    headline: "Senior Full-Stack JavaScript Developer specializing in React & Node.js",
    bio: `Passionate full-stack developer with 7 years of experience building scalable web applications. I specialize in modern JavaScript/TypeScript ecosystems with expertise in React, Next.js, and Node.js.

Recent Projects:
• Built a real-time collaboration platform for 50k+ users using React, Socket.io, and MongoDB
• Led migration of legacy PHP application to Next.js, improving performance by 300%  
• Developed microservices architecture with Node.js and Docker, serving 1M+ API requests daily
• Created React component library used across 15+ internal applications

I'm passionate about clean code, performance optimization, and mentoring junior developers. Available for challenging full-stack projects that push the boundaries of web technology.`,
    rate: "125",
    availability: "available",
    country: "United States",
    portfolioUrl: "https://alexrodriguez.dev",
    githubUrl: "https://github.com/alexrod",
    websiteUrl: "https://alexrodriguez.dev",
    skills: [
      { skill: "javascript", level: "expert" },
      { skill: "typescript", level: "expert" },
      { skill: "react", level: "expert" },
      { skill: "nextjs", level: "advanced" },
      { skill: "nodejs", level: "expert" },
      { skill: "express", level: "advanced" },
      { skill: "mongodb", level: "advanced" },
      { skill: "postgresql", level: "intermediate" },
      { skill: "aws", level: "intermediate" },
      { skill: "docker", level: "intermediate" }
    ]
  },
  {
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    headline: "Frontend Specialist & UI/UX Engineer",
    bio: `Frontend developer with 5 years focusing on creating beautiful, accessible user interfaces. Expert in React, Vue.js, and modern CSS frameworks with strong design sensibilities.

Key Achievements:
• Redesigned e-commerce platform UI, increasing conversion rates by 45%
• Built accessible component system following WCAG 2.1 guidelines
• Optimized web vitals scores to 95+ across major client applications
• Mentored 12 junior developers in modern frontend practices

Specialties include performance optimization, responsive design, and creating delightful user experiences. I bridge the gap between design and development.`,
    rate: "110",
    availability: "available",
    country: "Canada",
    portfolioUrl: "https://sarahchen.design",
    githubUrl: "https://github.com/sarahchen",
    skills: [
      { skill: "javascript", level: "expert" },
      { skill: "typescript", level: "advanced" },
      { skill: "react", level: "expert" },
      { skill: "vue", level: "advanced" },
      { skill: "svelte", level: "intermediate" },
      { skill: "tailwindcss", level: "expert" },
      { skill: "sass", level: "advanced" },
      { skill: "nextjs", level: "advanced" }
    ]
  },
  {
    name: "Miguel Santos",
    email: "miguel.santos@email.com",
    headline: "Full-Stack TypeScript Developer & Architecture Consultant",
    bio: `Senior developer with 8 years experience architecting large-scale TypeScript applications. Specialized in building robust, maintainable systems using modern frameworks and best practices.

Recent Work:
• Architected multi-tenant SaaS platform serving 200k+ users with 99.9% uptime
• Implemented GraphQL federation across 8 microservices
• Led TypeScript migration for 500k+ line codebase, reducing bugs by 60%
• Built CI/CD pipelines reducing deployment time from 2 hours to 8 minutes

I excel at system design, code quality, and team leadership. Available for complex projects requiring scalable architecture and technical excellence.`,
    rate: "145",
    availability: "busy",
    country: "Spain",
    githubUrl: "https://github.com/migueldev",
    websiteUrl: "https://miguel-santos.dev",
    skills: [
      { skill: "typescript", level: "expert" },
      { skill: "javascript", level: "expert" },
      { skill: "nodejs", level: "expert" },
      { skill: "nestjs", level: "expert" },
      { skill: "react", level: "advanced" },
      { skill: "graphql", level: "expert" },
      { skill: "postgresql", level: "advanced" },
      { skill: "docker", level: "advanced" },
      { skill: "kubernetes", level: "intermediate" },
      { skill: "aws", level: "advanced" }
    ]
  },
  {
    name: "Emily Johnson",
    email: "emily.johnson@email.com",
    headline: "React Native & Full-Stack JavaScript Developer",
    bio: `Mobile-focused developer with 6 years building cross-platform applications. Expert in React Native with strong full-stack JavaScript skills for seamless mobile-web integration.

Portfolio Highlights:
• Developed fitness tracking app with 100k+ downloads on both App Stores
• Built real-time messaging system with React Native and Socket.io
• Created offline-first mobile app with complex data synchronization
• Integrated payment systems (Stripe, Apple Pay, Google Pay) across multiple apps

I specialize in creating native-feeling mobile experiences while maintaining code reusability across platforms.`,
    rate: "120",
    availability: "available",
    country: "United Kingdom",
    portfolioUrl: "https://emilyjohnson.dev",
    githubUrl: "https://github.com/emilyjdev",
    skills: [
      { skill: "javascript", level: "expert" },
      { skill: "typescript", level: "advanced" },
      { skill: "reactnative", level: "expert" },
      { skill: "react", level: "expert" },
      { skill: "nodejs", level: "advanced" },
      { skill: "firebase", level: "advanced" },
      { skill: "mongodb", level: "intermediate" },
      { skill: "ios", level: "intermediate" },
      { skill: "android", level: "intermediate" }
    ]
  },
  {
    name: "David Park",
    email: "david.park@email.com",
    headline: "Node.js Backend Specialist & API Architect",
    bio: `Backend-focused developer with 7 years building high-performance APIs and microservices. Expert in Node.js ecosystem with deep understanding of database optimization and system architecture.

Technical Achievements:
• Built payment processing system handling $10M+ monthly transactions
• Designed REST and GraphQL APIs serving 50+ mobile and web applications
• Optimized database queries reducing average response time by 80%
• Implemented real-time features using WebSockets and Redis pub/sub

I focus on building robust, scalable backend systems that power modern applications with reliability and performance.`,
    rate: "135",
    availability: "available",
    country: "South Korea",
    githubUrl: "https://github.com/davidpark",
    websiteUrl: "https://david-park.dev",
    skills: [
      { skill: "nodejs", level: "expert" },
      { skill: "javascript", level: "expert" },
      { skill: "typescript", level: "expert" },
      { skill: "express", level: "expert" },
      { skill: "nestjs", level: "advanced" },
      { skill: "postgresql", level: "expert" },
      { skill: "redis", level: "advanced" },
      { skill: "mongodb", level: "advanced" },
      { skill: "graphql", level: "advanced" },
      { skill: "docker", level: "advanced" },
      { skill: "aws", level: "intermediate" }
    ]
  },
  {
    name: "Lisa Anderson",
    email: "lisa.anderson@email.com",
    headline: "Vue.js Expert & Progressive Web App Developer",
    bio: `Frontend specialist with 5 years focused on Vue.js ecosystem and Progressive Web Applications. Passionate about creating fast, engaging user experiences with modern web technologies.

Key Projects:
• Built PWA for retail chain with offline capabilities, used by 1000+ employees daily
• Developed Vue.js dashboard for IoT device management (10k+ connected devices)
• Created component library for Vue ecosystem used across 20+ applications
• Optimized web app performance achieving 98+ Lighthouse scores

I excel at building sophisticated frontend applications that blur the line between web and native experiences.`,
    rate: "115",
    availability: "available",
    country: "Netherlands",
    portfolioUrl: "https://lisaanderson.dev",
    githubUrl: "https://github.com/lisadev",
    skills: [
      { skill: "vue", level: "expert" },
      { skill: "javascript", level: "expert" },
      { skill: "typescript", level: "advanced" },
      { skill: "nodejs", level: "intermediate" },
      { skill: "tailwindcss", level: "advanced" },
      { skill: "sass", level: "advanced" },
      { skill: "firebase", level: "intermediate" }
    ]
  },
  {
    name: "James Wilson",
    email: "james.wilson@email.com",
    headline: "Senior JavaScript Engineer & Team Lead",
    bio: `Experienced full-stack developer and team lead with 9 years in JavaScript development. Specialized in scaling teams and applications from startup to enterprise level.

Leadership & Technical:
• Led development team of 12 engineers across 3 product lines
• Architected migration from monolith to microservices (React + Node.js)
• Established coding standards and CI/CD practices adopted company-wide
• Built real-time analytics platform processing 1M+ events per hour

I combine deep technical expertise with strong leadership skills to deliver complex projects on time and budget.`,
    rate: "155",
    availability: "busy",
    country: "Australia",
    githubUrl: "https://github.com/jameswilson",
    websiteUrl: "https://james-wilson.dev",
    skills: [
      { skill: "javascript", level: "expert" },
      { skill: "typescript", level: "expert" },
      { skill: "react", level: "expert" },
      { skill: "nodejs", level: "expert" },
      { skill: "nextjs", level: "advanced" },
      { skill: "postgresql", level: "advanced" },
      { skill: "aws", level: "advanced" },
      { skill: "docker", level: "advanced" },
      { skill: "kubernetes", level: "intermediate" }
    ]
  },
  {
    name: "Anna Kowalski",
    email: "anna.kowalski@email.com",
    headline: "Angular & TypeScript Specialist",
    bio: `Frontend architect with 6 years specializing in enterprise Angular applications. Expert in TypeScript, RxJS, and building complex, maintainable single-page applications.

Enterprise Experience:
• Built trading platform frontend handling real-time market data for 10k+ users
• Developed Angular component library with 100+ reusable components
• Led Angular migration from AngularJS for financial services application
• Implemented micro-frontend architecture using Angular Elements

I specialize in large-scale Angular applications with complex state management and real-time data requirements.`,
    rate: "130",
    availability: "available",
    country: "Poland",
    portfolioUrl: "https://anna-kowalski.dev",
    githubUrl: "https://github.com/annadev",
    skills: [
      { skill: "angular", level: "expert" },
      { skill: "typescript", level: "expert" },
      { skill: "javascript", level: "expert" },
      { skill: "nodejs", level: "intermediate" },
      { skill: "sass", level: "advanced" },
      { skill: "postgresql", level: "intermediate" }
    ]
  },
  {
    name: "Carlos Martinez",
    email: "carlos.martinez@email.com",
    headline: "MERN Stack Developer & E-commerce Specialist",
    bio: `Full-stack developer with 5 years building scalable e-commerce and web applications. Expert in MongoDB, Express.js, React, and Node.js with focus on performance and user experience.

E-commerce Projects:
• Built multi-vendor marketplace with 500+ sellers and 50k+ products
• Developed inventory management system with real-time stock tracking
• Integrated multiple payment gateways and shipping providers
• Optimized database queries for product catalog with 1M+ items

I specialize in building complete e-commerce solutions from backend APIs to responsive frontends.`,
    rate: "105",
    availability: "available",
    country: "Mexico",
    portfolioUrl: "https://carlos-martinez.dev",
    githubUrl: "https://github.com/carlosdev",
    skills: [
      { skill: "javascript", level: "expert" },
      { skill: "react", level: "expert" },
      { skill: "nodejs", level: "advanced" },
      { skill: "express", level: "advanced" },
      { skill: "mongodb", level: "expert" },
      { skill: "tailwindcss", level: "advanced" },
      { skill: "stripe", level: "advanced" }
    ]
  },
  {
    name: "Rachel Kim",
    email: "rachel.kim@email.com",
    headline: "Next.js & JAMstack Developer",
    bio: `Modern web developer with 4 years specializing in Next.js, static site generation, and JAMstack architecture. Expert in building fast, SEO-optimized web applications.

JAMstack Expertise:
• Built headless CMS solutions for media companies with 1M+ monthly visitors
• Developed Next.js e-commerce platform with 99+ PageSpeed scores
• Created static documentation sites with dynamic search and filtering
• Implemented ISR (Incremental Static Regeneration) for news websites

I focus on building blazing-fast websites that deliver exceptional user experiences and optimal SEO performance.`,
    rate: "100",
    availability: "available",
    country: "Singapore",
    portfolioUrl: "https://rachel-kim.dev",
    githubUrl: "https://github.com/rachelkim",
    skills: [
      { skill: "javascript", level: "advanced" },
      { skill: "typescript", level: "advanced" },
      { skill: "react", level: "expert" },
      { skill: "nextjs", level: "expert" },
      { skill: "tailwindcss", level: "advanced" },
      { skill: "nodejs", level: "intermediate" },
      { skill: "graphql", level: "intermediate" }
    ]
  },

  // Python Specialists (10)
  {
    name: "Dr. Michael Thompson",
    email: "michael.thompson@email.com",
    headline: "Senior Python Developer & Data Science Engineer",
    bio: `Data-focused Python developer with 8 years experience building machine learning systems and data pipelines. PhD in Computer Science with expertise in AI/ML and scalable data processing.

ML & Data Projects:
• Built recommendation engine serving 2M+ users with 99.9% uptime
• Developed computer vision system for medical imaging with 95% accuracy
• Created real-time fraud detection system processing 100k+ transactions/hour
• Built data pipeline processing 50TB+ daily using Python, Kafka, and Spark

I specialize in bridging the gap between research and production, building ML systems that scale.`,
    rate: "160",
    availability: "busy",
    country: "United States",
    githubUrl: "https://github.com/mthompson",
    websiteUrl: "https://michael-thompson.ai",
    skills: [
      { skill: "python", level: "expert" },
      { skill: "django", level: "advanced" },
      { skill: "flask", level: "advanced" },
      { skill: "postgresql", level: "advanced" },
      { skill: "mongodb", level: "intermediate" },
      { skill: "docker", level: "advanced" },
      { skill: "aws", level: "advanced" },
      { skill: "linux", level: "expert" }
    ]
  },
  {
    name: "Sofia Petrov",
    email: "sofia.petrov@email.com",
    headline: "Django Expert & Backend Architect",
    bio: `Backend specialist with 7 years building robust Django applications. Expert in Python web development, database design, and API architecture for high-traffic applications.

Django Achievements:
• Built social media platform serving 500k+ active users
• Developed multi-tenant SaaS application with complex permission system
• Created Django REST API powering mobile app with 1M+ downloads
• Optimized Django application reducing server costs by 40%

I focus on building maintainable, scalable Django applications with clean architecture and comprehensive testing.`,
    rate: "125",
    availability: "available",
    country: "Bulgaria",
    portfolioUrl: "https://sofia-petrov.dev",
    githubUrl: "https://github.com/sofiapetrov",
    skills: [
      { skill: "python", level: "expert" },
      { skill: "django", level: "expert" },
      { skill: "flask", level: "advanced" },
      { skill: "postgresql", level: "expert" },
      { skill: "redis", level: "advanced" },
      { skill: "docker", level: "advanced" },
      { skill: "linux", level: "advanced" },
      { skill: "rest", level: "expert" }
    ]
  },
  {
    name: "Raj Sharma",
    email: "raj.sharma@email.com",
    headline: "Python DevOps Engineer & Infrastructure Specialist",
    bio: `DevOps-focused Python developer with 6 years building automation tools and infrastructure. Expert in deployment automation, monitoring, and scalable system architecture.

DevOps Achievements:
• Built deployment pipeline reducing release time from 4 hours to 15 minutes
• Created infrastructure-as-code solutions managing 100+ AWS instances
• Developed monitoring system with Python reducing incident response by 70%
• Automated testing framework increasing deployment confidence to 99%

I specialize in the intersection of development and operations, building tools that enable fast, reliable software delivery.`,
    rate: "140",
    availability: "available",
    country: "India",
    githubUrl: "https://github.com/rajsharma",
    websiteUrl: "https://raj-sharma.dev",
    skills: [
      { skill: "python", level: "expert" },
      { skill: "django", level: "advanced" },
      { skill: "flask", level: "advanced" },
      { skill: "docker", level: "expert" },
      { skill: "kubernetes", level: "advanced" },
      { skill: "aws", level: "expert" },
      { skill: "terraform", level: "advanced" },
      { skill: "linux", level: "expert" },
      { skill: "postgresql", level: "advanced" }
    ]
  },
  {
    name: "Elena Rossi",
    email: "elena.rossi@email.com",
    headline: "Flask & Microservices Python Developer",
    bio: `Microservices specialist with 5 years building lightweight, scalable Python applications. Expert in Flask, API design, and distributed systems architecture.

Microservices Experience:
• Architected microservices platform with 15+ Flask services
• Built event-driven architecture using Python and message queues
• Created API gateway handling 500k+ daily requests
• Developed service mesh with health checks and auto-scaling

I excel at building small, focused services that work together to create powerful, maintainable systems.`,
    rate: "115",
    availability: "available",
    country: "Italy",
    portfolioUrl: "https://elena-rossi.dev",
    githubUrl: "https://github.com/elenarossi",
    skills: [
      { skill: "python", level: "expert" },
      { skill: "flask", level: "expert" },
      { skill: "django", level: "intermediate" },
      { skill: "postgresql", level: "advanced" },
      { skill: "redis", level: "advanced" },
      { skill: "docker", level: "advanced" },
      { skill: "rest", level: "expert" },
      { skill: "mongodb", level: "intermediate" }
    ]
  },
  {
    name: "Ahmed Hassan",
    email: "ahmed.hassan@email.com",
    headline: "Python API Developer & Integration Specialist",
    bio: `Integration-focused Python developer with 6 years building APIs and connecting systems. Expert in REST/GraphQL APIs, third-party integrations, and data synchronization.

Integration Projects:
• Built payment processing integration handling $5M+ monthly volume
• Developed CRM synchronization system connecting 8 different platforms
• Created webhook system processing 1M+ events daily
• Built API documentation and testing framework used by 50+ developers

I specialize in making different systems work together seamlessly through robust API design and reliable integrations.`,
    rate: "120",
    availability: "busy",
    country: "Egypt",
    githubUrl: "https://github.com/ahmedhassan",
    skills: [
      { skill: "python", level: "expert" },
      { skill: "django", level: "advanced" },
      { skill: "flask", level: "expert" },
      { skill: "rest", level: "expert" },
      { skill: "graphql", level: "advanced" },
      { skill: "postgresql", level: "advanced" },
      { skill: "mongodb", level: "intermediate" },
      { skill: "redis", level: "intermediate" }
    ]
  },
  {
    name: "Maria Santos",
    email: "maria.santos@email.com",
    headline: "Python Web Developer & E-learning Platform Specialist",
    bio: `Education technology Python developer with 5 years building learning management systems and educational platforms. Expert in Django with focus on user experience and scalability.

EdTech Projects:
• Built online learning platform serving 100k+ students globally
• Developed interactive quiz system with real-time progress tracking
• Created video streaming platform with adaptive quality delivery
• Built gamification system increasing student engagement by 60%

I'm passionate about using technology to make education more accessible and engaging for learners worldwide.`,
    rate: "110",
    availability: "available",
    country: "Brazil",
    portfolioUrl: "https://maria-santos.dev",
    githubUrl: "https://github.com/mariasantos",
    skills: [
      { skill: "python", level: "expert" },
      { skill: "django", level: "expert" },
      { skill: "postgresql", level: "advanced" },
      { skill: "redis", level: "intermediate" },
      { skill: "javascript", level: "intermediate" },
      { skill: "docker", level: "intermediate" }
    ]
  },
  {
    name: "Thomas Mueller",
    email: "thomas.mueller@email.com",
    headline: "Python Automation & Testing Specialist",
    bio: `Quality-focused Python developer with 6 years building test automation and CI/CD systems. Expert in testing frameworks, automation tools, and ensuring software reliability.

Automation Expertise:
• Built comprehensive test suite covering 95% code coverage for enterprise app
• Created automated deployment system reducing manual errors by 90%
• Developed performance testing framework identifying bottlenecks early
• Built monitoring and alerting system with Python and custom dashboards

I focus on building systems that ensure software quality and enable teams to deploy with confidence.`,
    rate: "125",
    availability: "available",
    country: "Germany",
    githubUrl: "https://github.com/thomasmueller",
    websiteUrl: "https://thomas-mueller.dev",
    skills: [
      { skill: "python", level: "expert" },
      { skill: "django", level: "advanced" },
      { skill: "flask", level: "advanced" },
      { skill: "postgresql", level: "advanced" },
      { skill: "docker", level: "advanced" },
      { skill: "linux", level: "expert" },
      { skill: "aws", level: "intermediate" }
    ]
  },
  {
    name: "Priya Patel",
    email: "priya.patel@email.com",
    headline: "Django REST Framework & Mobile Backend Developer",
    bio: `Mobile backend specialist with 4 years building APIs for mobile applications. Expert in Django REST Framework with focus on performance, security, and mobile-specific requirements.

Mobile API Experience:
• Built backend for fitness app with 200k+ active users
• Developed real-time chat API with WebSocket integration
• Created location-based services API with geospatial queries
• Built push notification system handling 1M+ daily messages

I specialize in creating robust, scalable backends that power exceptional mobile experiences.`,
    rate: "105",
    availability: "available",
    country: "India",
    portfolioUrl: "https://priya-patel.dev",
    githubUrl: "https://github.com/priyapatel",
    skills: [
      { skill: "python", level: "expert" },
      { skill: "django", level: "expert" },
      { skill: "rest", level: "expert" },
      { skill: "postgresql", level: "advanced" },
      { skill: "redis", level: "advanced" },
      { skill: "firebase", level: "intermediate" },
      { skill: "docker", level: "intermediate" }
    ]
  },
  {
    name: "Kevin O'Brien",
    email: "kevin.obrien@email.com",
    headline: "Python Full-Stack Developer & Startup CTO",
    bio: `Versatile Python developer with 7 years building products from concept to scale. Former startup CTO with experience in full product lifecycle and team leadership.

Startup Experience:
• Led technical team of 8 engineers as CTO of fintech startup
• Built MVP to Series A product serving 10k+ business customers
• Architected scalable platform handling $50M+ annual transaction volume
• Raised $5M Series A with technical product demos and architecture

I excel at rapid prototyping, scaling systems, and making technical decisions that drive business success.`,
    rate: "150",
    availability: "busy",
    country: "Ireland",
    githubUrl: "https://github.com/kevinobrien",
    websiteUrl: "https://kevin-obrien.dev",
    skills: [
      { skill: "python", level: "expert" },
      { skill: "django", level: "expert" },
      { skill: "flask", level: "advanced" },
      { skill: "javascript", level: "intermediate" },
      { skill: "react", level: "intermediate" },
      { skill: "postgresql", level: "advanced" },
      { skill: "aws", level: "advanced" },
      { skill: "docker", level: "advanced" }
    ]
  },
  {
    name: "Yuki Tanaka",
    email: "yuki.tanaka@email.com",
    headline: "Python & AI/ML Integration Developer",
    bio: `AI-focused Python developer with 5 years integrating machine learning models into production applications. Expert in Python web frameworks with ML/AI deployment experience.

AI Integration Projects:
• Integrated computer vision model into Django app for quality control
• Built recommendation API serving personalized content to 500k+ users
• Developed natural language processing pipeline for customer support
• Created A/B testing framework for ML model performance comparison

I bridge the gap between data science and software engineering, making AI accessible in real-world applications.`,
    rate: "135",
    availability: "available",
    country: "Japan",
    githubUrl: "https://github.com/yukitanaka",
    websiteUrl: "https://yuki-tanaka.ai",
    skills: [
      { skill: "python", level: "expert" },
      { skill: "django", level: "advanced" },
      { skill: "flask", level: "advanced" },
      { skill: "postgresql", level: "advanced" },
      { skill: "mongodb", level: "intermediate" },
      { skill: "docker", level: "advanced" },
      { skill: "aws", level: "intermediate" }
    ]
  },

  // Java Specialists (10)
  {
    name: "Robert Johnson",
    email: "robert.johnson@email.com",
    headline: "Senior Java Enterprise Architect & Spring Expert",
    bio: `Enterprise Java developer with 12 years building large-scale applications. Expert in Spring ecosystem, microservices architecture, and performance optimization for high-traffic systems.

Enterprise Achievements:
• Architected banking system processing 10M+ transactions daily
• Led migration from monolith to microservices for insurance company
• Built real-time trading platform with sub-millisecond latency requirements
• Optimized legacy Java application reducing memory usage by 50%

I specialize in building robust, scalable enterprise applications that handle mission-critical business requirements.`,
    rate: "165",
    availability: "busy",
    country: "United States",
    githubUrl: "https://github.com/robertjohnson",
    websiteUrl: "https://robert-johnson.dev",
    skills: [
      { skill: "java", level: "expert" },
      { skill: "spring", level: "expert" },
      { skill: "postgresql", level: "expert" },
      { skill: "mongodb", level: "advanced" },
      { skill: "docker", level: "advanced" },
      { skill: "kubernetes", level: "advanced" },
      { skill: "aws", level: "advanced" },
      { skill: "rest", level: "expert" }
    ]
  },
  {
    name: "Hiroshi Yamamoto",
    email: "hiroshi.yamamoto@email.com",
    headline: "Java Microservices & Cloud Native Developer",
    bio: `Cloud-native Java developer with 8 years building containerized microservices. Expert in Spring Boot, Kubernetes, and cloud-first architecture patterns.

Cloud Native Projects:
• Built event-driven microservices platform with 20+ services
• Implemented service mesh architecture with Istio and Kubernetes
• Created auto-scaling system handling 10x traffic spikes
• Developed observability stack with distributed tracing and metrics

I focus on building cloud-native applications that are resilient, scalable, and maintainable in modern infrastructure.`,
    rate: "145",
    availability: "available",
    country: "Japan",
    portfolioUrl: "https://hiroshi-yamamoto.dev",
    githubUrl: "https://github.com/hiroshi",
    skills: [
      { skill: "java", level: "expert" },
      { skill: "spring", level: "expert" },
      { skill: "docker", level: "expert" },
      { skill: "kubernetes", level: "expert" },
      { skill: "postgresql", level: "advanced" },
      { skill: "mongodb", level: "intermediate" },
      { skill: "aws", level: "advanced" },
      { skill: "terraform", level: "intermediate" }
    ]
  },
  {
    name: "Isabella Schmidt",
    email: "isabella.schmidt@email.com",
    headline: "Java Backend Developer & API Design Specialist",
    bio: `API-focused Java developer with 6 years building RESTful and GraphQL services. Expert in Spring Boot with emphasis on clean architecture and comprehensive testing.

API Development:
• Built payment processing API handling €100M+ annual volume
• Designed GraphQL schema serving 15+ client applications
• Created rate-limiting and authentication middleware used across 50+ services
• Developed API documentation system with interactive testing capabilities

I specialize in designing and building APIs that are intuitive, performant, and maintainable.`,
    rate: "130",
    availability: "available",
    country: "Germany",
    githubUrl: "https://github.com/isabelladev",
    websiteUrl: "https://isabella-schmidt.dev",
    skills: [
      { skill: "java", level: "expert" },
      { skill: "spring", level: "expert" },
      { skill: "rest", level: "expert" },
      { skill: "graphql", level: "advanced" },
      { skill: "postgresql", level: "expert" },
      { skill: "redis", level: "advanced" },
      { skill: "docker", level: "advanced" }
    ]
  },
  {
    name: "Marcus Brown",
    email: "marcus.brown@email.com",
    headline: "Java Performance Engineer & System Optimization Expert",
    bio: `Performance-focused Java developer with 9 years optimizing high-traffic applications. Expert in JVM tuning, profiling, and building systems that scale under extreme load.

Performance Achievements:
• Optimized e-commerce platform to handle Black Friday traffic (50x normal load)
• Reduced application startup time from 5 minutes to 30 seconds
• Tuned JVM reducing garbage collection pauses by 90%
• Built caching layer improving API response time by 200%

I specialize in making Java applications fast, efficient, and capable of handling massive scale.`,
    rate: "155",
    availability: "available",
    country: "United Kingdom",
    githubUrl: "https://github.com/marcusbrown",
    skills: [
      { skill: "java", level: "expert" },
      { skill: "spring", level: "expert" },
      { skill: "postgresql", level: "expert" },
      { skill: "redis", level: "expert" },
      { skill: "mongodb", level: "advanced" },
      { skill: "docker", level: "advanced" },
      { skill: "linux", level: "expert" }
    ]
  },
  {
    name: "Chen Wei",
    email: "chen.wei@email.com",
    headline: "Java Full-Stack Developer & Team Lead",
    bio: `Full-stack Java developer with 7 years experience and 3 years leading development teams. Expert in Spring ecosystem with strong frontend skills and agile leadership experience.

Leadership Experience:
• Led team of 10 developers building e-government platform
• Implemented agile practices reducing delivery time by 40%
• Mentored 15+ junior developers in Java best practices
• Architected full-stack solution serving 1M+ citizens

I combine technical expertise with leadership skills to deliver complex projects while developing strong engineering teams.`,
    rate: "140",
    availability: "busy",
    country: "China",
    githubUrl: "https://github.com/chenwei",
    websiteUrl: "https://chen-wei.dev",
    skills: [
      { skill: "java", level: "expert" },
      { skill: "spring", level: "expert" },
      { skill: "javascript", level: "intermediate" },
      { skill: "react", level: "intermediate" },
      { skill: "postgresql", level: "advanced" },
      { skill: "docker", level: "advanced" },
      { skill: "aws", level: "intermediate" }
    ]
  },
  {
    name: "Laura Dubois",
    email: "laura.dubois@email.com",
    headline: "Java Security Specialist & Financial Systems Developer",
    bio: `Security-focused Java developer with 8 years building secure financial applications. Expert in Spring Security, compliance requirements, and building systems that handle sensitive data.

Security & Fintech:
• Built PCI-compliant payment processing system
• Developed GDPR-compliant data handling framework
• Created authentication system supporting MFA and SSO
• Built audit logging system tracking all financial transactions

I specialize in building secure, compliant Java applications for industries with strict regulatory requirements.`,
    rate: "150",
    availability: "available",
    country: "France",
    githubUrl: "https://github.com/lauradubois",
    skills: [
      { skill: "java", level: "expert" },
      { skill: "spring", level: "expert" },
      { skill: "postgresql", level: "expert" },
      { skill: "mongodb", level: "intermediate" },
      { skill: "docker", level: "advanced" },
      { skill: "aws", level: "intermediate" }
    ]
  },
  {
    name: "Ricardo Silva",
    email: "ricardo.silva@email.com",
    headline: "Java Integration Developer & Message Queue Specialist",
    bio: `Integration-focused Java developer with 6 years connecting enterprise systems. Expert in message queues, event-driven architecture, and building reliable distributed systems.

Integration Projects:
• Built message-driven architecture processing 5M+ events daily
• Integrated 12 legacy systems using Apache Kafka and Spring Integration
• Created fault-tolerant data pipeline with automatic retry and dead letter queues
• Developed real-time synchronization between CRM and ERP systems

I excel at making complex systems work together reliably through robust integration patterns and messaging.`,
    rate: "125",
    availability: "available",
    country: "Brazil",
    portfolioUrl: "https://ricardo-silva.dev",
    githubUrl: "https://github.com/ricardosilva",
    skills: [
      { skill: "java", level: "expert" },
      { skill: "spring", level: "expert" },
      { skill: "postgresql", level: "advanced" },
      { skill: "mongodb", level: "advanced" },
      { skill: "redis", level: "advanced" },
      { skill: "docker", level: "intermediate" }
    ]
  },
  {
    name: "Sarah Mitchell",
    email: "sarah.mitchell@email.com",
    headline: "Java Developer & Agile Coach",
    bio: `Java developer with 7 years experience and certified Scrum Master. Expert in Spring framework with strong focus on test-driven development and clean code practices.

Agile & Development:
• Implemented TDD practices increasing code coverage to 95%
• Led agile transformation for development team of 20+ engineers
• Built continuous integration pipeline reducing bug count by 60%
• Created coding standards and best practices adopted organization-wide

I combine strong technical skills with process improvement expertise to build better software and stronger teams.`,
    rate: "135",
    availability: "available",
    country: "Canada",
    githubUrl: "https://github.com/sarahmitchell",
    websiteUrl: "https://sarah-mitchell.dev",
    skills: [
      { skill: "java", level: "expert" },
      { skill: "spring", level: "expert" },
      { skill: "postgresql", level: "advanced" },
      { skill: "docker", level: "advanced" },
      { skill: "aws", level: "intermediate" },
      { skill: "rest", level: "advanced" }
    ]
  },
  {
    name: "Alexandros Papadopoulos",
    email: "alexandros.papadopoulos@email.com",
    headline: "Java Enterprise Integration & Legacy System Modernization",
    bio: `Enterprise Java specialist with 10 years modernizing legacy systems. Expert in gradual migration strategies, integration patterns, and maintaining business continuity during transitions.

Modernization Projects:
• Led migration of 15-year-old J2EE application to Spring Boot
• Implemented strangler fig pattern for gradual system replacement
• Built integration layer connecting mainframe to modern microservices
• Reduced technical debt while maintaining 99.9% system uptime

I specialize in breathing new life into legacy systems while ensuring business continuity and team productivity.`,
    rate: "160",
    availability: "busy",
    country: "Greece",
    githubUrl: "https://github.com/alexandros",
    skills: [
      { skill: "java", level: "expert" },
      { skill: "spring", level: "expert" },
      { skill: "postgresql", level: "expert" },
      { skill: "mongodb", level: "intermediate" },
      { skill: "docker", level: "advanced" },
      { skill: "linux", level: "advanced" }
    ]
  },
  {
    name: "Jennifer Wang",
    email: "jennifer.wang@email.com",
    headline: "Java Cloud Developer & DevOps Engineer",
    bio: `Cloud-focused Java developer with 5 years building and deploying applications on AWS and GCP. Expert in infrastructure as code, monitoring, and building observable systems.

Cloud & DevOps:
• Built multi-region deployment system with zero-downtime releases
• Created monitoring and alerting system reducing incident response by 80%
• Implemented infrastructure as code managing 200+ cloud resources
• Developed cost optimization strategies reducing cloud spend by 35%

I focus on building Java applications that are cloud-native, observable, and cost-effective to operate.`,
    rate: "140",
    availability: "available",
    country: "Singapore",
    githubUrl: "https://github.com/jenniferwang",
    websiteUrl: "https://jennifer-wang.dev",
    skills: [
      { skill: "java", level: "expert" },
      { skill: "spring", level: "advanced" },
      { skill: "docker", level: "expert" },
      { skill: "kubernetes", level: "advanced" },
      { skill: "aws", level: "expert" },
      { skill: "terraform", level: "advanced" },
      { skill: "postgresql", level: "advanced" }
    ]
  },

  // Multi-language specialists (10)
  {
    name: "Dmitri Volkov",
    email: "dmitri.volkov@email.com",
    headline: "Full-Stack Polyglot Developer - React, Node.js, Python, Java",
    bio: `Polyglot developer with 10 years across multiple technologies. Expert in JavaScript/TypeScript, Python, and Java with ability to choose the right tool for each project requirement.

Cross-Platform Expertise:
• Built trading platform with React frontend, Node.js APIs, and Java matching engine
• Created data pipeline using Python for ML and Java for high-performance processing
• Developed microservices architecture using optimal language per service
• Led technical decisions for startup choosing tech stack based on team and requirements

I excel at technology selection, cross-team collaboration, and building systems that leverage the best of each platform.`,
    rate: "175",
    availability: "busy",
    country: "Estonia",
    githubUrl: "https://github.com/dmitrivolkov",
    websiteUrl: "https://dmitri-volkov.dev",
    skills: [
      { skill: "javascript", level: "expert" },
      { skill: "typescript", level: "expert" },
      { skill: "python", level: "expert" },
      { skill: "java", level: "expert" },
      { skill: "react", level: "expert" },
      { skill: "nodejs", level: "expert" },
      { skill: "spring", level: "advanced" },
      { skill: "django", level: "advanced" },
      { skill: "postgresql", level: "expert" },
      { skill: "docker", level: "expert" },
      { skill: "aws", level: "advanced" }
    ]
  },
  {
    name: "Fatima Al-Zahra",
    email: "fatima.alzahra@email.com",
    headline: "Mobile & Web Developer - React Native, Flutter, React",
    bio: `Mobile-first developer with 6 years building cross-platform applications. Expert in React Native, Flutter, and React with focus on unified user experiences across all platforms.

Cross-Platform Projects:
• Built fintech app with React Native (iOS/Android) and React web dashboard
• Developed Flutter e-commerce app with 500k+ downloads across platforms
• Created design system shared between React web and React Native mobile
• Built offline-first apps with synchronization across web and mobile platforms

I specialize in creating consistent, high-quality experiences across all platforms while maximizing code reuse and team efficiency.`,
    rate: "130",
    availability: "available",
    country: "Morocco",
    portfolioUrl: "https://fatima-alzahra.dev",
    githubUrl: "https://github.com/fatimadev",
    skills: [
      { skill: "javascript", level: "expert" },
      { skill: "typescript", level: "advanced" },
      { skill: "react", level: "expert" },
      { skill: "reactnative", level: "expert" },
      { skill: "flutter", level: "expert" },
      { skill: "dart", level: "advanced" },
      { skill: "nodejs", level: "intermediate" },
      { skill: "firebase", level: "advanced" }
    ]
  },
  {
    name: "Sebastian Mueller",
    email: "sebastian.mueller@email.com",
    headline: "Backend Specialist - Go, Rust, Python, Kubernetes",
    bio: `Performance-focused backend developer with 8 years building high-throughput systems. Expert in Go, Rust, and Python with deep knowledge of systems programming and cloud-native architecture.

High-Performance Projects:
• Built cryptocurrency trading engine in Rust handling 100k+ TPS
• Created logging system in Go processing 10M+ events per second  
• Developed ML inference API in Python with Go performance layer
• Built Kubernetes operators for automated database management

I focus on building the fastest, most reliable backend systems using the optimal language for each performance requirement.`,
    rate: "170",
    availability: "busy",
    country: "Switzerland",
    githubUrl: "https://github.com/sebastianmueller",
    websiteUrl: "https://sebastian-mueller.dev",
    skills: [
      { skill: "golang", level: "expert" },
      { skill: "rust", level: "expert" },
      { skill: "python", level: "expert" },
      { skill: "kubernetes", level: "expert" },
      { skill: "docker", level: "expert" },
      { skill: "postgresql", level: "advanced" },
      { skill: "redis", level: "advanced" },
      { skill: "linux", level: "expert" }
    ]
  },
  {
    name: "Aisha Patel",
    email: "aisha.patel@email.com",
    headline: "DevOps Engineer - Python, Go, TypeScript, Infrastructure",
    bio: `DevOps specialist with 7 years automating infrastructure and deployment processes. Expert in Python automation, Go tooling, and TypeScript for internal tools and dashboards.

DevOps & Automation:
• Built deployment platform in Go managing 500+ microservices
• Created monitoring dashboards with TypeScript reducing incident response by 60%
• Developed Python automation tools saving 20+ hours weekly across teams
• Implemented GitOps workflow with automated testing and rollback capabilities

I bridge development and operations by building tools that make software delivery fast, safe, and reliable.`,
    rate: "155",
    availability: "available",
    country: "United Kingdom",
    githubUrl: "https://github.com/aishapatel",
    websiteUrl: "https://aisha-patel.dev",
    skills: [
      { skill: "python", level: "expert" },
      { skill: "golang", level: "expert" },
      { skill: "typescript", level: "advanced" },
      { skill: "docker", level: "expert" },
      { skill: "kubernetes", level: "expert" },
      { skill: "terraform", level: "expert" },
      { skill: "aws", level: "advanced" },
      { skill: "linux", level: "expert" }
    ]
  },
  {
    name: "Lucas Rodriguez",
    email: "lucas.rodriguez@email.com",
    headline: "Startup CTO - React, Node.js, Python, AWS",
    bio: `Technical leader with 9 years building products from MVP to scale. Former startup CTO with experience across full stack development, team leadership, and technical decision making.

Startup Leadership:
• Scaled engineering team from 2 to 25 engineers as CTO
• Built SaaS platform serving 100k+ users with React, Node.js, and Python
• Led technical due diligence for $10M Series A funding round
• Implemented architecture supporting 10x growth in 18 months

I excel at making technology decisions that balance speed, quality, and scalability while building and leading high-performing engineering teams.`,
    rate: "180",
    availability: "busy",
    country: "Argentina",
    githubUrl: "https://github.com/lucasrodriguez",
    websiteUrl: "https://lucas-rodriguez.tech",
    skills: [
      { skill: "javascript", level: "expert" },
      { skill: "typescript", level: "expert" },
      { skill: "react", level: "expert" },
      { skill: "nodejs", level: "expert" },
      { skill: "python", level: "expert" },
      { skill: "django", level: "advanced" },
      { skill: "aws", level: "expert" },
      { skill: "postgresql", level: "advanced" },
      { skill: "docker", level: "advanced" }
    ]
  },
  {
    name: "Nina Larsson",
    email: "nina.larsson@email.com",
    headline: "Frontend Architect - React, Vue, Angular, TypeScript",
    bio: `Frontend architecture specialist with 8 years building scalable UI systems. Expert across React, Vue, and Angular ecosystems with deep TypeScript knowledge and design system experience.

Frontend Architecture:
• Built design system supporting 50+ applications across React, Vue, and Angular
• Created micro-frontend architecture enabling independent team deployments  
• Developed build system reducing bundle sizes by 40% across all frameworks
• Led frontend architecture decisions for enterprise applications serving 1M+ users

I specialize in creating consistent, maintainable frontend experiences regardless of the underlying framework or technology choices.`,
    rate: "145",
    availability: "available",
    country: "Sweden",
    portfolioUrl: "https://nina-larsson.design",
    githubUrl: "https://github.com/ninalarsson",
    skills: [
      { skill: "typescript", level: "expert" },
      { skill: "javascript", level: "expert" },
      { skill: "react", level: "expert" },
      { skill: "vue", level: "expert" },
      { skill: "angular", level: "expert" },
      { skill: "tailwindcss", level: "advanced" },
      { skill: "sass", level: "advanced" },
      { skill: "nodejs", level: "intermediate" }
    ]
  },
  {
    name: "Omar Ben Ali",
    email: "omar.benali@email.com",
    headline: "Cloud Architect - Java, Python, Go, Kubernetes",
    bio: `Cloud architecture specialist with 9 years designing multi-cloud solutions. Expert in Java Spring, Python, and Go with deep experience in Kubernetes and serverless architectures.

Cloud Architecture:
• Designed multi-cloud strategy for enterprise serving 5M+ customers
• Built event-driven serverless architecture processing 50M+ events daily
• Created Kubernetes platform supporting 200+ microservices
• Led cloud migration reducing infrastructure costs by 45%

I specialize in designing cloud-native architectures that are resilient, scalable, and cost-effective across multiple cloud providers.`,
    rate: "165",
    availability: "available",
    country: "Tunisia",
    githubUrl: "https://github.com/omarbenali",
    websiteUrl: "https://omar-benali.cloud",
    skills: [
      { skill: "java", level: "expert" },
      { skill: "python", level: "expert" },
      { skill: "golang", level: "advanced" },
      { skill: "spring", level: "expert" },
      { skill: "kubernetes", level: "expert" },
      { skill: "docker", level: "expert" },
      { skill: "aws", level: "expert" },
      { skill: "terraform", level: "advanced" }
    ]
  },
  {
    name: "Katja Novak",
    email: "katja.novak@email.com",
    headline: "Data Engineer - Python, Java, Scala, Big Data",
    bio: `Data engineering specialist with 7 years building large-scale data processing systems. Expert in Python, Java, and functional programming with experience in both batch and stream processing.

Big Data Projects:
• Built real-time analytics platform processing 1TB+ daily using Kafka and Spark
• Created data lake architecture storing and processing 100TB+ of customer data
• Developed ML feature pipeline serving models with sub-100ms latency
• Built data quality monitoring system catching issues before production impact

I specialize in building robust, scalable data infrastructure that enables data-driven decision making at enterprise scale.`,
    rate: "150",
    availability: "available",
    country: "Slovenia",
    githubUrl: "https://github.com/katjanovak",
    websiteUrl: "https://katja-novak.data",
    skills: [
      { skill: "python", level: "expert" },
      { skill: "java", level: "expert" },
      { skill: "postgresql", level: "expert" },
      { skill: "mongodb", level: "advanced" },
      { skill: "docker", level: "advanced" },
      { skill: "kubernetes", level: "intermediate" },
      { skill: "aws", level: "advanced" }
    ]
  },
  {
    name: "Ryan O'Sullivan",
    email: "ryan.osullivan@email.com",
    headline: "Platform Engineer - Rust, Go, Python, Infrastructure",
    bio: `Platform engineering specialist with 6 years building developer tools and infrastructure. Expert in systems programming with Rust and Go, plus Python for automation and tooling.

Platform Engineering:
• Built internal developer platform used by 200+ engineers daily
• Created CI/CD system in Go reducing build times by 70%
• Developed service mesh components in Rust for high-performance networking
• Built monitoring and observability stack processing 100M+ metrics hourly

I focus on building the foundational systems and tools that enable other developers to be productive and deploy software reliably.`,
    rate: "160",
    availability: "busy",
    country: "Ireland",
    githubUrl: "https://github.com/ryanosullivan",
    skills: [
      { skill: "rust", level: "expert" },
      { skill: "golang", level: "expert" },
      { skill: "python", level: "advanced" },
      { skill: "docker", level: "expert" },
      { skill: "kubernetes", level: "expert" },
      { skill: "terraform", level: "advanced" },
      { skill: "linux", level: "expert" }
    ]
  },
  {
    name: "Camila Torres",
    email: "camila.torres@email.com",
    headline: "Full-Stack Product Developer - React, Python, Java, Design",
    bio: `Product-focused developer with 7 years building user-centered applications. Expert across React, Python, and Java with strong UX/UI design skills and product management experience.

Product Development:
• Built complete SaaS platform from user research to deployment serving 50k+ users
• Led product development combining technical implementation with user experience design
• Created A/B testing framework enabling data-driven product decisions
• Developed design system bridging gap between design and engineering teams

I combine technical expertise with product sense and design skills to build software that users love and businesses depend on.`,
    rate: "140",
    availability: "available",
    country: "Colombia",
    portfolioUrl: "https://camila-torres.design",
    githubUrl: "https://github.com/camilatorres",
    skills: [
      { skill: "react", level: "expert" },
      { skill: "typescript", level: "advanced" },
      { skill: "python", level: "expert" },
      { skill: "django", level: "advanced" },
      { skill: "java", level: "intermediate" },
      { skill: "tailwindcss", level: "expert" },
      { skill: "postgresql", level: "advanced" },
      { skill: "aws", level: "intermediate" }
    ]
  }
]

async function seedDeveloperProfiles() {
  console.log('🌱 Seeding developer profiles...')
  
  try {
    // First, ensure all skills exist
    for (const skill of CORE_SKILLS) {
      await db.insert(skills).values(skill).onConflictDoNothing()
    }

    let successCount = 0
    let skipCount = 0

    // Create developer profiles
    for (const devProfile of DEVELOPER_PROFILES) {
      try {
        // Check if user already exists
        const existingUser = await db.select()
          .from(users)
          .where(eq(users.email, devProfile.email))
          .limit(1)

        if (existingUser.length > 0) {
          console.log(`⏭️  Skipping ${devProfile.name} - user already exists`)
          skipCount++
          continue
        }

        // Create user
        const hashedPassword = await bcrypt.hash('demo123', 10)
        const [user] = await db.insert(users).values({
          email: devProfile.email,
          name: devProfile.name,
          password: hashedPassword,
        }).returning()

        // Create profile
        await db.insert(profiles).values({
          id: user.id,
          role: 'developer',
          displayName: devProfile.name,
        })

        // Create developer profile
        await db.insert(developerProfiles).values({
          userId: user.id,
          headline: devProfile.headline,
          bio: devProfile.bio,
          rate: devProfile.rate,
          availability: devProfile.availability as any,
          portfolioUrl: devProfile.portfolioUrl || null,
          githubUrl: devProfile.githubUrl || null,
          websiteUrl: devProfile.websiteUrl || null,
          country: devProfile.country,
        })

        // Add skills
        for (const skillData of devProfile.skills) {
          const skill = await db.select()
            .from(skills)
            .where(eq(skills.slug, skillData.skill))
            .limit(1)

          if (skill.length > 0) {
            await db.insert(developerSkills).values({
              userId: user.id,
              skillId: skill[0].id,
              level: skillData.level as any,
            }).onConflictDoNothing()
          }
        }

        console.log(`✅ Created profile for ${devProfile.name}`)
        successCount++
      } catch (error) {
        console.error(`❌ Error creating profile for ${devProfile.name}:`, error)
      }
    }
    
    console.log(`\n🎉 Seeding completed!`)
    console.log(`✅ Successfully created: ${successCount} profiles`)
    console.log(`⏭️  Skipped existing: ${skipCount} profiles`)
    console.log(`📊 Total profiles: ${DEVELOPER_PROFILES.length}`)
    
  } catch (error) {
    console.error('❌ Error seeding developer profiles:', error)
  }
}

// Run the seed function
seedDeveloperProfiles().catch(console.error)