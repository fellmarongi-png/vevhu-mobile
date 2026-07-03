# Next.js 16.2.9 - Verified Installation (from nextjs.org/docs 2026-07-01)

## Create project
npx create-next-app@latest my-app --yes
# --yes = TypeScript, Tailwind CSS, ESLint, App Router, Turbopack, @/* alias, AGENTS.md

## Manual create (custom options)
npx create-next-app@latest
# Prompts: TypeScript? Linter (ESLint/Biome/None)? React Compiler? Tailwind? src/? App Router? Alias? AGENTS.md?

## File structure (App Router)
app/
  layout.tsx    # Root layout (required, has <html> <body>)
  page.tsx      # Home page (/)
  loading.tsx   # Loading UI
  error.tsx     # Error boundary
  not-found.tsx # 404

## Key changes from v15:
- Turbopack is DEFAULT bundler (no flag needed)
- Biome supported as linter option
- AGENTS.md included by default (for AI agents)
- React Compiler option available
- next build no longer runs linter automatically

## shadcn/ui setup:
npx shadcn@latest init
npx shadcn@latest add button card input table dialog ...
# Components go to @/components/ui/
# Requires Tailwind + @/* path alias (both default in Next.js 16)
