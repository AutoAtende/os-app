#!/bin/bash

# Instalar componentes do shadcn/ui
echo "🚀 Instalando componentes do shadcn/ui..."

# Inicializar shadcn/ui
npx shadcn-ui@latest init

# Instalar componentes necessários
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

for component in "${components[@]}"
do
  echo "📦 Instalando componente: $component"
  npx shadcn@latest add "$component" -y
done

echo "✅ Instalação dos componentes concluída!"