/**
 * Currency formatting utilities for Philippine Peso (PHP)
 */

/**
 * Format a number as Philippine Peso currency
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the ₱ symbol (default: true)
 * @returns {string} Formatted currency string
 */
export const formatPHP = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? '₱0.00' : '0.00';
  }

  const formatted = parseFloat(amount).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return showSymbol ? `₱${formatted}` : formatted;
};

/**
 * Parse a currency string to a number
 * @param {string} currencyString - The currency string to parse
 * @returns {number} The parsed number
 */
export const parsePHP = (currencyString) => {
  if (!currencyString) return 0;

  // Remove currency symbol and commas
  const cleaned = currencyString.toString().replace(/[₱,\s]/g, '');
  return parseFloat(cleaned) || 0;
};

/**
 * Format currency for input fields (without symbol)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted number string
 */
export const formatPHPInput = (amount) => {
  return formatPHP(amount, false);
};

export default {
  formatPHP,
  parsePHP,
  formatPHPInput
};
