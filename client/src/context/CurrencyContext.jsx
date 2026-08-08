import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext(null);

const DEFAULT_RATES = {
  USD: 1,
  ILS: 3.75,
  EUR: 0.92,
  GBP: 0.79
};

export const CURRENCY_SYMBOLS = {
  USD: '$',
  ILS: '₪',
  EUR: '€',
  GBP: '£'
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => localStorage.getItem('app_currency') || 'USD');
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('app_currency', currency);
  }, [currency]);

  // Fetch real-time exchange rates from external open API
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        if (res.ok) {
          const data = await res.json();
          if (data && data.rates) {
            setRates({
              USD: 1,
              ILS: data.rates.ILS || DEFAULT_RATES.ILS,
              EUR: data.rates.EUR || DEFAULT_RATES.EUR,
              GBP: data.rates.GBP || DEFAULT_RATES.GBP
            });
          }
        }
      } catch (err) {
        console.warn('Using default exchange rates due to network:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  const convertPrice = (usdAmount) => {
    const rate = rates[currency] || 1;
    return Number((Number(usdAmount) * rate).toFixed(2));
  };

  const formatPrice = (usdAmount) => {
    const rate = rates[currency] || 1;
    const symbol = CURRENCY_SYMBOLS[currency] || '$';
    const converted = Number(usdAmount) * rate;
    return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        rates,
        loadingRates: loading,
        convertPrice,
        formatPrice,
        symbols: CURRENCY_SYMBOLS,
        availableCurrencies: ['USD', 'ILS', 'EUR', 'GBP']
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
