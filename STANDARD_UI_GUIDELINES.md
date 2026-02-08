# Standard UI Dashboard UI/UX Guidelines

> **Purpose**: A simple, consistent UI standard for dashboard-style web apps using **shadcn/ui** and **Tailwind CSS**.
> This is meant for **AI-assisted frontend generation** — predictable, boring (in a good way), and easy to scale.

---

## Design Principles

- **Clarity > Creativity**
- **Consistency beats customization**
- **Readable by default**
- **Spacing creates hierarchy**
- **Avoid visual noise**

If something doesn’t improve usability, don’t add it.

---

## Layout Structure

### App Shell

```text
--------------------------------------------------
| Sidebar |           Top Navbar                  |
|         |----------------------------------------|
|         | Main Content Area                      |
|         | (scrollable)                           |
--------------------------------------------------
```

- **Sidebar**: primary navigation
- **Navbar**: page title, actions, user menu
- **Main content**: max-width container

### Container Widths

| Usage             | Max Width    |
| ----------------- | ------------ |
| Default dashboard | `max-w-7xl`  |
| Dense data pages  | `max-w-full` |
| Forms / settings  | `max-w-3xl`  |

```tsx
<div className="mx-auto w-full max-w-7xl px-6">
```

---

## Typography

### Font Family

- Use **default shadcn font stack** (usually `Inter`)
- No custom fonts unless branding requires it

### Font Sizes

| Type          | Tailwind                        | Usage             |
| ------------- | ------------------------------- | ----------------- |
| Page Title    | `text-2xl font-semibold`        | Main page heading |
| Section Title | `text-lg font-medium`           | Card headers      |
| Body          | `text-sm`                       | Default text      |
| Muted / Meta  | `text-xs text-muted-foreground` | Labels, hints     |

### Rules

- One **page title** only
- Avoid mixing font weights randomly
- Never go below `text-xs`

---

## Spacing System

Use **multiples of 4** only.

### Standard Spacing

| Use          | Tailwind           |
| ------------ | ------------------ |
| Page padding | `p-6`              |
| Section gap  | `space-y-6`        |
| Card padding | `p-4` or `p-6`     |
| Inline gap   | `gap-2` or `gap-3` |

❌ Avoid: `p-5`, `mt-7`, `gap-[13px]`

---

## Cards

Cards are the **primary building block**.

### Default Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>{/* content */}</CardContent>
</Card>
```

### Card Rules

- Always use **CardHeader** if there’s a title
- Avoid nesting cards inside cards
- No shadows beyond default shadcn styles

### Card Spacing

- Cards grid gap: `gap-4` or `gap-6`

---

## Buttons

### Button Variants

Use only:

- `default` – primary action
- `secondary` – secondary action
- `outline` – neutral / safe
- `destructive` – dangerous actions
- `ghost` – icon or toolbar actions

### Button Sizes

| Size      | Usage            |
| --------- | ---------------- |
| `sm`      | Tables, dense UI |
| `default` | Forms, dialogs   |

Rules:

- One **primary button** per section
- Avoid multiple destructive buttons

---

## Forms

### Layout

- One column by default
- Two columns only for short inputs

```tsx
<div className="grid gap-4">
```

### Input Rules

- Always include a label
- Use helper text only when needed
- Error text should be short and clear

---

## Tables & Lists

### Tables

- Use `text-sm`
- Row height: `h-12`
- Actions aligned to the right

### Empty States

Every table/list **must** have:

- Title
- One sentence description
- One clear action

---

## Icons

- Use **Lucide icons only**
- Default size: `h-4 w-4`
- Icons should support text, not replace it

---

## Colors

Use **shadcn tokens only**:

- `primary`
- `secondary`
- `accent`
- `muted`
- `destructive`

Rules:

- Never hardcode colors
- Avoid color for decoration only

---

## Modals & Dialogs

- Width: `max-w-lg` by default
- One main action + one cancel
- Close on escape

---

## UX Rules (Non‑Negotiable)

- Loading states are mandatory
- Disable buttons during async actions
- Confirm destructive actions
- Never rely on color alone for meaning

---

## AI Usage Notes

When generating UI with AI:

- Prefer **existing components** over new ones
- Follow spacing and typography strictly
- Do not invent variants or sizes
- If unsure, choose the **simplest layout**

---

## Summary

This UI system is:

- Predictable
- Boring
- Scalable
- Fast to build

That’s the goal.
