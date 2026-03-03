import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import SectionTwelve from './SectionTwelve';
import EyeCursor from './EyeCursor';

function Layout() {
  return (
    <>
      <EyeCursor />
      <Navbar />
      {/* <div style={{ paddingTop: '100px', minHeight: 'calc(100vh - 400px)' }}>
        <Outlet />
        </div> */}
      <Outlet />
      <SectionTwelve />
    </>
  );
}

export default Layout;
