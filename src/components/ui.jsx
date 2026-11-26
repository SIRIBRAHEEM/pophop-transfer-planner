import React from 'react';

export function Button({ variant = 'coral', className = '', ...props }) {
  const styles = {
    coral: 'bg-coral text-white',
    grape: 'bg-grape text-white',
    tang: 'bg-tang text-ink',
    white: 'bg-white text-ink',
    mint: 'bg-mint text-white',
  };
  return <button className={`btn-chunk px-5 py-2.5 text-sm ${styles[variant]} ${className}`} {...props} />;
}

export function Card({ className = '', children }) {
  return <section className={`card-chunk bg-white p-5 ${className}`}>{children}</section>;
}

export function Badge({ tone = 'lilac', className = '', children }) {
  const tones = {
    lilac: 'bg-lilac text-grape',
    blush: 'bg-blush text-coral',
    tang: 'bg-tang text-ink',
    mint: 'bg-mint text-white',
    coral: 'bg-coral text-white',
    grape: 'bg-grape text-white',
    sky: 'bg-sky text-white',
    white: 'bg-white text-ink',
  };
  return <span className={`sticker ${tones[tone]} ${className}`}>{children}</span>;
}

export function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-ink/70">
      {children}
    </label>
  );
}

export function Input(props) {
  return <input className="field" {...props} />;
}

export function Select({ children, ...props }) {
  return (
    <select className="field" {...props}>
      {children}
    </select>
  );
}
