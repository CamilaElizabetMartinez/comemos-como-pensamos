import React from 'react';
import './Spinner.css';

const Spinner = ({ size = 'medium', color = 'primary', text = '', centered = true }) => {
  const spinnerClass = `spinner spinner-${size} spinner-${color} ${centered ? 'spinner-centered' : ''}`;

  return (
    <div className={spinnerClass}>
      <div className="spinner-circle" />
      {text && <span className="spinner-text">{text}</span>}
    </div>
  );
};

export const PageSpinner = ({ text }) => (
  <div className="page-spinner">
    <Spinner size="large" text={text} />
  </div>
);

export const ButtonSpinner = () => (
  <span className="button-spinner" />
);

export default Spinner;



