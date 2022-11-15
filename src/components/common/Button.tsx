import React from "react";

export interface ButtonProps extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {}

export const Button: React.FunctionComponent<ButtonProps> = ({
  children,
  ...rest
}) => {
  return (
    <button 
      type='button' 
      {...rest} 
      className={`${rest.className || ''} w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-2 py-1 bg-pink-600 font-medium text-white hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 sm:col-start-2 ${
        rest.disabled ? 'opacity-10' : 'opacity-100'
      }`}
    >
      {children}
    </button>
  );
}
