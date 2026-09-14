import { AuthProvider } from './src/context/AuthContext'

/**
 * Envoltura de las páginas de cliente de la tienda (carrito, checkout, compras)
 * para montarlas dentro de la web principal.
 *
 * Sigue el mismo patrón que `InventarioAppPage.jsx`: es el punto de entrada que
 * el host importa. Aporta lo único que las páginas no pueden darse a sí mismas,
 * el `AuthProvider` que `useAuth` exige; la piel `.qawa-storefront` la aporta
 * cada página con su `TiendaShell`, y está aislada bajo ese contenedor, así que
 * no altera el sistema de estilos del host.
 */
export default function TiendaClientePage({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}
