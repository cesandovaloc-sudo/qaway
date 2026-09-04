import {Outlet} from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout(){
  return (
    <>
      <a href="#main-content" className="epc-skip-link">Saltar al contenido principal</a>
      <Navbar/>
      <main id="main-content">
        <Outlet/>
      </main>
      <Footer/>
    </>
  );
}
