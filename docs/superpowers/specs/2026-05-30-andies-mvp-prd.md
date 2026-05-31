# Andies MVP PRD

Date: 2026-05-30
Status: Draft for review

## Product Summary

Andies is a web-friendly personal productivity app that helps a user build positive habits and achieve goals by caring for retro RPG-style avatars. Each avatar represents a life dimension the user wants to improve, such as Fitness, Career, Intellect, Relationships, Money, Creativity, or Spirituality.

The app starts with a diagnostic onboarding flow, creates a small set of personalized avatars called Andies, lets the user define each Andy's Needs, and then tracks daily/weekly follow-through through HP, badges, and AI-assisted reflections.

## MVP North Star

The MVP is successful when a user can:

1. Complete first setup and onboarding.
2. Create 1-3 Andies with Needs.
3. Check off today's Need instances as complete or missed.
4. See HP and badges change immediately.
5. Complete a daily reflection.
6. Review saved reflections and AI summaries over time.

The main product loop is: diagnose -> create Andies -> define Needs -> check in -> HP changes -> badges unlock -> reflect -> adjust behavior.

## Target User

The first user is Andy personally. The app should still support a reusable naming setup so the experience can adapt to other users later without changing product language.

The MVP does not include login or multi-user account management, but the data model should include an internal user identifier so future multi-user support is easier.

## First Setup

Before onboarding, the app shows a one-time name setup screen.

Required fields:

- Singular name: example `Andy`
- Plural name: example `Andies`

Optional field:

- User profile photo, taken with camera or uploaded from device.

The app uses these values dynamically:

- App title uses the plural name, such as `Andies`, `Sherries`, or `Agrims`.
- Avatar names use dimension plus singular name, such as `Fitness Andy`, `Career Andy`, or `Intellect Andy`.

The name setup appears only once in the MVP. Editing names later is out of scope.

If the user provides a profile photo, the app uses it as visual reference when generating Andy sprites. The app should keep generated sprites, but delete the raw uploaded photo by default after sprite generation unless a future setting explicitly allows retaining it.

## Day Zero Diagnostic

The Day Zero diagnostic collects free-form answers that help the AI identify life dimensions, current baseline, goals, and future coaching context.

Core questions:

1. How have you been feeling lately?
2. How have you been spending your time?
3. What do you want to get better at?
4. Where do you want to be at the end of this month?

AI behavior:

- The app requires an OpenAI API key for MVP AI features.
- If the key is missing, the app shows a setup message and does not run onboarding.
- The AI summarizes the user's Day Zero profile in fewer than 100 words.
- The AI may ask up to 5 clarifying questions.
- Clarifying questions are asked one at a time.
- Each clarifying question must help choose Andies, define Needs, or establish useful reflection/coaching context.

Stored output:

- Raw diagnostic answers
- Clarifying question answers
- Day Zero profile summary
- Extracted themes and likely life dimensions

## Andies

After Day Zero, the AI recommends exactly 3 Andies wherever possible. It may recommend fewer only when the diagnostic does not support 3 meaningful dimensions.

Each Andy has:

- Name
- Dimension
- Retro 16-bit inspired sprite generated from the user's profile photo and the Andy's life dimension, where a profile photo exists
- HP value
- HP state
- Needs
- Badges
- Recent HP events

Default HP:

- New Andies start at 50 HP.

Recommended dimensions may include:

- Fitness
- Career
- Intellect
- Relationships
- Money
- Creativity
- Spirituality

The user can review and edit all recommended Andies before starting.

Editable fields:

- Andy name
- Dimension label
- Sprite/archetype, if MVP UI exposes a choice
- Need wording
- Need type
- Need schedule
- Need duration

The user can remove or add Needs during review, capped at 3 Needs per Andy for MVP.

## Needs

Needs are the habits or goals required to keep an Andy healthy.

Each Andy can have up to 3 Needs in MVP.

Need types:

1. Scheduled recurring Need
2. Unscheduled daily check-in
3. Unscheduled weekly check-in
4. One-off task

### Scheduled Recurring Need

The user must define:

- Specific days of week
- Start time
- Duration

Example:

- Run on Monday, Wednesday, and Friday at 7:00am for 30 minutes.

Loose frequencies such as "3 times per week, anytime" are out of scope for MVP.

### Unscheduled Daily Check-In

Used for Needs that do not have a calendar time but should be evaluated daily.

Example:

- Spend less than $100 today.

### Unscheduled Weekly Check-In

Used for Needs that should be evaluated once per week.

Example:

- Call parents once this week.

### One-Off Task

Used for simple non-recurring goals.

Optional fields:

- Due date
- Due time
- Estimated duration

Milestones and multi-step project goals are out of scope for MVP.

## Need Instances

The app generates and stores Need instances ahead of time for the current week.

Instances can have these statuses:

- Pending
- Completed
- Missed

HP changes only when the user explicitly marks an instance as completed or missed.

Unmarked instances do not automatically penalize HP in MVP.

If the user edits a recurring Need schedule, the MVP should preserve completed and missed history and update only future unmarked instances.

## HP Rules

HP is the emotional feedback system for each Andy.

Rules:

- New Andy starts at 50 HP.
- Completed Need instance: +5 HP.
- Missed Need instance: -5 HP.
- HP is capped from 0 to 100.
- HP updates immediately after marking an instance.

HP states:

| HP Range | State | Visual Direction |
| --- | --- | --- |
| 0 | Dead | Dead/gray state |
| 1-9 | Dreadful | Red, severe distress |
| 10-24 | Poor | Yellow, weak/distressed |
| 25-74 | Normal | Orange/neutral |
| 75-89 | Healthy | Light green/glow |
| 90-99 | Very healthy | Dark green/strong glow |
| 100 | Powered up | Super Saiyan-style aura effect |

MVP visual implementation:

- Generate one base retro 16-bit inspired sprite per Andy when the user has provided a profile photo.
- Use built-in placeholder sprites when no profile photo exists or sprite generation fails.
- Use CSS effects, color shifts, tinting, glow, and aura effects to represent HP states.
- Full state-specific sprite sheets are deferred.

## Badges

Badges should reinforce the core loop without becoming a complex achievement system.

MVP badges:

- First Care: first completed Need.
- 3-Day Streak: at least one completed Need for the same Andy across 3 consecutive calendar days.
- 3 in a Row: the same recurring Need completed for 3 scheduled instances in a row.
- Perfect Week: all scheduled/check-in Need instances for one Andy completed in a calendar week.
- Comeback: complete a Need after previously marking a Need incomplete for that Andy.

Badge awards should be visible immediately after the action that unlocks them.

Each MVP badge must have a designed pixel-art badge image. Badge art should communicate both the achievement concept and the idea of an earned medal/badge. For MVP, badge images are static app assets for the five badge types, not generated per user.

## Home Screen

The post-onboarding home screen uses a vertical layout.

Top section: Andies dashboard

- Shows all active Andies.
- Each Andy card shows sprite, name, dimension, HP bar, HP value, HP state, and today's Need count.
- Clicking an Andy opens that Andy's detail view.

Below section: Today panel

- Shows today's scheduled Needs.
- Shows due daily check-ins.
- Shows due one-off tasks.
- Shows daily reflection prompt.
- Each Need instance has Complete and Missed actions.

Responsive behavior:

- Desktop can show Andies in a horizontal grid.
- Mobile stacks Andies and Today items vertically.
- MVP should be readable and usable on mobile, but desktop-first polish is acceptable.

## Andy Detail Screen

The Andy detail screen shows one Andy's progress and Needs.

Required content:

- Andy sprite and HP
- Needs list
- Current week completion progress
- Current month completion progress if available from stored instances
- Recent HP events
- Badges earned by or through this Andy

Required actions:

- Edit Andy
- Edit Needs
- Mark due instances complete/missed when applicable

## Reflections And Journal

The MVP includes a private Journal screen for daily and weekly reflections only.

Free-form anytime journaling is out of scope.

### Daily Reflection

The Today panel prompts the user to complete a daily reflection.

The AI generates 2-3 short reflection questions based on:

- Today's completed Needs
- Today's missed Needs
- HP changes
- Recent badges
- Recent reflections

The user answers in free form.

The AI then generates:

- Short daily summary
- Pattern notes
- Coaching-style observation

The app stores:

- Questions asked
- User answers
- AI summary
- Related date
- Related Need/Andy context

If AI generation fails, the app should fall back to fixed reflection questions.

Fallback questions:

1. What went well today?
2. What got in the way today?
3. What is one small adjustment for tomorrow?

### Weekly Review

Weekly review is generated when the user opens it.

The weekly review compares:

- Need completion
- Missed instances
- HP movement
- Badges earned
- Daily reflection themes

The AI should identify patterns in:

- Energy
- Avoidance
- Confidence
- Priorities
- Consistency

The app should frame AI output as coaching/reflection support, not medical or mental health diagnosis.

## AI Requirements

OpenAI-powered features:

- Day Zero profile summary
- Clarifying questions
- Andy recommendations
- Starter Need recommendations
- Profile-photo-based sprite generation
- Daily reflection questions
- Daily reflection summaries
- Weekly review summaries
- Reflection pattern comparison

Security requirement:

- The OpenAI API key must be stored server-side and never exposed in browser code.

Prompting requirements:

- AI should return structured data for app flows.
- AI should avoid diagnosing mental health conditions.
- AI should be concise, practical, and coach-like.
- AI should prefer concrete Needs that can be scheduled or checked off.
- Image generation should create original retro 16-bit inspired sprites based on the user's profile photo and the Andy dimension.

## Data Model

The MVP should support these entities:

- User
- Setup profile
- Diagnostic answer
- Day Zero profile
- Andy
- Need
- Need instance
- HP event
- Badge
- Reflection
- AI summary

Suggested fields:

### User

- id
- singularName
- pluralName
- profilePhotoStatus
- createdAt

### Day Zero Profile

- id
- userId
- rawAnswers
- clarifyingAnswers
- summary
- extractedDimensions
- createdAt

### Andy

- id
- userId
- name
- dimension
- hp
- spriteKey
- spriteUrl
- spriteGenerationStatus
- createdAt
- updatedAt

### Need

- id
- userId
- andyId
- title
- type
- schedule
- durationMinutes
- dueDateTime
- active
- createdAt
- updatedAt

### Need Instance

- id
- userId
- andyId
- needId
- scheduledFor
- durationMinutes
- status
- completedAt
- missedAt
- weekKey
- createdAt

### HP Event

- id
- userId
- andyId
- needInstanceId
- delta
- hpBefore
- hpAfter
- reason
- createdAt

### Badge

- id
- userId
- andyId
- badgeType
- title
- description
- awardedAt
- relatedNeedId
- relatedNeedInstanceId

### Reflection

- id
- userId
- type
- dateKey
- weekKey
- questions
- answers
- aiSummary
- patternNotes
- createdAt

## Technical Direction

Recommended stack:

- Next.js-style web app
- Convex for database and backend state
- Vercel as the recommended first live deployment target
- OpenAI API for AI features

Development approach:

1. Build and run locally first.
2. Verify the main flow works end to end.
3. Deploy to Vercel and Convex after the local MVP works.

Deployment portability:

- The app should not depend on Vercel-only behavior where avoidable.
- The app should remain portable to Node-capable hosts such as Render if deployment needs change.
- Cursor or Manus may be used as development/building assistants, but they are not treated as the primary production hosting target in the MVP spec.

Implementation rule:

- Ask before adding packages.

## External Platforms And Assets

Required for MVP:

- OpenAI API key
- Convex project

Required for live deployment:

- Vercel project
- Convex production deployment

Assets:

- Retro 16-bit inspired generated sprites
- Retro 16-bit inspired placeholder sprites for fallback
- CSS HP state effects
- Five designed pixel-art badge images

The MVP should not depend on a large finished avatar asset library.

## Deferred To MVP+1

- Google Calendar sync for scheduled Needs
- Telegram reminders, including end-of-day review prompt
- Full sprite variation library for each HP state
- Dimension-specific or user-specific badge image variants
- Login/auth
- Multi-user support
- Free-form journaling
- Milestone/project goals
- Loose recurring frequency scheduling
- Calendar editing conflict handling
- Advanced notification settings

## Key Assumptions

- No auth in MVP.
- One default user.
- Internal userId exists for future-proofing.
- Weekly period starts Monday.
- User timezone comes from the browser.
- Daily reflection appears in the Today panel.
- Profile photo upload is optional.
- Generated base sprites are used for MVP HP states with CSS effects rather than separate image files per HP state.
- The app prioritizes working product flow before visual polish.
- The UI should be simple and readable first, then enhanced toward the retro RPG style.

## Acceptance Criteria

The MVP is ready for review when:

1. A fresh user can complete name setup.
2. A fresh user can complete Day Zero diagnostic.
3. AI can generate a Day Zero summary under 100 words.
4. AI can recommend 1-3 Andies, preferably 3.
5. User can edit Andies and Needs before starting.
6. If a profile photo is provided, app can generate base sprites for recommended Andies or fall back gracefully.
7. App can generate current-week Need instances.
8. Home shows Andies dashboard above the Today panel.
9. User can mark Need instances complete or missed.
10. HP changes by +5 or -5 and stays between 0 and 100.
11. Badge awards trigger for MVP badge rules and display designed badge images.
12. User can complete daily reflection.
13. AI can generate daily reflection questions and a summary.
14. Journal shows saved daily reflections.
15. Weekly review generates on open.
16. App runs locally without broken main-flow screens.

## Non-Goals

- The MVP does not need real Google Calendar sync.
- The MVP does not need Telegram notifications.
- The MVP does not need production auth.
- The MVP does not need a full polished pixel-art library.
- The MVP does not need social/sharing features.
- The MVP does not need mobile-native app packaging.
