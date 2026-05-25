import { useEffect, useState } from "react";
import { Link } from "react-router";
import Card from "../components/card";
import Gauge from "../components/gauge";
import WeatherIcon from "../components/weatherIcon";
import ProductionChart from "../components/productionChart";
import LineChart from "../components/lineChart";
import { useParams } from "react-router";
import MultiLineChart from "../components/multilineChart";

type Snapshot = {
    greenhouse_name?: string;
    captured_at: string;
    temperature_air_c: number | string | null;
    humidity_pct: number | string | null;
    pressure_hpa: number | string | null;
    lux: number | string | null;
    flowers_white: number | string;
    fruits_green: number | string;
    fruits_yellow: number | string;
    fruits_red: number | string;
    harvested_now: number | string;
    harvest_total: number | string;
    status: string;
};

type ProductionPoint = {
    label: string;
    value: number;
};

type ApiResponse = {
    success: boolean;
    greenhouse_id: number;
    last: Snapshot | null;
    history: Snapshot[];
    monthly_production?: ProductionPoint[];
    season_harvest_total?: number;
    message?: string;
};

export default function Index() {
    const [data, setData] = useState<Snapshot | null>(null);
    const [monthlyProduction, setMonthlyProduction] = useState<ProductionPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [historyData, setHistoryData] = useState<Snapshot[]>([]);
    const [showDetails, setShowDetails] = useState(false);
    const [showChartDetails, setShowChartDetails] = useState(false);
    const { id } = useParams();
    const [range, setRange] = useState("week");
    const [compareMode, setCompareMode] = useState(false);
    const [compareYear, setCompareYear] = useState("");
    const [seasonHarvestTotal, setSeasonHarvestTotal] = useState(0);


    useEffect(() => {
        async function loadDashboard() {
            try {
                setLoading(true);
                setError(null);
                const params = new URLSearchParams({
                    greenhouse_id: String(id),
                    range,
                });

                if (compareMode && compareYear) {
                    params.set("compare_year", compareYear);
                }

                const response = await fetch(`https://theocolpaert.be/projets/tfe_test6/backend/import.php?greenhouse_id=${id}&range=${range}`);

                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}`);
                }

                const json: ApiResponse = await response.json();

                if (!json.success) {
                    throw new Error(json.message || "API error");
                }

                setData(json.last);
                setMonthlyProduction(json.monthly_production || []);
                setHistoryData(json.history || []);
                setSeasonHarvestTotal(json.season_harvest_total || 0);

            } catch (err) {
                console.error(err);
                setError("Unable to load the dashboard data.");
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();

    }, [id,range, compareMode, compareYear]);

    const temperature =
        data?.temperature_air_c != null
        ? `${Number(data.temperature_air_c).toFixed(1)}°C`
        : "--";

    const sunlight =
        data?.lux != null
        ? `${Number(data.lux).toFixed(1)} Lx`
        : "--";

    const humidity =
        data?.humidity_pct != null
        ? `${Number(data.humidity_pct).toFixed(0)} %`
        : "--";
    
    const pressureValue =
        data?.pressure_hpa != null ? Number(data.pressure_hpa) : null;

        const weatherType =
        pressureValue == null
            ? "cloud"
            : pressureValue < 1011
            ? "rain"
            : pressureValue > 1015
                ? "sun"
                : "cloud";

    const strawberriesReady = data != null ? Number(data.fruits_red || 0) : 0;
    const greenhouseName = data?.greenhouse_name || `#${id}`;
    
    function parseMysqlDate(dateStr: string): Date {
        return new Date(dateStr.replace(" ", "T"));
    }

    const tempAverage = (() => {
        if (!data || !historyData.length) return null;

        const lastDate = parseMysqlDate(data.captured_at);
        const minTime = lastDate.getTime() - 24 * 60 * 60 * 1000;

        const values = historyData
            .filter((row) => {
                if (!row.captured_at || row.temperature_air_c == null) return false;
                const rowDate = parseMysqlDate(row.captured_at);
                return rowDate.getTime() >= minTime && rowDate.getTime() <= lastDate.getTime();
            })
            .map((row) => Number(row.temperature_air_c))
            .filter((value) => !Number.isNaN(value));

        if (!values.length) return null;

        const sum = values.reduce((acc, value) => acc + value, 0);
        return sum / values.length;
    })();

    const sunRateAverage = (() => {
        if (!data || !historyData.length) return null;

        const lastDate = parseMysqlDate(data.captured_at);
        const minTime = lastDate.getTime() - 24 * 60 * 60 * 1000;

        const values = historyData
        .filter((row) => {
            if (!row.captured_at || row.lux == null) return false;
            const rowDate = parseMysqlDate(row.captured_at);
            return rowDate.getTime() >= minTime && rowDate.getTime() <= lastDate.getTime();
        })
        .map((row) => Number(row.lux))
        .filter((value) => !Number.isNaN(value));

        if (!values.length) return null;

        const sum = values.reduce((acc, value) => acc + value, 0);
        return sum / values.length;
    })();

    const humidityAverage = (() => {
        if (!data || !historyData.length) return null;

        const lastDate = parseMysqlDate(data.captured_at);
        const minTime = lastDate.getTime() - 24 * 60 * 60 * 1000;

        const values = historyData
        .filter((row) => {
            if (!row.captured_at || row.humidity_pct == null) return false;
            const rowDate = parseMysqlDate(row.captured_at);
            return rowDate.getTime() >= minTime && rowDate.getTime() <= lastDate.getTime();
        })
        .map((row) => Number(row.humidity_pct))
        .filter((value) => !Number.isNaN(value));

        if (!values.length) return null;

        const sum = values.reduce((acc, value) => acc + value, 0);
        return sum / values.length;
    })();

    const pressureAverage = (() => {
        if (!data || !historyData.length) return null;

        const lastDate = parseMysqlDate(data.captured_at);
        const minTime = lastDate.getTime() - 24 * 60 * 60 * 1000;

        const values = historyData
        .filter((row) => {
            if (!row.captured_at || row.pressure_hpa == null) return false;
            const rowDate = parseMysqlDate(row.captured_at);
            return rowDate.getTime() >= minTime && rowDate.getTime() <= lastDate.getTime();
        })
        .map((row) => Number(row.pressure_hpa))
        .filter((value) => !Number.isNaN(value));

        if (!values.length) return null;

        const sum = values.reduce((acc, value) => acc + value, 0);
        return sum / values.length;
    })();

    function formatDayLabel(date: Date): string {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        return `${day}/${month}`;
    }

    const monthTempData = buildAverageData(historyData, "temperature_air_c",range);
    const monthHumidityData = buildAverageData(historyData, "humidity_pct",range);
    const monthPresData = buildAverageData(historyData, "pressure_hpa",range);
    const monthSunlightData = buildAverageData(historyData, "lux",range);

    function buildAverageData(
        rows: Snapshot[],
        field: "temperature_air_c" | "humidity_pct" | "pressure_hpa" | "lux",
        range: string
    ) {
        const grouped = new Map<string, number[]>();

        for (const row of rows) {
            if (!row.captured_at || row[field] == null) continue;

            const value = Number(row[field]);
            if (Number.isNaN(value)) continue;

            const date = parseMysqlDate(row.captured_at);

            const key =
            range === "day"
                ? `${date.getHours().toString().padStart(2, "0")}:00`
                : date.toISOString().slice(0, 10);

            if (!grouped.has(key)) {
            grouped.set(key, []);
            }

            grouped.get(key)!.push(value);
        }

        return Array.from(grouped.entries()).map(([key, values]) => {
            const avg = values.reduce((acc, v) => acc + v, 0) / values.length;

            return {
                label:
                    range === "day"
                    ? key
                    : formatDayLabel(new Date(`${key}T00:00:00`)),
                value: Number(avg.toFixed(2)),
            };
        });
    }

    const rangeLabel =
    range === "day"
        ? "last 24 hours"
        : range === "week"
        ? "this week"
        : range === "month"
        ? "this month"
        : "this season";

    function buildFruitStageData(rows: Snapshot[]) {
        return rows.map((row) => {
            const date = parseMysqlDate(row.captured_at);

            return {
            label:
                range === "day"
                ? `${date.getHours().toString().padStart(2, "0")}:${date
                    .getMinutes()
                    .toString()
                    .padStart(2, "0")}`
                : formatDayLabel(date),
            flowers: Number(row.flowers_white || 0),
            green: Number(row.fruits_green || 0),
            yellow: Number(row.fruits_yellow || 0),
            red: Number(row.fruits_red || 0),
            };
        });
    }

const fruitStageData = buildFruitStageData(historyData);
    return (
        <>
            <div className="top--nav">
                <div className="section--logo">
                    <img className="img--logo" src={import.meta.env.BASE_URL + "logo.svg"} alt="Logo de l'entreprise BerryCam"/>
                    <p className="p--logo">BerryCam</p>
                </div>

                <Link to={`${import.meta.env.BASE_URL}dashboard`} className="btn--back">
                    Back
                </Link>
            </div>

            <h1 className="section--title__big">Data from {greenhouseName}</h1>

            {loading && <p>Chargement des données...</p>}
            {error && <p>{error}</p>}

            <div className="card--gap"></div>

            <div className="grid">
                <div className="card--click" onClick={() => setShowDetails((prev) => !prev)}>
                    <Card>
                        <p className="p--small">Temperature</p>
                        <p className="p--big">{temperature}</p>
                        <Gauge />

                        {showDetails && (
                            <p className="p--small" style={{ marginTop: "12px" }}>
                                Avg last 24h:{" "}
                                {tempAverage != null ? `${tempAverage.toFixed(1)}°C` : "--"}
                            </p>
                        )}
                    </Card>
                </div>

                <div className="card--click" onClick={() => setShowDetails((prev) => !prev)}>
                    <Card>
                        <p className="p--small">Sunlight rate</p>
                        <p className="p--big">{sunlight}</p>
                        <Gauge />

                        {showDetails && (
                        <p className="p--small" style={{ marginTop: "12px" }}>
                            Avg last 24h:{" "}
                            {sunRateAverage != null ? `${sunRateAverage.toFixed(1)} Lx` : "--"}
                        </p>
                        )}
                    </Card>
                </div>

                <div className="card--click" onClick={() => setShowDetails((prev) => !prev)}>
                    <Card>
                        <p className="p--small">Humidity rate</p>
                        <p className="p--big">{humidity}</p>
                        <Gauge />

                        {showDetails && (
                            <p className="p--small" style={{ marginTop: "12px" }}>
                                Avg last 24h:{" "}
                                {humidityAverage != null ? `${humidityAverage.toFixed(1)} %` : "--"}
                            </p>
                        )}
                    </Card>
                </div>

                <div className="card--click" onClick={() => setShowDetails((prev) => !prev)}>
                    <Card>
                        <p className="p--small">Weather</p>
                        <div style={{ display: "flex", justifyContent: "center", marginTop: "8px" }}>
                            <WeatherIcon type={weatherType} size={60} />
                        </div>

                        {showDetails && (
                            <p className="p--small" style={{ marginTop: "12px" }}>
                                Avg last 24h:{" "}
                                {pressureAverage != null ? `${pressureAverage.toFixed(1)} hPa` : "--"}
                            </p>
                        )}
                    </Card>
                </div>
            </div>

            <Card>
                <div>
                    <p className="p--small">Currently</p>
                    <p className="p--big">{strawberriesReady} strawberries</p>
                    <p className="p--small">are ready to get picked up</p>
                </div>
            </Card>

            <h1 className="section--title__big">Additional data</h1>

            <div className="card--gap">
                <Card>
                    <h1>Your production per month</h1>
                    <ProductionChart data={monthlyProduction} />

                    <button onClick={() => setShowChartDetails((prev) => !prev)}>
                        {showChartDetails ? "Close details" : "See details"}
                    </button>

                    {showChartDetails && (
                        
                    <div style={{ marginTop: "8px" }}>
                <Card>

                <label>
                    Display period

                    <select
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                        style={{ marginTop: "12px" }}
                        >
                        <option value="day">Day</option>
                        <option value="week">Week</option>
                        <option value="month">Month</option>
                        <option value="season">Season</option>
                    </select>
                </label>

                <button type="button" onClick={() => setCompareMode((prev) => !prev)}>
                    {compareMode ? "Disable comparison" : "Compare with another season"}
                </button>

                {compareMode && (
                    <input
                        type="number"
                        placeholder="Example: 2025"
                        value={compareYear}
                        onChange={(e) => setCompareYear(e.target.value)}
                    />
                )}

                </Card>
                    <LineChart
                        title={`Temperature over ${rangeLabel}`}
                        unit="°C"
                        data={monthTempData}
                    />

                    <LineChart
                        title={`Humidity over ${rangeLabel}`}
                        unit="%"
                        data={monthHumidityData}
                    />

                    <LineChart
                         title={`Pressure over ${rangeLabel}`}
                        unit="hPa"
                        data={monthPresData}
                    />

                    <LineChart
                         title={`Sunlight over ${rangeLabel}`}
                        unit="Lx"
                        data={monthSunlightData}
                    />
                    
                    <MultiLineChart
                        title={`Fruit development over ${rangeLabel}`}
                        data={fruitStageData}
                    />
                    </div>
                    
                    )}
                </Card>

                <Card>
                    <div>
                        <p className="p--small">Since season start</p>
                        <p className="p--big">{seasonHarvestTotal} strawberries</p>
                        <p className="p--small">have been harvested</p>
                    </div>
                </Card>
            </div>
        </>
    );
}