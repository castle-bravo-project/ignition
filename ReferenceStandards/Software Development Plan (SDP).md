DATA ITEM DESCRIPTION
Title: Software Development Plan (SDP)

Number: DI-IPSC-81427B Approval Date: 20170313
AMSC Number: N9775 Limitation: N/A
DTIC Applicable: No GIDEP Applicable: No
Preparing Activity: EC Project Number: IPSC-2017-
Applicable Forms: N/A

Use/relationship: The Software Development Plan (SDP) with Agile, Cyber Security and Safety
Assurance contains the format, content, and delivery timeframes for the SDP. The SDP provides
the acquirer insight into, and a tool for monitoring, the processes to be followed for software
development, the methods to be used, the approach to be followed for each activity, and project
schedules, organization, and resources. This DID is useful for new development, modification,
reuse, reengineering, maintenance, and other activities resulting in software products.

```
This Data Item Description contains the format, content, and intended use information for the
data product resulting from the work task described by the contract.
```

```
This DID supersedes DI-IPSC-81427A.
```

Requirements:

1. Referenced documents. This section shall list the number, title, revision, and date of all
   documents referenced in this plan. This section shall also identify the source for all documents
   not available through normal Government stocking activities. The complete address or website
   or other conditions for availability will be described.
2. Format. The SDP shall adhere to the format described under Content.
3. Content:

```
3.1. Identification. This paragraph shall contain a full identification of the system and the
software to which this document applies, including, as applicable, identification number(s),
title(s), abbreviation(s), version number(s), and release number(s).
```

```
3.2. System overview. This paragraph shall briefly state the purpose of the system and the
software to which this document applies. It shall describe the general nature of the system and
software; summarize the history of system development, operation, and maintenance; identify
the project sponsor, acquirer, user, developer, and support agencies; identify current and planned
operating sites; and list other relevant documents.
```

```
Source: http://assist.dla.mil -- Downloaded: 2025-07-06T06:31Z
```

```
3.3. Document overview. This paragraph shall summarize the purpose and contents of this
document and shall describe any security or privacy considerations associated with its use.
```

```
3.4. Relationship to other plans. This paragraph shall describe the relationship, if any, of the
SDP to other project management plans.
```

```
3.5. Overview of required work. This section shall be divided into paragraphs as needed to
establish the context for the planning described in later sections. It shall include, as applicable, an
overview of:
```

```
Requirements and constraints on the system and software to be developed
Requirements and constraints on project documentation
Position of the project in the system life cycle
The selected program/acquisition strategy or any requirements or constraints on it
Requirements and constraints on project schedules and resources
Other requirements and constraints, such as on project security, privacy, methods,
standards interdependencies in hardware and software development, etc.
```

3.6. Plans for performing general software development activities. This section shall be divided
into the following paragraphs. Provisions corresponding to non-required activities may be
satisfied by the words "Not applicable." If different builds or different software on the project
require different planning, these differences shall be noted in the paragraphs. In addition to the
content specified below, each paragraph shall identify applicable risks/uncertainties and plans for
dealing with them.

a. Software development process. This paragraph shall describe the software
development process to be used. The planning shall cover all contractual clauses concerning this
topic, identifying planned builds, if applicable, their objectives, and the software development
activities to be performed in each build. This paragraph shall include why the approach was
chosen and provide a description of previous experience in developing software of the same
nature as being acquired.

```
b. If the software development process is an Agile process, the following must be
addressed within this section or subsection(s):
```

1. Cite the Agile technique(s) being employed (Scrum, pair programming,
   extreme programming, etc.).
2. For each Agile technique employed, describe your approach.
3. Describe the approach for release planning.
4. For Scrum, identify the sprint length and how it was determined.
5. Describe how the backlog is initially established, and the process for
   modifying and re-prioritizing it.
6. For Scrum, describe the typical sprint activities, and what happens during each
   iteration.
7. Identify the Product Owner and his/her roles/responsibilities.

```
Source: http://assist.dla.mil -- Downloaded: 2025-07-06T06:31Z
```

### 10.

### 11.

### 12.

### 13.

### 14.

### 15.

### 16.

### 17.

### 18.

### 19.

### 20.

### 21.

### 22.

### 23.

### 24.

### 25.

```
Describe the acquirer’s role in the sprints if the customer is not also the
Product Owner.
Describe the mechanism for getting acquirer ( or end user) feedback for each
sprint.
Describe how the product (working, useful piece of software) will be
demonstrated to the Product Owner after each sprint (e.g., live demo on real
equipment, in the lab with sim/stim, PowerPoint slides, etc.).
Describe the handling of incomplete user stories, unsatisfactory user stories,
and bugs, and how they are factored back into the backlog.
Describe your Configuration Management process for keeping track of which
user stories passed without any rework needed, which require rework, and
which failed.
Describe your approach to artifact delivery; when documents such as the SRS,
SDD, Software Test Plan and System Integration Plan will be available.
Discuss your approach to refactoring.
List and describe the software metrics to be used.
Discuss your approach to paying off technical debt.
Describe how you will determine story points for the velocity metric.
Describe your Integrated Requirements Toolset (IRT) that traces user stories to
mission threads and KPPs, and whether this is a commercial tool or a tool
developed by your organization.
Describe how software development activities will be coordinated with the
Integration and Test (I&T) team, and how it will be assured that the I&T team
can keep up with testing all the software releases.
Describe how sprint-to-sprint dependencies (related to product and
development resources) will be resolved and factored into the Sprint/Release
Plan.
Describe your strategy/mechanism for keep multiple sprint teams in sync.
Describe how the integrity of the baseline is maintained for use in the
development of the next sprint.
Describe how regression testing will be conducted for each sprint release for all
previous functions released.
Describe how automated testing techniques will be used for sprint and/or
regression testing.
Describe how the software development effort will be synchronized and
coordinated with systems engineering activities and reviews.
```

3.7. General plans for software development. This paragraph shall be divided into the following
subparagraphs.

```
Source: http://assist.dla.mil -- Downloaded: 2025-07-06T06:31Z
```

a. Software development methods. This paragraph shall describe or reference the
software development methods to be used. Included shall be descriptions of the manual and
automated tools and procedures to be used in support of these methods. The methods shall cover
all contractual clauses concerning this topic. Reference may be made to other paragraphs in this
plan if the methods are better described in context with the activities to which they will be
applied.

b. Standards for software products. This paragraph shall describe or reference the
standards to be followed for representing requirements, design, code, test cases, test procedures,
and test results. The standards shall cover all contractual clauses concerning this topic. Reference
may be made to other paragraphs in this plan if the standards are better described in context with
the activities to which they will be applied. Standards for code shall be provided for each
programming language to be used. They shall include at a minimum:

1. Standards for format (such as indentation, spacing, capitalization, and order of
   information)
2. Standards for header comments (requiring, for example, name/identifier of the
   code; version identification; modification history; purpose; requirements and design decisions
   implemented; notes on the processing (such as algorithms used, assumptions, constraints,
   limitations, and side effects); and notes on the data (inputs, outputs, variables, data structures,
   etc.)
3. Standards for other comments (such as required number and content expectations)
4. Naming conventions for variables, parameters, packages, procedures, files, etc.
5. Restrictions, if any, on the use of programming language constructs or features
6. Restrictions, if any, on the complexity of code aggregates

```
c. Reusable software products. This paragraph shall be divided into the following
subparagraphs.
```

1. Incorporating reusable software products. This paragraph shall describe the
   approach to be followed for identifying, evaluating, and incorporating reusable software
   products, including the scope of the search for such products and the criteria to be used for their
   evaluation. It shall cover all contractual clauses concerning this topic. Candidate or selected
   reusable software products known at the time this plan is prepared or updated shall be identified
   and described, together with benefits, drawbacks, and restrictions, as applicable, associated with
   their use.
2. Developing reusable software products. This paragraph shall describe the
   approach to be followed for identifying, evaluating, and reporting opportunities for developing
   reusable software products. It shall cover all contractual clauses concerning this topic.

```
d. Handling of critical requirements. This paragraph shall be divided into the following
subparagraphs to describe the approach to be followed for handling requirements designated
critical. The planning in each subparagraph shall cover all contractual clauses concerning the
identified topic.
```

```
Source: http://assist.dla.mil -- Downloaded: 2025-07-06T06:31Z
```

1. Safety Assurance
   a. Software Requirements
   b. System Software Architecture and Software Preliminary Design
   c. Software Detailed Design
   d. Software Coding and Unit Test
   e. Computer Software Component (CSC) Integration and Test
   f. Computer Software Configuration Item (CSCI) Formal Qualification
   Test (FQT)
   g. Subsystem Integration and Test
   h. System Qualification Test
2. Cyber-Security / Software Assurance
   a. Software Requirements
   System Software Architecture and Software Preliminary Design
   Software Detailed Design
   Software Coding and Unit Test
   CSC Integration and Test
   CSCIFQT
   Subsystem Integration and Test
   System Qualification Test
   Describe the mechanism to address constant emerging cyber-security
   requirements.

3. Assurance of other critical requirements

f. Computer hardware resource utilization. This paragraph shall describe the approach
to be followed for allocating computer hardware resources and monitoring their utilization. It
shall cover all contractual clauses concerning this topic.

g. Recording rationale. This paragraph shall describe the approach to be followed for
recording rationale that will be useful to the support agency for key decisions made on the
project. It shall interpret the term "key decisions" for the project and state where the rationales
are to be recorded. It shall cover all contractual clauses concerning this topic.

```
h. Access for acquirer review. This paragraph shall describe the approach to be followed
for providing the acquirer or its authorized representative access to developer and subcontractor
facilities for review of software products and activities. It shall cover all contractual clauses
concerning this topic.
```

3.8. Plans for performing detailed software development activities. This section shall be divided
into the following paragraphs. Provisions corresponding to non-required activities may be
satisfied by the words "Not applicable." If different builds or different software on the project
require different planning, these differences shall be noted in the paragraphs. The discussion of
each activity shall include the approach (methods/procedures/tools) to be applied to: 1) the
analysis or other technical tasks involved; 2) the recording of results; and, 3) the preparation of

```
Source: http://assist.dla.mil -- Downloaded: 2025-07-06T06:31Z
```

associated deliverables, if applicable. The discussion shall also identify applicable
risks/uncertainties and plans for dealing with them.

a. Project planning and oversight. This paragraph shall be divided into the following
subparagraphs to describe the approach to be followed for project planning and oversight. The
planning in each subparagraph shall cover all contractual clauses regarding the identified topic.

```
Software development planning (covering updates to this plan)
CSCI test planning
System test planning
Software installation planning
Software transition planning
S Following and updating plans, including the intervals for management review
```

```
b. Establishing a software development environment. This paragraph shall be divided
into the following subparagraphs to describe the approach to be followed for establishing,
controlling, and maintaining a software development environment. The planning in each
subparagraph shall cover all contractual clauses regarding the identified topic.
```

. Software engineering environment
Software test environment
. Software development library
. Software development files
. Non-deliverable software
oL. Software assurance considerations, including on tool selection

### AW

```
c. System requirements analysis. This paragraph shall be divided into the following
subparagraphs to describe the approach to be followed for participating in system requirements
analysis. The planning in each subparagraph shall cover all contractual clauses regarding the
identified topic.
```

1. Analysis of user input
2. Operational concept
3. System requirements

```
d. System design. This paragraph shall be divided into the following subparagraphs to
describe the approach to be followed for participating in system design. The planning in each
subparagraph shall cover all contractual clauses regarding the identified topic.
```

1. System-wide design decisions
2. System architectural design

```
e. Software requirements analysis. This paragraph shall describe the approach to be
followed for software requirements analysis. The approach shall cover all contractual clauses
concerning this topic.
```

```
Source: http://assist.dla.mil -- Downloaded: 2025-07-06T06:31Z
```

```
f. Software design. This paragraph shall be divided into the following subparagraphs to
describe the approach to be followed for software design. The planning in each subparagraph
shall cover all contractual clauses regarding the identified topic.
```

1. CSCI-wide design decisions
2. CSCI architectural design
3. CSCI detailed design

g. Peer Review. This paragraph shall describe the peer review process covering: System
requirements, system design, software requirements, software design, software implementation
and software testing.

```
h. Coding Standards. This paragraph shall describe the uniform set of rules and
guidelines of the project and organization used for software development. This shall include
standards for the creation and sustainment of secure systems.
```

i. Software implementation and unit testing. This paragraph shall be divided into the
following subparagraphs to describe the approach to be followed for software implementation
and unit testing. The planning in each subparagraph shall cover all contractual clauses regarding
the identified topic.

. Software implementation
. Preparing for unit testing
. Performing unit testing
. Revision and retesting
(VI. Analyzing and recording unit test results

```
SRV
```

j. Unit integration and testing. This paragraph shall be divided into the following
subparagraphs to describe the approach to be followed for unit integration and testing. The
planning in each subparagraph shall cover all contractual clauses regarding the identified topic.

1. Preparing for unit integration and testing
2. Performing unit integration and testing
3. Revision and retesting
4. Analyzing and recording unit integration and test results

k. CSCI qualification testing. This paragraph shall be divided into the following
subparagraphs to describe the approach to be followed for CSCI qualification testing. The
planning in each subparagraph shall cover all contractual clauses regarding the identified topic.

. Independence in CSCI qualification testing
. Testing on the target computer system
. Preparing for CSCI qualification testing
. Dry run of CSCI qualification testing
. Performing CSCI qualification testing
O. Revision and retesting

```
AW
```

```
-
```

```
Source: http://assist.dla.mil -- Downloaded: 2025-07-06T06:31Z
```

7. Analyzing and recording CSCI qualification test results
1. CSC/HWCI integration and testing. This paragraph shall be divided into the following
   subparagraphs to describe the approach to be followed for participating in CSCUHWCI
   integration and testing. The planning in each subparagraph shall cover all contractual clauses
   regarding the identified topic.
1. Preparing for CSCI/HWCTI integration and testing
1. Performing CSC/HWCI integration and testing
1. Revision and retesting
1. Analyzing and recording CSCI/HWCT integration and test results

m. System qualification testing. This paragraph shall be divided into the following
subparagraphs to describe the approach to be followed for participating in system qualification
testing. The planning in each subparagraph shall cover all contractual clauses regarding the
identified topic.

. Independence in system qualification testing
. Testing on the target computer system
. Preparing for system qualification testing
Dry run of system qualification testing
. Performing system qualification testing
. Revision and retesting
. Analyzing and recording system qualification test results
. Describe the process to allow access by the government to the results of this code
evaluation on a real-time basis and shall address the use of automated code analyzers and
documented peer review process.

```
0
```

```
U
```

```
AW
```

n. Preparing for software use. This paragraph shall be divided into the following
subparagraphs to describe the approach to be followed for preparing for software use. The
planning in each subparagraph shall cover all contractual clauses regarding the identified topic.

1. Preparing the executable software
2. Preparing version descriptions for user sites
3. Preparing user manuals
4. Installation at user sites

o. Preparing for software transition. This paragraph shall be divided into the following
subparagraphs to describe the approach to be followed for preparing for software transition. The
planning in each subparagraph shall cover all contractual clauses regarding the identified topic.

. Preparing the executable software
. Preparing source files
. Preparing version descriptions for the support site
. Preparing the "as built" CSCI design and other software support information
[VIF. Updating the system design description

```
SRV
```

```
S
```

```
Source: http://assist.dla.mil -- Downloaded: 2025-07-06T06:31Z
```

6. Preparing support manuals
7. Transition to the designated support site 8. Details for proposed evaluation of code quality and removal of defects before the
   code leaves the hands of the software developers to the system integrators. This includes
   conformance to coding standards, as well as problems such as dead code, memory leaks and
   unreachable code

p. Software configuration management. This paragraph shall be divided into the
following subparagraphs to describe the approach to be followed for software configuration
management. The planning in each subparagraph shall cover all contractual clauses regarding the
identified topic.

. Configuration identification
. Configuration control
. Configuration status accounting
. Configuration audits
(VI. Packaging, storage, handling, and delivery

```
I
```

q. Software product evaluation. This paragraph shall be divided into the following
subparagraphs to describe the approach to be followed for software product evaluation. The
planning in each subparagraph shall cover all contractual clauses regarding the identified topic.

1. In-process and final software product evaluations
2. Software product evaluation records, including items to be recorded
3. Independence in software product evaluation
4. Software quality assurance. This paragraph shall be divided into the following
   subparagraphs to describe the approach to be followed for software quality assurance. The
   planning in each subparagraph shall cover all contractual clauses regarding the identified topic.
5. Software quality assurance evaluations
6. Software quality assurance records, including items to be recorded
7. Independence in software quality assurance

```
s. Corrective action. This paragraph shall be divided into the following subparagraphs to
describe the approach to be followed for corrective action. The planning in each subparagraph
shall cover all contractual clauses regarding the identified topic.
```

1. Problem/change reports, including items to be recorded (candidate items include
   project name, originator, problem number, problem name, software element or document
   affected, origination date, category and priority, description, analyst assigned to the problem,
   date assigned, date completed, analysis time, recommended solution, impacts, problem status,
   approval of solution, follow-up actions, corrector, correction date, version where corrected,
   correction time, description of solution implemented)
2. Corrective action system

```
Source: http://assist.dla.mil -- Downloaded: 2025-07-06T06:31Z
```

t. Joint technical and management reviews. This paragraph shall be divided into the
following subparagraphs to describe the approach to be followed for joint technical and
management reviews. The planning in each subparagraph shall cover all contractual clauses
regarding the identified topic.

1. Joint technical reviews, including a proposed set of reviews
2. Joint management reviews, including a proposed set of reviews

```
u. Other software development activities. This paragraph shall be divided into the
following subparagraphs to describe the approach to be followed for other software development
activities. The planning in each subparagraph shall cover all contractual clauses regarding the
identified topic.
```

. Risk management, including known risks and corresponding strategies
Software management indicators, including indicators to be used
. Security and privacy
. Subcontractor management
. Interface with software independent verification and validation (IV&V) agents
. Coordination with associate developers

## . Improvement of project processes

```
0. Other activities not covered elsewhere in the plan
```

```
U
```

```
AW
```

```
v. Schedules and activity network. This section shall present:
```

1. Schedule(s) identifying the activities in each build and showing initiation of each
   activity, availability of draft and final deliverables and other milestones, and completion of each
   activity
2. An activity network, depicting sequential relationships and dependencies among
   activities and identifying those activities that impose the greatest time restrictions on the project

3.9. Project organization and resources. This section shall be divided into the following
paragraphs to describe the project organization and resources to be applied in each build.

a. Project organization. This paragraph shall describe the organizational structure to be used
on the project, including the organizations involved, their relationships to one another, and the
authority and responsibility of each organization for carrying out required activities. This
paragraph shall also include the definition of Systems Engineering, Software Engineering,
Integrated Product and Process Development, and processes for the Division(s) responsible for
the development and the principle sub-contractors responsible for software development, as
applicable.

b. Project resources. This paragraph shall describe the resources to be applied to the project.
This section shall include a description of the extent to which personnel who contributed to these
previous efforts using these processes will be supporting this development effort. It shall include:

1. Personnel resources, including:

```
10
```

```
Source: http://assist.dla.mil -- Downloaded: 2025-07-06T06:31Z
```

a. The estimated staff-loading for the project (number of personnel over time)
b. The breakdown of the staff-loading numbers by responsibility (for example,
management, software engineering, software testing, software configuration management,
software product evaluation, software quality assurance)
c. A breakdown of the skill levels, geographic locations, and security clearances of
personnel performing each responsibility

2. Overview of developer facilities to be used, including geographic locations in which
   the work will be performed, facilities to be used, and secure areas and other features of the
   facilities as applicable to the contracted effort.
3. Acquirer-furnished equipment, software, services, documentation, data, and facilities
   required for the contracted effort. A schedule detailing when these items will be needed shall
   also be included.
4. Other required resources, including a plan for obtaining the resources, dates needed,
   and availability of each resource item.

3.10. Notes. This section shall contain any general information that aids in understanding
this document (e.g., background information, glossary, rationale). This section shall
include an alphabetical listing of all acronyms, abbreviations, and their meanings as used
in this document and a list of any terms and definitions needed to understand this
document.

3.11 Appendixes. Appendixes may be used to provide information published separately
for convenience in document maintenance (e.g., charts, classified data). As applicable,
each appendix shall be referenced in the main body of the document where the data
would normally have been provided. Appendixes may be bound as separate documents
for ease in handling. Appendixes shall be lettered alphabetically (A, B, etc.).

End of DI-IPSC-81427B

```
11
```

```
Source: http://assist.dla.mil -- Downloaded: 2025-07-06T06:31Z
```
