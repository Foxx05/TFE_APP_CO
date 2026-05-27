export default function Gauge({
    value,
    min,
    max,
}: {
    value: number | null;
    min: number;
    max: number;
}) {

    const percent =
        value == null
        ? 0
        : Math.min(
            100,
            Math.max(0, ((value - min) / (max - min)) * 100)
        );

    return (
        <div className="gauge">
            <div className="bar red"/>
            <div className="bar yellow"/>
            <div className="bar green"/>
            <div className="bar yellow"/>
            <div className="bar red"/>

            <div className="gauge--indicator" style={{ left: `${percent}%` }}/>
        </div>
    );
}