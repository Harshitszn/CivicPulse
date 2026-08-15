# CivicPulse Project Instructions

CivicPulse is a civic grievance and municipal services prototype.

IMPORTANT DESIGN ARCHITECTURE:

This project intentionally uses TWO design systems.

## CITIZEN PORTAL

Use:
DESIGN.md

DESIGN.md is the primary visual system for all citizen-facing experiences.

Citizen pages include:
- Home
- Local Issues Feed
- Report an Issue
- Complaint Details
- Comments
- Voting
- My Complaints
- Profile
- Pincode selection

The citizen interface should feel like a modern civic social platform inspired by:
- Instagram
- Reddit
- community feeds

Use FeedLoop's visual language:
- content-first
- scroll-optimized
- compact post cards
- strong media/image presentation
- easy scanning
- clean interaction controls
- mobile-friendly layouts

Do NOT make the citizen side look like a dashboard.

## MUNICIPAL PORTAL

Use:
MUNICIPAL_DESIGN.md

MUNICIPAL_DESIGN.md is the design system for municipal officers.

Municipal pages include:
- Login
- Dashboard
- Complaints
- Complaint details
- Map
- Departments
- Analytics
- Citizens
- Settings

Use the Command Center design strongly here:
- dark frosted sidebar
- dark header
- warm light workspace
- analytical cards
- tables
- charts
- filters
- status badges
- orange action language

Do NOT make the municipal side look like a social media feed.

## SHARED SYSTEM

Both interfaces use the same:
- backend
- database
- authentication/session
- complaints
- users
- comments
- votes
- AI classification
- pincode data
- status system

Only the presentation/layout differs.

## ROUTING

Citizen:
/
 /feed
 /report
 /complaint/:id
 /my-complaints
 /profile

Municipal:
/municipal/login
/municipal/dashboard
/municipal/complaints
/municipal/complaints/:id
/municipal/map
/municipal/departments
/municipal/analytics
/municipal/citizens
/municipal/settings

Never accidentally use the municipal Command Center shell on citizen pages.

Never accidentally use the citizen FeedLoop layout on municipal pages.

Preserve both design systems throughout development.