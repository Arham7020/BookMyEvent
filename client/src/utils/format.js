export const fmtPrice = (n) => (!n ? 'Free' : `₹${Number(n).toLocaleString('en-IN')}`);

export const fmtDate = (d, opts = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) =>
    new Date(d).toLocaleDateString('en-IN', opts);

export const dayOf = (d) => new Date(d).getDate();
export const monthOf = (d) => new Date(d).toLocaleDateString('en-IN', { month: 'short' });

export const METHOD_LABEL = { upi: 'UPI', card: 'Card', cash: 'Cash at venue', none: 'Free' };

export const methodOf = (b) => {
    if (!b.amount) return 'Free';
    return b.paymentMethod && b.paymentMethod !== 'none' ? METHOD_LABEL[b.paymentMethod] : 'Not recorded';
};
