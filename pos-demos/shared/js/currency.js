/* Prices are VAT-inclusive, as is normal in South Africa. */
const VAT_RATE = 0.15;
const fmt = n => 'R' + Number(n).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
const vatPortion = total => total - total / (1 + VAT_RATE);
