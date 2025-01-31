#!/bin/bash

# Instalar dependências base do shadcn/ui
npm install @shadcn/ui class-variance-authority clsx tailwind-merge lucide-react

# Instalar componentes necessários
npx shadcn@latest add alert
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add badge
npx shadcn@latest add table
npx shadcn@latest add avatar
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add toast
npx shadcn@latest add tabs
npx shadcn@latest add calendar
npx shadcn@latest add separator
npx shadcn@latest add sheet
npx shadcn@latest add skeleton
npx shadcn@latest add scroll-area
npx shadcn@latest add popover

# Instalar dependências adicionais necessárias
npm install @hookform/resolvers date-fns react-hook-form zod