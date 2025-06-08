import React from 'react';

// This is a basic mock. For more complex testing scenarios,
// you might need to provide more sophisticated mock implementations
// or use a helper library for testing i18n.

const useTranslation = () => {
  return {
    t: (key, options) => {
      if (options && options.val) { // Simple interpolation mock for {val}
        return key.replace('{{val}}', options.val);
      }
      // For keys like 'yearLabel', return 'Year' for simplicity in tests,
      // or just the key itself to verify the key is used.
      // Let's return the key for now to make tests check for key usage.
      // If actual translated text is needed, this mock needs to be more complex
      // or tests need to use a real i18n instance.
      // For labels like 'yearLabel:', we can append ':'
      if (key === 'yearLabel') return 'Year:'; // Mock specific common case
      if (key === 'appTitle') return 'myclaysuggestions.com'; // Keep brand name as is for title
      // Add other specific key mocks if needed for test clarity
      return key; // Default: return the key itself
    },
    i18n: {
      changeLanguage: jest.fn((lng) => new Promise(() => {})), // Mock changeLanguage
      language: 'en', // Default language for tests
      // Add other i18n instance properties/methods if your components use them
    },
  };
};

// Mock Trans component if you use it, for now, it's not used.
const Trans = ({ i18nKey, children }) => {
  // Simple mock: renders children or the key
  return children || i18nKey;
};

module.exports = {
  useTranslation,
  Trans,
  // Mock other exports from react-i18next if needed
};
