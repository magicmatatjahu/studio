import React from "react";

export interface IconButtonProps extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  icon: React.ElementType;
}

export const IconButton: React.FunctionComponent<IconButtonProps> = ({
  icon,
  ...rest
}) => {
  const Icon = icon;
  return (
    <button type='button' {...rest} className={`${rest.className || ''} flex items-center justify-center bg-inherit hover:bg-gray-600 active:bg-gray-500 text-gray-300 rounded p-[1px]`}>
      <Icon />
    </button>
  )
}