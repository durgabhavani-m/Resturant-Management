interface StatCardProps{
    title: string;
    value: string;
    change: string;
    icon: React.ReactNode;
}

const StatCard = ({
    title,
    value,
    change,
    icon,
}:StatCardProps) => {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5">

            <div className="flex items-start justify-between">

                <div>
                    <p className="text-sm text-slate-500">
                        {title}
                    </p>

                    <h3 className="mt-2 text-2xl font-bold text-slate-900">
                        {value}
                    </h3>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                    {icon}
                </div>
            </div>

            <p className="mt-4 text-xs font-medium text-green-600">
                ↑ {change}
                <span className="ml-1 font-normal text-slate-400">
                    from last week
                </span>
            </p>
        </div>
    );
};
export default StatCard;