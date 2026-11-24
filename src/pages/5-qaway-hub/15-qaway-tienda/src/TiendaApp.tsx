import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import StoreHomePage from './pages/StoreHomePage';
import StoreCategoryPage from './pages/StoreCategoryPage';
import StoreProductPage from './pages/StoreProductPage';
import StoreSearchPage from './pages/StoreSearchPage';

export default function TiendaApp() {
  return (
    <Routes>
      <Route path=":tenantSlug" element={<StoreHomePage />} />
      <Route path=":tenantSlug/c/:categorySlug" element={<StoreCategoryPage />} />
      <Route path=":tenantSlug/p/:productSlug" element={<StoreProductPage />} />
      <Route path=":tenantSlug/buscar" element={<StoreSearchPage />} />
      <Route path="*" element={<Navigate to="demo" replace />} />
    </Routes>
  );
}
