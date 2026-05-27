'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  MapPin,
  Users,
  Tag,
  BarChart2,
  Settings,
  LogOut,
  Fuel,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/lib/firebase/auth'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Estaciones', href: '/estaciones', icon: MapPin },
  { label: 'Clientes', href: '/clientes', icon: Users },
  { label: 'Promociones', href: '/promociones', icon: Tag },
  { label: 'Reportes', href: '/reportes', icon: BarChart2 },
]

interface MobileNavProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/login'
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="flex h-16 items-center gap-2 px-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Fuel className="h-6 w-6 text-blue-600" />
            <SheetTitle className="text-lg font-semibold text-slate-900">
              PromoFlow
            </SheetTitle>
          </div>
        </SheetHeader>

        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => onOpenChange(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <Separator />

        <div className="px-3 py-4">
          <ul className="space-y-1">
            <li>
              <Link
                href="/configuracion"
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Settings className="h-5 w-5" />
                Configuración
              </Link>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
                Cerrar sesión
              </Button>
            </li>
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  )
}
