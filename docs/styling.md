# Styling

Stack: **Bootstrap 5**, **react-bootstrap**, **Sass/SCSS**.

## Order of preference

1. **Bootstrap utility classes** — spacing, colors, flex, typography (`mb-3`, `text-primary`, etc.)
2. **Bootstrap components** — `card`, `btn`, `badge`, `alert`
3. **Design tokens** — variables from [src/scss/_vars.scss](../src/scss/_vars.scss)
4. **Custom SCSS** — only when utilities cannot achieve the layout or look

## Before hardcoding values

1. Check `_vars.scss` for custom spacers, color banks, and tokens.
2. Fall back to Bootstrap variables (`$primary`, `$spacer`, …).
3. Use raw hex/rem only if neither exists—and prefer adding a token with team agreement.

Bootstrap overrides belong in the vars file **before** the Bootstrap import, not scattered in components.

## Global entry

[src/scss/style.scss](../src/scss/style.scss) imports variables and app styles; imported once from [App.jsx](../src/App.jsx).

## Anti-patterns

- Inline `style=""` with magic numbers when a utility exists
- Duplicating spacing/colors across files
- `!important` to beat Bootstrap—fix selectors or utilities instead

## Related

- Project Cursor rule: `.cursor/rules/bootstrap-scss.mdc` (same principles as this doc)
