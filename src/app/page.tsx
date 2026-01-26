import Link from 'next/link';
import { UtensilsCrossed, Users, Store, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-12">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl mb-6 shadow-xl">
            <UtensilsCrossed className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            AYCE Event
          </h1>
          <p className="text-xl text-gray-600 max-w-md">
            All You Can Eat Experience
          </p>
        </div>

        {/* Cards de navegación */}
        <div className="w-full max-w-md space-y-4">
          {/* Card para clientes */}
          <Link href="/reserva/demo" className="block">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100 hover:border-orange-300 group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <Users className="w-7 h-7 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                    Soy Cliente
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Ver mi reserva y tiempo restante
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>

          {/* Card para restaurantes */}
          <Link href="/restaurant/login" className="block">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100 hover:border-orange-300 group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Store className="w-7 h-7 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                    Soy Restaurante
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Gestionar usuarios y órdenes
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        </div>

        {/* Info adicional */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Escanea tu código QR para acceder a tu reserva
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-sm text-gray-400">
          © 2026 VISCOCITY S.A.S. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
