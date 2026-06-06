import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import Card from "../components/Card";
import Gauge from "../components/Gauge";
import WeatherIcon from "../components/WeatherIcon";
import ProductionChart from "../components/ProductionChart";
import LineChart from "../components/LineChart";
import { useParams } from "react-router";
import MultiLineChart from "../components/MultilineChart";

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
    offset?: number;
    has_previous?: boolean;
    has_next?: boolean;
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
    const [seasonHarvestTotal, setSeasonHarvestTotal] = useState(0);
    const[offset, setOffset] = useState(0);
    const [hasPrevious, setHasPrevious] = useState(true);
    const [hasNext, setHasNext] = useState(false);
    const lastValidOffsetRef = useRef(0);

    useEffect(() => {
        async function loadDashboard() {
            try {
                setLoading(true);
                setError(null);
                const params = new URLSearchParams({
                    greenhouse_id: String(id),
                    range,
                    offset: String(offset),
                });

                const response = await fetch(`${import.meta.env.BASE_URL}backend/import.php?${params.toString()}`);
                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}`);
                }

                const json: ApiResponse = await response.json();

                if (!json.success) {
                    throw new Error(json.message || "API error");
                }

                setData(json.last);
                setMonthlyProduction(json.monthly_production || []);
                if (json.history && json.history.length > 0) {
                    setHistoryData(json.history);
                    lastValidOffsetRef.current = offset;
                    setHasPrevious(json.has_previous ?? false);
                    setHasNext(json.has_next ?? false);
                } else {
                    setOffset(lastValidOffsetRef.current);
                    setHasPrevious(false);
                    setHasNext(lastValidOffsetRef.current < 0);
                    return;
                }
                setSeasonHarvestTotal(json.season_harvest_total || 0);
                setHasPrevious(json.has_previous??false);
                setHasNext(json.has_next??false);
            } 
            
            catch (err) {
                console.error(err);
                setError("Unable to load the dashboard data.");
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, [id, range, offset]);

    const temperature =
        data?.temperature_air_c != null
        ? `${Number(data.temperature_air_c).toFixed(1)}°C`
        : "--";

    const sunlight = (() => {

        if (data?.lux == null) return "--";

        const lux = Number(data.lux);

        if (lux >= 1000) {
            return `${(lux / 1000).toFixed(1).replace(".0", "")}k Lx`;
        }

        return `${lux.toFixed(0)} Lx`;

    })();

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

    const strawberriesReady =
        data != null ? Number(data.fruits_red || 0) : 0;
    
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
    : "this month";

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
                <Link to={`${import.meta.env.BASE_URL}dashboard`} className="btn--back">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                    </svg>
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
                        <Gauge value={data?.temperature_air_c != null ? Number(data.temperature_air_c) : null} min={0} max={36}/>

                        {showDetails && (
                        <p className="p--small p--avg">
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
                        <Gauge value={data?.lux != null ? Number(data.lux) : null} min={0} max={40000}/>

                        {showDetails && (
                        <p className="p--small p--avg">
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
                        <Gauge value={data?.humidity_pct != null ? Number(data.humidity_pct) : null} min={40} max={90}/>

                        {showDetails && (
                        <p className="p--small p--avg">
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
                        <p className="p--small p--avg">
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
                                        onChange={(e) => {
                                            setRange(e.target.value);
                                            setOffset(0);}}
                                        style={{ marginTop: "12px" }}
                                    >
                                        <option value="day">Day</option>
                                        <option value="week">Week</option>
                                        <option value="month">Month</option>
                                    </select>
                                </label>
                            </Card>

                            <LineChart
                                title={`Temperature over ${rangeLabel}`}
                                unit="°C"
                                data={monthTempData}
                                onPrevious={() => setOffset((current) => current - 1)}
                                onNext={() => setOffset((current) => current + 1)}
                                disablePrevious={!hasPrevious}
                                disableNext={!hasNext}
                            />
                            <LineChart
                                title={`Humidity over ${rangeLabel}`}
                                unit="%"
                                data={monthHumidityData}
                                onPrevious={() => setOffset((current) => current - 1)}
                                onNext={() => setOffset((current) => current + 1)}
                                disablePrevious={!hasPrevious}
                                disableNext={!hasNext}
                            />
                            <LineChart
                                title={`Pressure over ${rangeLabel}`}
                                unit="hPa"
                                data={monthPresData}
                                onPrevious={() => setOffset((current) => current - 1)}
                                onNext={() => setOffset((current) => current + 1)}
                                disablePrevious={!hasPrevious}
                                disableNext={!hasNext}
                            />
                            <LineChart
                                title={`Sunlight over ${rangeLabel}`}
                                unit="Lx"
                                data={monthSunlightData}
                                onPrevious={() => setOffset((current) => current - 1)}
                                onNext={() => setOffset((current) => current + 1)}
                                disablePrevious={!hasPrevious}
                                disableNext={!hasNext}
                            />
                            <MultiLineChart
                                title={`Maturation over ${rangeLabel}`}
                                data={fruitStageData}
                                onPrevious={() => setOffset((current) => current - 1)}
                                onNext={() => setOffset((current) => current + 1)}
                                disablePrevious={!hasPrevious}
                                disableNext={!hasNext}
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