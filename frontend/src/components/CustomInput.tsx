interface CustomInputProps {
    label?: string
    value: string
    onChange: (val: string) => void
    type?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    className?: string
    icon?: any
}

export function CustomInput({
    label,
    value,
    onChange,
    type = 'text',
    placeholder,
    required,
    disabled,
    className = '',
    icon: Icon
}: CustomInputProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={`w-full ${Icon ? 'pl-12' : 'px-6'} py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all outline-none disabled:opacity-50`}
                />
            </div>
        </div>
    )
}
