'use client'

import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from '@/lib/firebase/auth'

interface TopbarProps {
  onMenuClick?: () => void
}

const pathTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/estaciones': 'Estaciones',
  '/clientes': 'Clientes',
  '/promociones': 'Promociones',
  '/reportes': 'Reportes',
  '/configuracion': 'Configuración',
}

function getPageTitle(pathname: string): string {
  if (pathTitles[pathname]) return pathTitles[pathname]

  if (pathname.startsWith('/estaciones/')) return 'Detalle de Estación'
  if (pathname.startsWith('/clientes/nuevo')) return 'Nuevo Cliente'
  if (pathname.startsWith('/clientes/')) return 'Detalle de Cliente'
  if (pathname.startsWith('/promociones/nueva')) return 'Nueva Promoción'
  if (pathname.startsWith('/promociones/')) return 'Detalle de Promoción'

  return 'PromoFlow'
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/login'
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-blue-100 text-blue-600">
                AD
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleSignOut}>
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
