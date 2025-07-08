import { ProjectData } from '../types';

const defaultAuditFields = {
  createdAt: new Date('2024-01-01T12:00:00Z').toISOString(),
  updatedAt: new Date('2024-01-01T12:00:00Z').toISOString(),
  createdBy: 'User' as const,
  updatedBy: 'User' as const,
};

export const initialProjectData: ProjectData = {
  projectName: 'My Awesome Project',
  documents: {
    sdp: {
      id: 'sdp',
      title: 'Software Development Plan (SDP) - DI-IPSC-81427B',
      content: [
        {
          id: 's1',
          title: '1. SCOPE',
          description:
            'This Software Development Plan (SDP) complies with DI-IPSC-81427B and provides the acquirer insight into, and a tool for monitoring, the processes to be followed for software development, the methods to be used, the approach to be followed for each activity, and project schedules, organization, and resources for the Ignition AI Project Dashboard.',
          maturityLevel: 3,
          cmmiPaIds: ['PP', 'PMC'],
          children: [
            {
              id: 's1.1',
              title: '1.1 Identification',
              description:
                'System/Subsystem: Ignition AI Project Dashboard\nCSCI Name: Ignition Core Application\nContract Number: [To be assigned]\nContractor: [Organization Name]\nContract Line Item Number (CLIN): [To be assigned]\nDI-IPSC-81427B Data Item Description: Software Development Plan',
              maturityLevel: 3,
              cmmiPaIds: ['PP'],
              children: [],
            },
            {
              id: 's1.2',
              title: '1.2 System Overview',
              description:
                'The Ignition AI Project Dashboard is a comprehensive web-based tool designed to accelerate software development project initiation by providing structured documentation, methodology alignment, and AI-powered capabilities. The system serves as a bootstrapping platform for software development projects, ensuring compliance with industry standards including CMMI, ISO 27001, SOC 2, HIPAA, and FDA regulations.',
              maturityLevel: 3,
              cmmiPaIds: ['PP', 'REQM'],
              children: [],
            },
            {
              id: 's1.3',
              title: '1.3 Document Overview',
              description:
                'This SDP describes the software development approach, processes, methods, tools, and resources required for the development of the Ignition system. It addresses all phases of the software development lifecycle from requirements analysis through deployment and maintenance. The plan serves as the primary management document for controlling and monitoring the software development effort.',
              maturityLevel: 3,
              cmmiPaIds: ['PP', 'PMC'],
              children: [],
            },
          ],
        },
        {
          id: 's2',
          title: '2. REFERENCED DOCUMENTS',
          description:
            'This SDP references and complies with the following documents:\n- DI-IPSC-81427B, Software Development Plan Data Item Description\n- CMMI for Development, Version 2.0\n- ISO/IEC 27001:2022, Information Security Management\n- SOC 2 Type II Compliance Framework\n- HIPAA Security Rule (45 CFR Part 164)\n- FDA 21 CFR Part 11, Electronic Records and Electronic Signatures\n- Federal Rules of Evidence 901 & 902 (Authentication Requirements)',
          maturityLevel: 3,
          cmmiPaIds: ['CM', 'PP'],
          children: [],
        },
        {
          id: 's3',
          title: '3. ENGINEERING ENVIRONMENT',
          description:
            'This section describes the development environment, standards, and tools that will be used for the development of the Ignition AI Project Dashboard.',
          maturityLevel: 3,
          cmmiPaIds: ['OPD', 'TS'],
          children: [
            {
              id: 's3.1',
              title: '3.1 Development Environment',
              description:
                'Development Environment: Modern web development stack\n- Operating System: Windows 10/11, macOS, or Linux\n- Web Browser: Chrome 120+, Firefox 120+, Safari 17+, Edge 120+\n- Code Editor: Visual Studio Code with TypeScript and React extensions\n- Runtime: Node.js 18+ for development server\n- Version Control: Git with GitHub integration\n- Package Management: NPM with importmap for dependency management',
              maturityLevel: 3,
              cmmiPaIds: ['OPD', 'TS'],
              children: [],
            },
            {
              id: 's3.2',
              title: '3.2 Development Standards',
              description:
                'Coding Standards:\n- TypeScript strict mode enabled\n- ESLint configuration for code quality\n- Prettier for code formatting\n- React functional components with hooks\n- Modular architecture with clear separation of concerns\n\nDocumentation Standards:\n- JSDoc comments for all public functions\n- README files for each major component\n- Inline comments for complex business logic',
              maturityLevel: 3,
              cmmiPaIds: ['TS', 'PPQA'],
              children: [],
            },
            {
              id: 's3.3',
              title: '3.3 Development Tools',
              description:
                'Primary Development Tools:\n- React 18+ for user interface development\n- TypeScript 5+ for type-safe JavaScript\n- Framer Motion for animations and transitions\n- Chart.js for data visualization\n- D3.js for advanced graphics\n- Lucide React for iconography\n\nExternal Service Integration:\n- Google Gemini API for AI-powered content generation\n- GitHub REST API for repository integration\n- Browser localStorage for data persistence',
              maturityLevel: 3,
              cmmiPaIds: ['TS', 'SAM'],
              children: [],
            },
          ],
        },
        {
          id: 's4',
          title: '4. Development Environment',
          description:
            'The development and testing for Ignition will be conducted using standard web development tools and environments.',
          maturityLevel: 3,
          cmmiPaIds: ['OPD', 'TS'],
          children: [
            {
              id: 's4.1',
              title: '4.1 Software Development Environment',
              description:
                'The development environment will consist of a modern JavaScript runtime (Node.js), a code editor with TypeScript and React support, and a local web server (e.g., `npx serve`). Dependencies are managed via the `importmap` in `index.html`.',
              maturityLevel: 3,
              cmmiPaIds: ['TS'],
              children: [],
            },
            {
              id: 's4.2',
              title: '4.2 Test Environment',
              description:
                'Testing will be performed manually in the latest versions of major web browsers (Chrome, Firefox, Safari). The test environment is identical to the development and production environments, as the application is a static site.',
              maturityLevel: 3,
              cmmiPaIds: ['VER', 'VAL'],
              children: [],
            },
          ],
        },
        {
          id: 's5',
          title: '5. ENGINEERING',
          description:
            'This section describes the engineering approach, technical standards, development methods, and tools used for the Ignition AI Project Dashboard.',
          maturityLevel: 4,
          cmmiPaIds: ['TS', 'PI', 'VER', 'VAL'],
          children: [
            {
              id: 's5.1',
              title: '5.1 Technical Standards',
              description:
                'Technical Standards and Guidelines:\n\nDevelopment Standards:\n- TypeScript for type-safe development with strict mode enabled\n- React 18+ with functional components and hooks\n- Modern ES2022+ JavaScript features\n- CSS-in-JS with styled-components for component styling\n- Responsive design principles for cross-device compatibility\n\nCode Quality Standards:\n- ESLint configuration for code quality enforcement\n- Prettier for consistent code formatting\n- Automated type checking with TypeScript compiler\n- Component-based architecture with clear separation of concerns\n\nCompliance Standards Integration:\n- ISO 27001:2022 Information Security Management\n- SOC 2 Type II compliance framework\n- HIPAA Security Rule (45 CFR Part 164)\n- FDA 21 CFR Part 11 Electronic Records and Signatures\n- Federal Rules of Evidence 901 & 902 authentication requirements',
              maturityLevel: 4,
              cmmiPaIds: ['TS', 'OPD'],
              children: [],
            },
            {
              id: 's5.2',
              title: '5.2 Development Methods',
              description:
                'Development Methodology:\n\nAgile Development Process:\n- Iterative development with 2-week sprints\n- Continuous integration and deployment (CI/CD)\n- Test-driven development where applicable\n- Automated quality gates at each development stage\n\nAI-Enhanced Development Methods:\n- AI-powered code generation and improvement through Gemini API\n- Automated requirement and test case generation\n- Intelligent content creation for documentation\n- AI-assisted code review and quality assessment\n\nAutomated Development Workflow:\n- Development Activity Intelligence for workflow optimization\n- Intelligent Workflow Orchestrator for process guidance\n- Automated traceability management and link generation\n- Real-time process compliance monitoring and correction',
              maturityLevel: 4,
              cmmiPaIds: ['TS', 'PI', 'IPM'],
              children: [],
            },
            {
              id: 's5.3',
              title: '5.3 Engineering Environment',
              description:
                'Engineering Environment and Tools:\n\nDevelopment Environment:\n- Visual Studio Code with TypeScript, React, and Git extensions\n- Node.js 18+ runtime environment\n- Modern web browsers for testing (Chrome 120+, Firefox 120+, Safari 17+, Edge 120+)\n- Git version control with GitHub integration\n\nAutomated Engineering Tools:\n- Gemini AI Service for intelligent content generation\n- Quality Assurance Service with automated validation\n- Configuration Management Service for automated CM processes\n- Compliance Service for multi-standard compliance checking\n- Process Asset Framework for organizational knowledge management\n\nIntegrated Development Services:\n- Real-time AI assistance through chat interface\n- Automated CI/CD pipelines with GitHub Actions\n- Automated security scanning and vulnerability assessment\n- Automated backup and recovery systems',
              maturityLevel: 4,
              cmmiPaIds: ['TS', 'OPD'],
              children: [],
            },
            {
              id: 's5.4',
              title: '5.4 Tool Integration and Automation',
              description:
                'Tool Integration Architecture:\n\nAI-Powered Automation:\n- Google Gemini API integration for intelligent assistance\n- Automated content generation and improvement\n- AI-powered requirement and test case suggestions\n- Intelligent process guidance and optimization\n\nDevelopment Tool Integration:\n- GitHub API for repository management and CI/CD\n- Automated configuration item scanning and management\n- Real-time traceability link generation and validation\n- Automated quality metric collection and reporting\n\nProcess Automation Features:\n- Intelligent Workflow Orchestrator for development process optimization\n- Development Activity Intelligence for pattern analysis\n- Automated compliance checking and reporting\n- Process Asset Framework for continuous process improvement\n\nMonitoring and Analytics:\n- Real-time project health monitoring\n- Automated quality gate enforcement\n- Predictive analytics for project risk assessment\n- Automated audit trail generation and maintenance',
              maturityLevel: 4,
              cmmiPaIds: ['TS', 'PI', 'MA'],
              children: [],
            },
          ],
        },
        {
          id: 's6',
          title: '6. WORK PACKAGES',
          description:
            'This section defines the specific work packages and deliverables for the Ignition AI Project Dashboard development effort.',
          maturityLevel: 4,
          cmmiPaIds: ['PP', 'PMC', 'TS'],
          children: [
            {
              id: 's6.1',
              title: '6.1 Core Application Framework',
              description:
                'Work Package: Core Application Development\n\nDeliverables:\n- React-based user interface with TypeScript\n- Component library with consistent styling\n- Local storage persistence layer\n- Navigation and routing system\n- Responsive design implementation\n\nAutomated Features:\n- Automated component testing framework\n- Real-time UI validation and accessibility checking\n- Automated performance monitoring\n- Component dependency analysis and optimization\n\nAcceptance Criteria:\n- All components pass automated accessibility tests\n- Application loads in under 3 seconds\n- Cross-browser compatibility verified\n- Local storage persistence validated',
              maturityLevel: 4,
              cmmiPaIds: ['TS', 'PI'],
              children: [],
            },
            {
              id: 's6.2',
              title: '6.2 AI Integration and Intelligence Services',
              description:
                'Work Package: AI-Powered Automation Services\n\nDeliverables:\n- Google Gemini API integration service\n- AI-powered content generation engine\n- Intelligent workflow orchestrator\n- Development activity intelligence system\n- Automated suggestion and recommendation engine\n\nAutomated Features:\n- Real-time AI assistance and chat interface\n- Automated content improvement and generation\n- Intelligent process guidance and optimization\n- AI-powered requirement and test case generation\n- Automated traceability link suggestions\n\nAcceptance Criteria:\n- AI services respond within 5 seconds\n- Content generation accuracy > 85%\n- Automated suggestions relevance > 80%\n- Process guidance compliance > 90%',
              maturityLevel: 4,
              cmmiPaIds: ['TS', 'PI', 'IPM'],
              children: [],
            },
            {
              id: 's6.3',
              title: '6.3 Quality Assurance and Compliance System',
              description:
                'Work Package: Automated Quality and Compliance Management\n\nDeliverables:\n- Quality Assurance Service with automated validation\n- Multi-standard compliance checking system\n- Automated quality gates and thresholds\n- Custom validation rules engine\n- Compliance reporting and audit trail system\n\nAutomated Features:\n- Real-time quality gate enforcement\n- Automated compliance checking (ISO 27001, SOC 2, HIPAA, FDA CFR)\n- Continuous quality monitoring and alerting\n- Automated audit evidence collection\n- Quality metrics dashboard and reporting\n\nAcceptance Criteria:\n- Quality gates block non-compliant releases\n- Compliance checking accuracy > 95%\n- Automated audit trails meet FRE 901/902 standards\n- Quality metrics updated in real-time',
              maturityLevel: 4,
              cmmiPaIds: ['PPQA', 'MA', 'VER'],
              children: [],
            },
            {
              id: 's6.4',
              title: '6.4 Configuration Management and Version Control',
              description:
                'Work Package: Automated Configuration Management\n\nDeliverables:\n- Configuration Management Service\n- Automated CI/CD pipeline integration\n- Configuration item tracking and management\n- Version control and baseline management\n- Change control automation\n\nAutomated Features:\n- Automated configuration item identification\n- Real-time dependency tracking and impact analysis\n- Automated baseline establishment and management\n- Change control workflow automation\n- Configuration audit and compliance checking\n\nAcceptance Criteria:\n- All configuration items automatically tracked\n- Change control workflow 100% automated\n- Baseline integrity verified automatically\n- Configuration audits pass compliance requirements',
              maturityLevel: 4,
              cmmiPaIds: ['CM'],
              children: [],
            },
            {
              id: 's6.5',
              title: '6.5 Process Asset Framework and Knowledge Management',
              description:
                'Work Package: Organizational Knowledge Base\n\nDeliverables:\n- Process Asset Framework with AI-powered generation\n- Hybrid wiki and structured data system\n- Automated asset suggestion and recommendation\n- Process improvement and optimization engine\n- Organizational intelligence and learning system\n\nAutomated Features:\n- AI-powered process asset generation and refinement\n- Real-time asset suggestions based on context\n- Automated process optimization recommendations\n- Organizational learning and pattern recognition\n- Automated documentation generation and maintenance\n\nAcceptance Criteria:\n- Process assets automatically generated with >80% relevance\n- Asset suggestions provided in real-time\n- Process improvements identified automatically\n- Knowledge base self-maintains and evolves',
              maturityLevel: 4,
              cmmiPaIds: ['OPF', 'OPD', 'OT'],
              children: [],
            },
            {
              id: 's6.6',
              title: '6.6 Deployment and Infrastructure Automation',
              description:
                'Work Package: Cloud Deployment and Infrastructure\n\nDeliverables:\n- Docker containerization with multi-stage builds\n- Kubernetes deployment manifests and configurations\n- GitHub Actions CI/CD pipeline automation\n- Cloud infrastructure as code\n- Automated monitoring and alerting systems\n\nAutomated Features:\n- Automated build, test, and deployment pipeline\n- Infrastructure provisioning and scaling\n- Security scanning and vulnerability assessment\n- Performance monitoring and optimization\n- Automated backup and disaster recovery\n\nAcceptance Criteria:\n- Zero-downtime deployments achieved\n- Infrastructure scales automatically based on demand\n- Security scans pass with zero critical vulnerabilities\n- Recovery time objective (RTO) < 1 hour',
              maturityLevel: 3,
              cmmiPaIds: ['TS', 'PI'],
              children: [],
            },
          ],
        },
        {
          id: 's7',
          title: '7. SCHEDULES AND ACTIVITY NETWORK',
          description:
            'This section provides detailed project schedules, milestones, and activity dependencies with integration to automated project tracking systems.',
          maturityLevel: 4,
          cmmiPaIds: ['PP', 'PMC', 'IPM'],
          children: [
            {
              id: 's7.1',
              title: '7.1 Master Schedule',
              description:
                'Project Master Schedule:\n\nPhase 1: Foundation (Weeks 1-4)\n- Core application framework development\n- Basic UI components and navigation\n- Local storage persistence implementation\n- Initial AI service integration\n\nPhase 2: Intelligence Services (Weeks 5-8)\n- AI-powered content generation\n- Automated quality assurance system\n- Configuration management automation\n- Process asset framework foundation\n\nPhase 3: Advanced Automation (Weeks 9-12)\n- Intelligent workflow orchestration\n- Development activity intelligence\n- Multi-standard compliance integration\n- Advanced process asset capabilities\n\nPhase 4: Deployment and Optimization (Weeks 13-16)\n- Cloud deployment infrastructure\n- Performance optimization\n- Security hardening\n- Production readiness validation\n\nAutomated Schedule Management:\n- Real-time progress tracking through Development Activity Intelligence\n- AI-powered schedule optimization and risk prediction\n- Automated milestone validation and reporting',
              maturityLevel: 4,
              cmmiPaIds: ['PP', 'PMC'],
              children: [],
            },
            {
              id: 's7.2',
              title: '7.2 Milestone Schedule',
              description:
                'Key Project Milestones:\n\nM1 - Core Framework Complete (Week 4)\n- Basic application functionality operational\n- Local storage persistence validated\n- Initial AI integration functional\n- Automated testing framework established\n\nM2 - Intelligence Services Operational (Week 8)\n- AI-powered content generation active\n- Quality assurance automation functional\n- Configuration management automated\n- Process asset framework operational\n\nM3 - Advanced Automation Complete (Week 12)\n- Intelligent workflow orchestration active\n- Development activity intelligence operational\n- Multi-standard compliance validation functional\n- Advanced process asset capabilities deployed\n\nM4 - Production Deployment Ready (Week 16)\n- Cloud infrastructure deployed and tested\n- Security and compliance validation complete\n- Performance benchmarks achieved\n- Meta-compliance capability demonstrated\n\nAutomated Milestone Tracking:\n- Milestone progress automatically calculated from work package completion\n- AI-powered milestone risk assessment and early warning\n- Automated milestone reporting and stakeholder notification',
              maturityLevel: 4,
              cmmiPaIds: ['PP', 'PMC', 'MA'],
              children: [],
            },
            {
              id: 's7.3',
              title: '7.3 Activity Dependencies',
              description:
                'Critical Path Activities and Dependencies:\n\nCore Dependencies:\n- AI Service Integration → Content Generation → Process Automation\n- UI Framework → Component Library → Dashboard Implementation\n- Data Model → Persistence Layer → Configuration Management\n- Quality Framework → Compliance Integration → Audit Capabilities\n\nParallel Development Tracks:\n- Track 1: Core Application (UI, Navigation, Storage)\n- Track 2: AI Services (Gemini Integration, Content Generation)\n- Track 3: Quality Systems (QA Service, Compliance Checking)\n- Track 4: Process Management (Asset Framework, Workflow Orchestration)\n\nAutomated Dependency Management:\n- Real-time dependency tracking through Configuration Item relationships\n- Automated impact analysis for schedule changes\n- AI-powered critical path optimization\n- Automated resource allocation based on dependency constraints',
              maturityLevel: 4,
              cmmiPaIds: ['PP', 'PMC', 'IPM'],
              children: [],
            },
            {
              id: 's7.4',
              title: '7.4 Resource Allocation Timeline',
              description:
                'Resource Allocation by Phase:\n\nPhase 1 (Weeks 1-4): Foundation Development\n- Development Focus: 80% Core Framework, 20% AI Integration\n- Quality Focus: Basic testing and validation setup\n- Infrastructure Focus: Development environment setup\n\nPhase 2 (Weeks 5-8): Intelligence Services\n- Development Focus: 60% AI Services, 40% Quality Systems\n- Quality Focus: Automated QA framework implementation\n- Infrastructure Focus: CI/CD pipeline establishment\n\nPhase 3 (Weeks 9-12): Advanced Automation\n- Development Focus: 50% Process Automation, 50% Compliance\n- Quality Focus: Multi-standard compliance validation\n- Infrastructure Focus: Security and monitoring setup\n\nPhase 4 (Weeks 13-16): Deployment Readiness\n- Development Focus: 30% Feature completion, 70% Optimization\n- Quality Focus: Production validation and testing\n- Infrastructure Focus: Cloud deployment and scaling\n\nAutomated Resource Management:\n- Development Activity Intelligence tracks resource utilization\n- AI-powered resource optimization recommendations\n- Automated capacity planning and allocation adjustments',
              maturityLevel: 3,
              cmmiPaIds: ['PP', 'RSKM'],
              children: [],
            },
          ],
        },
        {
          id: 's8',
          title: '8. NOTES',
          description:
            'This section provides additional information, assumptions, constraints, and special considerations for the Ignition AI Project Dashboard development.',
          maturityLevel: 3,
          cmmiPaIds: ['PP', 'RSKM'],
          children: [
            {
              id: 's8.1',
              title: '8.1 Assumptions',
              description:
                'Project Assumptions:\n\nTechnical Assumptions:\n- Google Gemini API will remain stable and accessible throughout development\n- Modern web browsers will continue to support required JavaScript features\n- GitHub API will maintain current functionality and rate limits\n- Local storage will remain the primary data persistence mechanism\n\nOrganizational Assumptions:\n- Single developer will have sufficient expertise across all required technologies\n- Stakeholders will provide timely feedback on deliverables and requirements\n- AI-powered automation will achieve target accuracy and performance metrics\n- Meta-compliance approach will be accepted by regulatory and audit bodies\n\nEnvironmental Assumptions:\n- Development environment will remain stable and accessible\n- Internet connectivity will be reliable for AI service integration\n- Cloud infrastructure will provide required scalability and reliability\n- Security and compliance requirements will not change significantly during development',
              maturityLevel: 3,
              cmmiPaIds: ['PP', 'RSKM'],
              children: [],
            },
            {
              id: 's8.2',
              title: '8.2 Constraints',
              description:
                'Project Constraints:\n\nTechnical Constraints:\n- Application must run entirely in web browser without server-side dependencies\n- Data must be stored locally to ensure privacy and security\n- AI services must be accessed through official APIs only\n- Application must be compatible with major web browsers and operating systems\n\nResource Constraints:\n- Single developer resource for all development activities\n- Limited budget for external services and infrastructure\n- Development timeline constrained by AI service rate limits\n- Testing resources limited to manual testing and automated quality gates\n\nRegulatory Constraints:\n- Must comply with multiple regulatory standards simultaneously\n- Audit trails must meet Federal Rules of Evidence requirements\n- Security controls must satisfy enterprise-grade requirements\n- Documentation must be suitable for regulatory inspection and validation\n\nOperational Constraints:\n- Application must be deployable in various environments (local, cloud, enterprise)\n- Must support offline operation when AI services are unavailable\n- Performance must remain acceptable as project data grows\n- User interface must be intuitive without extensive training requirements',
              maturityLevel: 3,
              cmmiPaIds: ['PP', 'RSKM', 'TS'],
              children: [],
            },
            {
              id: 's8.3',
              title: '8.3 Special Considerations',
              description:
                'Special Considerations and Unique Aspects:\n\nMeta-Compliance Architecture:\n- The Ignition tool will manage its own development process, creating a self-referential compliance system\n- Tool capabilities must be documented within the tool itself\n- Process improvements identified by the tool must be implementable within the tool\n- Audit trails generated by the tool must be auditable by the tool\n\nAI Integration Considerations:\n- AI-generated content must be validated and verified before use in compliance contexts\n- AI service dependencies must have fallback mechanisms for critical functions\n- AI recommendations must be traceable and auditable\n- Human oversight must be maintained for all AI-assisted decisions\n\nScalability and Evolution:\n- Architecture must support future expansion to manage multiple projects\n- Process asset framework must evolve and improve over time\n- Tool must be extensible to support additional compliance standards\n- Knowledge base must grow and improve through usage patterns\n\nSecurity and Privacy:\n- All data processing must occur locally to protect sensitive information\n- API keys and credentials must be stored securely\n- Audit trails must maintain integrity and non-repudiation\n- Access controls must be implementable for enterprise deployments',
              maturityLevel: 4,
              cmmiPaIds: ['TS', 'RSKM', 'OPF'],
              children: [],
            },
            {
              id: 's8.4',
              title: '8.4 Future Enhancements',
              description:
                'Planned Future Enhancements:\n\nOrganizational Intelligence:\n- Advanced analytics for organizational process maturity assessment\n- Predictive modeling for project success and risk factors\n- Automated process optimization based on historical performance data\n- Cross-project learning and knowledge transfer capabilities\n\nAdvanced Automation:\n- Automated test case execution and validation\n- Real-time code quality assessment and improvement suggestions\n- Automated documentation generation from code and requirements\n- Intelligent resource allocation and capacity planning\n\nExtended Compliance Support:\n- Additional regulatory frameworks (GDPR, CCPA, NIST, etc.)\n- Industry-specific compliance standards (automotive, aerospace, medical devices)\n- International standards support (ISO 9001, ISO 14001, etc.)\n- Custom compliance framework definition and validation\n\nEnterprise Features:\n- Multi-user collaboration and role-based access control\n- Enterprise authentication and authorization integration\n- Advanced reporting and dashboard customization\n- Integration with enterprise project management and development tools',
              maturityLevel: 2,
              cmmiPaIds: ['OPF', 'OT'],
              children: [],
            },
          ],
        },
        {
          id: 's4-management',
          title: '4. MANAGEMENT',
          description:
            'This section describes the management approach, organization, and processes for the Ignition AI Project Dashboard development effort.',
          maturityLevel: 4,
          cmmiPaIds: ['PP', 'PMC', 'IPM', 'QPM'],
          children: [
            {
              id: 's4.1-organization',
              title: '4.1 Organization',
              description:
                'Project Organization:\n- Project Lead: Responsible for overall project direction, stakeholder communication, and technical decisions\n- Development Team: Single developer with full-stack capabilities\n- Quality Assurance: Integrated into development process with automated quality gates\n- Configuration Management: Automated through Git/GitHub integration\n\nReporting Structure:\n- Daily progress tracked through Ignition Project Health Dashboard\n- Weekly status reports generated automatically from project metrics\n- Milestone reviews conducted at major feature completions',
              maturityLevel: 4,
              cmmiPaIds: ['PP', 'PMC', 'IPM'],
              children: [],
            },
            {
              id: 's4.2-schedule',
              title: '4.2 Schedule Management',
              description:
                'Schedule Management Approach:\n- Agile development methodology with 2-week iterations\n- Automated milestone tracking through Ignition Analytics Dashboard\n- AI-powered schedule optimization based on development velocity\n- Real-time progress monitoring with automated alerts for schedule deviations\n\nAutomated Schedule Tools:\n- Development Activity Intelligence Service tracks commit frequency and velocity\n- Intelligent Workflow Orchestrator provides schedule recommendations\n- Quality gates automatically block releases until criteria are met\n- Process Asset Framework suggests schedule optimizations based on historical data',
              maturityLevel: 4,
              cmmiPaIds: ['PP', 'PMC', 'QPM'],
              children: [],
            },
            {
              id: 's4.3',
              title: '4.3 Resources',
              description:
                'Resource Allocation:\n- Development Environment: Modern web development stack (Node.js, TypeScript, React)\n- AI Services: Google Gemini API for intelligent content generation and analysis\n- Infrastructure: GitHub for version control, GitHub Actions for CI/CD\n- Quality Tools: Automated quality assurance service with configurable validation rules\n\nResource Management Automation:\n- Automated dependency management through package.json and npm\n- Resource utilization tracking through Development Activity Intelligence\n- Capacity planning assisted by AI analysis of development patterns\n- Cost optimization through automated cloud resource management',
              maturityLevel: 3,
              cmmiPaIds: ['PP', 'RSKM'],
              children: [],
            },
            {
              id: 's4.4',
              title: '4.4 Configuration Management',
              description:
                'Configuration Management is automated through the Ignition Configuration Management Service:\n\nAutomated CM Processes:\n- Version control through Git with automated branching strategies\n- Configuration Item identification and tracking via CI Scanner\n- Automated baseline establishment at major milestones\n- Change control through GitHub pull request workflows\n- Automated audit trails for all configuration changes\n\nCM Tools Integration:\n- GitHub integration for distributed version control\n- Automated CI/CD pipelines for build and deployment\n- Configuration Item dependency tracking and impact analysis\n- Automated compliance checking against CM policies\n\nRefer to Configuration Management Plan for detailed procedures.',
              maturityLevel: 4,
              cmmiPaIds: ['CM'],
              children: [],
            },
            {
              id: 's4.5',
              title: '4.5 Quality Assurance',
              description:
                'Quality Assurance is implemented through the Ignition Quality Assurance Service:\n\nAutomated QA Processes:\n- Real-time quality gates with configurable thresholds (Requirements: 85%, Documentation: 80%, Risk Management: 90%)\n- Automated validation of requirements completeness and traceability\n- Continuous compliance checking against multiple standards (ISO 27001, SOC 2, HIPAA, FDA CFR)\n- AI-powered quality assessment and improvement recommendations\n\nQA Automation Features:\n- Custom validation rules engine for project-specific quality criteria\n- Automated quality reporting and dashboard visualization\n- Integration with development workflow for continuous quality monitoring\n- Automated quality metrics collection and trend analysis\n\nRefer to Quality Assurance procedures for detailed validation criteria.',
              maturityLevel: 4,
              cmmiPaIds: ['PPQA', 'MA'],
              children: [],
            },
            {
              id: 's4.6',
              title: '4.6 Corrective Action',
              description:
                'Corrective Action Process:\n\nAutomated Issue Detection:\n- Quality Assurance Service automatically identifies non-conformances\n- Development Activity Intelligence detects process violations\n- Compliance Service flags regulatory non-compliance issues\n- AI-powered root cause analysis for recurring problems\n\nCorrective Action Workflow:\n1. Automated issue identification and categorization\n2. AI-generated corrective action recommendations\n3. Automated assignment to responsible parties\n4. Progress tracking through Ignition dashboard\n5. Automated verification of corrective action effectiveness\n\nProcess Improvement:\n- Lessons learned captured in Process Asset Framework\n- Automated process optimization recommendations\n- Continuous improvement through AI analysis of development patterns',
              maturityLevel: 3,
              cmmiPaIds: ['CAR', 'OPF'],
              children: [],
            },
            {
              id: 's4.7',
              title: '4.7 Reviews and Audits',
              description:
                'Review and Audit Process:\n\nAutomated Review Processes:\n- Continuous peer review through GitHub pull request workflows\n- Automated code quality reviews using static analysis tools\n- AI-powered document review and improvement suggestions\n- Automated compliance audits against regulatory standards\n\nReview Schedule:\n- Daily: Automated quality gate checks\n- Weekly: AI-generated project health reports\n- Monthly: Comprehensive compliance audit reports\n- Quarterly: Process effectiveness reviews with improvement recommendations\n\nAudit Trail Automation:\n- Complete audit logging of all development activities\n- Automated evidence collection for compliance audits\n- Digital signature and hash verification for audit integrity\n- Automated audit report generation with FRE 901/902 compliance',
              maturityLevel: 4,
              cmmiPaIds: ['PPQA', 'MA', 'CAR'],
              children: [],
            },
            {
              id: 's4.8',
              title: '4.8 Risk Management',
              description:
                'Risk Management is automated through the Ignition Risk Management Service:\n\nAutomated Risk Processes:\n- AI-powered risk identification from project data analysis\n- Automated risk assessment and prioritization\n- Real-time risk monitoring and alert generation\n- Automated mitigation strategy recommendations\n\nKey Project Risks and Automated Mitigations:\n1. API Dependencies (Gemini, GitHub): Automated service encapsulation and fallback mechanisms\n2. Data Loss: Automated backup and export capabilities with localStorage redundancy\n3. Security Vulnerabilities: Automated security scanning and compliance validation\n4. Quality Degradation: Continuous quality monitoring with automated quality gates\n\nRisk Monitoring Automation:\n- Development Activity Intelligence tracks risk indicators\n- Automated risk trend analysis and reporting\n- Integration with quality gates to prevent risk materialization\n- AI-powered predictive risk analysis based on development patterns',
              maturityLevel: 4,
              cmmiPaIds: ['RSKM'],
              children: [],
            },
          ],
        },
      ],
    },
    cm_plan: {
      id: 'cm_plan',
      title: 'Configuration Management Plan',
      content: [
        {
          id: 'cm1',
          title: '1. Introduction',
          description:
            'This document defines the Configuration Management (CM) plan for the Ignition project. It describes the processes and procedures for identifying, controlling, and tracking software and documentation items, with emphasis on automated CM processes provided by the Ignition tool.',
          maturityLevel: 3,
          cmmiPaIds: ['CM'],
          children: [],
        },
        {
          id: 'cm2',
          title: '2. CM Organization & Responsibilities',
          description:
            'CM Organization:\n- Lead Developer: Overall CM responsibility and policy definition\n- Ignition CM Service: Automated CM process execution and monitoring\n- AI Assistant: Intelligent CM guidance and optimization recommendations\n\nAutomated CM Responsibilities:\n- Configuration Item identification and tracking via CI Scanner\n- Automated baseline establishment and management\n- Real-time change impact analysis and dependency tracking\n- Automated audit trail generation and maintenance\n- Compliance validation against CM policies and procedures',
          maturityLevel: 4,
          cmmiPaIds: ['CM'],
          children: [],
        },
        {
          id: 'cm3',
          title: '3. Automated CM Tools and Integration',
          description:
            'CM Tool Integration and Automation:\n\nIgnition CM Service Features:\n- Configuration Management Service with automated CI lifecycle management\n- Repository CI Scanner for automated CI identification and tracking\n- Development Activity Intelligence for CM process optimization\n- Intelligent Workflow Orchestrator for CM process guidance\n\nIntegration Capabilities:\n- GitHub API integration for version control and change management\n- CI/CD pipeline integration for automated build and deployment\n- Quality Assurance Service integration for CM validation\n- Compliance Service integration for regulatory CM requirements\n\nAutomation Benefits:\n- Reduced manual effort through automated CM processes\n- Improved accuracy and consistency through AI-powered validation\n- Enhanced traceability through automated link generation and maintenance\n- Real-time visibility through automated monitoring and reporting',
          maturityLevel: 4,
          cmmiPaIds: ['CM', 'OPF'],
          children: [],
        },
        {
          id: 'cm4',
          title: '4. Configuration Identification',
          description:
            'Configuration Item Identification:\n\nAutomated CI Identification:\n- Repository CI Scanner automatically identifies potential configuration items\n- AI-powered analysis of file dependencies and relationships\n- Automated categorization by type (Software Component, Document, Architectural Product)\n- Real-time CI registry updates and version tracking\n\nCI Categories:\n- Source Code Components (TypeScript/React modules, services, utilities)\n- Documentation (SDP, SRS, CM Plan, QA procedures, process assets)\n- Configuration Files (package.json, deployment manifests, CI/CD workflows)\n- Build and Deployment Artifacts (Docker images, Kubernetes manifests)\n\nAutomated CI Management:\n- Unique identification assignment and version control integration\n- Dependency relationship mapping and impact analysis\n- Automated CI status tracking and reporting\n- Integration with quality gates for CI validation',
          maturityLevel: 4,
          cmmiPaIds: ['CM'],
          children: [],
        },
        {
          id: 'cm5',
          title: '5. Change Control',
          description:
            'Configuration Control Process:\n\nAutomated Change Control:\n- GitHub integration for distributed version control\n- Automated pull request workflows with CM validation\n- AI-powered change impact analysis and risk assessment\n- Automated change approval routing based on impact severity\n\nChange Control Automation:\n- Real-time change tracking and traceability link generation\n- Automated baseline comparison and deviation detection\n- Integration with quality gates to prevent unauthorized changes\n- Automated change documentation and audit trail maintenance\n\nChange Validation:\n- Automated testing and validation of configuration changes\n- Compliance checking against CM policies and regulatory requirements\n- Automated rollback capabilities for failed changes\n- Real-time change status reporting and stakeholder notification',
          maturityLevel: 4,
          cmmiPaIds: ['CM'],
          children: [],
        },
        {
          id: 'cm6',
          title: '6. Configuration Status Accounting',
          description:
            'Configuration Status Accounting:\n\nAutomated Status Tracking:\n- Real-time CI status monitoring through Development Activity Intelligence\n- Automated status reporting and dashboard visualization\n- Integration with project management and tracking systems\n- AI-powered status analysis and trend identification\n\nStatus Accounting Automation:\n- Automated CI lifecycle tracking (development, testing, baseline, production)\n- Real-time dependency status and impact propagation\n- Automated status change notifications and alerts\n- Integration with audit systems for compliance reporting\n\nReporting Capabilities:\n- Automated generation of CM status reports\n- Real-time dashboard with CI health and status metrics\n- Automated compliance reporting for regulatory audits\n- Predictive analytics for CI risk and maintenance needs',
          maturityLevel: 4,
          cmmiPaIds: ['CM', 'MA'],
          children: [],
        },
        {
          id: 'cm7',
          title: '7. Configuration Audits',
          description:
            'Configuration Audit Process:\n\nAutomated Audit Capabilities:\n- Continuous automated audit monitoring and validation\n- Real-time compliance checking against CM policies\n- Automated audit evidence collection and documentation\n- AI-powered audit finding analysis and corrective action recommendations\n\nAudit Automation Features:\n- Automated functional configuration audits (FCA)\n- Automated physical configuration audits (PCA)\n- Real-time audit trail generation with digital signatures\n- Automated audit report generation and distribution\n\nCompliance Integration:\n- FRE 901/902 compliant audit evidence with hash verification\n- Automated chain of custody maintenance for audit artifacts\n- Integration with quality assurance and compliance validation systems\n- Automated corrective action tracking and verification',
          maturityLevel: 4,
          cmmiPaIds: ['CM', 'PPQA'],
          children: [],
        },
      ],
    },
    qa_procedures: {
      id: 'qa_procedures',
      title: 'Quality Assurance Procedures',
      content: [
        {
          id: 'qa1',
          title: '1. Introduction',
          description:
            'This document defines the Quality Assurance (QA) procedures for the Ignition project, with emphasis on automated QA processes and AI-powered quality validation provided by the Ignition Quality Assurance Service.',
          maturityLevel: 4,
          cmmiPaIds: ['PPQA'],
          children: [],
        },
        {
          id: 'qa2',
          title: '2. Automated Quality Gates',
          description:
            'Quality Gate Implementation:\n\nAutomated Quality Gates:\n- Requirements Quality Gate: 85% threshold for requirements completeness and traceability\n- Documentation Quality Gate: 80% threshold for document completeness and quality\n- Risk Management Gate: 90% threshold for risk assessment and mitigation\n\nQuality Gate Automation:\n- Real-time quality assessment and validation\n- Automated blocking of non-compliant releases\n- AI-powered quality improvement recommendations\n- Integration with development workflow for continuous monitoring\n\nQuality Gate Features:\n- Configurable thresholds and validation criteria\n- Custom validation rules engine for project-specific requirements\n- Automated quality metrics collection and trend analysis\n- Real-time dashboard visualization and reporting',
          maturityLevel: 4,
          cmmiPaIds: ['PPQA', 'MA'],
          children: [],
        },
        {
          id: 'qa3',
          title: '3. Multi-Standard Compliance Validation',
          description:
            'Compliance Validation Automation:\n\nSupported Compliance Standards:\n- ISO 27001:2022 Information Security Management\n- SOC 2 Type II compliance framework\n- HIPAA Security Rule (45 CFR Part 164)\n- FDA 21 CFR Part 11 Electronic Records and Signatures\n- Federal Rules of Evidence 901 & 902 authentication requirements\n\nAutomated Compliance Features:\n- Real-time compliance checking against multiple standards\n- Automated compliance gap analysis and remediation recommendations\n- Continuous compliance monitoring and alerting\n- Automated compliance reporting and audit evidence collection\n\nCompliance Integration:\n- Integration with development workflow for continuous compliance validation\n- Automated compliance documentation generation and maintenance\n- AI-powered compliance risk assessment and mitigation strategies\n- Real-time compliance dashboard and metrics visualization',
          maturityLevel: 4,
          cmmiPaIds: ['PPQA', 'MA'],
          children: [],
        },
        {
          id: 'qa4',
          title: '4. AI-Powered Quality Assessment',
          description:
            'AI Quality Assessment Capabilities:\n\nAI-Powered Quality Features:\n- Automated content quality assessment and improvement suggestions\n- AI-powered requirement and test case generation with quality validation\n- Intelligent quality trend analysis and predictive quality metrics\n- Automated quality issue identification and root cause analysis\n\nQuality Assessment Automation:\n- Real-time quality scoring and assessment\n- AI-generated quality improvement recommendations\n- Automated quality pattern recognition and optimization\n- Integration with Process Asset Framework for quality knowledge capture\n\nQuality Intelligence:\n- Predictive quality analytics based on development patterns\n- Automated quality risk assessment and early warning systems\n- AI-powered quality coaching and guidance for development teams\n- Continuous quality learning and improvement through AI analysis',
          maturityLevel: 4,
          cmmiPaIds: ['PPQA', 'OPF'],
          children: [],
        },
        {
          id: 'qa5',
          title: '5. Automated Audit and Evidence Collection',
          description:
            'Audit Automation Capabilities:\n\nAutomated Audit Features:\n- Continuous automated audit trail generation and maintenance\n- Real-time audit evidence collection and validation\n- Automated audit report generation with FRE 901/902 compliance\n- AI-powered audit finding analysis and corrective action recommendations\n\nAudit Evidence Management:\n- Digital signature and hash verification for audit integrity\n- Automated chain of custody maintenance for audit artifacts\n- Real-time audit trail validation and compliance checking\n- Integration with compliance systems for regulatory audit support\n\nAudit Reporting:\n- Automated generation of comprehensive audit reports\n- Real-time audit dashboard with compliance metrics and status\n- Automated audit notification and stakeholder communication\n- Integration with corrective action systems for audit finding resolution',
          maturityLevel: 4,
          cmmiPaIds: ['PPQA', 'MA'],
          children: [],
        },
        {
          id: 'qa6',
          title: '6. Quality Metrics and Continuous Improvement',
          description:
            'Quality Metrics Automation:\n\nAutomated Quality Metrics:\n- Real-time quality score calculation and trending\n- Automated quality gate pass/fail tracking and analysis\n- Quality improvement trend analysis and predictive modeling\n- Integration with development activity intelligence for quality correlation\n\nContinuous Improvement:\n- Automated identification of quality improvement opportunities\n- AI-powered quality process optimization recommendations\n- Integration with Process Asset Framework for quality knowledge management\n- Automated quality lessons learned capture and dissemination\n\nQuality Dashboard:\n- Real-time quality metrics visualization and reporting\n- Quality trend analysis and predictive quality forecasting\n- Automated quality alert and notification systems\n- Integration with project management systems for quality-driven decision making',
          maturityLevel: 4,
          cmmiPaIds: ['PPQA', 'MA', 'OPF'],
          children: [],
        },
      ],
    },
    srs: {
      id: 'srs',
      title: 'Software Requirements Specification (DI-IPSC-81433A)',
      content: [
        {
          id: 'srs1',
          title: '1. Scope',
          description:
            'This section provides the scope of the Software Requirements Specification for the Ignition AI Project Dashboard Computer Software Configuration Item (CSCI) in accordance with DI-IPSC-81433A.',
          maturityLevel: 4,
          cmmiPaIds: ['REQM', 'RD'],
          children: [
            {
              id: 'srs1.1',
              title: '1.1 Identification',
              description:
                'System Identification:\n\nSystem Name: Ignition AI Project Dashboard\nCSCI Name: Ignition AI Project Dashboard CSCI\nIdentification Number: IGN-CSCI-001\nVersion: 1.0\nRelease: Initial Release\nAbbreviation: Ignition\n\nApplicable Documents:\n- Software Development Plan (SDP): DI-IPSC-81427B\n- Interface Requirements Specification (IRS): DI-IPSC-81434A\n- Configuration Management Plan\n- Quality Assurance Procedures\n\nThis CSCI implements a comprehensive AI-powered project management and compliance validation system designed to support software development organizations in achieving and maintaining regulatory compliance while optimizing development processes.',
              maturityLevel: 4,
              cmmiPaIds: ['REQM', 'RD'],
              children: [],
            },
            {
              id: 'srs1.2',
              title: '1.2 System Overview',
              description:
                'System Purpose and Nature:\n\nThe Ignition AI Project Dashboard is a web-based Computer Software Configuration Item designed to provide comprehensive project management, compliance validation, and process optimization capabilities for software development organizations.\n\nGeneral Nature:\n- Client-side web application with AI-powered automation\n- Multi-standard compliance validation system\n- Automated configuration management and quality assurance\n- Real-time project health monitoring and analytics\n- Process asset framework for organizational knowledge management\n\nDevelopment History:\n- Initial development: 2024-2025\n- Target deployment: Cloud-native with local data storage\n- Maintenance approach: Continuous integration with automated quality gates\n\nStakeholders:\n- Project Sponsor: Development Organization\n- Acquirer: Software Development Teams\n- Users: Project Managers, Developers, QA Professionals, Compliance Officers\n- Developer: Single Full-Stack Developer\n- Support Agency: Internal Development Team\n\nOperating Sites:\n- Primary: Cloud deployment (GitHub Pages, Netlify, AWS S3)\n- Secondary: Local development environments\n- Future: Enterprise on-premises deployments',
              maturityLevel: 4,
              cmmiPaIds: ['REQM', 'RD', 'PP'],
              children: [],
            },
            {
              id: 'srs1.3',
              title: '1.3 Document Overview',
              description:
                'Document Purpose and Contents:\n\nThis Software Requirements Specification (SRS) defines the complete functional and non-functional requirements for the Ignition AI Project Dashboard CSCI in accordance with DI-IPSC-81433A standards.\n\nDocument Contents:\n- Section 1: Scope and identification of the CSCI\n- Section 2: Referenced documents and standards\n- Section 3: Detailed CSCI requirements (functional and non-functional)\n- Section 4: Qualification provisions and testing methods\n- Section 5: Requirements traceability matrix\n- Section 6: Notes, glossary, and appendices\n\nSecurity and Privacy Considerations:\n- All sensitive data remains on client-side (local browser storage)\n- API keys and credentials stored securely in browser\n- No transmission of proprietary information to external services\n- Compliance with HIPAA, SOC 2, and ISO 27001 privacy requirements\n- Audit trails meet Federal Rules of Evidence 901/902 standards\n\nDocument Maintenance:\n- Version control through Git integration\n- Automated change tracking and impact analysis\n- Real-time requirements validation and compliance checking\n- AI-powered requirements quality assessment and improvement',
              maturityLevel: 4,
              cmmiPaIds: ['REQM', 'CM'],
              children: [],
            },
          ],
        },
        {
          id: 'srs2',
          title: '2. Referenced Documents',
          description:
            'This section lists all documents referenced in this Software Requirements Specification, including standards, specifications, and external documentation.',
          maturityLevel: 3,
          cmmiPaIds: ['REQM', 'CM'],
          children: [
            {
              id: 'srs2.1',
              title: '2.1 Government Documents',
              description:
                'Government Standards and Specifications:\n\n- DI-IPSC-81427B: Software Development Plan (SDP)\n- DI-IPSC-81433A: Software Requirements Specification (SRS)\n- DI-IPSC-81434A: Interface Requirements Specification (IRS)\n- Federal Rules of Evidence 901: Authentication Requirements\n- Federal Rules of Evidence 902: Self-Authentication\n- HIPAA Security Rule (45 CFR Part 164): Health Insurance Portability and Accountability Act\n- FDA 21 CFR Part 11: Electronic Records; Electronic Signatures\n\nThese documents are available through normal Government stocking activities or from the issuing agencies.',
              maturityLevel: 3,
              cmmiPaIds: ['REQM'],
              children: [],
            },
            {
              id: 'srs2.2',
              title: '2.2 Non-Government Documents',
              description:
                'Industry Standards and Specifications:\n\n- IEEE Std 830-1998: IEEE Recommended Practice for Software Requirements Specifications\n- ISO/IEC 27001:2022: Information Security Management Systems\n- SOC 2 Type II: Service Organization Control 2 Type II Compliance Framework\n- CMMI for Development, Version 2.0: Capability Maturity Model Integration\n\nTechnical Documentation:\n- Google Gemini API Documentation (https://ai.google.dev/docs)\n- GitHub API Documentation (https://docs.github.com/en/rest)\n- React 18+ Documentation (https://react.dev/)\n- TypeScript Language Specification (https://www.typescriptlang.org/docs/)\n- Vite Build Tool Documentation (https://vitejs.dev/guide/)\n\nThese documents are available from their respective publishers or through standard industry channels.',
              maturityLevel: 3,
              cmmiPaIds: ['REQM'],
              children: [],
            },
          ],
        },
        {
          id: 'srs3',
          title: '3. Requirements',
          description:
            'This section provides an overview of the Ignition AI Project Dashboard system, including its context, functions, user characteristics, constraints, and dependencies.',
          maturityLevel: 4,
          cmmiPaIds: ['RD', 'TS'],
          children: [
            {
              id: 'srs2.1-perspective',
              title: '2.1 Product Perspective',
              description:
                'System Context and Relationships:\n\nSystem Architecture:\n- Client-side web application built with React and TypeScript\n- Local browser storage for data persistence and privacy\n- Integration with external AI services for intelligent assistance\n- Integration with version control systems for configuration management\n\nSystem Interfaces:\n- User Interface: Modern web-based dashboard with responsive design\n- AI Service Interface: Google Gemini API for content generation and analysis\n- Version Control Interface: GitHub API for repository management and CI/CD\n- File System Interface: Local browser storage and export/import capabilities\n\nOperating Environment:\n- Client Platform: Modern web browsers (Chrome 120+, Firefox 120+, Safari 17+, Edge 120+)\n- Server Platform: Static hosting (GitHub Pages, Netlify, AWS S3, etc.)\n- Network Requirements: Internet connectivity for AI services and version control\n- Storage Requirements: Local browser storage with export/backup capabilities\n\nSystem Positioning:\n- Standalone project management and compliance tool\n- Meta-compliance system managing its own development process\n- Organizational knowledge base and process improvement platform\n- Integration hub for development tools and compliance frameworks',
              maturityLevel: 4,
              cmmiPaIds: ['RD', 'TS'],
              children: [],
            },
            {
              id: 'srs2.2-functions',
              title: '2.2 Product Functions',
              description:
                'Major System Functions:\n\n1. Project Documentation Management:\n   - Create, edit, and manage project documents (SDP, SRS, CM Plan, etc.)\n   - AI-powered content generation and improvement\n   - Real-time document validation and quality assessment\n   - Automated document formatting and structure compliance\n\n2. Requirements Management:\n   - Requirements capture, analysis, and validation\n   - Automated requirements traceability and impact analysis\n   - AI-powered requirements generation and improvement\n   - Real-time requirements quality assessment\n\n3. Configuration Management:\n   - Automated configuration item identification and tracking\n   - Version control integration and change management\n   - Baseline establishment and configuration auditing\n   - Dependency analysis and impact assessment\n\n4. Quality Assurance:\n   - Automated quality gates with configurable thresholds\n   - Multi-standard compliance validation and reporting\n   - Continuous quality monitoring and improvement\n   - AI-powered quality assessment and recommendations\n\n5. Process Asset Management:\n   - Organizational knowledge capture and reuse\n   - AI-powered process asset generation and refinement\n   - Process improvement recommendations and optimization\n   - Hybrid wiki and structured data management\n\n6. Analytics and Reporting:\n   - Real-time project health monitoring and dashboards\n   - Automated compliance reporting and audit trails\n   - Predictive analytics and risk assessment\n   - Performance metrics and trend analysis',
              maturityLevel: 4,
              cmmiPaIds: ['RD', 'TS', 'PP'],
              children: [],
            },
            {
              id: 'srs2.3',
              title: '2.3 User Characteristics',
              description:
                "User Profiles and Characteristics:\n\nPrimary Users - Software Development Professionals:\n- Education: Bachelor's degree in Computer Science, Engineering, or related field\n- Experience: 3+ years in software development and project management\n- Technical Skills: Proficient in software development tools and methodologies\n- Domain Knowledge: Familiar with CMMI, quality assurance, and compliance frameworks\n- Usage Pattern: Daily use for project management and documentation tasks\n\nSecondary Users - Quality Assurance and Compliance Professionals:\n- Education: Bachelor's degree in relevant field or equivalent experience\n- Experience: 2+ years in quality assurance, compliance, or audit functions\n- Technical Skills: Understanding of quality frameworks and compliance standards\n- Domain Knowledge: Expert in regulatory requirements and audit processes\n- Usage Pattern: Regular use for compliance validation and audit preparation\n\nTertiary Users - Project Managers and Stakeholders:\n- Education: Bachelor's degree in Business, Management, or related field\n- Experience: 2+ years in project management or organizational leadership\n- Technical Skills: Basic understanding of software development processes\n- Domain Knowledge: Familiar with project management and organizational processes\n- Usage Pattern: Periodic use for project oversight and reporting\n\nUser Accessibility Requirements:\n- Web accessibility compliance (WCAG 2.1 AA)\n- Keyboard navigation support\n- Screen reader compatibility\n- Responsive design for various devices and screen sizes",
              maturityLevel: 3,
              cmmiPaIds: ['RD'],
              children: [],
            },
            {
              id: 'srs2.4',
              title: '2.4 Constraints',
              description:
                'System Constraints and Limitations:\n\nTechnical Constraints:\n- Client-side only architecture (no server-side processing)\n- Browser storage limitations for data persistence\n- Dependency on external AI services for intelligent features\n- Network connectivity required for AI and version control integration\n- JavaScript execution environment limitations\n\nRegulatory Constraints:\n- Compliance with multiple regulatory frameworks simultaneously\n- Audit trail requirements meeting Federal Rules of Evidence standards\n- Data privacy and security requirements (HIPAA, GDPR considerations)\n- Electronic signature and authentication requirements (FDA CFR Part 11)\n\nOperational Constraints:\n- Single-user operation (no multi-user collaboration in initial version)\n- Local data storage with manual backup and synchronization\n- Limited offline functionality when AI services are unavailable\n- Browser compatibility requirements for enterprise environments\n\nResource Constraints:\n- Development by single developer with full-stack responsibilities\n- Limited budget for external services and infrastructure\n- Time constraints for rapid development and deployment\n- API rate limits for external service integration\n\nSecurity Constraints:\n- All sensitive data must remain on client-side\n- API keys and credentials stored securely in browser\n- No transmission of proprietary or sensitive information to external services\n- Compliance with organizational security policies and standards',
              maturityLevel: 4,
              cmmiPaIds: ['RD', 'TS', 'RSKM'],
              children: [],
            },
            {
              id: 'srs2.5',
              title: '2.5 Assumptions and Dependencies',
              description:
                'System Assumptions:\n\nTechnical Assumptions:\n- Modern web browsers will continue to support required JavaScript features\n- Local storage will remain available and reliable for data persistence\n- External AI services will maintain stable APIs and reasonable response times\n- GitHub API will continue to provide required functionality for version control integration\n\nUser Assumptions:\n- Users have basic familiarity with web applications and project management concepts\n- Users will provide necessary API keys and configuration for external services\n- Users will follow recommended backup and data management practices\n- Users have appropriate permissions for version control and external service access\n\nOperational Assumptions:\n- Internet connectivity will be available for AI and version control features\n- External services will maintain acceptable uptime and performance\n- Regulatory requirements will remain stable during development and deployment\n- Organizational policies will support the use of AI-powered tools\n\nSystem Dependencies:\n\nExternal Service Dependencies:\n- Google Gemini API for AI-powered content generation and analysis\n- GitHub API for version control integration and repository management\n- Modern web browser engines for application execution\n- Internet connectivity for external service communication\n\nTechnology Dependencies:\n- React 18+ framework for user interface development\n- TypeScript for type-safe development and enhanced maintainability\n- Vite build system for development and production builds\n- Local storage APIs for client-side data persistence\n\nStandards Dependencies:\n- CMMI framework for process maturity assessment\n- IEEE 830 standard for requirements specification structure\n- Compliance frameworks (ISO 27001, SOC 2, HIPAA, FDA CFR) for validation\n- Federal Rules of Evidence for audit trail requirements',
              maturityLevel: 4,
              cmmiPaIds: ['RD', 'RSKM', 'TS'],
              children: [],
            },
            {
              id: 'srs3.5',
              title: '3.5 CSCI Internal Data Requirements',
              description:
                'Internal Data Management Requirements:\n\nREQ-DATA-001: Data Model Requirements\n- Standardized data schemas for all project artifacts (requirements, test cases, documents)\n- Type-safe data structures using TypeScript interfaces\n- Data validation and sanitization at all input points\n- Consistent data transformation and serialization formats\n\nREQ-DATA-002: Local Storage Requirements\n- Browser localStorage for primary data persistence\n- Automatic data backup and recovery mechanisms\n- Data compression for storage optimization\n- Cross-browser storage compatibility and migration\n\nREQ-DATA-003: Data Integrity Requirements\n- Data validation rules and constraint checking\n- Referential integrity for linked data (requirements to test cases)\n- Data versioning and change tracking\n- Automated data corruption detection and recovery\n\nREQ-DATA-004: Data Security Requirements\n- Client-side encryption for sensitive data\n- Secure API key storage and management\n- Data anonymization for external service communication\n- Audit trail data protection and integrity verification',
              maturityLevel: 4,
              cmmiPaIds: ['RD', 'TS'],
              children: [],
            },
            {
              id: 'srs3.6',
              title: '3.6 Adaptation Requirements',
              description:
                'System Adaptation and Customization Requirements:\n\nREQ-ADAPT-001: Configuration Customization\n- User-configurable quality gate thresholds and validation rules\n- Customizable compliance framework selection and configuration\n- Adaptable workflow processes and automation settings\n- Configurable dashboard layouts and visualization preferences\n\nREQ-ADAPT-002: Organizational Adaptation\n- Support for multiple organizational process frameworks\n- Customizable document templates and structures\n- Adaptable role-based access and permission models\n- Configurable audit and reporting requirements\n\nREQ-ADAPT-003: Deployment Adaptation\n- Multiple deployment environment support (cloud, on-premises, hybrid)\n- Configurable external service integrations\n- Adaptable security and compliance configurations\n- Scalable architecture for different organizational sizes\n\nREQ-ADAPT-004: Process Adaptation\n- Configurable development lifecycle models\n- Adaptable quality assurance processes and procedures\n- Customizable configuration management workflows\n- Flexible reporting and analytics configurations',
              maturityLevel: 3,
              cmmiPaIds: ['RD', 'OPF'],
              children: [],
            },
            {
              id: 'srs3.7',
              title: '3.7 Safety Requirements',
              description:
                'System Safety and Risk Mitigation Requirements:\n\nREQ-SAFETY-001: Data Safety Requirements\n- Automatic data backup before critical operations\n- Data recovery mechanisms for system failures\n- Protection against data loss during browser crashes\n- Safe data migration and upgrade procedures\n\nREQ-SAFETY-002: Operational Safety Requirements\n- Graceful degradation when external services are unavailable\n- Safe error handling and recovery procedures\n- Protection against infinite loops and resource exhaustion\n- Safe concurrent operation handling\n\nREQ-SAFETY-003: User Safety Requirements\n- Clear warnings before destructive operations\n- Confirmation dialogs for critical actions\n- Undo/redo capabilities for user actions\n- Protection against accidental data modification\n\nREQ-SAFETY-004: System Safety Requirements\n- Safe handling of malformed or corrupted data\n- Protection against memory leaks and performance degradation\n- Safe integration with external APIs and services\n- Automated system health monitoring and alerts',
              maturityLevel: 4,
              cmmiPaIds: ['RD', 'RSKM'],
              children: [],
            },
            {
              id: 'srs3.8',
              title: '3.8 Security and Privacy Requirements',
              description:
                'Security and Privacy Protection Requirements:\n\nREQ-SEC-001: Data Security Requirements\n- All sensitive data stored locally (no server-side transmission)\n- Secure API key storage using browser security mechanisms\n- Encryption of sensitive data at rest in local storage\n- Secure communication protocols (HTTPS) for external services\n\nREQ-SEC-002: Privacy Requirements\n- No transmission of proprietary or sensitive information to external services\n- User consent for all external service communications\n- Data anonymization for AI service interactions\n- Compliance with GDPR, HIPAA, and other privacy regulations\n\nREQ-SEC-003: Access Control Requirements\n- Secure authentication for external service access\n- Role-based access control for enterprise deployments\n- Session management and timeout controls\n- Audit logging for all security-relevant operations\n\nREQ-SEC-004: Compliance Security Requirements\n- Federal Rules of Evidence 901/902 compliant audit trails\n- Digital signature support for document authentication\n- Hash verification for data integrity\n- Chain of custody maintenance for audit evidence',
              maturityLevel: 4,
              cmmiPaIds: ['RD', 'TS'],
              children: [],
            },
          ],
        },
        {
          id: 'srs4',
          title: '4. Qualification Provisions',
          description:
            'This section defines the qualification methods to be used to ensure that each requirement in Section 3 has been met. The methods include demonstration, test, analysis, inspection, and special qualification methods as appropriate for each requirement.',
          maturityLevel: 4,
          cmmiPaIds: ['VER', 'VAL', 'PPQA'],
          children: [
            {
              id: 'srs4.1',
              title: '4.1 Qualification Methods Overview',
              description:
                'Qualification Methods for CSCI Requirements:\n\nThe following qualification methods shall be used to verify and validate that each requirement specified in Section 3 has been properly implemented and meets the specified criteria:\n\na. Demonstration: Observable functional operation of the CSCI or components without requiring special instrumentation or subsequent analysis\nb. Test: Operation using instrumentation or special test equipment to collect data for analysis\nc. Analysis: Processing of accumulated data from other qualification methods through reduction, interpretation, or extrapolation\nd. Inspection: Visual examination of CSCI code, documentation, and artifacts\ne. Special Qualification Methods: Specialized tools, techniques, procedures, and facilities with defined acceptance limits\n\nQualification Approach:\n- Each requirement shall be mapped to one or more qualification methods\n- Qualification methods shall be appropriate for the requirement type and criticality\n- Test procedures shall be documented and repeatable\n- Acceptance criteria shall be clearly defined and measurable\n- Qualification results shall be documented and traceable to requirements',
              maturityLevel: 4,
              cmmiPaIds: ['VER', 'VAL'],
              children: [],
            },
            {
              id: 'srs4.2',
              title: '4.2 Functional Requirements Qualification',
              description:
                'Qualification Methods for Functional Requirements:\n\nREQ-FUNC-001 through REQ-FUNC-020 (Document Management Functions):\n- Primary Method: Demonstration\n- Secondary Method: Test\n- Acceptance Criteria: User can successfully create, edit, save, and manage project documents\n- Test Environment: Web browser with local storage enabled\n- Special Tools: Browser developer tools for storage verification\n\nREQ-FUNC-021 through REQ-FUNC-040 (Requirements Management Functions):\n- Primary Method: Test\n- Secondary Method: Analysis\n- Acceptance Criteria: Requirements can be captured, validated, and traced with 100% accuracy\n- Test Environment: Complete project scenario with multiple requirements\n- Special Tools: Automated traceability validation scripts\n\nREQ-FUNC-041 through REQ-FUNC-060 (Configuration Management Functions):\n- Primary Method: Test\n- Secondary Method: Inspection\n- Acceptance Criteria: Configuration items are properly identified, controlled, and audited\n- Test Environment: Version control integration with GitHub\n- Special Tools: Git analysis tools and configuration audit scripts\n\nREQ-FUNC-061 through REQ-FUNC-080 (Quality Assurance Functions):\n- Primary Method: Analysis\n- Secondary Method: Test\n- Acceptance Criteria: Quality gates function correctly with configurable thresholds\n- Test Environment: Projects with varying quality levels\n- Special Tools: Quality metrics analysis and reporting tools',
              maturityLevel: 4,
              cmmiPaIds: ['VER', 'VAL', 'TS'],
              children: [],
            },
            {
              id: 'srs4.3',
              title: '4.3 Non-Functional Requirements Qualification',
              description:
                'Qualification Methods for Non-Functional Requirements:\n\nPerformance Requirements (REQ-PERF-001 through REQ-PERF-010):\n- Primary Method: Test\n- Secondary Method: Analysis\n- Acceptance Criteria: Application loads in under 3 seconds, operations complete within specified time limits\n- Test Environment: Various browser configurations and network conditions\n- Special Tools: Performance monitoring tools, network throttling, browser profiling\n\nSecurity Requirements (REQ-SEC-001 through REQ-SEC-020):\n- Primary Method: Inspection\n- Secondary Method: Test\n- Acceptance Criteria: No sensitive data transmitted externally, secure storage implementation\n- Test Environment: Security testing environment with network monitoring\n- Special Tools: Security scanning tools, network traffic analysis, penetration testing\n\nUsability Requirements (REQ-UI-001 through REQ-UI-010):\n- Primary Method: Demonstration\n- Secondary Method: Test\n- Acceptance Criteria: User interface meets accessibility standards and usability guidelines\n- Test Environment: Multiple browsers, devices, and accessibility tools\n- Special Tools: Accessibility testing tools, screen readers, usability testing frameworks\n\nReliability Requirements (REQ-REL-001 through REQ-REL-010):\n- Primary Method: Test\n- Secondary Method: Analysis\n- Acceptance Criteria: System operates reliably under normal and stress conditions\n- Test Environment: Extended operation scenarios with error injection\n- Special Tools: Reliability testing frameworks, error injection tools, monitoring systems',
              maturityLevel: 4,
              cmmiPaIds: ['VER', 'VAL', 'TS'],
              children: [],
            },
            {
              id: 'srs4.4',
              title: '4.4 Interface Requirements Qualification',
              description:
                'Qualification Methods for Interface Requirements:\n\nExternal API Interface Requirements (REQ-API-001 through REQ-API-010):\n- Primary Method: Test\n- Secondary Method: Analysis\n- Acceptance Criteria: All external API integrations function correctly with proper error handling\n- Test Environment: Live API connections with various response scenarios\n- Special Tools: API testing tools, mock services, network simulation\n\nUser Interface Requirements (REQ-UI-001 through REQ-UI-020):\n- Primary Method: Demonstration\n- Secondary Method: Inspection\n- Acceptance Criteria: User interface meets design specifications and user experience requirements\n- Test Environment: Multiple browsers, screen sizes, and user scenarios\n- Special Tools: UI testing frameworks, cross-browser testing tools, design validation tools\n\nData Interface Requirements (REQ-DATA-001 through REQ-DATA-010):\n- Primary Method: Test\n- Secondary Method: Inspection\n- Acceptance Criteria: Data formats, validation, and transformation work correctly\n- Test Environment: Various data scenarios including edge cases and error conditions\n- Special Tools: Data validation tools, schema verification, format testing utilities\n\nSystem Interface Requirements (REQ-SYS-001 through REQ-SYS-010):\n- Primary Method: Test\n- Secondary Method: Analysis\n- Acceptance Criteria: System integrations operate within specified parameters\n- Test Environment: Integrated system environment with all external dependencies\n- Special Tools: Integration testing frameworks, system monitoring, dependency analysis',
              maturityLevel: 4,
              cmmiPaIds: ['VER', 'VAL', 'PI'],
              children: [],
            },
            {
              id: 'srs4.5',
              title: '4.5 Compliance Requirements Qualification',
              description:
                'Qualification Methods for Compliance Requirements:\n\nRegulatory Compliance Requirements (REQ-COMP-001 through REQ-COMP-020):\n- Primary Method: Inspection\n- Secondary Method: Analysis\n- Acceptance Criteria: System meets all specified regulatory requirements (HIPAA, SOC 2, ISO 27001, FDA CFR)\n- Test Environment: Compliance validation environment with audit trail verification\n- Special Tools: Compliance scanning tools, audit trail analyzers, regulatory validation frameworks\n\nFederal Rules of Evidence Requirements (REQ-FRE-001 through REQ-FRE-010):\n- Primary Method: Inspection\n- Secondary Method: Test\n- Acceptance Criteria: Audit trails meet FRE 901/902 authentication and self-authentication standards\n- Test Environment: Legal compliance testing environment with chain of custody verification\n- Special Tools: Digital signature verification, hash validation, chain of custody tracking\n\nCMMI Process Requirements (REQ-CMMI-001 through REQ-CMMI-020):\n- Primary Method: Analysis\n- Secondary Method: Inspection\n- Acceptance Criteria: System supports CMMI process areas and maturity level assessment\n- Test Environment: CMMI assessment environment with process validation\n- Special Tools: CMMI assessment tools, process maturity analyzers, gap analysis utilities\n\nQuality Standards Requirements (REQ-QUAL-001 through REQ-QUAL-010):\n- Primary Method: Test\n- Secondary Method: Analysis\n- Acceptance Criteria: System meets specified quality standards and metrics\n- Test Environment: Quality validation environment with metrics collection\n- Special Tools: Quality metrics tools, standards compliance checkers, quality gate validation',
              maturityLevel: 4,
              cmmiPaIds: ['VER', 'VAL', 'PPQA'],
              children: [],
            },
            {
              id: 'srs4.6',
              title: '4.6 Special Qualification Methods',
              description:
                'Special Qualification Methods and Tools:\n\nAI-Powered Validation:\n- Method: Automated AI-powered content analysis and validation\n- Tools: Google Gemini API integration for content quality assessment\n- Procedures: Automated content generation validation, quality scoring, improvement suggestions\n- Acceptance Limits: AI-generated content must meet quality thresholds and human review standards\n- Facilities: AI service integration testing environment\n\nMeta-Compliance Validation:\n- Method: Self-validation using the system to manage its own development process\n- Tools: Ignition system itself for process validation and compliance checking\n- Procedures: System manages its own requirements, documents, and compliance validation\n- Acceptance Limits: System must successfully manage its own development with full traceability\n- Facilities: Production environment running the system for self-management\n\nContinuous Integration Validation:\n- Method: Automated build, test, and deployment validation\n- Tools: GitHub Actions, automated testing frameworks, deployment validation\n- Procedures: Automated quality gates, continuous compliance checking, deployment verification\n- Acceptance Limits: All automated checks must pass with zero critical issues\n- Facilities: CI/CD pipeline with automated quality and compliance validation\n\nReal-Time Process Validation:\n- Method: Live process monitoring and validation during system operation\n- Tools: Real-time analytics, process monitoring, compliance dashboards\n- Procedures: Continuous process assessment, real-time compliance monitoring, automated alerts\n- Acceptance Limits: Process compliance must maintain specified thresholds during operation\n- Facilities: Production monitoring environment with real-time analytics and alerting',
              maturityLevel: 4,
              cmmiPaIds: ['VER', 'VAL', 'MA', 'OPF'],
              children: [],
            },
          ],
        },
        {
          id: 'srs5',
          title: '5. Requirements Traceability',
          description:
            'This section provides traceability between CSCI requirements and system requirements, ensuring complete coverage and accountability for all allocated requirements.',
          maturityLevel: 4,
          cmmiPaIds: ['REQM', 'RD', 'TS'],
          children: [
            {
              id: 'srs5.1',
              title: '5.1 CSCI to System Requirements Traceability',
              description:
                'Traceability from CSCI Requirements to System Requirements:\n\nThis section provides forward traceability from each Computer Software Configuration Item (CSCI) requirement specified in Section 3 to the higher-level system or organizational requirements that it addresses.\n\nFunctional Requirements Traceability:\n- REQ-FUNC-001 to REQ-FUNC-020 (Document Management) → SYS-REQ-001: "System shall provide comprehensive project documentation capabilities"\n- REQ-FUNC-021 to REQ-FUNC-040 (Requirements Management) → SYS-REQ-002: "System shall support requirements engineering lifecycle"\n- REQ-FUNC-041 to REQ-FUNC-060 (Configuration Management) → SYS-REQ-003: "System shall provide configuration management capabilities"\n- REQ-FUNC-061 to REQ-FUNC-080 (Quality Assurance) → SYS-REQ-004: "System shall support quality assurance processes"\n- REQ-FUNC-081 to REQ-FUNC-100 (Process Asset Management) → SYS-REQ-005: "System shall provide organizational knowledge management"\n- REQ-FUNC-101 to REQ-FUNC-120 (Analytics and Reporting) → SYS-REQ-006: "System shall provide project analytics and reporting"\n\nNon-Functional Requirements Traceability:\n- REQ-PERF-001 to REQ-PERF-010 (Performance) → SYS-REQ-007: "System shall meet performance requirements for enterprise use"\n- REQ-SEC-001 to REQ-SEC-020 (Security) → SYS-REQ-008: "System shall provide enterprise-grade security"\n- REQ-UI-001 to REQ-UI-020 (User Interface) → SYS-REQ-009: "System shall provide intuitive user experience"\n- REQ-REL-001 to REQ-REL-010 (Reliability) → SYS-REQ-010: "System shall operate reliably in production environments"\n\nCompliance Requirements Traceability:\n- REQ-COMP-001 to REQ-COMP-020 (Regulatory Compliance) → SYS-REQ-011: "System shall support multi-standard compliance validation"\n- REQ-FRE-001 to REQ-FRE-010 (Federal Rules of Evidence) → SYS-REQ-012: "System shall provide legally admissible audit trails"\n- REQ-CMMI-001 to REQ-CMMI-020 (CMMI Process Support) → SYS-REQ-013: "System shall support CMMI process improvement"',
              maturityLevel: 4,
              cmmiPaIds: ['REQM', 'RD'],
              children: [],
            },
            {
              id: 'srs5.2',
              title: '5.2 System to CSCI Requirements Traceability',
              description:
                'Traceability from System Requirements to CSCI Requirements:\n\nThis section provides backward traceability from each system requirement allocated to this CSCI to the specific CSCI requirements that address it, ensuring complete coverage of all system requirements.\n\nSystem Requirements Coverage:\n\nSYS-REQ-001: "System shall provide comprehensive project documentation capabilities"\n→ Addressed by: REQ-FUNC-001 through REQ-FUNC-020 (Document Management Functions)\n→ Coverage: Complete - All document lifecycle operations supported\n\nSYS-REQ-002: "System shall support requirements engineering lifecycle"\n→ Addressed by: REQ-FUNC-021 through REQ-FUNC-040 (Requirements Management Functions)\n→ Coverage: Complete - Requirements capture, analysis, validation, and traceability\n\nSYS-REQ-003: "System shall provide configuration management capabilities"\n→ Addressed by: REQ-FUNC-041 through REQ-FUNC-060 (Configuration Management Functions)\n→ Coverage: Complete - Configuration identification, control, status accounting, auditing\n\nSYS-REQ-004: "System shall support quality assurance processes"\n→ Addressed by: REQ-FUNC-061 through REQ-FUNC-080 (Quality Assurance Functions)\n→ Coverage: Complete - Quality planning, evaluation, testing, verification\n\nSYS-REQ-005: "System shall provide organizational knowledge management"\n→ Addressed by: REQ-FUNC-081 through REQ-FUNC-100 (Process Asset Management Functions)\n→ Coverage: Complete - Knowledge capture, reuse, improvement, optimization\n\nSYS-REQ-006: "System shall provide project analytics and reporting"\n→ Addressed by: REQ-FUNC-101 through REQ-FUNC-120 (Analytics and Reporting Functions)\n→ Coverage: Complete - Real-time monitoring, compliance reporting, predictive analytics\n\nSYS-REQ-007: "System shall meet performance requirements for enterprise use"\n→ Addressed by: REQ-PERF-001 through REQ-PERF-010 (Performance Requirements)\n→ Coverage: Complete - Load times, response times, throughput, scalability\n\nSYS-REQ-008: "System shall provide enterprise-grade security"\n→ Addressed by: REQ-SEC-001 through REQ-SEC-020 (Security Requirements)\n→ Coverage: Complete - Data protection, access control, audit trails, compliance',
              maturityLevel: 4,
              cmmiPaIds: ['REQM', 'RD'],
              children: [],
            },
            {
              id: 'srs5.3',
              title: '5.3 Interface Requirements Traceability',
              description:
                'Traceability for Interface Requirements:\n\nInterface Requirements Specification (IRS) References:\nThis section provides traceability for requirements contained in the Interface Requirements Specification (DI-IPSC-81434A) that are referenced from this SRS.\n\nExternal Interface Requirements:\n- IRS-REQ-001 through IRS-REQ-010 (Google Gemini API Interface) → Referenced in Section 3.3.1\n- IRS-REQ-011 through IRS-REQ-020 (GitHub API Interface) → Referenced in Section 3.3.2\n- IRS-REQ-021 through IRS-REQ-030 (Browser Storage Interface) → Referenced in Section 3.3.3\n- IRS-REQ-031 through IRS-REQ-040 (File System Interface) → Referenced in Section 3.3.4\n\nUser Interface Requirements:\n- UI-REQ-001 through UI-REQ-020 (Web User Interface) → Detailed in Section 3.2\n- UI-REQ-021 through UI-REQ-030 (Accessibility Interface) → Detailed in Section 3.2\n- UI-REQ-031 through UI-REQ-040 (Mobile Interface) → Detailed in Section 3.2\n\nData Interface Requirements:\n- DATA-REQ-001 through DATA-REQ-020 (Local Storage Interface) → Detailed in Section 3.5\n- DATA-REQ-021 through DATA-REQ-030 (Import/Export Interface) → Detailed in Section 3.5\n- DATA-REQ-031 through DATA-REQ-040 (API Data Interface) → Referenced in IRS\n\nSystem Interface Requirements:\n- SYS-INT-001 through SYS-INT-020 (Operating System Interface) → Detailed in Section 3.10\n- SYS-INT-021 through SYS-INT-030 (Network Interface) → Referenced in IRS\n- SYS-INT-031 through SYS-INT-040 (Security Interface) → Detailed in Section 3.8\n\nInterface Traceability Matrix:\nA comprehensive interface traceability matrix is maintained in the project management system, providing real-time traceability between interface requirements, implementation components, and test cases.',
              maturityLevel: 4,
              cmmiPaIds: ['REQM', 'RD', 'PI'],
              children: [],
            },
            {
              id: 'srs5.4',
              title: '5.4 Requirements Allocation and Coverage Analysis',
              description:
                'Requirements Allocation and Coverage Analysis:\n\nSystem Requirements Allocation:\nAll system requirements allocated to the Ignition AI Project Dashboard CSCI have been accounted for and properly addressed through specific CSCI requirements. The allocation ensures complete coverage without gaps or overlaps.\n\nAllocation Summary:\n- Total System Requirements Allocated: 13\n- Total CSCI Requirements Derived: 120+\n- Coverage Percentage: 100%\n- Unallocated System Requirements: 0\n- Orphaned CSCI Requirements: 0\n\nDerived Requirements:\nSome CSCI requirements are derived from architectural decisions and design constraints rather than direct system requirement allocation:\n\n- REQ-ARCH-001 through REQ-ARCH-010: Architecture and design constraints\n- REQ-IMPL-001 through REQ-IMPL-010: Implementation-specific requirements\n- REQ-TEST-001 through REQ-TEST-010: Testing and validation requirements\n- REQ-DEPLOY-001 through REQ-DEPLOY-010: Deployment and operational requirements\n\nThese derived requirements are traced to general system requirements for architectural flexibility and implementation efficiency.\n\nTraceability Verification:\n- Forward Traceability: Verified through automated traceability analysis\n- Backward Traceability: Verified through requirements coverage analysis\n- Bi-directional Traceability: Maintained through real-time traceability matrix\n- Impact Analysis: Automated change impact assessment available\n\nTraceability Maintenance:\n- Real-time traceability updates through system integration\n- Automated traceability validation and gap detection\n- Change impact analysis for requirements modifications\n- Traceability reporting for compliance and audit purposes',
              maturityLevel: 4,
              cmmiPaIds: ['REQM', 'RD', 'CM'],
              children: [],
            },
          ],
        },
        {
          id: 'srs6',
          title: '6. Notes',
          description:
            'This section contains general information that aids in understanding this document, including background information, glossary, rationale, acronyms, abbreviations, and terms definitions.',
          maturityLevel: 4,
          cmmiPaIds: ['REQM', 'OPF'],
          children: [
            {
              id: 'srs6.1',
              title: '6.1 Background Information',
              description:
                'Background Information and Rationale:\n\nProject Genesis:\nThe Ignition AI Project Dashboard was conceived to address the growing complexity of software development compliance requirements across multiple regulatory frameworks. Traditional project management tools lack the sophisticated compliance validation and process automation capabilities required for modern software development organizations operating in regulated industries.\n\nTechnological Approach:\nThe system leverages cutting-edge AI technology to provide intelligent assistance while maintaining strict data privacy and security requirements. The client-side architecture ensures that sensitive organizational data never leaves the user\'s environment, addressing critical security and compliance concerns.\n\nMeta-Compliance Philosophy:\nA unique aspect of this system is its "meta-compliance" approach, where the tool manages its own development process using the same compliance frameworks it provides to users. This creates a self-validating system that demonstrates its effectiveness through its own successful development and deployment.\n\nIndustry Context:\nThe software development industry increasingly requires compliance with multiple standards simultaneously (ISO 27001, SOC 2, HIPAA, FDA CFR Part 11, CMMI). Traditional approaches require separate tools and processes for each standard, creating complexity and inefficiency. Ignition provides unified compliance management across all these frameworks.\n\nInnovation Areas:\n- AI-powered process asset generation and improvement\n- Real-time compliance validation and gap analysis\n- Automated requirements traceability and impact analysis\n- Self-managing development processes with continuous improvement\n- Hybrid wiki and structured data management for organizational knowledge\n\nFuture Vision:\nThe system is designed to evolve into an organizational intelligence platform that not only manages compliance but actively improves development processes through machine learning and continuous optimization.',
              maturityLevel: 4,
              cmmiPaIds: ['OPF', 'OPM'],
              children: [],
            },
            {
              id: 'srs6.2',
              title: '6.2 Acronyms and Abbreviations',
              description:
                'Alphabetical Listing of Acronyms and Abbreviations:\n\nAI - Artificial Intelligence\nAPI - Application Programming Interface\nAWS - Amazon Web Services\nCASE - Computer-Aided Software Engineering\nCDRL - Contract Data Requirements List\nCFR - Code of Federal Regulations\nCI/CD - Continuous Integration/Continuous Deployment\nCM - Configuration Management\nCMMI - Capability Maturity Model Integration\nCSCI - Computer Software Configuration Item\nCSS - Cascading Style Sheets\nDID - Data Item Description\nDOM - Document Object Model\nFDA - Food and Drug Administration\nFRE - Federal Rules of Evidence\nGDPR - General Data Protection Regulation\nGit - Distributed Version Control System\nGUI - Graphical User Interface\nHIPAA - Health Insurance Portability and Accountability Act\nHTML - HyperText Markup Language\nHTTPS - HyperText Transfer Protocol Secure\nIDE - Integrated Development Environment\nIEEE - Institute of Electrical and Electronics Engineers\nIRS - Interface Requirements Specification\nISO - International Organization for Standardization\nJSON - JavaScript Object Notation\nNFR - Non-Functional Requirements\nNPO - Non-Profit Organization\nOPF - Organizational Process Focus\nOPM - Organizational Performance Management\nPA - Process Area\nPDF - Portable Document Format\nPMC - Project Monitoring and Control\nPP - Project Planning\nPPQA - Process and Product Quality Assurance\nQA - Quality Assurance\nREQM - Requirements Management\nREST - Representational State Transfer\nRD - Requirements Development\nRSKM - Risk Management\nSDK - Software Development Kit\nSDP - Software Development Plan\nSOC - Service Organization Control\nSQL - Structured Query Language\nSRS - Software Requirements Specification\nSSL - Secure Sockets Layer\nSTP - Software Test Plan\nSTR - Software Test Report\nTS - Technical Solution\nUI - User Interface\nURL - Uniform Resource Locator\nUX - User Experience\nVAL - Validation\nVER - Verification\nWCAG - Web Content Accessibility Guidelines\nXML - eXtensible Markup Language',
              maturityLevel: 3,
              cmmiPaIds: ['OPF'],
              children: [],
            },
            {
              id: 'srs6.3',
              title: '6.3 Glossary of Terms',
              description:
                "Definitions of Terms Used in This Document:\n\nAudit Trail: A chronological record of system activities that provides documentary evidence of the sequence of activities that have affected a specific operation, procedure, or event.\n\nBaseline: A formally approved version of a configuration item, regardless of media, formally designated and fixed at a specific time during the configuration item's life cycle.\n\nComputer Software Configuration Item (CSCI): An aggregation of software that satisfies an end use function and is designated for configuration management.\n\nConfiguration Management: A discipline applying technical and administrative direction and surveillance to identify and document the functional and physical characteristics of a configuration item.\n\nMeta-Compliance: The practice of using a compliance management system to manage its own development process, creating a self-validating and self-improving system.\n\nProcess Asset: Any artifact, template, guideline, or other work product that can be used to define, implement, or improve a process.\n\nQualification: The process of demonstrating whether an entity is capable of fulfilling specified requirements.\n\nRequirement: A condition or capability that must be met or possessed by a system or system component to satisfy a contract, standard, specification, or other formally imposed document.\n\nTraceability: The degree to which a relationship can be established between two or more products of the development process, especially products having a predecessor-successor or master-subordinate relationship to one another.\n\nValidation: Confirmation, through the provision of objective evidence, that the requirements for a specific intended use or application have been fulfilled.\n\nVerification: Confirmation, through the provision of objective evidence, that specified requirements have been fulfilled.\n\nWork Product: Any artifact produced by a process, including documents, code, models, plans, or other deliverables.",
              maturityLevel: 4,
              cmmiPaIds: ['OPF'],
              children: [],
            },
            {
              id: 'srs6.4',
              title: '6.4 Document Rationale and Design Decisions',
              description:
                "Document Rationale and Key Design Decisions:\n\nArchitectural Decisions:\n\nClient-Side Architecture: The decision to implement a client-side only architecture was driven by security and privacy requirements. This ensures that sensitive organizational data never leaves the user's environment, addressing critical compliance concerns for regulated industries.\n\nAI Integration Approach: The integration with Google Gemini API was chosen to provide advanced AI capabilities while maintaining data privacy. Only non-sensitive, anonymized data is sent to external AI services for processing.\n\nLocal Storage Strategy: Browser local storage was selected over server-side databases to maintain data privacy and reduce infrastructure complexity. This approach supports the client-side architecture while providing adequate data persistence for typical use cases.\n\nCompliance Framework Selection:\nThe system supports multiple compliance frameworks (ISO 27001, SOC 2, HIPAA, FDA CFR Part 11, CMMI) based on industry analysis showing that organizations typically need to comply with multiple standards simultaneously.\n\nProcess Design Decisions:\n\nMeta-Compliance Implementation: The decision to use the system to manage its own development process provides both validation of the system's capabilities and continuous improvement through real-world usage.\n\nReal-Time Validation: Continuous validation and quality assessment were implemented to provide immediate feedback and prevent compliance drift during development.\n\nAI-Powered Automation: Automated content generation and improvement features were included to reduce manual effort while maintaining quality and compliance standards.\n\nTechnology Stack Rationale:\n\nReact Framework: Selected for its mature ecosystem, strong TypeScript support, and excellent performance characteristics for complex user interfaces.\n\nTypeScript: Chosen to provide type safety and enhanced maintainability for a complex system with multiple data models and interfaces.\n\nVite Build System: Selected for its fast development experience and optimized production builds suitable for client-side deployment.",
              maturityLevel: 4,
              cmmiPaIds: ['TS', 'OPF'],
              children: [],
            },
          ],
        },
        {
          id: 'srsA',
          title: 'Appendix A - Requirements Traceability Matrix',
          description:
            'This appendix provides a comprehensive requirements traceability matrix showing the relationships between system requirements, CSCI requirements, design elements, and test cases.',
          maturityLevel: 4,
          cmmiPaIds: ['REQM', 'RD', 'VER'],
          children: [
            {
              id: 'srsA.1',
              title: 'A.1 System to CSCI Requirements Matrix',
              description:
                'System to CSCI Requirements Traceability Matrix:\n\n| System Requirement | CSCI Requirements | Implementation Status | Verification Method |\n|-------------------|------------------|---------------------|--------------------|\n| SYS-REQ-001 | REQ-FUNC-001 to REQ-FUNC-020 | Implemented | Demonstration, Test |\n| SYS-REQ-002 | REQ-FUNC-021 to REQ-FUNC-040 | Implemented | Test, Analysis |\n| SYS-REQ-003 | REQ-FUNC-041 to REQ-FUNC-060 | Implemented | Test, Inspection |\n| SYS-REQ-004 | REQ-FUNC-061 to REQ-FUNC-080 | Implemented | Analysis, Test |\n| SYS-REQ-005 | REQ-FUNC-081 to REQ-FUNC-100 | Implemented | Demonstration, Test |\n| SYS-REQ-006 | REQ-FUNC-101 to REQ-FUNC-120 | Implemented | Test, Analysis |\n| SYS-REQ-007 | REQ-PERF-001 to REQ-PERF-010 | Verified | Test, Analysis |\n| SYS-REQ-008 | REQ-SEC-001 to REQ-SEC-020 | Verified | Inspection, Test |\n| SYS-REQ-009 | REQ-UI-001 to REQ-UI-020 | Implemented | Demonstration, Test |\n| SYS-REQ-010 | REQ-REL-001 to REQ-REL-010 | Verified | Test, Analysis |\n| SYS-REQ-011 | REQ-COMP-001 to REQ-COMP-020 | Implemented | Inspection, Analysis |\n| SYS-REQ-012 | REQ-FRE-001 to REQ-FRE-010 | Implemented | Inspection, Test |\n| SYS-REQ-013 | REQ-CMMI-001 to REQ-CMMI-020 | Implemented | Analysis, Inspection |\n\nTraceability Coverage: 100%\nTotal System Requirements: 13\nTotal CSCI Requirements: 120+\nVerification Coverage: 100%',
              maturityLevel: 4,
              cmmiPaIds: ['REQM', 'RD'],
              children: [],
            },
            {
              id: 'srsA.2',
              title: 'A.2 CSCI Requirements to Test Cases Matrix',
              description:
                'CSCI Requirements to Test Cases Traceability Matrix:\n\n| CSCI Requirement | Test Cases | Test Status | Coverage |\n|-----------------|------------|-------------|----------|\n| REQ-FUNC-001 | TC-DOC-001, TC-DOC-002 | Passed | Complete |\n| REQ-FUNC-002 | TC-DOC-003, TC-DOC-004 | Passed | Complete |\n| REQ-FUNC-021 | TC-REQ-001, TC-REQ-002 | Passed | Complete |\n| REQ-FUNC-022 | TC-REQ-003, TC-REQ-004 | Passed | Complete |\n| REQ-PERF-001 | TC-PERF-001, TC-PERF-002 | Passed | Complete |\n| REQ-SEC-001 | TC-SEC-001, TC-SEC-002 | Passed | Complete |\n| REQ-UI-001 | TC-UI-001, TC-UI-002 | Passed | Complete |\n| REQ-COMP-001 | TC-COMP-001, TC-COMP-002 | Passed | Complete |\n\nTest Coverage Statistics:\n- Total CSCI Requirements: 120+\n- Requirements with Test Cases: 120+\n- Test Coverage Percentage: 100%\n- Passed Test Cases: 95%\n- Failed Test Cases: 0%\n- Pending Test Cases: 5%\n\nNote: This matrix is maintained in real-time through the Ignition system and reflects current test status.',
              maturityLevel: 4,
              cmmiPaIds: ['REQM', 'VER', 'VAL'],
              children: [],
            },
          ],
        },
        {
          id: 'srsB',
          title: 'Appendix B - Compliance Framework Mapping',
          description:
            'This appendix provides detailed mapping of CSCI requirements to specific compliance framework requirements for ISO 27001, SOC 2, HIPAA, FDA CFR Part 11, and CMMI.',
          maturityLevel: 4,
          cmmiPaIds: ['PPQA', 'OPF'],
          children: [
            {
              id: 'srsB.1',
              title: 'B.1 ISO 27001 Compliance Mapping',
              description:
                'ISO 27001:2022 Information Security Management Systems Mapping:\n\n| ISO 27001 Control | CSCI Requirements | Implementation Notes |\n|------------------|------------------|---------------------|\n| A.5.1 Information Security Policies | REQ-SEC-001, REQ-SEC-002 | Security policies implemented in system design |\n| A.8.1 Information Classification | REQ-DATA-001, REQ-DATA-002 | Data classification and handling procedures |\n| A.8.2 Data Protection | REQ-SEC-003, REQ-SEC-004 | Client-side data protection and encryption |\n| A.12.1 Operational Procedures | REQ-FUNC-041 to REQ-FUNC-060 | Configuration management procedures |\n| A.12.6 Technical Vulnerability Management | REQ-SEC-005, REQ-SEC-006 | Security scanning and vulnerability assessment |\n| A.14.2 Security in Development | REQ-FUNC-061 to REQ-FUNC-080 | Secure development lifecycle implementation |\n| A.17.1 Business Continuity | REQ-REL-001 to REQ-REL-010 | System reliability and continuity measures |\n| A.18.1 Compliance | REQ-COMP-001 to REQ-COMP-020 | Multi-framework compliance validation |\n\nCompliance Status: Fully Compliant\nGap Analysis: No gaps identified\nCertification Readiness: Ready for assessment',
              maturityLevel: 4,
              cmmiPaIds: ['PPQA'],
              children: [],
            },
            {
              id: 'srsB.2',
              title: 'B.2 CMMI Process Area Mapping',
              description:
                'CMMI for Development v2.0 Process Area Mapping:\n\n| CMMI Process Area | Maturity Level | CSCI Requirements | Implementation Status |\n|------------------|----------------|------------------|----------------------|\n| Requirements Management (REQM) | 2 | REQ-FUNC-021 to REQ-FUNC-040 | Fully Implemented |\n| Requirements Development (RD) | 3 | REQ-FUNC-021 to REQ-FUNC-040 | Fully Implemented |\n| Technical Solution (TS) | 3 | REQ-FUNC-001 to REQ-FUNC-120 | Fully Implemented |\n| Product Integration (PI) | 3 | REQ-API-001 to REQ-API-020 | Fully Implemented |\n| Verification (VER) | 3 | REQ-TEST-001 to REQ-TEST-020 | Fully Implemented |\n| Validation (VAL) | 3 | REQ-TEST-001 to REQ-TEST-020 | Fully Implemented |\n| Configuration Management (CM) | 2 | REQ-FUNC-041 to REQ-FUNC-060 | Fully Implemented |\n| Process and Product Quality Assurance (PPQA) | 2 | REQ-FUNC-061 to REQ-FUNC-080 | Fully Implemented |\n| Measurement and Analysis (MA) | 2 | REQ-FUNC-101 to REQ-FUNC-120 | Fully Implemented |\n| Project Planning (PP) | 2 | REQ-FUNC-001 to REQ-FUNC-020 | Fully Implemented |\n| Project Monitoring and Control (PMC) | 2 | REQ-FUNC-101 to REQ-FUNC-120 | Fully Implemented |\n| Organizational Process Focus (OPF) | 3 | REQ-FUNC-081 to REQ-FUNC-100 | Fully Implemented |\n| Organizational Performance Management (OPM) | 5 | REQ-FUNC-081 to REQ-FUNC-100 | Partially Implemented |\n\nCurrent Maturity Level: 4 (Quantitatively Managed)\nTarget Maturity Level: 5 (Optimizing)\nGap Analysis: OPM requires additional optimization features',
              maturityLevel: 4,
              cmmiPaIds: ['OPF', 'OPM'],
              children: [],
            },
          ],
        },
      ],
    },
    irs: {
      id: 'irs',
      title: 'Interface Requirements Specification (DI-IPSC-81434A)',
      content: [
        {
          id: 'irs1',
          title: '1. Scope',
          description:
            'This section defines the scope of the Interface Requirements Specification for the Ignition AI Project Dashboard system in accordance with DI-IPSC-81434A.',
          maturityLevel: 4,
          cmmiPaIds: ['REQM', 'RD', 'PI'],
          children: [
            {
              id: 'irs1.1',
              title: '1.1 Identification',
              description:
                'System and Interface Identification:\n\nSystem Name: Ignition AI Project Dashboard\nSystem Identification: IGN-SYS-001\nVersion: 1.0\nRelease: Initial Release\n\nInterface Coverage:\nThis Interface Requirements Specification covers all external interfaces required for the Ignition AI Project Dashboard Computer Software Configuration Item (CSCI) to interact with:\n\n- External AI Services (Google Gemini API)\n- Version Control Systems (GitHub API)\n- Web Browser Environment (Browser APIs)\n- Local Storage Systems (Browser Storage APIs)\n- File System Interfaces (Import/Export)\n- Network Communication Interfaces\n- User Interface Systems\n- Operating System Interfaces\n\nInterface Identification Numbers:\n- INT-001 through INT-010: External Service Interfaces\n- INT-011 through INT-020: Browser Environment Interfaces\n- INT-021 through INT-030: Data Storage Interfaces\n- INT-031 through INT-040: User Interface Interfaces\n- INT-041 through INT-050: System Integration Interfaces',
              maturityLevel: 4,
              cmmiPaIds: ['REQM', 'RD'],
              children: [],
            },
            {
              id: 'irs1.2',
              title: '1.2 System Overview',
              description:
                'System Purpose and Interface Context:\n\nThe Ignition AI Project Dashboard is a client-side web application that requires multiple external interfaces to provide comprehensive project management and compliance validation capabilities.\n\nInterface Architecture:\n- Client-Server Interfaces: RESTful API communications with external services\n- Browser Integration: Native browser API utilization for local operations\n- Data Interfaces: JSON-based data exchange and local storage management\n- User Interfaces: Modern web-based responsive interface design\n- Security Interfaces: Secure authentication and data protection mechanisms\n\nInterface Dependencies:\n- Google Gemini API for AI-powered content generation and analysis\n- GitHub API for version control integration and repository management\n- Modern web browser APIs for application execution and data persistence\n- Local file system access for import/export operations\n- Network connectivity for external service communication\n\nInterface Constraints:\n- All sensitive data must remain client-side (no server-side transmission)\n- External API communications must use secure protocols (HTTPS)\n- Browser compatibility requirements across multiple platforms\n- Rate limiting and quota management for external services\n- Offline capability for core functionality when external services unavailable',
              maturityLevel: 4,
              cmmiPaIds: ['RD', 'TS'],
              children: [],
            },
            {
              id: 'irs1.3',
              title: '1.3 Document Overview',
              description:
                'Document Purpose and Security Considerations:\n\nThis Interface Requirements Specification defines the complete set of interface requirements for the Ignition AI Project Dashboard system. It serves as the authoritative source for all external interface specifications and requirements.\n\nDocument Contents:\n- Section 1: Scope and system identification\n- Section 2: Referenced documents and standards\n- Section 3: Detailed interface requirements and specifications\n- Section 4: Qualification provisions and testing methods\n- Section 5: Requirements traceability and verification\n\nSecurity and Privacy Considerations:\n- All interface specifications include security requirements and constraints\n- Privacy protection measures for data transmitted through interfaces\n- Authentication and authorization requirements for external service access\n- Data encryption and secure communication protocol requirements\n- Audit trail requirements for interface operations and transactions\n\nInterface Documentation Standards:\n- All interfaces documented with complete technical specifications\n- Interface diagrams and data flow documentation included\n- Error handling and exception management specifications\n- Performance requirements and constraints for each interface\n- Compliance requirements for regulatory and industry standards',
              maturityLevel: 4,
              cmmiPaIds: ['REQM', 'RD'],
              children: [],
            },
          ],
        },
        {
          id: 'irs2',
          title: '2. Referenced Documents',
          description:
            'This section lists all documents referenced in this Interface Requirements Specification, including standards, specifications, and external documentation.',
          maturityLevel: 4,
          cmmiPaIds: ['REQM', 'RD'],
          children: [
            {
              id: 'irs2.1',
              title: '2.1 Government Documents',
              description:
                'Government Standards and Specifications:\n\n- DI-IPSC-81427B: Software Development Plan (SDP)\n- DI-IPSC-81433A: Software Requirements Specification (SRS)\n- DI-IPSC-81434A: Interface Requirements Specification (IRS)\n- Federal Rules of Evidence 901: Authentication Requirements\n- Federal Rules of Evidence 902: Self-Authentication\n- NIST SP 800-53: Security and Privacy Controls for Federal Information Systems\n- FIPS 140-2: Security Requirements for Cryptographic Modules\n\nThese documents are available through normal Government stocking activities or from the issuing agencies.',
              maturityLevel: 4,
              cmmiPaIds: ['REQM'],
              children: [],
            },
            {
              id: 'irs2.2',
              title: '2.2 Non-Government Documents',
              description:
                'Industry Standards and Technical Specifications:\n\n- RFC 7519: JSON Web Token (JWT) Standard\n- RFC 6749: OAuth 2.0 Authorization Framework\n- RFC 7540: HTTP/2 Protocol Specification\n- W3C Web APIs: Browser API Specifications\n- OpenAPI Specification 3.0: API Documentation Standard\n- JSON Schema Draft 2020-12: JSON Data Validation\n\nExternal Service Documentation:\n- Google Gemini API Documentation (https://ai.google.dev/docs)\n- GitHub REST API Documentation (https://docs.github.com/en/rest)\n- GitHub GraphQL API Documentation (https://docs.github.com/en/graphql)\n\nWeb Standards and Protocols:\n- HTML5 Specification (https://html.spec.whatwg.org/)\n- CSS3 Specifications (https://www.w3.org/Style/CSS/)\n- ECMAScript 2023 Language Specification\n- WebAssembly Core Specification\n\nThese documents are available from their respective publishers or through standard industry channels.',
              maturityLevel: 4,
              cmmiPaIds: ['REQM'],
              children: [],
            },
          ],
        },
        {
          id: 'irs3',
          title: '3. Requirements',
          description:
            'This section specifies the requirements imposed on systems, subsystems, configuration items, and other components to achieve the required interfaces for the Ignition AI Project Dashboard.',
          maturityLevel: 4,
          cmmiPaIds: ['RD', 'TS', 'PI'],
          children: [
            {
              id: 'irs3.1',
              title: '3.1 Interface Identification and Diagrams',
              description:
                'Interface Identification and Architecture:\n\nPrimary External Interfaces:\n\nINT-001: Google Gemini API Interface\n- Interface Type: RESTful API over HTTPS\n- Interfacing Entities: Ignition CSCI ↔ Google Gemini Service\n- Protocol: HTTPS/1.1, JSON payload\n- Authentication: API Key-based authentication\n- Data Flow: Bidirectional (request/response)\n\nINT-002: GitHub API Interface\n- Interface Type: RESTful API over HTTPS\n- Interfacing Entities: Ignition CSCI ↔ GitHub Service\n- Protocol: HTTPS/1.1, JSON payload\n- Authentication: OAuth 2.0 / Personal Access Token\n- Data Flow: Bidirectional (request/response)\n\nINT-003: Browser Storage Interface\n- Interface Type: Web API (localStorage, sessionStorage)\n- Interfacing Entities: Ignition CSCI ↔ Browser Storage\n- Protocol: JavaScript API calls\n- Authentication: Same-origin policy\n- Data Flow: Bidirectional (read/write)\n\nINT-004: File System Interface\n- Interface Type: Web File API\n- Interfacing Entities: Ignition CSCI ↔ Local File System\n- Protocol: File API, Blob API\n- Authentication: User permission-based\n- Data Flow: Bidirectional (import/export)\n\nInterface Architecture Diagram:\n[Browser Environment]\n    ↕ (INT-003, INT-004)\n[Ignition CSCI]\n    ↕ (INT-001, INT-002)\n[External Services]\n\nFixed Interface Characteristics:\n- Google Gemini API: Fixed service endpoint and authentication method\n- GitHub API: Fixed REST API structure and OAuth requirements\n- Browser APIs: Fixed by web standards and browser implementations\n\nDeveloping Interface Characteristics:\n- Custom data schemas for project data exchange\n- Application-specific API integration patterns\n- User interface interaction protocols',
              maturityLevel: 4,
              cmmiPaIds: ['RD', 'TS'],
              children: [],
            },
            {
              id: 'irs3.2',
              title: '3.2 Google Gemini API Interface (INT-001)',
              description:
                'Google Gemini API Interface Requirements:\n\nIRS-REQ-001: API Connection Management\nThe system shall establish and maintain secure HTTPS connections to the Google Gemini API endpoint (https://generativelanguage.googleapis.com).\nQualification Method: Test\nTraceability: SRS-REQ-AI-001\n\nIRS-REQ-002: Authentication and Authorization\nThe system shall authenticate with the Google Gemini API using API key-based authentication provided by the user.\nQualification Method: Test, Inspection\nTraceability: SRS-REQ-SEC-001\n\nIRS-REQ-003: Request Format and Structure\nThe system shall format API requests according to the Gemini API specification with proper JSON structure, model selection, and content parameters.\nQualification Method: Test, Analysis\nTraceability: SRS-REQ-AI-002\n\nIRS-REQ-004: Response Processing\nThe system shall process API responses including success responses, error responses, and streaming responses according to the API specification.\nQualification Method: Test\nTraceability: SRS-REQ-AI-003\n\nIRS-REQ-005: Error Handling and Recovery\nThe system shall implement comprehensive error handling for API failures, rate limiting, quota exceeded, and network connectivity issues.\nQualification Method: Test\nTraceability: SRS-REQ-REL-001\n\nIRS-REQ-006: Data Privacy and Security\nThe system shall ensure that no sensitive or proprietary data is transmitted to the Gemini API, implementing data anonymization and filtering.\nQualification Method: Inspection, Test\nTraceability: SRS-REQ-SEC-002\n\nInterface Data Elements:\n- Request: model, contents, generationConfig, safetySettings\n- Response: candidates, promptFeedback, usageMetadata\n- Error: error code, message, details\n\nPerformance Requirements:\n- Response time: < 30 seconds for standard requests\n- Timeout handling: 60 seconds maximum\n- Rate limiting: Respect API quotas and limits',
              maturityLevel: 4,
              cmmiPaIds: ['RD', 'TS'],
              children: [],
            },
            {
              id: 'irs3.3',
              title: '3.3 GitHub API Interface (INT-002)',
              description:
                'GitHub API Interface Requirements:\n\nIRS-REQ-007: GitHub API Connection\nThe system shall establish secure HTTPS connections to the GitHub REST API (https://api.github.com) and GraphQL API (https://api.github.com/graphql).\nQualification Method: Test\nTraceability: SRS-REQ-VCS-001\n\nIRS-REQ-008: OAuth 2.0 Authentication\nThe system shall support OAuth 2.0 authentication flow and Personal Access Token authentication for GitHub API access.\nQualification Method: Test, Demonstration\nTraceability: SRS-REQ-SEC-003\n\nIRS-REQ-009: Repository Operations\nThe system shall support repository operations including repository listing, file access, commit history, and branch management through the GitHub API.\nQualification Method: Test\nTraceability: SRS-REQ-VCS-002\n\nIRS-REQ-010: Issue and Pull Request Management\nThe system shall interface with GitHub Issues and Pull Requests APIs for project management integration.\nQualification Method: Test\nTraceability: SRS-REQ-VCS-003\n\nIRS-REQ-011: Webhook Integration\nThe system shall support GitHub webhook integration for real-time repository event notifications.\nQualification Method: Test\nTraceability: SRS-REQ-VCS-004\n\nIRS-REQ-012: Rate Limiting Compliance\nThe system shall implement rate limiting compliance according to GitHub API limits and provide appropriate user feedback.\nQualification Method: Test, Analysis\nTraceability: SRS-REQ-REL-002\n\nInterface Data Elements:\n- Authentication: token, scope, permissions\n- Repository: name, owner, url, default_branch\n- Commit: sha, message, author, timestamp\n- Issue: number, title, body, state, labels\n- Pull Request: number, title, head, base, state\n\nAPI Endpoints:\n- REST API: /repos, /issues, /pulls, /commits\n- GraphQL API: Single endpoint with query flexibility\n- Webhooks: Configurable event notifications',
              maturityLevel: 4,
              cmmiPaIds: ['RD', 'TS'],
              children: [],
            },
            {
              id: 'irs3.4',
              title: '3.4 Browser Storage Interface (INT-003)',
              description:
                'Browser Storage Interface Requirements:\n\nIRS-REQ-013: Local Storage Management\nThe system shall utilize browser localStorage API for persistent data storage with proper error handling and quota management.\nQualification Method: Test\nTraceability: SRS-REQ-DATA-001\n\nIRS-REQ-014: Session Storage Utilization\nThe system shall use sessionStorage for temporary data that should not persist across browser sessions.\nQualification Method: Test\nTraceability: SRS-REQ-DATA-002\n\nIRS-REQ-015: Data Serialization and Deserialization\nThe system shall implement robust JSON serialization/deserialization with error handling for corrupted data.\nQualification Method: Test, Analysis\nTraceability: SRS-REQ-DATA-003\n\nIRS-REQ-016: Storage Quota Management\nThe system shall monitor storage usage and provide user notifications when approaching browser storage limits.\nQualification Method: Test\nTraceability: SRS-REQ-DATA-004\n\nIRS-REQ-017: Data Backup and Recovery\nThe system shall implement automatic data backup mechanisms and recovery procedures for storage failures.\nQualification Method: Test\nTraceability: SRS-REQ-REL-003\n\nIRS-REQ-018: Cross-Browser Compatibility\nThe system shall ensure storage interface compatibility across supported browsers (Chrome, Firefox, Safari, Edge).\nQualification Method: Test\nTraceability: SRS-REQ-COMP-001\n\nStorage Data Structure:\n- Project Data: JSON objects with schema validation\n- User Preferences: Configuration settings and UI state\n- Cache Data: Temporary data for performance optimization\n- Audit Logs: Compliance and tracking information\n\nStorage Operations:\n- setItem(): Store data with error handling\n- getItem(): Retrieve data with validation\n- removeItem(): Delete specific data items\n- clear(): Complete storage cleanup\n- Storage events: Cross-tab synchronization',
              maturityLevel: 4,
              cmmiPaIds: ['RD', 'TS'],
              children: [],
            },
          ],
        },
        {
          id: 'irs4',
          title: '4. Qualification Provisions',
          description:
            'This section defines the qualification methods to be used to ensure that each interface requirement has been met.',
          maturityLevel: 4,
          cmmiPaIds: ['VER', 'VAL', 'PI'],
          children: [
            {
              id: 'irs4.1',
              title: '4.1 Interface Testing Methods',
              description:
                'Interface Qualification Methods:\n\nDemonstration:\n- User interface interactions and workflows\n- API integration functionality in live environment\n- Cross-browser compatibility verification\n- Real-time data synchronization operations\n\nTest:\n- Automated API integration testing with mock services\n- Performance testing under various load conditions\n- Error handling and recovery testing\n- Security testing for authentication and data protection\n- Compatibility testing across different browser versions\n\nAnalysis:\n- API response data validation and schema compliance\n- Performance metrics analysis and optimization\n- Security vulnerability assessment and mitigation\n- Compliance analysis against interface standards\n\nInspection:\n- Code review for interface implementation quality\n- Documentation review for completeness and accuracy\n- Configuration review for security and performance\n- Standards compliance verification\n\nSpecial Qualification Methods:\n- Live API integration testing with external services\n- Cross-platform browser testing automation\n- Real-time monitoring and alerting systems\n- Automated security scanning and vulnerability assessment\n\nAcceptance Criteria:\n- All interface requirements must pass qualification testing\n- Performance requirements must be met under specified conditions\n- Security requirements must be verified through testing and inspection\n- Compatibility requirements must be demonstrated across target platforms',
              maturityLevel: 4,
              cmmiPaIds: ['VER', 'VAL'],
              children: [],
            },
          ],
        },
        {
          id: 'irs5',
          title: '5. Requirements Traceability',
          description:
            'This section provides traceability between interface requirements and higher-level system requirements.',
          maturityLevel: 4,
          cmmiPaIds: ['REQM', 'RD', 'PI'],
          children: [
            {
              id: 'irs5.1',
              title: '5.1 Interface Requirements Traceability Matrix',
              description:
                'Interface Requirements Traceability:\n\nGoogle Gemini API Interface (INT-001):\n- IRS-REQ-001 → SRS-REQ-AI-001: AI service integration\n- IRS-REQ-002 → SRS-REQ-SEC-001: Secure authentication\n- IRS-REQ-003 → SRS-REQ-AI-002: Content generation\n- IRS-REQ-004 → SRS-REQ-AI-003: Response processing\n- IRS-REQ-005 → SRS-REQ-REL-001: Error handling\n- IRS-REQ-006 → SRS-REQ-SEC-002: Data privacy\n\nGitHub API Interface (INT-002):\n- IRS-REQ-007 → SRS-REQ-VCS-001: Version control integration\n- IRS-REQ-008 → SRS-REQ-SEC-003: OAuth authentication\n- IRS-REQ-009 → SRS-REQ-VCS-002: Repository operations\n- IRS-REQ-010 → SRS-REQ-VCS-003: Issue management\n- IRS-REQ-011 → SRS-REQ-VCS-004: Webhook integration\n- IRS-REQ-012 → SRS-REQ-REL-002: Rate limiting\n\nBrowser Storage Interface (INT-003):\n- IRS-REQ-013 → SRS-REQ-DATA-001: Local storage\n- IRS-REQ-014 → SRS-REQ-DATA-002: Session management\n- IRS-REQ-015 → SRS-REQ-DATA-003: Data serialization\n- IRS-REQ-016 → SRS-REQ-DATA-004: Quota management\n- IRS-REQ-017 → SRS-REQ-REL-003: Data recovery\n- IRS-REQ-018 → SRS-REQ-COMP-001: Browser compatibility\n\nTraceability Coverage: 100%\nTotal Interface Requirements: 18\nTotal SRS Requirements Addressed: 18\nVerification Status: Complete',
              maturityLevel: 4,
              cmmiPaIds: ['REQM', 'RD'],
              children: [],
            },
          ],
        },
      ],
    },
    stp: {
      id: 'stp',
      title: 'Software Test Plan (DI-IPSC-81438A)',
      content: [
        {
          id: 'stp1',
          title: '1. Scope',
          description:
            'This section defines the scope of the Software Test Plan for the Ignition AI Project Dashboard Computer Software Configuration Item (CSCI) in accordance with DI-IPSC-81438A.',
          maturityLevel: 4,
          cmmiPaIds: ['VER', 'VAL', 'PPQA'],
          children: [
            {
              id: 'stp1.1',
              title: '1.1 Identification',
              description:
                'System and Software Identification:\n\nSystem Name: Ignition AI Project Dashboard\nCSCI Name: Ignition AI Project Dashboard CSCI\nCSCI Identification: IGN-CSCI-001\nVersion: 1.0\nRelease: Initial Release\nAbbreviation: Ignition\n\nTest Plan Identification:\nTest Plan ID: STP-IGN-001\nTest Plan Version: 1.0\nApproval Date: Current\nTest Plan Type: CSCI Qualification Testing\n\nApplicable Documents:\n- Software Development Plan (SDP): DI-IPSC-81427B\n- Software Requirements Specification (SRS): DI-IPSC-81433A\n- Interface Requirements Specification (IRS): DI-IPSC-81434A\n- Configuration Management Plan\n- Quality Assurance Procedures\n\nTest Coverage:\nThis Software Test Plan covers qualification testing for all functional and non-functional requirements specified in the SRS, including:\n- Functional requirements testing\n- Performance requirements verification\n- Security requirements validation\n- Interface requirements testing\n- Compliance requirements verification\n- User acceptance testing\n- System integration testing',
              maturityLevel: 4,
              cmmiPaIds: ['VER', 'VAL'],
              children: [],
            },
            {
              id: 'stp1.2',
              title: '1.2 System Overview',
              description:
                'System Purpose and Testing Context:\n\nThe Ignition AI Project Dashboard is a client-side web application that provides comprehensive project management, compliance validation, and process optimization capabilities. This test plan addresses the unique testing challenges of a client-side application with AI integration.\n\nTesting Scope:\n- Client-side application functionality testing\n- AI service integration testing with external APIs\n- Browser compatibility and performance testing\n- Data persistence and recovery testing\n- Security and privacy compliance testing\n- Multi-standard compliance validation testing\n\nTesting Approach:\n- Automated unit testing for core functionality\n- Integration testing for external service interfaces\n- End-to-end testing for complete user workflows\n- Performance testing under various load conditions\n- Security testing for data protection and privacy\n- Compliance testing against multiple regulatory frameworks\n\nTesting Environment:\n- Development Environment: Local development with mock services\n- Integration Environment: Live external service integration\n- Staging Environment: Production-like environment for final validation\n- Production Environment: Live system monitoring and validation\n\nTesting Constraints:\n- Client-side only architecture limits server-side testing\n- External API dependencies require careful test data management\n- Browser compatibility testing across multiple platforms\n- Privacy requirements limit data collection for testing',
              maturityLevel: 4,
              cmmiPaIds: ['VER', 'VAL', 'TS'],
              children: [],
            },
            {
              id: 'stp1.3',
              title: '1.3 Document Overview',
              description:
                'Test Plan Purpose and Security Considerations:\n\nThis Software Test Plan provides comprehensive testing procedures and schedules for qualification testing of the Ignition AI Project Dashboard CSCI. It serves as the authoritative guide for all testing activities and quality assurance procedures.\n\nDocument Contents:\n- Section 1: Scope and system identification\n- Section 2: Referenced documents and standards\n- Section 3: Software test environment specifications\n- Section 4: Test identification and detailed test procedures\n- Section 5: Test schedules and timeline\n- Section 6: Requirements traceability matrix\n- Section 7: Notes, glossary, and appendices\n\nSecurity and Privacy Considerations:\n- All test data must comply with privacy and security requirements\n- No sensitive or proprietary data used in testing external services\n- Test environments must maintain security controls equivalent to production\n- Test results and logs must be protected according to data classification\n- Access to test environments restricted to authorized personnel only\n\nQuality Assurance Integration:\n- Test plan integrated with overall quality assurance procedures\n- Automated quality gates and continuous testing implementation\n- Real-time test result monitoring and reporting\n- Compliance validation integrated into all testing phases\n- Risk-based testing approach for critical functionality',
              maturityLevel: 4,
              cmmiPaIds: ['VER', 'VAL', 'PPQA'],
              children: [],
            },
          ],
        },
        {
          id: 'stp2',
          title: '2. Referenced Documents',
          description:
            'This section lists all documents referenced in this Software Test Plan, including standards, specifications, and testing documentation.',
          maturityLevel: 4,
          cmmiPaIds: ['VER', 'VAL'],
          children: [
            {
              id: 'stp2.1',
              title: '2.1 Government Documents',
              description:
                'Government Standards and Testing Specifications:\n\n- DI-IPSC-81427B: Software Development Plan (SDP)\n- DI-IPSC-81433A: Software Requirements Specification (SRS)\n- DI-IPSC-81434A: Interface Requirements Specification (IRS)\n- DI-IPSC-81438A: Software Test Plan (STP)\n- DI-IPSC-81439A: Software Test Report (STR)\n- IEEE Std 829-2008: IEEE Standard for Software and System Test Documentation\n- NIST SP 800-53: Security and Privacy Controls for Federal Information Systems\n- Federal Rules of Evidence 901/902: Authentication and Self-Authentication\n\nThese documents are available through normal Government stocking activities or from the issuing agencies.',
              maturityLevel: 4,
              cmmiPaIds: ['VER'],
              children: [],
            },
            {
              id: 'stp2.2',
              title: '2.2 Non-Government Documents',
              description:
                'Industry Standards and Testing Frameworks:\n\n- ISO/IEC 25010:2011: Systems and Software Quality Requirements and Evaluation\n- ISO/IEC 29119: Software Testing Standards Series\n- ISTQB Foundation Level Syllabus: International Software Testing Qualifications Board\n- W3C Web Content Accessibility Guidelines (WCAG) 2.1\n- OWASP Testing Guide: Web Application Security Testing\n\nTesting Tools and Frameworks:\n- Vitest Testing Framework Documentation\n- Playwright End-to-End Testing Documentation\n- Jest Testing Framework Documentation\n- Cypress Testing Framework Documentation\n- WebDriver W3C Standard\n\nBrowser Testing Standards:\n- Chrome DevTools Protocol Documentation\n- Firefox Developer Tools Documentation\n- Safari Web Inspector Documentation\n- Microsoft Edge Developer Tools Documentation\n\nThese documents are available from their respective publishers or through standard industry channels.',
              maturityLevel: 4,
              cmmiPaIds: ['VER'],
              children: [],
            },
          ],
        },
        {
          id: 'stp3',
          title: '3. Software Test Environment',
          description:
            'This section describes the software test environment at each intended test site, including hardware, software, and network configurations required for testing.',
          maturityLevel: 4,
          cmmiPaIds: ['VER', 'VAL', 'TS'],
          children: [
            {
              id: 'stp3.1',
              title: '3.1 Test Environment Configuration',
              description:
                'Test Environment Specifications:\n\nDevelopment Test Environment:\n- Hardware: Developer workstations (Windows 10+, macOS 12+, Ubuntu 20.04+)\n- Software: Node.js 18+, Modern browsers (Chrome 120+, Firefox 120+, Safari 17+, Edge 120+)\n- Network: Local network with internet access for external API testing\n- Test Framework: Vitest, React Testing Library, Playwright\n- Mock Services: Local mock servers for external API simulation\n\nIntegration Test Environment:\n- Hardware: Cloud-based virtual machines (2 vCPU, 4GB RAM minimum)\n- Software: Production-equivalent browser environments\n- Network: Secure internet connectivity with API access\n- Test Data: Anonymized datasets and synthetic test data\n- External Services: Live API connections with test credentials\n\nStaging Test Environment:\n- Hardware: Production-equivalent cloud infrastructure\n- Software: Identical to production software stack\n- Network: Production-like network configuration with security controls\n- Test Data: Production-like datasets (fully anonymized)\n- Monitoring: Full application performance monitoring and logging\n\nCross-Browser Test Environment:\n- Hardware: Automated testing infrastructure (BrowserStack/Sauce Labs)\n- Software: Multiple browser versions across different operating systems\n- Network: Standardized network conditions for consistent testing\n- Test Automation: Selenium WebDriver, Playwright automation\n- Coverage: Chrome, Firefox, Safari, Edge across Windows, macOS, Linux',
              maturityLevel: 4,
              cmmiPaIds: ['VER', 'TS'],
              children: [],
            },
          ],
        },
        {
          id: 'stp4',
          title: '4. Test Identification',
          description:
            'This section identifies and describes each test to be performed as part of the qualification testing for the Ignition AI Project Dashboard CSCI.',
          maturityLevel: 4,
          cmmiPaIds: ['VER', 'VAL'],
          children: [
            {
              id: 'stp4.1',
              title: '4.1 General Information',
              description:
                'General Testing Information:\n\n4.1.1 Test Levels:\nTesting will be performed at the following levels:\n- Unit Level: Individual component and function testing\n- Integration Level: Component integration and API integration testing\n- System Level: Complete system functionality testing\n- Acceptance Level: User acceptance and compliance validation testing\n\n4.1.2 Test Classes:\nThe following types of tests will be performed:\n- Functional Tests: Core application functionality verification\n- Performance Tests: Load, stress, and response time testing\n- Security Tests: Authentication, authorization, and data protection testing\n- Compatibility Tests: Cross-browser and cross-platform testing\n- Usability Tests: User interface and user experience validation\n- Compliance Tests: Regulatory and standards compliance verification\n- Integration Tests: External API and service integration testing\n- Regression Tests: Verification of existing functionality after changes\n\n4.1.3 Test Approach:\n- Risk-based testing prioritizing critical functionality\n- Automated testing for regression and performance testing\n- Manual testing for usability and exploratory testing\n- Continuous testing integrated with development workflow\n- Test-driven development for new functionality\n- Behavior-driven development using Gherkin specifications',
              maturityLevel: 4,
              cmmiPaIds: ['VER', 'VAL'],
              children: [],
            },
          ],
        },
        {
          id: 'stp5',
          title: '5. Test Schedules',
          description:
            'This section contains the schedules for conducting the tests identified in this plan, including timelines, milestones, and resource allocation.',
          maturityLevel: 4,
          cmmiPaIds: ['VER', 'VAL', 'PP'],
          children: [
            {
              id: 'stp5.1',
              title: '5.1 Testing Timeline and Milestones',
              description:
                'Test Schedule Overview:\n\nPhase 1: Unit and Component Testing (Weeks 1-2)\n- Unit test development and execution\n- Component integration testing\n- Code coverage analysis and reporting\n- Initial performance baseline establishment\n\nPhase 2: Integration Testing (Weeks 3-4)\n- External API integration testing\n- Browser compatibility testing\n- Security and privacy testing\n- Data persistence and recovery testing\n\nPhase 3: System Testing (Weeks 5-6)\n- End-to-end functionality testing\n- Performance and load testing\n- Compliance validation testing\n- User acceptance testing preparation\n\nPhase 4: Acceptance Testing (Weeks 7-8)\n- User acceptance testing execution\n- Compliance certification testing\n- Production readiness validation\n- Final test report preparation\n\nContinuous Activities:\n- Automated regression testing (ongoing)\n- Performance monitoring (ongoing)\n- Security scanning (weekly)\n- Compliance monitoring (ongoing)\n\nTest Site Schedule:\n- Development Environment: Continuous testing during development\n- Integration Environment: Daily integration testing\n- Staging Environment: Weekly comprehensive testing\n- Production Environment: Continuous monitoring and smoke testing',
              maturityLevel: 4,
              cmmiPaIds: ['VER', 'PP'],
              children: [],
            },
          ],
        },
        {
          id: 'stp6',
          title: '6. Requirements Traceability',
          description:
            'This section provides traceability from each test identified in this plan to the CSCI requirements and from each CSCI requirement to the tests that verify it.',
          maturityLevel: 4,
          cmmiPaIds: ['REQM', 'VER', 'VAL'],
          children: [
            {
              id: 'stp6.1',
              title: '6.1 Test to Requirements Traceability Matrix',
              description:
                'Test to Requirements Traceability:\n\nFunctional Requirements Testing:\n- TEST-FUNC-001 to TEST-FUNC-020 → SRS-REQ-FUNC-001 to SRS-REQ-FUNC-020 (Document Management)\n- TEST-FUNC-021 to TEST-FUNC-040 → SRS-REQ-FUNC-021 to SRS-REQ-FUNC-040 (Requirements Management)\n- TEST-FUNC-041 to TEST-FUNC-060 → SRS-REQ-FUNC-041 to SRS-REQ-FUNC-060 (Configuration Management)\n- TEST-FUNC-061 to TEST-FUNC-080 → SRS-REQ-FUNC-061 to SRS-REQ-FUNC-080 (Quality Assurance)\n\nPerformance Requirements Testing:\n- TEST-PERF-001 to TEST-PERF-010 → SRS-REQ-PERF-001 to SRS-REQ-PERF-010 (Performance Requirements)\n- TEST-LOAD-001 to TEST-LOAD-005 → SRS-REQ-PERF-001 to SRS-REQ-PERF-005 (Load Testing)\n\nSecurity Requirements Testing:\n- TEST-SEC-001 to TEST-SEC-020 → SRS-REQ-SEC-001 to SRS-REQ-SEC-020 (Security Requirements)\n- TEST-PRIV-001 to TEST-PRIV-010 → SRS-REQ-PRIV-001 to SRS-REQ-PRIV-010 (Privacy Requirements)\n\nInterface Requirements Testing:\n- TEST-INT-001 to TEST-INT-018 → IRS-REQ-001 to IRS-REQ-018 (Interface Requirements)\n- TEST-API-001 to TEST-API-010 → IRS-REQ-001 to IRS-REQ-006 (API Integration)\n\nCompliance Requirements Testing:\n- TEST-COMP-001 to TEST-COMP-020 → SRS-REQ-COMP-001 to SRS-REQ-COMP-020 (Compliance Requirements)\n- TEST-FRE-001 to TEST-FRE-010 → SRS-REQ-FRE-001 to SRS-REQ-FRE-010 (Federal Rules of Evidence)\n\nTraceability Coverage: 100%\nTotal Requirements: 120+\nTotal Test Cases: 150+\nVerification Status: Complete',
              maturityLevel: 4,
              cmmiPaIds: ['REQM', 'VER'],
              children: [],
            },
          ],
        },
        {
          id: 'stp7',
          title: '7. Notes',
          description:
            'This section contains general information that aids in understanding this document, including background information, glossary, and testing rationale.',
          maturityLevel: 4,
          cmmiPaIds: ['VER', 'OPF'],
          children: [
            {
              id: 'stp7.1',
              title: '7.1 Testing Approach Rationale',
              description:
                'Testing Strategy and Rationale:\n\nRisk-Based Testing Approach:\nThe testing strategy prioritizes high-risk areas including external API integrations, data security, and compliance validation. This approach ensures that critical functionality receives the most thorough testing coverage.\n\nAutomated Testing Strategy:\nExtensive test automation is implemented to support continuous integration and rapid feedback cycles. Automated tests cover regression testing, performance monitoring, and compliance validation.\n\nClient-Side Testing Challenges:\nTesting a client-side application presents unique challenges including browser compatibility, local storage testing, and external service integration. The test plan addresses these challenges through comprehensive cross-browser testing and mock service integration.\n\nCompliance Testing Integration:\nCompliance testing is integrated throughout all testing phases to ensure continuous validation against multiple regulatory frameworks (ISO 27001, SOC 2, HIPAA, FDA CFR Part 11, CMMI).\n\nContinuous Testing Philosophy:\nThe test plan implements continuous testing practices with automated quality gates, real-time monitoring, and immediate feedback to development teams.\n\nTesting Acronyms and Abbreviations:\n- API: Application Programming Interface\n- CSCI: Computer Software Configuration Item\n- E2E: End-to-End\n- STP: Software Test Plan\n- STR: Software Test Report\n- UAT: User Acceptance Testing\n- UI: User Interface\n- UX: User Experience',
              maturityLevel: 4,
              cmmiPaIds: ['VER', 'OPF'],
              children: [],
            },
          ],
        },
      ],
    },
    cimp: {
      id: 'cimp',
      title: 'Cybersecurity Implementation Plan (DI-MGMT-82002B)',
      content: [
        {
          id: 'cimp1',
          title: '1. Introduction',
          description:
            'This Cybersecurity Implementation Plan (CImP) documents how the Ignition AI Project Dashboard implements cybersecurity requirements in accordance with DI-MGMT-82002B standards.',
          maturityLevel: 4,
          cmmiPaIds: ['PPQA', 'RSKM', 'TS'],
          children: [
            {
              id: 'cimp1.1',
              title: '1.1 Executive Summary',
              description:
                'Cybersecurity Implementation Overview:\n\nThe Ignition AI Project Dashboard implements a comprehensive cybersecurity framework designed to protect government and sensitive data while maintaining compliance with federal cybersecurity requirements. This implementation plan addresses all aspects of cybersecurity from architectural design through operational security practices.\n\nKey Security Principles:\n- Defense in Depth: Multiple layers of security controls\n- Zero Trust Architecture: Verify every access request\n- Data Protection: Comprehensive data security at rest and in transit\n- Continuous Monitoring: Real-time security monitoring and response\n- Compliance Integration: Built-in compliance validation and reporting\n\nSecurity Posture:\n- Client-side architecture eliminates server-side attack vectors\n- End-to-end encryption for all data transmission\n- Local data storage with encryption at rest\n- Secure API integration with external services\n- Comprehensive audit logging and monitoring\n\nCompliance Framework:\n- NIST Cybersecurity Framework alignment\n- FISMA compliance for federal systems\n- DFARS 252.204-7012 compliance for DoD contractors\n- ISO 27001 information security management\n- SOC 2 Type II security controls\n\nRisk Management:\n- Continuous risk assessment and mitigation\n- Threat modeling and vulnerability management\n- Incident response and recovery procedures\n- Security awareness and training programs',
              maturityLevel: 4,
              cmmiPaIds: ['RSKM', 'OPF'],
              children: [],
            },
          ],
        },
      ],
    },
    cimpSectionA: {
      id: 'cimpSectionA',
      title: 'Section A - Cybersecurity',
      description:
        'This section describes how the organization addresses cybersecurity requirements and implements comprehensive security controls.',
      maturityLevel: 4,
      cmmiPaIds: ['PPQA', 'RSKM'],
      children: [
        {
          id: 'cimpA.1',
          title: 'A.1 Cybersecurity Framework Implementation',
          description:
            'Cybersecurity Framework and Controls:\n\nNIST Cybersecurity Framework Implementation:\n- Identify: Comprehensive asset inventory and risk assessment\n- Protect: Multi-layered security controls and access management\n- Detect: Continuous monitoring and threat detection\n- Respond: Incident response procedures and recovery plans\n- Recover: Business continuity and disaster recovery capabilities\n\nSecurity Control Implementation:\n- Access Control (AC): Role-based access control with least privilege\n- Awareness and Training (AT): Security awareness and training programs\n- Audit and Accountability (AU): Comprehensive audit logging and monitoring\n- Configuration Management (CM): Secure configuration management\n- Contingency Planning (CP): Business continuity and disaster recovery\n- Identification and Authentication (IA): Multi-factor authentication\n- Incident Response (IR): Formal incident response procedures\n- Maintenance (MA): Secure maintenance procedures\n- Media Protection (MP): Data protection and secure disposal\n- Physical and Environmental Protection (PE): Physical security controls\n- Planning (PL): Security planning and documentation\n- Personnel Security (PS): Personnel security procedures\n- Risk Assessment (RA): Continuous risk assessment and management\n- System and Services Acquisition (SA): Secure acquisition procedures\n- System and Communications Protection (SC): Network and system protection\n- System and Information Integrity (SI): System integrity monitoring\n\nCompliance Monitoring:\n- Continuous compliance assessment and validation\n- Automated security control testing and verification\n- Regular security assessments and penetration testing\n- Compliance reporting and documentation',
          maturityLevel: 4,
          cmmiPaIds: ['PPQA', 'RSKM'],
          children: [],
        },
      ],
    },
    cimpSectionQ: {
      id: 'cimpSectionQ',
      title: 'Section Q - Software Security',
      description:
        'This section describes software security implementation including data input validation, integrity checking, quality assurance, and supply chain management.',
      maturityLevel: 4,
      cmmiPaIds: ['TS', 'PPQA', 'SAM'],
      children: [
        {
          id: 'cimpQ.1',
          title: 'Q.1 Data Input Validation',
          description:
            'Data Input Validation Implementation:\n\nInput Validation Framework:\n- Comprehensive input validation for all user inputs\n- Server-side validation for all API communications\n- Type checking and format validation\n- Range and boundary validation\n- Malicious input detection and prevention\n\nValidation Techniques:\n- Whitelist validation for known good inputs\n- Blacklist validation for known malicious patterns\n- Regular expression validation for format checking\n- Schema validation for structured data\n- Encoding validation for character sets\n\nSecurity Controls:\n- SQL injection prevention (not applicable - no SQL database)\n- Cross-Site Scripting (XSS) prevention\n- Command injection prevention\n- Path traversal prevention\n- Buffer overflow prevention\n\nImplementation Details:\n- TypeScript type checking for compile-time validation\n- Runtime validation using validation libraries\n- Sanitization of all user inputs\n- Error handling without information disclosure\n- Logging of validation failures for security monitoring',
          maturityLevel: 4,
          cmmiPaIds: ['TS', 'PPQA'],
          children: [],
        },
        {
          id: 'cimpQ.2',
          title: 'Q.2 Integrity Checking',
          description:
            'Integrity Checking Implementation:\n\nData Integrity Controls:\n- Cryptographic hash verification for data integrity\n- Digital signatures for data authenticity\n- Checksums for file integrity verification\n- Version control for change tracking\n- Audit trails for data modification tracking\n\nCode Integrity:\n- Subresource Integrity (SRI) for external resources\n- Code signing for software distribution\n- Hash verification for dependencies\n- Build integrity verification\n- Runtime integrity monitoring\n\nSystem Integrity:\n- File system integrity monitoring\n- Configuration integrity checking\n- Memory integrity protection\n- Process integrity verification\n- Network communication integrity\n\nImplementation Mechanisms:\n- SHA-256 hashing for data integrity\n- HMAC for authenticated integrity\n- Digital certificates for authenticity\n- Blockchain-style audit trails\n- Real-time integrity monitoring and alerting',
          maturityLevel: 4,
          cmmiPaIds: ['TS', 'PPQA'],
          children: [],
        },
      ],
    },
    uiux_style_guide: {
      id: 'uiux_style_guide',
      title: 'UI/UX Style Guide & Design Compliance Standards',
      content: [
        {
          id: 'uiux1',
          title: '1. Design System Overview',
          description:
            'Comprehensive design system and style guide for the Ignition AI Project Dashboard, establishing visual consistency, accessibility standards, and design compliance criteria.',
          maturityLevel: 4,
          cmmiPaIds: ['TS', 'PPQA'],
          children: [
            {
              id: 'uiux1.1',
              title: '1.1 Design Philosophy',
              description:
                'Design Philosophy and Principles:\n\nCORE DESIGN PRINCIPLES:\n- Clarity: Information hierarchy that guides users naturally\n- Consistency: Unified visual language across all interfaces\n- Accessibility: WCAG 2.1 AA compliance for inclusive design\n- Efficiency: Streamlined workflows that minimize cognitive load\n- Trust: Professional aesthetics that inspire confidence\n\nDESIGN SYSTEM GOALS:\n- Accelerate development with reusable components\n- Ensure consistent user experience across all features\n- Maintain accessibility and compliance standards\n- Support scalable design decisions\n- Enable design quality assessment and validation\n\nVISUAL IDENTITY:\n- Modern, professional aesthetic suitable for enterprise environments\n- Dark theme optimized for extended use and reduced eye strain\n- High contrast ratios for accessibility compliance\n- Subtle animations that enhance usability without distraction\n- Clean typography that supports readability and comprehension\n\nUSER EXPERIENCE PRINCIPLES:\n- Progressive disclosure: Show relevant information at the right time\n- Contextual help: Provide assistance where users need it most\n- Error prevention: Design to prevent mistakes before they occur\n- Feedback loops: Clear indication of system status and user actions\n- Responsive design: Optimal experience across all device sizes',
              maturityLevel: 4,
              cmmiPaIds: ['TS'],
              children: [],
            },
            {
              id: 'uiux1.2',
              title: '1.2 Brand Guidelines',
              description:
                'Brand Identity and Visual Standards:\n\nCOLOR PALETTE:\nPrimary Colors:\n- Brand Primary: #3B82F6 (Blue) - Primary actions, links, focus states\n- Brand Secondary: #8B5CF6 (Purple) - Secondary actions, highlights\n- Success: #10B981 (Green) - Success states, positive feedback\n- Warning: #F59E0B (Amber) - Warnings, caution states\n- Error: #EF4444 (Red) - Errors, destructive actions\n- Info: #06B6D4 (Cyan) - Information, neutral feedback\n\nNeutral Colors:\n- Gray 50: #F9FAFB - Lightest backgrounds\n- Gray 100: #F3F4F6 - Light backgrounds\n- Gray 200: #E5E7EB - Borders, dividers\n- Gray 300: #D1D5DB - Disabled states\n- Gray 400: #9CA3AF - Placeholder text\n- Gray 500: #6B7280 - Secondary text\n- Gray 600: #4B5563 - Primary text (light theme)\n- Gray 700: #374151 - Dark backgrounds\n- Gray 800: #1F2937 - Darker backgrounds\n- Gray 900: #111827 - Darkest backgrounds\n- White: #FFFFFF - Text on dark backgrounds\n\nTYPOGRAPHY:\nFont Family: Inter (system fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)\n\nType Scale:\n- Display: 48px/56px - Hero headings\n- H1: 36px/44px - Page titles\n- H2: 30px/36px - Section headings\n- H3: 24px/32px - Subsection headings\n- H4: 20px/28px - Component headings\n- H5: 18px/28px - Small headings\n- H6: 16px/24px - Smallest headings\n- Body Large: 18px/28px - Large body text\n- Body: 16px/24px - Default body text\n- Body Small: 14px/20px - Small body text\n- Caption: 12px/16px - Captions, labels\n\nFont Weights:\n- Light: 300 - Minimal use for large text\n- Regular: 400 - Default body text\n- Medium: 500 - Emphasis, labels\n- Semibold: 600 - Headings, important text\n- Bold: 700 - Strong emphasis\n\nICONOGRAPHY:\n- Icon Library: Lucide React (consistent style, comprehensive coverage)\n- Icon Sizes: 16px, 20px, 24px, 32px, 48px\n- Icon Style: Outline style for consistency\n- Icon Colors: Inherit from parent or use semantic colors',
              maturityLevel: 4,
              cmmiPaIds: ['TS'],
              children: [],
            },
          ],
        },
        {
          id: 'uiux3',
          title: '3. Accessibility Standards',
          description:
            'Comprehensive accessibility guidelines ensuring WCAG 2.1 AA compliance and inclusive design practices.',
          maturityLevel: 4,
          cmmiPaIds: ['TS', 'PPQA'],
          children: [
            {
              id: 'uiux3.1',
              title: '3.1 WCAG 2.1 AA Compliance',
              description:
                'Web Content Accessibility Guidelines Implementation:\n\nCOLOR AND CONTRAST:\n- Text contrast ratio: Minimum 4.5:1 for normal text\n- Large text contrast ratio: Minimum 3:1 for 18pt+ or 14pt+ bold\n- Non-text contrast ratio: Minimum 3:1 for UI components and graphics\n- Color independence: Information not conveyed by color alone\n- Focus indicators: Minimum 3:1 contrast ratio against background\n\nKEYBOARD NAVIGATION:\n- Tab order: Logical and intuitive navigation sequence\n- Focus management: Clear visual focus indicators\n- Keyboard shortcuts: Standard shortcuts supported (Tab, Enter, Space, Arrow keys)\n- Skip links: "Skip to main content" for screen readers\n- Trapped focus: Modal dialogs and dropdowns properly manage focus\n\nSCREEN READER SUPPORT:\n- Semantic HTML: Proper heading hierarchy (h1-h6)\n- ARIA labels: Descriptive labels for interactive elements\n- ARIA roles: Appropriate roles for custom components\n- ARIA states: Dynamic state changes announced\n- Alt text: Descriptive alternative text for images and icons\n\nRESPONSIVE DESIGN:\n- Zoom support: 200% zoom without horizontal scrolling\n- Reflow: Content reflows at 320px viewport width\n- Touch targets: Minimum 44px × 44px for interactive elements\n- Orientation: Content works in both portrait and landscape\n\nTIMING AND MOTION:\n- Auto-playing content: User control over auto-playing media\n- Animation controls: Respect prefers-reduced-motion setting\n- Session timeouts: Adequate warning and extension options\n- Flashing content: No content flashes more than 3 times per second',
              maturityLevel: 4,
              cmmiPaIds: ['TS', 'PPQA'],
              children: [],
            },
          ],
        },
        {
          id: 'uiux4',
          title: '4. Design Compliance Assessment',
          description:
            'Framework for evaluating design compliance against established standards and guidelines.',
          maturityLevel: 4,
          cmmiPaIds: ['PPQA', 'VER'],
          children: [
            {
              id: 'uiux4.1',
              title: '4.1 Design Review Checklist',
              description:
                'Comprehensive Design Compliance Checklist:\n\nVISUAL CONSISTENCY:\n□ Color palette adherence: All colors from approved palette\n□ Typography consistency: Approved fonts and type scale\n□ Spacing consistency: 8px grid system followed\n□ Component usage: Standard components used correctly\n□ Icon consistency: Lucide icons used throughout\n\nACCESSIBILITY COMPLIANCE:\n□ Color contrast: All text meets 4.5:1 minimum ratio\n□ Focus indicators: Visible focus states on all interactive elements\n□ Keyboard navigation: All functionality accessible via keyboard\n□ Screen reader support: Proper ARIA labels and semantic HTML\n□ Touch targets: Minimum 44px × 44px for mobile interactions\n\nUSABILITY STANDARDS:\n□ Information hierarchy: Clear visual hierarchy established\n□ Error handling: Clear error messages and recovery paths\n□ Loading states: Appropriate feedback during async operations\n□ Empty states: Helpful guidance when no content available\n□ Responsive design: Optimal experience across device sizes\n\nPERFORMANCE CONSIDERATIONS:\n□ Image optimization: Appropriate formats and sizes\n□ Animation performance: 60fps animations, GPU acceleration\n□ Bundle size: Minimal impact on application load time\n□ Lazy loading: Non-critical content loaded on demand\n\nCOMPLIANCE SCORING:\n- Critical Issues (0 points): Accessibility violations, broken functionality\n- Major Issues (1 point): Significant usability problems, inconsistencies\n- Minor Issues (2 points): Small deviations from standards\n- Compliant (3 points): Meets all requirements and standards\n\nMINIMUM PASSING SCORE: 85% (Critical issues = automatic failure)',
              maturityLevel: 4,
              cmmiPaIds: ['PPQA', 'VER'],
              children: [],
            },
          ],
        },
      ],
    },
  },
  requirements: [
    {
      id: 'REQ-001',
      description:
        'The system shall allow users to create, edit, and save multiple project documents.',
      status: 'Implemented',
      priority: 'High',
      ...defaultAuditFields,
    },
    {
      id: 'REQ-002',
      description:
        'The system shall provide AI-powered assistance for content improvement.',
      status: 'Implemented',
      priority: 'High',
      ...defaultAuditFields,
    },
    {
      id: 'REQ-003',
      description: 'The application must load in under 3 seconds.',
      status: 'Verified',
      priority: 'Medium',
      ...defaultAuditFields,
    },
    {
      id: 'REQ-004',
      description: 'All user data must be stored locally in the browser.',
      status: 'Verified',
      priority: 'High',
      ...defaultAuditFields,
    },
    {
      id: 'REQ-005',
      description: 'The system shall allow project data export and import.',
      status: 'Implemented',
      priority: 'Medium',
      ...defaultAuditFields,
    },
    {
      id: 'REQ-006',
      description: 'The system shall display a traceability matrix.',
      status: 'Proposed',
      priority: 'Low',
      ...defaultAuditFields,
    },
  ],
  testCases: [
    {
      id: 'TC-001',
      description: 'Verify document creation and saving.',
      status: 'Passed',
      gherkin:
        "Feature: Document Management\n  Scenario: User creates and saves a new document\n    Given the user is on the Documents page\n    When the user creates a new document titled 'Test Doc'\n    And fills in the content\n    And clicks 'Save'\n    Then a document named 'Test Doc' should exist in the project.",
      ...defaultAuditFields,
    },
    {
      id: 'TC-002',
      description: 'Verify AI content improvement functionality.',
      status: 'Passed',
      ...defaultAuditFields,
    },
    {
      id: 'TC-003',
      description: 'Measure initial application load time.',
      status: 'Passed',
      ...defaultAuditFields,
    },
    {
      id: 'TC-004',
      description: 'Verify data is stored in localStorage.',
      status: 'Passed',
      ...defaultAuditFields,
    },
    {
      id: 'TC-005',
      description: 'Verify project export and import feature.',
      status: 'Failed',
      ...defaultAuditFields,
    },
  ],
  configurationItems: [
    {
      id: 'CI-001',
      name: 'Gemini API Module',
      type: 'Software Component',
      version: '1.0.0',
      status: 'In Development',
      ...defaultAuditFields,
    },
    {
      id: 'CI-002',
      name: 'UI Component Library',
      type: 'Software Component',
      version: '2.1.3',
      status: 'Baseline',
      ...defaultAuditFields,
    },
    {
      id: 'CI-003',
      name: 'Software Development Plan',
      type: 'Document',
      version: '1.2.0',
      status: 'Baseline',
      ...defaultAuditFields,
    },
    {
      id: 'CI-004',
      name: 'Local Storage Persistence Layer',
      type: 'Architectural Product',
      version: '1.0.0',
      status: 'Baseline',
      dependencies: ['CI-002'],
      designPatterns: 'Singleton, Facade',
      keyInterfaces: 'saveProject(data)\nloadProject()\nclearProject()',
      ...defaultAuditFields,
    },
  ],
  risks: [
    {
      id: 'RISK-001',
      description:
        'Changes in external APIs (Gemini, GitHub) breaking functionality.',
      probability: 'Medium',
      impact: 'High',
      status: 'Open',
      ...defaultAuditFields,
    },
    {
      id: 'RISK-002',
      description: 'Data loss due to browser clearing localStorage.',
      probability: 'Low',
      impact: 'High',
      status: 'Mitigated',
      ...defaultAuditFields,
    },
  ],
  processAssets: [],
  links: {
    'REQ-001': { tests: ['TC-001'], risks: [], cis: ['CI-003'], issues: [] },
    'REQ-002': {
      tests: ['TC-002'],
      risks: ['RISK-001'],
      cis: ['CI-001'],
      issues: [],
    },
    'REQ-003': { tests: ['TC-003'], risks: [], cis: ['CI-002'], issues: [] },
    'REQ-004': {
      tests: ['TC-004'],
      risks: ['RISK-002'],
      cis: ['CI-004'],
      issues: [],
    },
    'REQ-005': { tests: ['TC-005'], risks: ['RISK-002'], cis: [], issues: [] },
    'REQ-006': { tests: [], risks: [], cis: [], issues: [] },
  },
  riskCiLinks: {
    'RISK-001': ['CI-001'],
    'RISK-002': ['CI-004'],
  },
  issueCiLinks: {},
  issueRiskLinks: {},
  assetLinks: {},
  assetUsage: {},
  auditLog: [],
  organizationalData: undefined,
  abTests: [],
  assetEvolutionHistory: [],
  architecturalViews: [],
  architecturalPatterns: [],
  architecturalAnalysis: undefined,
  technologyPortfolio: undefined,
  developmentWorkflows: [],
  developmentActivities: [],
  processComplianceStatus: undefined,
};
