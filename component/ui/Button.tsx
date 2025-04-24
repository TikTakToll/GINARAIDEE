import React, { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'default' | 'outline' | 'secondary' | 'three-d';

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
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition-all duration-300'; // เพิ่ม transition-all

    const variantStyles = {
        default:
        // เพิ่ม hover:-translate-y-1 เพื่อให้ปุ่ม "ลอยขึ้น" เมื่อ hover และเพิ่ม transform เพื่อให้ทำงาน
            "w-full py-4 text-lg border-2 border-red-400 bg-red-400 text-white hover:bg-orange-50 hover:text-gray-500 hover:border-red-400 shadow-md hover:shadow-lg transform hover:-translate-y-1 rounded-xl font-medium cursor-pointer pointer-events-auto",

        outline:
            "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-300",

        secondary:
            "w-full py-4 text-lg border-2 border-orange-400 bg-orange-400 text-white hover:bg-orange-50 hover:text-gray-500 hover:border-orange-400 shadow-md hover:shadow-lg transform hover:-translate-y-1 rounded-xl font-medium cursor-pointer pointer-events-auto",

        'three-d':
        // สำหรับปุ่ม 3D เราอาจไม่ใส่ hover translate ตรงๆ เพราะมันมี effect ของตัวเองอยู่แล้ว
            "relative pb-2 transition-transform duration-100 ease-in-out active:translate-y-2 active:pb-0 active:mb-2"
    };

    const combinedClassName = `${variant === 'three-d' ? '' : baseStyles} ${variantStyles[variant]} ${className}`;



    if (variant === 'three-d') {
        return (
            <button
                {...props}
                disabled={props.disabled}
                className={`
                relative w-full transform
                transition-all duration-300 ease-in-out
                hover:-translate-y-1 active:translate-y-0
                disabled:opacity-50 disabled:pointer-events-none
                ${className}
            `}
            >
                <div className="bg-gray-500 border-4 border-black pb-2 rounded-lg">
                    <div className="bg-gray-200 border-4 border-white px-4 py-2 rounded-md">
                        <span className="text-lg tracking-wider">{children}</span>
                    </div>
                </div>
            </button>
        );
    }

    return (
        <button className={combinedClassName} {...props}>
            {children}
        </button>
    );
};


