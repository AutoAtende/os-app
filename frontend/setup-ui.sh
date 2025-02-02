#!/bin/bash

# Instalação das dependências necessárias
echo "Instalando dependências..."
npm install -D tailwindcss postcss autoprefixer
npm install @radix-ui/react-icons class-variance-authority clsx tailwind-merge

# Inicializar Tailwind CSS
echo "Inicializando Tailwind CSS..."
npx tailwindcss init -p

# Criar diretório components se não existir
mkdir -p src/components/ui

# Inicializar shadcn/ui
echo "Inicializando shadcn/ui..."
npx shadcn@latest init <<EOF
y
y
default
slate
y
src/components/ui
@/components/ui
y
EOF

# Lista de componentes a serem instalados
components=(
  "alert"
  "button"
  "card"
  "form"
  "input"
  "label"
  "select"
  "badge"
  "table"
  "avatar"
  "dialog"
  "dropdown-menu"
  "toast"
  "tabs"
  "calendar"
  "separator"
  "sheet"
  "skeleton"
  "scroll-area"
  "popover"
)

# Instalar cada componente
for component in "${components[@]}"; do
  echo "Instalando componente: $component"
  npx shadcn@latest add "$component" -y
done

echo "✅ Configuração concluída!"