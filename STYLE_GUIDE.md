# Studio Board — Style Guide

Reference this before adding or restyling anything in `index.html`. The goal
is a single cohesive app, not a pile of one-off widgets — every new piece
should look like it was designed alongside the rest, not bolted on.

## 1. Page structure (top to bottom)

```
.app-topbar (position: sticky, top: 0)       ← one sticky unit, nothing else is sticky
  header                                      dark chrome: brand, who's online, account
  .team-bar                                   team picker (<select>) + Board Settings
  .toolbar                                    date nav + Day/Week/Matrix switch
main.main
  .app-shell  (flex row, stacks to column at 1100px, .board-content first when stacked)
    .scratch-sidebar-col  (380px)             Notes Dump card + Scratchboard boards
    .board-content        (flex: 1)           Day / Week / Matrix — the primary content
```

There is no permanent "Teams" panel — switching and managing teams both
happen through the one `#teamSelect` dropdown + its adjacent ⚙ button in
the team-bar. Don't resurrect a standing list-of-teams column; if teams
need more visibility than a dropdown gives, improve the dropdown (e.g.
grouping, search) rather than adding a second place to see them.

**Rule: `.app-topbar` is for truly global chrome only — header, team-bar,
toolbar — nothing else.** It's easy to assume "pinned" means "goes in the
topbar," but a feature that's *view content* (Notes Dump, Quick Add before
it) belongs in `.app-shell` instead, even if you want it visible on every
view — every view already shares `.scratch-sidebar-col`, so putting it
there gets you "visible everywhere" for free without growing the sticky
bar. (The Notes Dump bug that prompted this guide was exactly this
mistake: a content feature got placed in the topbar, ended up above the
header, and looked broken.)

**Rule: when `.app-shell` stacks (narrow screens), `.board-content` must
render first.** It's the primary content; the sidebars are supporting
tools. Use `order: -1` on `.board-content` inside the stacking media query
rather than reordering the HTML (the HTML order matters for the
side-by-side desktop layout).

**Rule: the outer 3-pane stack and any inner multi-column layout (like
Day/Week's Personal/Team columns) should collapse at the *same* breakpoint
(`1100px`), not different ones.** Otherwise you get a dead middle range
where the inside has already stacked but the outside hasn't caught up yet
(or vice versa), which is what "incohesive" usually turns out to mean in
practice.

**Rule: one quick-capture entry point.** Don't let two different "jot this
down fast" affordances coexist (this is why Quick Add was removed once
Notes Dump covered the same need) — if a new idea for capturing input
quickly comes up, extend Notes Dump rather than adding a second box next
to it.

## 2. Color tokens (`:root` CSS variables)

| Token | Use |
|---|---|
| `--cream` | page background |
| `--warm-white` | card/panel background (sits on top of cream) |
| `--panel` | secondary/recessed background — bars (team-bar, toolbar), input wells |
| `--ink` | header background, primary text, toast background |
| `--brown` | headings and labels set in Playfair Display |
| `--rust` | primary action color (Add buttons, Notes Dump accent, today-jump) |
| `--gold` | active/selected state, focus rings, secondary accent |
| `--light-brown` | hover background for panels/rows, neutral progress pill |
| `--border` | all hairline borders |
| `--muted` | secondary/meta text |
| `--success` / `--success-pale` | completed state, "all done" celebration |
| `--danger` | destructive actions, delete hover |

Don't introduce a new hex color inline — if nothing in the table fits, add
a token, don't hardcode. Anything inline like `style="border-left: 4px
solid ${color}"` should only ever be a *user-chosen* color (board colors),
never a UI color.

## 3. Typography

- **Playfair Display (italic)** — anything that *names* something: view
  labels (Day/Week/Matrix via `.vpill`), board titles, the team picker
  (`.team-select`), panel headers (`Scratchboards`, `Notes Dump`,
  `Needs Rating`), the Day hero date. All panel headers use the same
  non-italic `.notes-title` look specifically — Notes Dump matches
  Scratchboards exactly rather than having its own caption style, since
  they're siblings in the same sidebar. This is the "proper noun" font.
- **Lato** — everything else: body text, buttons, inputs, meta text.
- Uppercase + letterspaced Lato at `.56–.68rem` is the pattern for small
  eyebrow/caption labels (`.presence-label`, form row labels). Don't use
  this treatment for a panel's main header — that's Playfair (above).

## 4. Spacing

Stick to the existing scale rather than picking arbitrary values:
`.2rem .3rem .35rem .4rem .5rem .6rem .7rem .8rem 1rem 1.2rem`. Gaps
between sibling panels are `.8rem`–`1.2rem`; padding inside a panel is
`.5rem`–`.9rem`; padding inside a button/pill is `.25rem–.6rem`.

**Rule: don't add a UI element "just in case" it's handy.** This app went
through a round of removing a date-tile picker and a Quick Add box because
they took up space without earning it — Day/Week/Matrix nav already covers
that ground via the toolbar + the hero's prev/next arrows. Before adding a
new persistent control, check whether an existing one already does the
job with one more click, rather than giving it its own permanent row.

## 5. Component patterns — reuse these, don't reinvent

**Panel** (`.scratch-sidebar`, `.teams-panel`, `.completed-panel`): 1px
`--border`, `border-radius: 8px`, `--warm-white` background, `.6–.9rem`
padding, flex column with `.5–.7rem` gap.

**Bar** (`.team-bar`, `.toolbar`): full-width, flex row, `--panel`
background, `border-bottom: 1px solid var(--border)`, `0 1rem` horizontal
padding. These live in `.app-topbar` and never look like floating cards —
no border-radius, no margin, no centered max-width.

**Dashed "inbox" card** (`.notes-dump-card`): the one exception to the
solid-border panel look — `border: 1px dashed var(--rust)` on a warm tint
(`#fff7ef`), no title input. Reserved for "this is a quick/temporary
capture spot," as opposed to `.scratch-board`'s solid border + `--panel`
background for a named, intentional board. Don't reuse the dashed
treatment for anything that isn't literally that kind of inbox.

**Collapsible panel** (Notes Dump): a full-width header button (a chevron
on the right) that toggles a module-level `*Collapsed` boolean, persisted
to `localStorage` as `sb_<name>_${uid}`, re-rendered by calling its own
innerHTML update rather than the full `render()` where possible. Match
`toggleNotesDump` exactly when adding another one.

**Native `<select>` picker** (`.team-select`): for "choose one of a short,
named list and immediately act on it," a styled native `<select>` beats a
custom dropdown/menu — less code, free keyboard/accessibility support, and
nothing to position or click-outside-to-close. Reserve a custom popover
menu for cases where options need rich content (avatars, descriptions)
that a `<select>` can't render; a plain "pick one" choice like switching
teams doesn't need that.

**Pill button** (`.gact`, `.vpill`, `.pill-toggle`, `.btn`): fully rounded
(`border-radius: 999px`), 1px border, transparent/warm-white background,
hover darkens border + text color toward the relevant accent (gold for
neutral actions, rust for destructive-adjacent, danger for delete). Don't
make a new button shape — square/slightly-rounded buttons don't exist
anywhere else in this app.

**Round icon button** (`.note-del-btn`, `.team-row-gear`, `.goal-check`,
`.note-line-check`, `.board-visibility-btn`, `.week-nav-btn`): circular,
border + muted icon color by default, fills or changes border color on
hover/active. The small prev/next day arrows next to the hero date reuse
`.week-nav-btn` directly rather than inventing a new nav-arrow style —
do the same for any future "step back/forward one unit" control.

**Badge/count pill** (`.slot-count`, `.completed-count`, `.today-progress`):
small pill, `--light-brown` or status-tinted background, bold text. Reuse
`.slot-count` for "N items waiting" badges instead of inventing a new
badge class per feature.

## 6. Icons (emoji) — one meaning per icon, app-wide

| Icon | Meaning | Don't reuse for |
|---|---|---|
| 🛋️ | brand | — |
| 📥 | Notes Dump (inbox / capture-now-sort-later) | — |
| 🗒️ | Scratchboards (named boards) | Notes Dump — these are deliberately different icons even though both are "notes," because they're different mental models (a titled board vs. a single inbox) |
| 🔒 / 🌐 | private / public visibility toggle | anything else |
| ➕ | add (new line, new goal, new board, convert note→goal) | — |
| 📋 | copy to clipboard | — |
| ✕ | delete | — |
| ✓ / ✔ | done / complete / convert-confirmed | — |
| ⚙ | settings (Board Settings, next to the team picker) | — |
| 🔗 | join (a team) — an option inside the team `<select>` | — |
| 🎉 | celebratory, "all done for the day" — used sparingly, only in `.today-progress.all-done` | don't sprinkle it elsewhere or it stops meaning anything |

Before adding a new icon, check this table first — a collision (like 🗒️
briefly being used for both Scratchboard *and* Notes Dump) is exactly the
kind of thing that makes the app feel incohesive, because two visually
identical things turn out to mean different things.

## 7. Avoiding duplicate real estate

Before adding a new panel that shows information already visible
elsewhere (team name, member list, description, etc.), decide which panel
*owns* that information and have the other one link to it or omit it,
rather than showing it twice. Current ownership:

- **Team identity, switching, and management** → the `#teamSelect` picker
  + ⚙ button in `.team-bar`. There's no separate team-identity display
  anywhere else — a plain label repeating the selected team's name next to
  the dropdown would just be restating what the dropdown already shows.
- **"Who's online right now"** → the presence list in the header, next to
  the account avatar.
- **"Capture this before I forget, sort it later"** → Notes Dump (a loose
  line, in the Scratchboard sidebar; convert it to a real goal with ➕
  when you're ready).
- **"Notes that belong together under a topic"** → Scratchboard boards.
- **"How am I doing today"** → the `.today-progress` pill under the Day
  hero — don't add a second progress indicator elsewhere for the same day.

If a new feature's data already has a home in this list, extend that
home — don't create a sixth place to look for the same kind of thing.

## 8. Fun, efficient micro-interactions

The app's job is to make tracking work feel light, not like data entry.
Two small patterns do most of that work — reuse them rather than adding a
third:

- **`popCheck(el)`** — a shared helper (defined once, next to
  `toggleGoal`) that plays a quick scale-pop (`@keyframes checkPop`) on
  any checkbox the instant it's checked. Both `.goal-check` and
  `.note-line-check` use it. Because `render()` does a full innerHTML
  rebuild, this only works by calling `popCheck` on the *specific element*
  right after a user action — either the click's `event.currentTarget`
  (if the UI update is async, e.g. waiting on Firestore) or a freshly
  rendered element looked up by id (if `render()` already ran
  synchronously). Don't try to do this with a CSS class baked into the
  template string — it'll replay on every unrelated re-render instead of
  just the action that earned it.
- **`.today-progress` pill** — a one-line "N of M done" readout under the
  Day hero, switching to `--success-pale` + a 🎉 once everything's
  checked off. This is the app's one "progress/celebration" surface —
  if a future feature wants to show completion state, point it at this
  pill (e.g. extend `todayProgress()`) rather than building a second one.

Keep both subtle: a quick pop and a text pill, not confetti or sound.
This is a work-tracking tool first — "fun" here means satisfying and
low-friction, not distracting.

## 9. Checklist before shipping a new UI piece

1. Does it belong in `.app-topbar` (truly global chrome) or `.app-shell`
   (view content, even if "always visible")? See the rule in §1 — when in
   doubt, it's `.app-shell`.
2. Does it reuse an existing panel/bar/card/button/badge pattern from §5?
   If you're writing new CSS for a border+radius+padding combo, check
   it's not already one of these first.
3. Does its icon already mean something else (§6)?
4. Does it duplicate information another panel already owns (§7)?
5. Is it actually earning its permanent screen space, or would it work
   just as well as one more click on something that already exists (§4)?
6. Does it have a sane place to go when the layout stacks on narrow
   screens, and does `.board-content` still render first?
7. Run `node --check` on the extracted `<script type="module">` body and
   a div/span/button open-close tag count before calling it done — this
   has caught real mistakes in past updates.
