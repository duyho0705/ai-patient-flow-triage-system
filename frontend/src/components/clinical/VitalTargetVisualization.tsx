import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts'
import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'

interface VitalHistory {
    recordedAt: string;
    vitalType: string;
    valueNumeric: number;
    unit: string;
    source: string;
}

interface VitalTarget {
    vitalType: string;
    minValue: number;
    maxValue: number;
    unit: string;
}

interface VitalTargetVisualizationProps {
    history: VitalHistory[];
    targets: VitalTarget[];
}

export function VitalTargetVisualization({ history, targets }: VitalTargetVisualizationProps) {
    // Filter and group by type
    const vitalTypes = [...new Set(history.map(h => h.vitalType))]

    return (
        <div className="space-y-12">
            {vitalTypes.map(type => {
                const typeHistory = history
                    .filter(h => h.vitalType === type)
                    .map(h => ({
                        time: new Date(h.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        value: h.valueNumeric,
                        fullDate: new Date(h.recordedAt).toLocaleString()
                    }))
                    .reverse() // Chronological order

                const target = targets.find(t => t.vitalType === type)

                return (
                    <motion.div
                        key={type}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center">
                                    <Activity className="w-4 h-4" />
                                </div>
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">{type}</h4>
                            </div>
                            {target && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Nguyên tắc:</span>
                                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black tracking-widest border border-emerald-100">
                                        {target.minValue} - {target.maxValue} {target.unit}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={typeHistory}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="time"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                        domain={['auto', 'auto']}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '1rem',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                            fontSize: '10px',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                    {target && (
                                        <ReferenceArea
                                            y1={target.minValue}
                                            y2={target.maxValue}
                                            fill="#10b981"
                                            fillOpacity={0.05}
                                        />
                                    )}
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#0f172a"
                                        strokeWidth={3}
                                        dot={{ fill: '#0f172a', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                        animationDuration={1500}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}
