import React, { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'default' | 'outline' | 'secondary';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    className?: string;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
                                                  variant = 'default',
                                                  className = '',
                                                  children,
                                                  ...props
                                              }) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variantStyles = {
        //ปุ่มแรก
        default:
            "w-full py-4 text-lg border-2 border-red-400 bg-red-400 text-white hover:bg-orange-50 hover:text-gray-500 hover:border-red-400 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl font-medium cursor-pointer pointer-events-auto",

        outline:
            "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
        //ปุ่มที่สองในหน้าหลัก
        secondary:
            "w-full py-4 text-lg border-2 border-orange-400 bg-orange-400 text-white hover:bg-orange-50 hover:text-gray-500 hover:border-orange-400 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl font-medium cursor-pointer pointer-events-auto",
    };



    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`;

    return (
        <button className={combinedClassName} {...props}>
            {children}
        </button>
    );
};