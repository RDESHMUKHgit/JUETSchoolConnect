import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import { RegisterSchoolModal } from '../components/modals/RegisterSchoolModal.js';

export const PublicLayout: React.FC = () => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar onOpenRegisterSchoolModal={() => setRegisterModalOpen(true)} />
      <main style={{ flex: 1 }}>
        <Outlet context={{ openRegisterSchoolModal: () => setRegisterModalOpen(true) }} />
      </main>
      <Footer />
      <RegisterSchoolModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
    </div>
  );
};
