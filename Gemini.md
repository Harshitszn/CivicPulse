# CivicPulse — Project Instructions

CivicPulse is a civic grievance and municipal services platform.

IMPORTANT:
This project has ONE global visual identity and TWO interface structures.

==================================================
GLOBAL DESIGN SYSTEM
==================================================

DESIGN.md is the global visual source of truth for the entire application.

Use DESIGN.md for:

- colors
- color palette
- primary/secondary/accent colors
- theme
- typography
- fonts
- font weights
- font sizes
- line heights
- spacing
- border colors
- border radii
- shadows
- component visual styling
- buttons
- inputs
- cards
- badges
- general visual tone

Do NOT create a second independent visual identity.

==================================================
CITIZEN STRUCTURE
==================================================

Use the structure and interaction philosophy of FeedLoop from DESIGN.md.

Citizen pages:

Home
Local Issues Feed
Report Issue
Complaint Details
Comments
My Complaints
Profile
Pincode Selection

The citizen experience should feel like:

Instagram + Reddit + civic services.

Use:
- content-first posts
- scrollable feed
- image-centric complaint cards
- upvote/downvote
- comments
- sorting
- filtering
- mobile-friendly interaction

Do NOT make citizen pages look like a dashboard.

==================================================
MUNICIPAL STRUCTURE
==================================================

Use MUNICIPAL_DESIGN.md only for the MUNICIPAL STRUCTURE and INFORMATION ARCHITECTURE.

Municipal pages:

Dashboard
Complaints
Complaint Details
Map
Departments
Analytics
Citizens
Settings

Use its:
- sidebar structure
- header structure
- dashboard layout
- KPI arrangement
- tables
- filters
- analytics composition
- operational information density
- municipal workflow structure

However, ALL visual styling must still come from DESIGN.md.

Therefore:

MUNICIPAL_DESIGN.md provides:
STRUCTURE

DESIGN.md provides:
STYLE

Do NOT copy the Command Center color palette, fonts, independent theme, or unrelated visual identity if they conflict with DESIGN.md.

The municipal interface must visually belong to the same CivicPulse product as the citizen interface.

==================================================
SHARED DATA
==================================================

Both interfaces use the same:

- users
- complaints
- comments
- votes
- pincode data
- AI classification
- departments
- status
- verification data

Do not create separate duplicate business logic for citizen and municipal interfaces.

==================================================
ROUTING
==================================================

Citizen routes:

/
 /feed
 /report
 /complaint/:id
 /my-complaints
 /profile

Municipal routes:

/municipal/login
/municipal/dashboard
/municipal/complaints
/municipal/complaints/:id
/municipal/map
/municipal/departments
/municipal/analytics
/municipal/citizens
/municipal/settings

Create:

CitizenLayout
MunicipalLayout

CitizenLayout uses FeedLoop-style structure.

MunicipalLayout uses Command Center-style structure.

Both use the same DESIGN.md visual identity.

==================================================
IMPORTANT DEVELOPMENT RULES
==================================================

- Never replace working code unnecessarily.
- Never rebuild the project from scratch after the initial setup.
- Preserve existing functionality when adding features.
- Reuse components.
- Keep business logic separate from visual layout.
- Keep citizen and municipal layouts separate.
- Keep the global visual identity unified.