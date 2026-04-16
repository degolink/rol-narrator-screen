import React, { createContext, useContext, useState, useCallback } from 'react';

const SRDModalContext = createContext(undefined);

export function SRDModalProvider({ children }) {
  const [config, setConfig] = useState({
    isOpen: false,
    type: null,
    index: null,
  });

  const openModal = useCallback((type, index) => {
    setConfig({
      isOpen: true,
      type,
      index,
    });
  }, []);

  const closeModal = useCallback(() => {
    setConfig((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const changeView = useCallback((type, index) => {
    setConfig({
      isOpen: true,
      type,
      index,
    });
  }, []);

  return (
    <SRDModalContext.Provider
      value={{
        ...config,
        openModal,
        closeModal,
        changeView,
      }}
    >
      {children}
    </SRDModalContext.Provider>
  );
}

export function useSRDModal() {
  const context = useContext(SRDModalContext);
  if (context === undefined) {
    throw new Error('useSRDModal must be used within a SRDModalProvider');
  }
  return context;
}
