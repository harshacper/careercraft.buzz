/**
 * Comprehensive Academic Curriculum Database for AI Learning & Assessment Agent
 * Covers all 12 core engineering & computer science disciplines.
 */

const CURRICULUM = [
  {
    id: 'software-engineering',
    name: 'Software Engineering',
    category: 'Core Computer Science',
    icon: 'Layers',
    description: 'Systematic approaches to software specification, design, development, testing, and lifecycle maintenance.',
    modules: [
      {
        id: 'se-m1',
        title: 'Module 1: Introduction to Software Engineering',
        topics: [
          'Software Engineering fundamentals',
          'Software Crisis and Evolution',
          'Software Quality Attributes',
          'Software Process Framework'
        ]
      },
      {
        id: 'se-m2',
        title: 'Module 2: Software Development Life Cycle (SDLC)',
        topics: [
          'SDLC models overview',
          'Waterfall Model',
          'Agile Methodology & Scrum',
          'Spiral Model',
          'V-Model & Prototyping'
        ]
      },
      {
        id: 'se-m3',
        title: 'Module 3: Software Requirements Engineering',
        topics: [
          'Requirement Engineering Process',
          'Functional and Non-functional Requirements',
          'SRS Document (IEEE Standards)',
          'Use Case Modeling & Feasibility Study'
        ]
      },
      {
        id: 'se-m4',
        title: 'Module 4: Software Design & Architecture',
        topics: [
          'Software Design Principles (Cohesion & Coupling)',
          'Architectural Styles (MVC, Microservices, Monolith)',
          'Object-Oriented Design & UML',
          'Design Patterns (Factory, Singleton, Observer)'
        ]
      },
      {
        id: 'se-m5',
        title: 'Module 5: Software Testing & Maintenance',
        topics: [
          'Software Testing Types (Unit, Integration, System)',
          'Black-Box vs White-Box Testing',
          'Automated CI/CD & Regression Testing',
          'Software Maintenance & Refactoring'
        ]
      }
    ]
  },
  {
    id: 'dsa',
    name: 'Data Structures and Algorithms',
    category: 'Core Computer Science',
    icon: 'Code2',
    description: 'Linear & non-linear structures, algorithmic paradigms, time-space complexities, and problem-solving techniques.',
    modules: [
      {
        id: 'dsa-m1',
        title: 'Module 1: Foundations & Asymptotic Complexity',
        topics: [
          'Big-O, Big-Omega, Theta Notation',
          'Arrays & Dynamic Memory Allocation',
          'Amortized Analysis',
          'Recursion & Mathematical Induction'
        ]
      },
      {
        id: 'dsa-m2',
        title: 'Module 2: Linear Data Structures',
        topics: [
          'Singly, Doubly, and Circular Linked Lists',
          'Stacks (Array & Linked implementations)',
          'Queues, Deques & Priority Queues',
          'Applications of Stacks (Infix to Postfix, Balancing)'
        ]
      },
      {
        id: 'dsa-m3',
        title: 'Module 3: Non-Linear Structures (Trees & Graphs)',
        topics: [
          'Binary Trees, BST, and Tree Traversals',
          'Balanced Trees (AVL & Red-Black Trees)',
          'Graph Representations (Adjacency Matrix & List)',
          'BFS and DFS Graph Traversals'
        ]
      },
      {
        id: 'dsa-m4',
        title: 'Module 4: Sorting, Searching & Hashing',
        topics: [
          'MergeSort, QuickSort, and HeapSort',
          'Binary Search & Lower/Upper Bound Search',
          'Hash Tables, Collision Resolution & Chaining',
          'Bloom Filters & Consistent Hashing'
        ]
      },
      {
        id: 'dsa-m5',
        title: 'Module 5: Algorithmic Paradigms',
        topics: [
          'Greedy Algorithms (Dijkstra, Prim, Kruskal)',
          'Dynamic Programming (Knapsack, LCS, LIS)',
          'Divide and Conquer Optimization',
          'Backtracking & Branch-and-Bound (N-Queens)'
        ]
      }
    ]
  },
  {
    id: 'dbms',
    name: 'Database Management Systems',
    category: 'Core Computer Science',
    icon: 'Database',
    description: 'Relational data models, normalization, SQL, indexing, transaction processing, and ACID properties.',
    modules: [
      {
        id: 'dbms-m1',
        title: 'Module 1: Introduction & ER Modeling',
        topics: [
          'DBMS Architecture & Data Independence',
          'Entity-Relationship (ER) & Extended ER Modeling',
          'Relational Data Model & Integrity Constraints',
          'Relational Algebra & Relational Calculus'
        ]
      },
      {
        id: 'dbms-m2',
        title: 'Module 2: Structured Query Language (SQL)',
        topics: [
          'DDL, DML, DCL, and TCL Commands',
          'Complex Joins & Subqueries',
          'Aggregate Functions & Grouping',
          'Views, Triggers & Stored Procedures'
        ]
      },
      {
        id: 'dbms-m3',
        title: 'Module 3: Normalization & Schema Design',
        topics: [
          'Functional Dependencies & Armstrong Axioms',
          'First, Second, and Third Normal Forms (1NF, 2NF, 3NF)',
          'Boyce-Codd Normal Form (BCNF)',
          'Lossless Join Decomposition & Dependency Preservation'
        ]
      },
      {
        id: 'dbms-m4',
        title: 'Module 4: Transactions & Concurrency Control',
        topics: [
          'ACID Properties of Transactions',
          'Serializability & Conflict Equivalence',
          'Lock-Based Protocols (2-Phase Locking)',
          'Deadlock Prevention, Detection, and Recovery'
        ]
      },
      {
        id: 'dbms-m5',
        title: 'Module 5: Storage, Indexing & Modern DBs',
        topics: [
          'B-Trees and B+ Trees Indexing',
          'Hashing & Query Optimization Execution Plans',
          'NoSQL Databases (Document, Key-Value, Graph)',
          'CAP Theorem & Distributed Databases'
        ]
      }
    ]
  },
  {
    id: 'computer-networks',
    name: 'Computer Networks',
    category: 'Core Computer Science',
    icon: 'Network',
    description: 'Network architecture, OSI & TCP/IP layers, routing protocols, flow control, and internet standards.',
    modules: [
      {
        id: 'cn-m1',
        title: 'Module 1: Network Models & Physical Layer',
        topics: [
          'OSI 7-Layer Reference Model vs TCP/IP Suite',
          'Network Topologies & Transmission Media',
          'Bandwidth, Latency & Throughput Metrics',
          'Packet Switching vs Circuit Switching'
        ]
      },
      {
        id: 'cn-m2',
        title: 'Module 2: Data Link Layer & MAC Sublayer',
        topics: [
          'Framing, Error Detection (CRC, Parity, Checksum)',
          'Flow Control Protocols (Stop-and-Wait, Go-Back-N, Selective Repeat)',
          'Multiple Access Protocols (CSMA/CD, CSMA/CA)',
          'Ethernet Standards, Switches, and ARP'
        ]
      },
      {
        id: 'cn-m3',
        title: 'Module 3: Network Layer & IP Routing',
        topics: [
          'IPv4 and IPv6 Addressing & Subnetting (CIDR)',
          'Routing Algorithms (Distance Vector vs Link State)',
          'OSPF, BGP, and RIP Protocols',
          'NAT, ICMP, and Routers'
        ]
      },
      {
        id: 'cn-m4',
        title: 'Module 4: Transport Layer',
        topics: [
          'TCP vs UDP Protocols',
          'TCP 3-Way Handshake & Connection Teardown',
          'TCP Flow Control & Sliding Window',
          'TCP Congestion Control (Slow Start, Congestion Avoidance)'
        ]
      },
      {
        id: 'cn-m5',
        title: 'Module 5: Application Layer & Network Security',
        topics: [
          'DNS Architecture and Resolution Process',
          'HTTP, HTTPS, HTTP/2, and WebSockets',
          'SMTP, POP3, IMAP Email Protocols',
          'TLS/SSL Handshake & Firewalls'
        ]
      }
    ]
  },
  {
    id: 'operating-systems',
    name: 'Operating Systems',
    category: 'Core Computer Science',
    icon: 'Cpu',
    description: 'Process management, CPU scheduling, thread synchronization, memory virtualization, and file systems.',
    modules: [
      {
        id: 'os-m1',
        title: 'Module 1: OS Principles & Process Management',
        topics: [
          'Operating System Functions, Dual-Mode & System Calls',
          'Process States, PCB, and Context Switching',
          'Threads vs Processes & Multi-threading Models',
          'Inter-Process Communication (IPC, Shared Memory, Message Queues)'
        ]
      },
      {
        id: 'os-m2',
        title: 'Module 2: CPU Scheduling Algorithms',
        topics: [
          'First-Come First-Served (FCFS) & SJF',
          'Round Robin (RR) with Time Quantum Tuning',
          'Priority Scheduling & Multi-Level Feedback Queues',
          'Real-Time Scheduling Paradigms'
        ]
      },
      {
        id: 'os-m3',
        title: 'Module 3: Synchronization & Deadlocks',
        topics: [
          'Critical Section Problem & Race Conditions',
          'Peterson Solution, Mutex Locks & Semaphores',
          'Classical Problems (Dining Philosophers, Producer-Consumer)',
          'Deadlock Conditions, Banker Algorithm & Detection'
        ]
      },
      {
        id: 'os-m4',
        title: 'Module 4: Memory Management & Virtual Memory',
        topics: [
          'Contiguous Allocation, Paging, and Segmentation',
          'Virtual Memory & Demand Paging',
          'Page Replacement Algorithms (FIFO, LRU, Optimal)',
          'Thrashing & Working Set Model'
        ]
      },
      {
        id: 'os-m5',
        title: 'Module 5: Storage & File Systems',
        topics: [
          'Disk Scheduling Algorithms (SCAN, C-SCAN, LOOK)',
          'File System Allocation (Contiguous, Linked, Indexed)',
          'Inodes, Directory Structures & Virtual File System (VFS)',
          'RAID Architectures & Security Protection'
        ]
      }
    ]
  },
  {
    id: 'theory-of-computation',
    name: 'Theory of Computation',
    category: 'Theoretical Computer Science',
    icon: 'Binary',
    description: 'Automata theory, regular expressions, context-free grammars, Turing machines, and computational complexity.',
    modules: [
      {
        id: 'toc-m1',
        title: 'Module 1: Finite Automata & Regular Languages',
        topics: [
          'Deterministic Finite Automata (DFA)',
          'Non-Deterministic Finite Automata (NFA) & Conversion',
          'Regular Expressions and Equivalence with FA',
          'Pumping Lemma for Regular Languages'
        ]
      },
      {
        id: 'toc-m2',
        title: 'Module 2: Context-Free Languages & Pushdown Automata',
        topics: [
          'Context-Free Grammars (CFG) & Derivation Trees',
          'Ambiguity in Grammars & Normal Forms (CNF, GNF)',
          'Pushdown Automata (PDA) Design',
          'Pumping Lemma for CFLs'
        ]
      },
      {
        id: 'toc-m3',
        title: 'Module 3: Turing Machines',
        topics: [
          'Turing Machine Formal Definition & Construction',
          'Multi-Tape & Non-Deterministic Turing Machines',
          'Church-Turing Thesis',
          'Universal Turing Machine'
        ]
      },
      {
        id: 'toc-m4',
        title: 'Module 4: Decidability & Computability',
        topics: [
          'Decidable vs Undecidable Problems',
          'Halting Problem Proof by Diagonalization',
          'Rice Theorem',
          'Post Correspondence Problem (PCP)'
        ]
      },
      {
        id: 'toc-m5',
        title: 'Module 5: Computational Complexity Theory',
        topics: [
          'Time and Space Complexity Classes (P and NP)',
          'NP-Completeness & Cook-Levin Theorem',
          'Classic NP-Complete Reductions (SAT, 3-SAT, Clique)',
          'Co-NP, PSPACE, and Approximation Algorithms'
        ]
      }
    ]
  },
  {
    id: 'ai-ml',
    name: 'Artificial Intelligence and Machine Learning',
    category: 'Advanced Computing',
    icon: 'Sparkles',
    description: 'Heuristic search, supervised & unsupervised learning, deep neural networks, and modern AI architectures.',
    modules: [
      {
        id: 'aiml-m1',
        title: 'Module 1: Foundations of Artificial Intelligence',
        topics: [
          'Intelligent Agents and Environment Types',
          'Informed Search (A* Search, Heuristics, Greedy Best-First)',
          'Adversarial Search & Minimax with Alpha-Beta Pruning',
          'Constraint Satisfaction Problems (CSP)'
        ]
      },
      {
        id: 'aiml-m2',
        title: 'Module 2: Supervised Machine Learning',
        topics: [
          'Linear Regression & Cost Optimization (Gradient Descent)',
          'Logistic Regression & Classification Metrics (ROC/AUC, F1)',
          'Decision Trees & Random Forests (Information Gain, Gini)',
          'Support Vector Machines (SVM & Kernel Trick)'
        ]
      },
      {
        id: 'aiml-m3',
        title: 'Module 3: Unsupervised Learning & Dimensionality Reduction',
        topics: [
          'K-Means Clustering & Hierarchical Clustering',
          'Principal Component Analysis (PCA)',
          't-SNE and UMAP Embeddings',
          'Anomaly Detection & Association Rules'
        ]
      },
      {
        id: 'aiml-m4',
        title: 'Module 4: Deep Learning & Neural Networks',
        topics: [
          'Multi-Layer Perceptrons & Backpropagation',
          'Activation Functions (ReLU, Softmax, Sigmoid)',
          'Convolutional Neural Networks (CNN) for Computer Vision',
          'Recurrent Neural Networks (RNN) and LSTMs'
        ]
      },
      {
        id: 'aiml-m5',
        title: 'Module 5: Modern Generative AI & Transformers',
        topics: [
          'Self-Attention Mechanism & Transformer Architecture',
          'Large Language Models (BERT, GPT, T5)',
          'Prompt Engineering, RAG & Fine-Tuning (LoRA)',
          'AI Ethics, Fairness, and Explainability (XAI)'
        ]
      }
    ]
  },
  {
    id: 'java-programming',
    name: 'Java Programming',
    category: 'Programming Languages',
    icon: 'Coffee',
    description: 'Object-oriented programming, Collections framework, concurrency, Streams, and JVM internals.',
    modules: [
      {
        id: 'java-m1',
        title: 'Module 1: Core Java & OOP Pillars',
        topics: [
          'Classes, Objects, and Constructors',
          'Encapsulation, Inheritance, and Polymorphism',
          'Interfaces vs Abstract Classes',
          'Access Modifiers & Memory Allocation (Stack vs Heap)'
        ]
      },
      {
        id: 'java-m2',
        title: 'Module 2: Collections Framework & Generics',
        topics: [
          'List Interface (ArrayList vs LinkedList)',
          'Set Interface (HashSet, TreeSet, LinkedHashSet)',
          'Map Interface (HashMap Internals, ConcurrentHashMap)',
          'Generics & Wildcards in Java'
        ]
      },
      {
        id: 'java-m3',
        title: 'Module 3: Exception Handling & IO Streams',
        topics: [
          'Checked vs Unchecked Exceptions',
          'Try-With-Resources & Custom Exceptions',
          'Java I/O, File NIO.2, and Serialization',
          'Garbage Collection Algorithms in JVM'
        ]
      },
      {
        id: 'java-m4',
        title: 'Module 4: Concurrency & Multithreading',
        topics: [
          'Thread Lifecycle, Runnable vs Callable',
          'Synchronization, Volatile, and Atomic Variables',
          'Executor Framework & Thread Pools',
          'CompletableFuture & Asynchronous Pipelines'
        ]
      },
      {
        id: 'java-m5',
        title: 'Module 5: Java 8+ Functional Programming',
        topics: [
          'Lambda Expressions & Functional Interfaces',
          'Stream API (filter, map, reduce, collectors)',
          'Optional Class & Method References',
          'Modern Spring Boot Microservices Integration'
        ]
      }
    ]
  },
  {
    id: 'python-programming',
    name: 'Python Programming',
    category: 'Programming Languages',
    icon: 'Terminal',
    description: 'Python syntax, functional & OOP paradigms, generators, data analysis, and asynchronous programming.',
    modules: [
      {
        id: 'py-m1',
        title: 'Module 1: Python Basics & Core Data Types',
        topics: [
          'Variables, Dynamic Typing & Scope (LEGB Rule)',
          'Lists, Tuples, Dictionaries, and Sets',
          'List & Dictionary Comprehensions',
          'String Formatting, Slicing & Built-in Functions'
        ]
      },
      {
        id: 'py-m2',
        title: 'Module 2: Advanced Functions & OOP',
        topics: [
          '*args, **kwargs, and First-Class Functions',
          'Decorators and Closures',
          'Classes, Magic Methods (__init__, __str__, __repr__)',
          'Inheritance, MRO (Method Resolution Order)'
        ]
      },
      {
        id: 'py-m3',
        title: 'Module 3: Iterators, Generators & Context Managers',
        topics: [
          'Iterable vs Iterator Protocol',
          'Generators & the yield Keyword',
          'Context Managers & the with Statement',
          'Custom Context Managers with contextlib'
        ]
      },
      {
        id: 'py-m4',
        title: 'Module 4: AsyncIO & Concurrency',
        topics: [
          'Global Interpreter Lock (GIL) Mechanics',
          'Multiprocessing vs Multithreading in Python',
          'async / await Syntax and Event Loops',
          'Coroutines and Tasks in asyncio'
        ]
      },
      {
        id: 'py-m5',
        title: 'Module 5: Python for Data & APIs',
        topics: [
          'NumPy Vectorized Arrays & Broadcasting',
          'Pandas DataFrames, GroupBy & Filtering',
          'REST APIs with FastAPI and Flask',
          'Testing with pytest and Mocking'
        ]
      }
    ]
  },
  {
    id: 'web-development',
    name: 'Web Development',
    category: 'Software Engineering',
    icon: 'Globe',
    description: 'Modern full-stack web technologies: React, Next.js, Node.js, REST APIs, responsive CSS, and state management.',
    modules: [
      {
        id: 'web-m1',
        title: 'Module 1: Modern HTML5, CSS3 & Responsive Design',
        topics: [
          'Semantic HTML5 & Accessibility (a11y)',
          'CSS Flexbox & CSS Grid Mastery',
          'Tailwind CSS & Utility-First Styling',
          'Responsive Breakpoints & Mobile-First Design'
        ]
      },
      {
        id: 'web-m2',
        title: 'Module 2: Advanced JavaScript (ES6+)',
        topics: [
          'Event Loop, Microtasks & Macrotasks',
          'Promises, Async/Await & Fetch API',
          'Closures, Prototypes & Prototypal Inheritance',
          'DOM Manipulation & Event Delegation'
        ]
      },
      {
        id: 'web-m3',
        title: 'Module 3: React.js & Modern UI Architecture',
        topics: [
          'Component Lifecycle, Props & State',
          'Essential Hooks (useState, useEffect, useMemo, useCallback)',
          'Context API & Global State Management (Zustand/Redux)',
          'Custom Hooks & Performance Optimization'
        ]
      },
      {
        id: 'web-m4',
        title: 'Module 4: Backend Engineering with Node.js & Express',
        topics: [
          'Node.js Non-Blocking Event-Driven Architecture',
          'Express.js Middleware Pipeline',
          'RESTful API Best Practices & HTTP Status Codes',
          'JWT Authentication, CORS, and Cookies'
        ]
      },
      {
        id: 'web-m5',
        title: 'Module 5: Full-Stack Integration & Production Deployment',
        topics: [
          'Server-Side Rendering (SSR) & Next.js App Router',
          'Database ORMs (Prisma, Sequelize) & Migrations',
          'Web Security (XSS, CSRF, SQL Injection, Helmet)',
          'CI/CD, Vercel / Cloudflare Edge Deployments'
        ]
      }
    ]
  },
  {
    id: 'cyber-security',
    name: 'Cyber Security',
    category: 'Security & Infrastructure',
    icon: 'Shield',
    description: 'Cryptography, network defense, penetration testing, web application vulnerabilities, and ethical hacking.',
    modules: [
      {
        id: 'sec-m1',
        title: 'Module 1: Security Fundamentals & Threat Landscape',
        topics: [
          'CIA Triad (Confidentiality, Integrity, Availability)',
          'Common Attacks (Phishing, MITM, DDoS, Ransomware)',
          'Zero Trust Architecture Principles',
          'Identity & Access Management (IAM, MFA, RBAC)'
        ]
      },
      {
        id: 'sec-m2',
        title: 'Module 2: Applied Cryptography',
        topics: [
          'Symmetric Encryption (AES, DES) & Block Cipher Modes',
          'Asymmetric Encryption (RSA, Elliptic Curve / ECC)',
          'Cryptographic Hashing (SHA-256, bcrypt, PBKDF2)',
          'Digital Signatures & Public Key Infrastructure (PKI)'
        ]
      },
      {
        id: 'sec-m3',
        title: 'Module 3: Web Application Security (OWASP Top 10)',
        topics: [
          'SQL Injection (SQLi) & Parameterized Queries',
          'Cross-Site Scripting (XSS - Reflected, Stored, DOM)',
          'Cross-Site Request Forgery (CSRF)',
          'Broken Access Control & Security Misconfiguration'
        ]
      },
      {
        id: 'sec-m4',
        title: 'Module 4: Network Defense & Endpoint Security',
        topics: [
          'Intrusion Detection & Prevention Systems (IDS/IPS)',
          'Packet Analysis with Wireshark & Nmap',
          'Virtual Private Networks (VPN, IPsec, WireGuard)',
          'Endpoint Detection & Response (EDR)'
        ]
      },
      {
        id: 'sec-m5',
        title: 'Module 5: Penetration Testing & Incident Response',
        topics: [
          'Penetration Testing Phases (Reconnaissance to Reporting)',
          'Security Information and Event Management (SIEM)',
          'Vulnerability Scanning & Patch Management',
          'Incident Response Lifecycle (NIST Framework)'
        ]
      }
    ]
  },
  {
    id: 'cloud-computing',
    name: 'Cloud Computing',
    category: 'Security & Infrastructure',
    icon: 'Cloud',
    description: 'Cloud service models (IaaS, PaaS, SaaS), virtualization, AWS/GCP architecture, Kubernetes, and Serverless.',
    modules: [
      {
        id: 'cloud-m1',
        title: 'Module 1: Cloud Paradigms & Core Architecture',
        topics: [
          'IaaS vs PaaS vs SaaS vs FaaS',
          'Public, Private, Hybrid & Multi-Cloud Strategies',
          'Virtualization & Hypervisors (Type 1 vs Type 2)',
          'Cloud Economics (CapEx vs OpEx, Auto-scaling)'
        ]
      },
      {
        id: 'cloud-m2',
        title: 'Module 2: Compute, Storage & Networking in Cloud',
        topics: [
          'Virtual Machines (EC2, Compute Engine)',
          'Cloud Object Storage (S3, Cloud Storage) & Block Volumes',
          'Virtual Private Clouds (VPC), Subnets & Route Tables',
          'Load Balancers (ALB, NLB) and CDN (CloudFront)'
        ]
      },
      {
        id: 'cloud-m3',
        title: 'Module 3: Containers & Kubernetes Orchestration',
        topics: [
          'Docker Containers vs Virtual Machines',
          'Containerizing Applications & Dockerfile Best Practices',
          'Kubernetes Architecture (Control Plane, Pods, Services)',
          'Deployments, Ingress Controllers & Helm Charts'
        ]
      },
      {
        id: 'cloud-m4',
        title: 'Module 4: Serverless Computing & Microservices',
        topics: [
          'AWS Lambda, Cloud Functions & Cold Starts',
          'API Gateways and Event-Driven Architecture',
          'Managed Message Brokers (Kafka, SQS, Pub/Sub)',
          'Microservices Observability (Distributed Tracing, Prometheus)'
        ]
      },
      {
        id: 'cloud-m5',
        title: 'Module 5: Cloud Security, DevOps & FinOps',
        topics: [
          'Shared Responsibility Model in Cloud',
          'Infrastructure as Code (Terraform, AWS CDK)',
          'CI/CD Pipelines in Cloud (GitHub Actions, GitLab CI)',
          'Cloud Cost Optimization & FinOps Best Practices'
        ]
      }
    ]
  }
];

// Curated question bank fallback to guarantee instant, high-quality question generation even under network/rate limitations
const VERIFIED_QUESTION_BANK = [
  // Software Engineering
  {
    course: 'Software Engineering',
    module: 'Module 2: Software Development Life Cycle (SDLC)',
    topic: 'Waterfall Model',
    type: 'MCQ',
    difficulty: 'Easy',
    question: 'Which of the following is a fundamental characteristic of the classic Waterfall Model in software engineering?',
    options: [
      'Each phase must be completed before the next phase begins, with minimal backtracking.',
      'Software is continuously deployed to production after every sprint.',
      'Requirements are gathered iteratively after product delivery.',
      'Testing is performed simultaneously alongside initial requirement gathering.'
    ],
    correctAnswer: 'Each phase must be completed before the next phase begins, with minimal backtracking.',
    marks: 5,
    explanation: 'The classic Waterfall Model is a sequential, linear software development lifecycle model. Each phase (Requirements, Design, Implementation, Verification, Maintenance) must be reviewed and signed off before proceeding to the subsequent phase.',
    rubric: 'Full marks for selecting the sequential linear phase progression option.'
  },
  {
    course: 'Software Engineering',
    module: 'Module 4: Software Design & Architecture',
    topic: 'Software Design Principles (Cohesion & Coupling)',
    type: 'Short Answer',
    difficulty: 'Medium',
    question: 'Explain the difference between High Cohesion and Loose Coupling in software modular design. Why is this pairing desirable?',
    correctAnswer: 'High Cohesion means all elements inside a single module or class are strongly focused on performing one well-defined responsibility. Loose Coupling means different modules have minimal, well-encapsulated dependencies on each other. This pairing is desirable because it makes software easier to maintain, test, understand, and refactor without ripple effects.',
    marks: 5,
    explanation: 'High cohesion ensures internal single-purpose focus (Single Responsibility Principle), while loose coupling minimizes inter-module entanglements, enabling independent evolution and modular reusability.',
    rubric: '2.5 marks for defining High Cohesion vs Loose Coupling accurately; 2.5 marks for explaining the benefits regarding maintainability, testing, and isolated changes.'
  },
  {
    course: 'Software Engineering',
    module: 'Module 2: Software Development Life Cycle (SDLC)',
    topic: 'Agile Methodology & Scrum',
    type: 'True/False',
    difficulty: 'Easy',
    question: 'In Scrum, the Product Backlog can be updated and re-prioritized continuously based on emerging user feedback and business value.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    marks: 2,
    explanation: 'The Product Backlog in Scrum is a living artifact managed by the Product Owner. It evolves continuously to reflect customer needs, market dynamics, and team feedback.',
    rubric: 'Full marks for True.'
  },
  {
    course: 'Software Engineering',
    module: 'Module 5: Software Testing & Maintenance',
    topic: 'Software Testing Types (Unit, Integration, System)',
    type: 'Long Answer',
    difficulty: 'Hard',
    question: 'Contrast Unit Testing, Integration Testing, and System Testing. Discuss the Testing Pyramid concept and why automated unit tests form the foundation of high-velocity CI/CD pipelines.',
    correctAnswer: 'Unit testing verifies isolated individual components or functions using mocks. Integration testing verifies that interacting modules communicate properly over interfaces or databases. System testing evaluates the entire end-to-end application against specified business requirements. The Testing Pyramid dictates having a large base of fast, cheap unit tests, a moderate layer of integration tests, and a smaller apex of end-to-end tests to achieve rapid feedback and high test coverage at manageable cost.',
    marks: 10,
    explanation: 'Unit tests are cheap to write, execute in milliseconds, and pinpoint the exact line of failure. In contrast, end-to-end tests are slow, brittle, and expensive to maintain.',
    rubric: '4 marks for contrasting Unit, Integration, and System testing; 4 marks for the Testing Pyramid structure and trade-offs; 2 marks for connection to CI/CD feedback speed.'
  },
  // Data Structures and Algorithms
  {
    course: 'Data Structures and Algorithms',
    module: 'Module 4: Sorting, Searching & Hashing',
    topic: 'MergeSort, QuickSort, and HeapSort',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'What is the worst-case time complexity of QuickSort, and under what condition does it typically occur when using a naive last-element pivot selection?',
    options: [
      'O(N^2), when the array is already sorted in ascending or descending order.',
      'O(N log N), when the array contains random elements.',
      'O(N), when all array elements are distinct.',
      'O(log N), when the recursion tree is balanced.'
    ],
    correctAnswer: 'O(N^2), when the array is already sorted in ascending or descending order.',
    marks: 5,
    explanation: 'When a naive pivot (such as always choosing the last or first element) is used on an already sorted or reverse-sorted array, the partition produces unbalanced subproblems of size 0 and N-1, leading to O(N^2) total comparisons.',
    rubric: 'Full marks for identifying O(N^2) on sorted/reverse-sorted inputs with naive pivot.'
  },
  {
    course: 'Data Structures and Algorithms',
    module: 'Module 3: Non-Linear Structures (Trees & Graphs)',
    topic: 'Binary Trees, BST, and Tree Traversals',
    type: 'Coding Questions',
    difficulty: 'Medium',
    question: 'Write an efficient JavaScript or Python function to check whether a given binary tree satisfies the Binary Search Tree (BST) property.',
    codeTemplate: `function isValidBST(root, min = -Infinity, max = Infinity) {
  // Your code here
}`,
    correctAnswer: `function isValidBST(root, min = -Infinity, max = Infinity) {
  if (!root) return true;
  if (root.val <= min || root.val >= max) return false;
  return isValidBST(root.left, min, root.val) && isValidBST(root.right, root.val, max);
}`,
    marks: 10,
    explanation: 'A node must be strictly greater than all ancestors on its left branch and strictly less than all ancestors on its right branch. Checking only immediate children is a classic bug; bounding with min and max recursively validates the global BST invariant in O(N) time.',
    rubric: '4 marks for base case; 4 marks for recursively passing upper and lower bounds; 2 marks for boundary condition checks.'
  },
  // Database Management Systems
  {
    course: 'Database Management Systems',
    module: 'Module 4: Transactions & Concurrency Control',
    topic: 'ACID Properties of Transactions',
    type: 'Short Answer',
    difficulty: 'Medium',
    question: 'Briefly define the four ACID properties in relational database systems and name the database mechanism responsible for guaranteeing Atomicity.',
    correctAnswer: 'Atomicity ensures all operations in a transaction succeed completely or none do (all-or-nothing), handled via Undo/Write-Ahead Logging (WAL). Consistency guarantees the database transitions from one valid state to another satisfying all integrity constraints. Isolation ensures concurrent transactions execute without interfering with one another, implemented via locks or Multi-Version Concurrency Control (MVCC). Durability guarantees committed changes survive system crashes, ensured via Redo logs and persistent disk flush.',
    marks: 5,
    explanation: 'Atomicity relies on write-ahead logging (WAL) and rollbacks. Consistency enforces foreign keys and check constraints. Isolation uses 2PL/MVCC. Durability uses non-volatile transaction logs.',
    rubric: '3 marks for defining each of A, C, I, D correctly; 2 marks for naming the WAL / rollback log mechanism for Atomicity.'
  },
  {
    course: 'Database Management Systems',
    module: 'Module 3: Normalization & Schema Design',
    topic: 'First, Second, and Third Normal Forms (1NF, 2NF, 3NF)',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'A relational schema is in Third Normal Form (3NF) if and only if it is in 2NF and which of the following conditions holds?',
    options: [
      'Every non-prime attribute is non-transitively dependent on every candidate key.',
      'All attributes are part of the primary key.',
      'Every determinant is a superkey (BCNF condition).',
      'It contains only atomic multi-valued attributes.'
    ],
    correctAnswer: 'Every non-prime attribute is non-transitively dependent on every candidate key.',
    marks: 5,
    explanation: '3NF eliminates transitive functional dependencies on candidate keys for all non-prime attributes. For every functional dependency X -> A, either X is a superkey or A is a prime attribute.',
    rubric: 'Full marks for non-transitive dependency on candidate keys.'
  },
  // Operating Systems
  {
    course: 'Operating Systems',
    module: 'Module 3: Synchronization & Deadlocks',
    topic: 'Deadlock Conditions, Banker Algorithm & Detection',
    type: 'MCQ',
    difficulty: 'Medium',
    question: 'Which of the following represents the four Coffman conditions necessary for a system deadlock to occur?',
    options: [
      'Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait',
      'Paging, Segmentation, Fragmentation, Thrashing',
      'Atomicity, Consistency, Isolation, Durability',
      'Preemption, Semaphore, Mutex, Monitor'
    ],
    correctAnswer: 'Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait',
    marks: 5,
    explanation: 'All four Coffman conditions must hold simultaneously for a deadlock to exist: 1) Mutual Exclusion, 2) Hold and Wait, 3) No Preemption, and 4) Circular Wait. Breaking any one of these conditions prevents deadlock.',
    rubric: 'Full marks for the four Coffman conditions.'
  },
  // Computer Networks
  {
    course: 'Computer Networks',
    module: 'Module 4: Transport Layer',
    topic: 'TCP 3-Way Handshake & Connection Teardown',
    type: 'Short Answer',
    difficulty: 'Medium',
    question: 'Explain the sequence of packets exchanged during the TCP 3-Way Handshake to establish a reliable connection between client and server.',
    correctAnswer: '1. Step 1 (SYN): The client sends a SYN packet with an initial sequence number (ISN_c) to the server to initiate connection. 2. Step 2 (SYN-ACK): The server responds with a SYN-ACK packet containing its own sequence number (ISN_s) and acknowledges the client sequence number (ACK = ISN_c + 1). 3. Step 3 (ACK): The client sends an ACK packet back acknowledging the server sequence number (ACK = ISN_s + 1). Once received, connection is established.',
    marks: 5,
    explanation: 'The 3-way handshake ensures both endpoints agree on sequence numbers and verify bidirectional transmission channels before transferring application payload.',
    rubric: '5 marks for clearly describing SYN, SYN-ACK, and ACK steps with sequence/acknowledgment numbers.'
  }
];

module.exports = {
  CURRICULUM,
  VERIFIED_QUESTION_BANK
};
