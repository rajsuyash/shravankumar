import hotToast from 'react-hot-toast';

const toast = {
  success: (message: string) =>
    hotToast.success(message, {
      duration: 4000,
      style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' },
      iconTheme: { primary: '#16a34a', secondary: '#fff' },
    }),
  error: (message: string) =>
    hotToast.error(message, {
      duration: 5000,
      style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
      iconTheme: { primary: '#dc2626', secondary: '#fff' },
    }),
  info: (message: string) =>
    hotToast(message, {
      duration: 4000,
      icon: 'ℹ️',
      style: { background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' },
    }),
};

export default toast;
