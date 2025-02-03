// src/components/Layout.jsx
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Loader2 } from "lucide-react";
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Suspense fallback={
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default Layout;