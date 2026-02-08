# Standard UI Guidelines

> **Purpose**: Comprehensive UI/UX standards for this dashboard application using **Next.js 15**, **shadcn/ui v2**, and **Tailwind CSS v4**.
> This document reflects the **actual patterns and conventions** used in this codebase for AI-assisted development.

---

## Project Context

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **UI Library**: shadcn/ui v2 (including Sidebar components)
- **Styling**: Tailwind CSS v4 with OKLCH color system
- **State Management**: Zustand stores + TanStack Query
- **Icons**: Lucide React
- **Font**: Geist Sans & Geist Mono

### Core Principles
- **Server-first**: Use server components by default, pass props from server to client
- **Prop-based data flow**: Avoid client-side data fetching for initial layout data
- **View component separation**: Separate routing (page.tsx) from UI logic (*View.tsx)
- **Composition over complexity**: Use small, focused components

---

## File Organization

### Route Groups
```
src/app/
  (dashboard)/    # Main app with sidebar
  (settings)/     # Settings with side nav
  (public)/       # Public pages (login, signup)
```

### Component Structure
```
src/components/
  ui/             # shadcn primitives (Button, Card, Dialog, etc.)
  shared/         # Shared composition components
  settings/       # Settings-specific components
  *.tsx           # Layout components (MainSidebar, Navbar, etc.)

src/app/(route-group)/[route]/
  page.tsx        # Route entry point (server component)
  components/     # Route-specific components
    *View.tsx     # Main view component
```

### Component Naming Conventions
- **Page entry points**: `page.tsx` (server component)
- **View components**: `DashboardView.tsx`, `ProfileView.tsx`
- **Composition components**: `PageContainer`, `PageHeader`, `SettingsPageHeader`
- **Feature components**: `OrganizationSwitcher`, `InviteMemberDialog`

---

## Layout Patterns

### Dashboard Layout (with MainSidebar)

**Structure:**
```tsx
<MainSidebarProvider>
  <MainSidebar />
  <SidebarInset>
    <header>{/* Fixed header with UserMenu */}</header>
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {children}
    </div>
  </SidebarInset>
</MainSidebarProvider>
```

**Key Components:**
- `MainSidebarProvider` - Wrapper for sidebar context
- `MainSidebar` - Collapsible sidebar with icon mode (`collapsible="icon"`)
- `SidebarInset` - Main content area
- `SidebarTrigger` - Toggle sidebar collapse

**Usage in**: `src/app/(dashboard)/layout.tsx`

### Settings Layout (with Side Navigation)

**Structure:**
```tsx
<div className="flex min-h-screen flex-col bg-background">
  <header>{/* Top bar with back link */}</header>
  <main className="flex-1 px-6 py-8">
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="w-full md:w-64">
          <SettingsNav />
        </aside>
        <Separator orientation="vertical" />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  </main>
</div>
```

**Usage in**: `src/app/(settings)/layout.tsx`

---

## Component Composition Patterns

### Dashboard Pages Pattern

**Use:** `PageContainer`, `PageHeader`, `PageHeaderContainer`

```tsx
// In DashboardView.tsx
import { PageContainer } from "@/components/shared/page-container";
import { PageHeader } from "@/components/shared/page-header";
import { PageHeaderContainer } from "@/components/shared/page-header-container";

export function DashboardView() {
  return (
    <PageContainer>
      <PageHeaderContainer>
        <PageHeader 
          title="Dashboard" 
          description="Welcome back to your workspace overview." 
        />
      </PageHeaderContainer>
      {/* Page content */}
    </PageContainer>
  );
}
```

**Component Specs:**
- `PageContainer`: `p-4 md:p-6 lg:p-8 space-y-6` - Responsive padding with vertical spacing
- `PageHeader`: Page title (`text-2xl font-bold tracking-tight lg:text-3xl`) + description (`text-sm text-muted-foreground`)
- `PageHeaderContainer`: Wrapper for header with `mb-6` bottom margin

### Settings Pages Pattern

**Use:** `SettingsPageContainer`, `SettingsPageHeader`, `SettingsPageHeaderContainer`

```tsx
// In ProfileView.tsx
import { SettingsPageContainer } from "@/components/settings/SettingsPageContainer";
import { SettingsPageHeader } from "@/components/settings/SettingsPageHeader";
import { SettingsPageHeaderContainer } from "@/components/settings/SettingsPageHeaderContainer";

export function ProfileView() {
  return (
    <SettingsPageContainer>
      <SettingsPageHeaderContainer>
        <SettingsPageHeader 
          title="Profile Settings" 
          description="Manage your account information and preferences." 
        />
      </SettingsPageHeaderContainer>
      {/* Settings content */}
    </SettingsPageContainer>
  );
}
```

**Component Specs:**
- `SettingsPageHeader`: Smaller title (`text-xl font-bold tracking-tight lg:text-2xl`) + description (`text-xs text-muted-foreground`)

---

## Authentication & State Management

### Server-Side Data Flow

**Pattern:** Fetch data in layout, pass as props to client components

```tsx
// In layout.tsx (server component)
export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const user = JSON.parse(cookieStore.get("user")?.value || "null");
  
  // Fetch organizations on server
  const organizations = await fetchOrganizations(accessToken);
  
  return (
    <AuthGuard initialIsAuthenticated={!!accessToken}>
      <StoreHydrator 
        currentOrganization={currentOrganization}
        currentRole={currentRole}
        organizations={organizations}
      >
        {/* Layout content */}
      </StoreHydrator>
    </AuthGuard>
  );
}
```

### Client-Side Data Fetching

**Pattern:** Use TanStack Query for client-side data

```tsx
// In ProfileView.tsx (client component)
import { useQuery, useMutation } from "@tanstack/react-query";

export function ProfileView() {
  const { data: user, isLoading, isError, refetch } = useQuery({
    queryKey: ["user-profile"],
    queryFn: authService.getMe,
  });

  const { mutate: handleUpdate, isPending } = useMutation({
    mutationFn: (payload) => authService.updateMe(payload),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      refetch();
    },
  });
  
  // Component render...
}
```

---

## Navigation Patterns

### Sidebar Navigation

**Structure:**
```tsx
<Sidebar collapsible="icon">
  <SidebarHeader>
    <OrganizationSwitcher />
  </SidebarHeader>
  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel>Application</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  </SidebarContent>
  <SidebarRail />
</Sidebar>
```

**Key Points:**
- Use `isActive` prop to highlight current page
- Icons always accompany labels
- Use `SidebarGroupLabel` to categorize navigation sections

---

## Typography

### Heading Hierarchy

| Element             | Tailwind Classes                              | Usage                |
| ------------------- | --------------------------------------------- | -------------------- |
| Page Title          | `text-2xl font-bold tracking-tight lg:text-3xl` | Dashboard pages      |
| Settings Title      | `text-xl font-bold tracking-tight lg:text-2xl`  | Settings pages       |
| Card Title          | `text-xl`                                     | Card headers         |
| Section Label       | `text-lg font-medium`                         | Section dividers     |
| Body Text           | `text-sm`                                     | Default paragraphs   |
| Description Text    | `text-sm text-muted-foreground`               | Page descriptions    |
| Settings Desc       | `text-xs text-muted-foreground`               | Settings descriptions |
| Label Text          | `text-xs font-bold uppercase tracking-wider text-muted-foreground` | Form labels (optional style) |

### Typography Rules
- One `h1` (page title) per page
- Use `font-bold` for titles, `font-medium` for labels
- Use `tracking-tight` for large headings
- Always pair titles with `text-muted-foreground` descriptions

---

## Spacing & Layout

### Container Spacing

| Container Type       | Spacing Classes                    |
| -------------------- | ---------------------------------- |
| PageContainer        | `p-4 md:p-6 lg:p-8 space-y-6`      |
| Card Padding         | `p-4` or `p-6`                     |
| CardHeader           | `pb-4` (reduce bottom padding)     |
| Form Spacing         | `space-y-6` (between field groups) |
| Field Spacing        | `space-y-2` (label to input)       |

### Grid Layouts

```tsx
// Two-column form layout
<div className="grid gap-4 sm:grid-cols-2">
  {/* Form fields */}
</div>

// Content with sidebar
<div className="flex flex-col-reverse gap-8 md:grid md:grid-cols-[1fr_250px]">
  <div>{/* Main content */}</div>
  <div>{/* Sidebar */}</div>
</div>
```

### Responsive Patterns
- Mobile-first: `gap-4` → `md:gap-6` → `lg:gap-8`
- Column collapse: `flex-col-reverse` → `md:grid md:grid-cols-[...]`
- Width constraints: `w-full` → `md:w-64`

---

## Color System (OKLCH)

### Design Tokens

**Always use CSS variables**, never hardcode colors:

```css
/* Light mode (defined in globals.css) */
--background: oklch(1 0 0);
--foreground: oklch(0.145 0 0);
--primary: oklch(0.205 0 0);
--muted: oklch(0.97 0 0);
--muted-foreground: oklch(0.556 0 0);
--accent: oklch(0.97 0 0);
--destructive: oklch(0.577 0.245 27.325);
--border: oklch(0.922 0 0);

/* Dark mode */
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* etc. */
}
```

### Usage in Components

```tsx
// Use Tailwind classes that reference tokens
<div className="bg-background text-foreground">
<p className="text-muted-foreground">
<Button variant="destructive">Delete</Button>
<div className="border border-border">
```

**Never do:**
```tsx
<div className="bg-gray-100"> ❌
<p className="text-[#666666]"> ❌
```

---

## Card Patterns

### Standard Card

```tsx
<Card>
  <CardHeader className="pb-4">
    <CardTitle className="text-xl">Card Title</CardTitle>
    <CardDescription>
      Supporting description text
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Card content */}
  </CardContent>
</Card>
```

### Enhanced Visual Cards

```tsx
<Card className="border-none bg-accent/40 backdrop-blur-sm shadow-xl">
  {/* Content */}
</Card>
```

**Use enhanced styling sparingly** for emphasis, not as default.

---

## Form Patterns

### Standard Form Structure

```tsx
<form onSubmit={handleSubmit} className="space-y-6">
  {/* Two-column layout for related fields */}
  <div className="grid gap-4 sm:grid-cols-2">
    <div className="space-y-2">
      <Label htmlFor="firstName">First Name</Label>
      <Input
        id="firstName"
        placeholder="John"
        value={formData.firstName}
        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
        required
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="lastName">Last Name</Label>
      <Input
        id="lastName"
        placeholder="Doe"
        value={formData.lastName}
        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
        required
      />
    </div>
  </div>

  {/* Full-width field */}
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input
      id="email"
      type="email"
      value={formData.email}
      required
    />
  </div>

  <div className="flex items-center justify-end pt-4">
    <Button type="submit" disabled={isPending}>
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
    </Button>
  </div>
</form>
```

### Icon-Prefixed Inputs

```tsx
<div className="relative">
  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
  <Input
    className="pl-9"
    placeholder="Email"
  />
</div>
```

### Form Rules
- Use `space-y-6` between field groups
- Use `space-y-2` between label and input
- Two columns for short, related fields
- One column for long fields (email, textarea)
- Always pair labels with inputs (`htmlFor` + `id`)
- Use `required` attribute for required fields

---

## Loading States

### Skeleton Loading

```tsx
{!isHydrated ? (
  <SidebarGroup>
    <SidebarGroupLabel>
      <Skeleton className="h-4 w-16" />
    </SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton disabled>
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
) : (
  {/* Actual content */}
)}
```

### Full-Page Loading

```tsx
if (isLoading) {
  return (
    <div className="flex h-[80vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
```

### Button Loading States

```tsx
<Button type="submit" disabled={isPending}>
  {isPending ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    "Save Changes"
  )}
</Button>
```

---

## Error States

### Full-Page Error

```tsx
if (isError) {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h2 className="text-xl font-semibold">Failed to load profile</h2>
      <Button onClick={() => refetch()}>Try Again</Button>
    </div>
  );
}
```

### Inline Error Messages

```tsx
{error && (
  <p className="text-sm text-destructive">
    {error.message}
  </p>
)}
```

---

## Dialog Patterns

### Standard Dialog

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent className="max-w-lg">
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Supporting description for the dialog action.
      </DialogDescription>
    </DialogHeader>
    {/* Dialog content */}
    <DialogFooter>
      <Button variant="outline" onClick={handleClose}>Cancel</Button>
      <Button onClick={handleConfirm}>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Dialog with Form

```tsx
<DialogContent>
  <DialogHeader>
    <DialogTitle>Create Organization</DialogTitle>
  </DialogHeader>
  <form onSubmit={handleSubmit}>
    <div className="space-y-4 py-4">
      {/* Form fields */}
    </div>
    <DialogFooter>
      <Button type="button" variant="outline" onClick={handleClose}>
        Cancel
      </Button>
      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
      </Button>
    </DialogFooter>
  </form>
</DialogContent>
```

---

## Icons

### Icon Usage
- **Source**: Lucide React only
- **Default size**: `h-4 w-4`
- **In buttons**: Same size as text (`h-4 w-4`)
- **In headers**: Slightly larger (`h-5 w-5` or `h-6 w-6`)

### Common Patterns

```tsx
// Navigation icons
<LayoutDashboard className="h-4 w-4" />

// Input prefix icons
<Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

// Button icons
<Button>
  <Plus className="mr-2 h-4 w-4" />
  Add New
</Button>

// Icon-only button
<Button size="icon" variant="ghost">
  <Settings className="h-4 w-4" />
</Button>
```

---

## Button Guidelines

### Variant Usage

| Variant       | Usage                          | Example                      |
| ------------- | ------------------------------ | ---------------------------- |
| `default`     | Primary action                 | Submit form, Create new      |
| `secondary`   | Secondary action               | View details, Alternative    |
| `outline`     | Neutral action                 | Cancel, Close                |
| `ghost`       | Tertiary/icon actions          | Edit, Delete (in table rows) |
| `destructive` | Dangerous actions              | Delete account, Remove       |

### Button Sizes

| Size      | Usage                    |
| --------- | ------------------------ |
| `default` | Forms, dialogs, primary  |
| `sm`      | Tables, compact layouts  |
| `icon`    | Icon-only buttons        |
| `lg`      | Hero CTAs (rare)         |

### Button Rules
- **One primary button** per section
- **Disable during async** operations
- **Show loading state** with Loader2 icon
- **Icon + text** for clarity (except icon-only buttons)

---

## Responsive Design

### Breakpoints (Tailwind defaults)

| Prefix | Min Width |
| ------ | --------- |
| `sm`   | 640px     |
| `md`   | 768px     |
| `lg`   | 1024px    |
| `xl`   | 1280px    |
| `2xl`  | 1536px    |

### Mobile-First Approach

```tsx
// Base styles for mobile, then add responsive modifiers
<div className="p-4 md:p-6 lg:p-8">
<div className="text-sm md:text-base lg:text-lg">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

### Layout Shifts

```tsx
// Vertical on mobile, horizontal on desktop
<div className="flex flex-col md:flex-row gap-4">

// Hidden on mobile, visible on desktop
<Separator orientation="vertical" className="hidden md:block" />

// Reverse column order on mobile
<div className="flex flex-col-reverse md:grid md:grid-cols-[1fr_250px]">
```

---

## Accessibility

### Essential Practices
- **Labels**: Always pair `<Label>` with `<Input>` using `htmlFor` and `id`
- **Alt text**: Provide meaningful alt text for images
- **Keyboard navigation**: Ensure all interactive elements are keyboard accessible
- **Focus states**: Use default focus rings (via `outline-ring/50` in globals.css)
- **Color contrast**: Never rely on color alone for meaning
- **ARIA labels**: Use `aria-label` for icon-only buttons

```tsx
// Good
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />

// Good
<Button size="icon" aria-label="Delete item">
  <Trash className="h-4 w-4" />
</Button>
```

---

## AI Development Guidelines

### When Generating UI

1. **Check existing patterns first** - Review this file for similar components
2. **Use composition components** - Leverage `PageContainer`, `PageHeader`, etc.
3. **Follow spacing rules** - Stick to multiples of 4 (`gap-4`, `p-6`, `space-y-8`)
4. **Server by default** - Make components server components unless they need interactivity
5. **View component pattern** - Separate page.tsx (routing) from *View.tsx (UI)

### Common Mistakes to Avoid

❌ **Don't:**
- Hardcode colors (`bg-gray-100`, `text-[#333]`)
- Mix spacing scales (`gap-3` next to `gap-5`)
- Create new composition components without reviewing existing ones
- Fetch data in client components when it can be done on server
- Use multiple page titles (`h1`) on one page
- Invent new button variants or sizes

✅ **Do:**
- Use design tokens (`bg-background`, `text-muted-foreground`)
- Use consistent spacing (`gap-4`, `gap-6`, `gap-8`)
- Extend existing components with `className` prop
- Pass server-fetched data as props to client components
- Use semantic HTML (`h1`, `h2`, `h3` in order)
- Stick to documented button variants

---

## Summary

This codebase prioritizes:

- **Consistency** - Established patterns over one-off solutions
- **Server-first** - Leverage Next.js 15 server components
- **Composition** - Small, reusable components
- **Accessibility** - Semantic HTML and ARIA best practices
- **Performance** - Minimal client-side JavaScript

When in doubt, find a similar existing component and follow its pattern.
