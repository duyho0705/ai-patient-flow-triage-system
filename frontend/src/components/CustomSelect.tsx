import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

export interface CustomSelectProps<T> {
    options: T[]
    value: string
    onChange: (value: string) => void
    labelKey: keyof T
    valueKey: keyof T
    placeholder: string
    icon?: React.ReactNode
    disabled?: boolean
    className?: string
    size?: 'sm' | 'md' | 'lg'
}

export function CustomSelect<T>({
    options,
    value,
    onChange,
    labelKey,
    valueKey,
    placeholder,
    icon,
    disabled,
    className = '',
    size = 'md'
}: CustomSelectProps<T>) {
    const [isOpen, setIsOpen] = useState(false)
    const selectedOption = options.find(opt => String(opt[valueKey]) === value)

    const sizeClasses = {
        sm: 'py-1.5 px-3 rounded-lg text-xs pl-8 pr-7',
        md: 'py-3.5 px-4 rounded-2xl text-sm pl-12 pr-10',
        lg: 'py-4 px-5 rounded-[1.5rem] text-base pl-14 pr-12'
    }

    const iconClasses = {
        sm: 'left-2.5 w-4 h-4',
        md: 'left-4 w-5 h-5',
        lg: 'left-5 w-6 h-6'
    }

    return (
        <div className={`relative ${className}`}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full bg-slate-50 border border-slate-200 flex items-center justify-between transition-all outline-none text-left
          ${sizeClasses[size]}
          ${isOpen ? 'ring-4 ring-[#2b8cee]/10 border-[#2b8cee] bg-white' : 'hover:border-slate-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
            >
                {icon && (
                    <div className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${iconClasses[size]}`}>
                        {icon}
                    </div>
                )}
                <span className={`block truncate ${selectedOption ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                    {selectedOption ? String(selectedOption[labelKey]) : placeholder}
                </span>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <ChevronRight className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''} ${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.ul
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute z-50 mt-2 min-w-full w-max max-w-[320px] bg-white/95 backdrop-blur-xl border border-slate-100 rounded-[1.5rem] shadow-2xl shadow-slate-200/50 py-2.5 max-h-60 overflow-auto outline-none custom-scrollbar right-0"
                        >
                            {options.length === 0 ? (
                                <li className="px-6 py-10 text-center">
                                    <p className="text-sm font-bold text-slate-300 italic tracking-wide">Không có dữ liệu</p>
                                </li>
                            ) : (
                                options.map((opt, i) => (
                                    <li
                                        key={i}
                                        onClick={() => {
                                            onChange(String(opt[valueKey]))
                                            setIsOpen(false)
                                        }}
                                        className={`mx-2 px-4 py-3 text-sm cursor-pointer transition-all duration-200 flex items-center justify-between rounded-xl mb-0.5 last:mb-0
                      ${String(opt[valueKey]) === value
                                                ? 'bg-[#2b8cee] text-white font-black shadow-lg shadow-[#2b8cee]/20'
                                                : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'}
                    `}
                                    >
                                        <span className="whitespace-nowrap pr-4">{String(opt[labelKey])}</span>
                                        {String(opt[valueKey]) === value && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                                        )}
                                    </li>
                                ))
                            )}
                        </motion.ul>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
