# Studio Board — Style Guide

Reference this before adding or restyling anything in `index.html`. The goal
is a single cohesive app, not a pile of one-off widgets — every new piece
should look like it was designed alongside the rest, not bolted on.

## 1. Page structure (top to bottom)

```
.app-topbar (position: sticky, top: 0)       ← one sticky unit, nothing else is sticky
  header                                      dark chrome: brand + account
  .notes-dump-bar                             pinned quick-capture, collapsed by default
  .team-bar                                   current team name + who's online
  .toolbar                                    date nav + Day/Week/Matrix switch
main.main
  .app-shell  (flex row, stacks to column at 1100px)
    .scratch-sidebar-col  (380px)             Quick Add + Scratchboard
    .board-content        (flex: 1)           Day / Week / Matrix — the primary content
    .teams-sidebar-col    (260px)             Teams: switch + manage
```

**Rule: anything "pinned" or "global" goes inside `.app-topbar`, in this
order: header → Notes Dump → team-bar → toolbar.** Header is the one
truly fixed brand/account row and always comes first. Don't add a new bar
above `<header>` — that's what caused the Notes Dump placement bug. If in
doubt, a new pinned bar goes *between* team-bar and toolbar, not above the
header.

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

## 2. Color tokens (`:root` CSS variables)

| Token | Use |
|---|---|
| `--cream` | page background |
| `--warm-white` | card/panel background (sits on top of cream) |
| `--panel` | secondary/recessed background — bars (team-bar, toolbar, Notes Dump), input wells |
| `--ink` | header background, primary text, toast background |
| `--brown` | headings and labels set in Playfair Display |
| `--rust` | primary action color (Add buttons, Quick Add accent, today-jump) |
| `--gold` | active/selected state, focus rings, secondary accent |
| `--light-brown` | hover background for panels/rows |
| `--border` | all hairline borders |
| `--muted` | secondary/meta text |
| `--success` / `--success-pale` | completed state |
| `--danger` | destructive actions, delete hover |

Don't introduce a new hex color inline — if nothing in the table fits, add
a token, don't hardcode. Anything inline like `style="border-left: 4px
solid ${color}"` should only ever be a *user-chosen* color (board colors),
never a UI color.

## 3. Typography

- **Playfair Display (italic)** — anything that *names* something: view
  labels (Day/Week/Matrix via `.vpill`), board titles, team names, panel
  headers (`Scratchboard`, `Teams`, `Notes Dump`, `Needs Rating`), day
  labels. This is the "proper noun" font.
- **Lato** — everything else: body text, buttons, inputs, meta text.
- Uppercase + letterspaced Lato at `.56–.68rem` is the pattern for small
  eyebrow/caption labels (`.slot-count`-adjacent captions, `.presence-label`,
  form row labels). Don't invent a different caption treatment.

## 4. Spacing

Stick to the existing scale rather than picking arbitrary values:
`.2rem .3rem .35rem .4rem .5rem .6rem .7rem .8rem 1rem 1.2rem`. Gaps
between sibling panels are `.8rem`–`1.2rem`; padding inside a panel is
`.5rem`–`.9rem`; padding inside a button/pill is `.25rem–.6rem`.

## 5. Component patterns — reuse these, don't reinvent

**Panel** (`.scratch-sidebar`, `.teams-panel`, `.completed-panel`): 1px
`--border`, `border-radius: 8px`, `--warm-white` background, `.6–.9rem`
padding, flex column with `.5–.7rem` gap.

**Bar** (`.team-bar`, `.toolbar`, `.notes-dump-bar`): full-width, flex row,
`--panel` background, `border-bottom: 1px solid var(--border)`, `0 1rem`
horizontal padding. These live in `.app-topbar` and never look like
floating cards — no border-radius, no margin, no centered max-width. If a
new pinned bar is needed, copy this pattern, not the panel pattern.

**Collapsible panel** (Teams column, Notes Dump): a full-width header
button (`justify-content: space-between`, a chevron on the right,
Playfair italic label) that toggles a module-level `*Collapsed` boolean,
persisted to `localStorage` as `sb_<name>_${uid}`, re-rendered by calling
its own `render*Panel()`/innerHTML update rather than the full `render()`
where possible. Match `toggleTeamsColumn`/`toggleNotesDump` exactly when
adding another one.

**Pill button** (`.gact`, `.vpill`, `.pill-toggle`, `.btn`): fully rounded
(`border-radius: 999px`), 1px border, transparent/warm-white background,
hover darkens border + text color toward the relevant accent (gold for
neutral actions, rust for destructive-adjacent, danger for delete). Don't
make a new button shape — square/slightly-rounded buttons don't exist
anywhere else in this app.

**Round icon button** (`.note-del-btn`, `.team-row-gear`, `.goal-check`,
`.note-line-check`, `.board-visibility-btn`): circular, border + muted
icon color by default, fills or changes border color on hover/active.

**Badge/count pill** (`.slot-count`, `.completed-count`, `.member-more`):
small pill, `--light-brown` or status-tinted background, `.58–.6rem` bold
text. Reuse `.slot-count` for "N items waiting" style badges (this is what
the Notes Dump's collapsed-state count uses) instead of inventing a new
badge class per feature.

## 6. Icons (emoji) — one meaning per icon, app-wide

| Icon | Meaning | Don't reuse for |
|---|---|---|
| 🛋️ | brand | — |
| 📥 | Notes Dump (inbox / capture-now-sort-later) | — |
| 🗒️ | Scratchboard (named boards) | Notes Dump — these are deliberately different icons even though both are "notes," because they're different mental models (a titled board vs. a single inbox) |
| 👥 | Teams column | — |
| 🔒 / 🌐 | private / public visibility toggle | anything else |
| ➕ | add (new line, new goal, new board, convert note→goal) | — |
| 📋 | copy to clipboard | — |
| ✕ | delete | — |
| ✓ / ✔ | done / complete / convert-confirmed | — |
| ⚙ | settings (Board Settings via a team row) | — |
| 🔗 | join (a team) | — |

Before adding a new icon, check this table first — a collision (like 🗒️
briefly being used for both Scratchboard *and* Notes Dump) is exactly the
kind of thing that makes the app feel incohesive, because two visually
identical things turn out to mean different things.

## 7. Avoiding duplicate real estate

Before adding a new panel that shows information already visible
elsewhere (team name, member list, description, etc.), decide which panel
*owns* that information and have the other one link to it or omit it,
rather than showing it twice. Current ownership:

- **Team identity glance** (which team am I on) → `.team-bar` (just the
  name).
- **Team roster, description, switching, management** → Teams column.
- **"What should I do right now"** → Quick Add (creates a real dated
  goal immediately).
- **"Capture this before I forget, sort it later"** → Notes Dump (a loose
  line, not yet a goal).
- **"Notes that belong together under a topic"** → Scratchboard boards.

If a new feature's data already has a home in this list, extend that
home — don't create a sixth place to look for the same kind of thing.

## 8. Checklist before shipping a new UI piece

1. Does it belong in `.app-topbar` (global/pinned) or `.app-shell`
   (view-scoped)? Place it accordingly, in the existing stacking order.
2. Does it reuse an existing panel/bar/button/badge pattern from §5? If
   you're writing new CSS for a border+radius+padding combo, check it's
   not already one of these first.
3. Does its icon already mean something else (§6)?
4. Does it duplicate information another panel already owns (§7)?
5. Does it have a sane place to go when the layout stacks on narrow
   screens, and does `.board-content` still render first?
6. Run `node --check` on the extracted `<script type="module">` body and
   a div/span/button open-close tag count before calling it done — this
   has caught real mistakes in past updates.
