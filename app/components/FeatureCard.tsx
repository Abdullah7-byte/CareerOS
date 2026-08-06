type FeatureCardProps = {
    title: string;
    description: string;
};

export default function FeatureCard({
    title,
    description,
}: FeatureCardProps) {
    return (
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 transition hover:border-cyan-500">
            <h3 className="text-xl font-semibold">{title}</h3>

            <p className="mt-3 text-slate-400">
                {description}
            </p>
        </div>
    );
}