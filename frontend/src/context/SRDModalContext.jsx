import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * @typedef {Object} SRDModalConfig
 * @property {boolean} isOpen
 * @property {string|null} type
 * @property {string|null} index
 * @property {string} title
 */

/**
 * @typedef {Object} SRDModalContextValue
 * @property {boolean} isOpen
 * @property {string|null} type
 * @property {string|null} index
 * @property {string} title
 * @property {function(string, string): void} openModal
 * @property {function(): void} closeModal
 * @property {function(string, string): void} changeView
 * @property {function(string): void} setTitle
 */

/** @type {React.Context<SRDModalContextValue | undefined>} */
const SRDModalContext = createContext(undefined);

export function SRDModalProvider({ children }) {
  const [config, setConfig] = useState({
    isOpen: false,
    type: null,
    index: null,
    title: '',
  });

  const openModal = useCallback((type, index) => {
    setConfig({
      isOpen: true,
      type,
      index,
      title: 'Cargando...',
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
      title: 'Cargando...',
    });
  }, []);

  const setTitle = useCallback((title) => {
    setConfig((prev) => ({ ...prev, title }));
  }, []);

  return (
    <SRDModalContext.Provider
      value={{
        ...config,
        openModal,
        closeModal,
        changeView,
        setTitle,
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
