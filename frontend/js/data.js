// Single source of truth for the portfolio content (from the resume).
// Also powers the chatbot's offline fallback answers.
export const profile = {
  name: "Abhinav Reddy",
  first: "Abhinav",
  role: "Full Stack .NET Developer",
  years: 7,
  location: "United States",
  email: "abhinav232025@outlook.com",
  linkedin: "https://www.linkedin.com/in/abhinav-reddy-452a34364/",
  github: "https://github.com/AbhinavMaram",
  resume: "assets/Abhinav_Resume.pdf",
  headline: ".NET Core · Angular · React · Azure · AWS",
  summary:
    "I design and ship scalable enterprise applications across insurance, finance, healthcare and security. End-to-end ownership from ASP.NET Core Web APIs and C# to Angular and React front ends — on cloud-native Azure and AWS, with event-driven microservices, CI/CD I own, and AI features built on Azure OpenAI in production.",
  domains: ["Insurance", "Banking & Finance", "Healthcare", "Travel & Booking"],
};

export const metrics = [
  { value: 7, suffix: "yrs", label: "shipping enterprise software" },
  { value: 50, suffix: "%", label: "faster deployments via owned CI/CD" },
  { value: 45, suffix: "%", label: "lower API latency with Redis caching" },
  { value: 35, suffix: "%", label: "transaction perf gain from microservices" },
  { value: 85, suffix: "%+", label: "test coverage with xUnit & Moq" },
  { value: 25, suffix: "%", label: "less loan processing time with AI features" },
];

export const skills = {
  Backend: [".NET 6/8/9/10", "ASP.NET Core", "Web API", "MVC", "EF Core", "Dapper", "LINQ", "SignalR", "gRPC", "Blazor", "MAUI", "WCF"],
  Frontend: ["Angular 16–20", "NgRx", "RxJS", "React 18", "Redux", "TypeScript", "Tailwind CSS", "Figma-to-Code", "Capacitor"],
  "AI & GenAI": ["Azure OpenAI", "Azure AI Search", "OpenAI API", "Prompt Engineering", "LLM Integration", "RAG", "GitHub Copilot", "Claude Code"],
  Architecture: ["Microservices", "DDD", "CQRS", "Event-Driven", "Clean Architecture", "SOLID", "REST", "GraphQL", "Kafka", "RabbitMQ", "Service Bus"],
  "Cloud & DevOps": ["Azure App Service", "Azure Functions", "AKS", "Cosmos DB", "Key Vault", "APIM", "AWS EKS", "ECS Fargate", "Docker", "Kubernetes", "Azure DevOps", "GitHub Actions", "Jenkins"],
  Data: ["SQL Server", "Azure SQL", "PostgreSQL", "Oracle", "MySQL", "MongoDB", "Redis", "SSIS", "SSRS"],
  "Quality & Ops": ["xUnit", "NUnit", "MSTest", "Moq", "Playwright", "Cypress", "Jasmine/Karma", "SonarQube", "App Insights", "Grafana", "Datadog", "Splunk", "New Relic"],
  Security: ["OAuth 2.0", "JWT", "Azure AD", "RBAC", "Cognito", "HIPAA", "PCI-DSS", "GDPR"],
};

export const experience = [
  {
    id: "a7f3c21",
    company: "State Farm",
    role: "Full Stack .NET Developer",
    place: "Hartford, CT",
    start: "Jun 2025",
    end: "Present",
    domain: "Insurance",
    stack: ["C#", ".NET 8", "Angular 20", "NgRx", "GraphQL", "gRPC", "AWS EKS", "Kubernetes", "PostgreSQL"],
    highlight: "Broke a legacy policy-management monolith into .NET 8 microservices — +35% transaction performance.",
    bullets: [
      "Builds full-stack policy & claims workflows with C#, ASP.NET Core, Angular 20, NgRx and RxJS.",
      "Led decomposition of a legacy policy monolith into .NET Core 8 microservices, improving reliability and transaction performance by 35%.",
      "Built and consumed REST and GraphQL APIs for enterprise insurance platforms and third-party integrations.",
      "Runs distributed systems on AWS EKS with Docker and Kubernetes for high availability and fault tolerance.",
      "Secured service-to-service traffic with OAuth 2.0, RBAC, Protobuf and gRPC.",
      "Tuned SQL Server and PostgreSQL with query and indexing strategies for large transactional workloads.",
      "Observability with New Relic, CloudWatch and Grafana to protect SLAs.",
      "xUnit + Moq suites took coverage above 85% and cut production defects by 18%.",
    ],
  },
  {
    id: "4be91d0",
    company: "Regions Bank",
    role: "Full Stack Developer",
    place: "Salt Lake City, UT",
    start: "Jul 2023",
    end: "May 2025",
    domain: "Banking",
    stack: ["ASP.NET Core", "Angular 16–19", "Capacitor", "Azure DevOps", "AKS", "Redis", "App Insights", "Tailwind"],
    highlight: "Shipped the Contractor SalesPro mobile app with AI loan recommendations — −25% processing time.",
    bullets: [
      "Built and deployed online-banking apps on Angular (16–19) and ASP.NET Core with optimized back-end architecture.",
      "Engineered the Regions Contractor SalesPro hybrid app (Angular + Capacitor, iOS/Android) with AI-driven loan recommendations, cutting processing time 25%.",
      "Delivered REST and GraphQL APIs with backward compatibility across release cycles.",
      "Automated CI/CD on Azure DevOps, App Services and AKS — 40% shorter lead times, zero-downtime deploys.",
      "Application Insights telemetry reduced incident resolution time by 35%.",
      "Secured apps with JWT, .NET Identity, OAuth 2.0 and RBAC for full PCI-DSS compliance.",
      "Accessible, Figma-faithful UI in TypeScript and Tailwind, improving WCAG scores.",
      "Redis caching on hot account/transaction endpoints dropped response times 45% at peak.",
    ],
  },
  {
    id: "19c0e5a",
    company: "HCL Technologies",
    role: "Software Engineer",
    place: "Hyderabad, India",
    start: "Jun 2018",
    end: "Dec 2021",
    domain: "Travel & Booking",
    stack: ["ASP.NET Core", "React", "RabbitMQ", "CQRS", "SignalR", "EF Core", "PostgreSQL", "Oracle", "Redis"],
    highlight: "Real-time ticketing platform with SignalR push and CQRS over RabbitMQ.",
    bullets: [
      "Built C# / ASP.NET Core modules for route search, seat reservation and e-ticketing behind a React front end.",
      "Created reusable React components for route search, seat selection and e-ticket views.",
      "Secured APIs with ASP.NET Identity, OAuth 2.0, JWT and RBAC under GDPR.",
      "Async server-side processing improved operational efficiency by 15%.",
      "Pub/sub microservices over RabbitMQ with CQRS for high-volume concurrent bookings.",
      "EF Core + repository pattern with code-first migrations on PostgreSQL and Oracle.",
      "SignalR WebSocket push for live booking confirmations and seat availability.",
      "Raised test coverage from 40% to 75% with MSTest + Moq; Redis cut fare/route latency 30%.",
    ],
  },
];

export const education = [
  { degree: "M.S. Information Systems", school: "Pace University", place: "New York, NY", year: "2023" },
  { degree: "B.Tech Computer Science", school: "Jawaharlal Nehru Technological University", place: "Hyderabad, India", year: "2019" },
];

export const heroLog = [
  ["info", "restoring packages for Abhinav.Portfolio.sln"],
  ["ok", "restored  C# · TypeScript · SQL"],
  ["info", "building  ASP.NET Core 8 · Angular 20 · React 18"],
  ["ok", "built     12 microservices · 0 warnings"],
  ["info", "testing   xUnit · Playwright · Cypress"],
  ["ok", "passed    coverage 85.4%"],
  ["info", "deploying → Azure AKS · AWS EKS"],
  ["ok", "deployed  in 4m 12s (−50% vs. baseline)"],
  ["live", "status    open to new opportunities"],
];
