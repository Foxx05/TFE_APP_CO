<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

$host = 'theocortheocorwp.mysql.db';
$dbname = 'theocortheocorwp';
$user = 'theocortheocorwp';
$pass = 'theocorWP5150';

$greenhouseId = isset($_GET['greenhouse_id']) ? (int)$_GET['greenhouse_id'] : 1;
$range = $_GET['range'] ?? 'season';
$compareYear = isset($_GET['compare_year']) ? (int)$_GET['compare_year'] : null;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;

if ($limit < 10) {
    $limit = 10;
}
if ($limit > 1000) {
    $limit = 1000;
}

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
    $stmtYear = $pdo->prepare("
    SELECT MAX(YEAR(captured_at)) AS latest_year
    FROM production_snapshots
    WHERE greenhouse_id = :greenhouse_id
");

$stmtYear->execute([
    ':greenhouse_id' => $greenhouseId
]);

$latestYear = (int)$stmtYear->fetchColumn();
if (!$latestYear) {
    echo json_encode([
        'success' => true,
        'greenhouse_id' => $greenhouseId,
        'season_year' => null,
        'compare_year' => $compareYear,
        'last' => null,
        'history' => [],
        'compare_history' => [],
        'monthly_production' => []
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$dateCondition = "YEAR(captured_at) = :year";
$dateParams = [
    ':greenhouse_id' => $greenhouseId,
    ':year' => $latestYear
];

if ($range === "day") {
    $dateCondition .= " AND captured_at >= DATE_SUB((
        SELECT MAX(captured_at)
        FROM production_snapshots
        WHERE greenhouse_id = :greenhouse_id
    ), INTERVAL 24 HOUR)";
}

if ($range === "week") {
    $dateCondition .= " AND captured_at >= DATE_SUB((
        SELECT MAX(captured_at)
        FROM production_snapshots
        WHERE greenhouse_id = :greenhouse_id
    ), INTERVAL 7 DAY)";
}

if ($range === "month") {
    $dateCondition .= " AND captured_at >= DATE_SUB((
        SELECT MAX(captured_at)
        FROM production_snapshots
        WHERE greenhouse_id = :greenhouse_id
    ), INTERVAL 1 MONTH)";
}

    // Dernière mesure
   // Dernière mesure
$stmtLast = $pdo->prepare("
    SELECT
        ps.id,
        ps.greenhouse_id,
        g.name AS greenhouse_name,
        ps.captured_at,
        ps.flowers_white,
        ps.fruits_green,
        ps.fruits_yellow,
        ps.fruits_red,
        ps.status,
        ps.temperature_air_c,
        ps.humidity_pct,
        ps.pressure_hpa,
        ps.lux,
        ps.harvested_now,
        ps.harvest_total
    FROM production_snapshots ps
    INNER JOIN greenhouses g
        ON ps.greenhouse_id = g.greenhouse_id
    WHERE ps.greenhouse_id = :greenhouse_id
    ORDER BY ps.captured_at DESC
    LIMIT 1
");
    $stmtLast->execute([
        ':greenhouse_id' => $greenhouseId
    ]);
    $lastRow = $stmtLast->fetch();
$stmtHistory = $pdo->prepare("
    SELECT
        captured_at,
        flowers_white,
        fruits_green,
        fruits_yellow,
        fruits_red,
        status,
        temperature_air_c,
        humidity_pct,
        pressure_hpa,
        lux,
        harvested_now,
        harvest_total
    FROM production_snapshots
    WHERE greenhouse_id = :greenhouse_id
    AND $dateCondition
    ORDER BY captured_at ASC
");

$stmtHistory->execute($dateParams);
$rows = $stmtHistory->fetchAll();

    

    // Production mensuelle
    $stmtMonthly = $pdo->prepare("
        SELECT
            DATE_FORMAT(day_date, '%Y-%m') AS month_key,
            MAX(day_total) AS month_end_total
        FROM (
            SELECT
                DATE(captured_at) AS day_date,
                MAX(harvest_total) AS day_total
            FROM production_snapshots
            WHERE greenhouse_id = :greenhouse_id AND YEAR(captured_at) = :year
            GROUP BY DATE(captured_at)
        ) daily
        GROUP BY DATE_FORMAT(day_date, '%Y-%m')
        ORDER BY month_key ASC
    ");
    $stmtMonthly->execute([
        ':greenhouse_id' => $greenhouseId,
        ':year' => $latestYear
    ]);
    $monthlyRaw = $stmtMonthly->fetchAll();

    $monthlyProduction = [];
    $prevMonthEnd = 0;

    foreach ($monthlyRaw as $row) {
        $monthKey = $row['month_key'];
        $monthEnd = (int)$row['month_end_total'];

        $produced = $monthEnd - $prevMonthEnd;

        $monthlyProduction[] = [
            'label' => $monthKey,
            'value' => max(0, $produced)
        ];

        $prevMonthEnd = $monthEnd;
    }
$compareRows = [];

if ($compareYear) {
    $stmtCompare = $pdo->prepare("
        SELECT
            captured_at,
            flowers_white,
            fruits_green,
            fruits_yellow,
            fruits_red,
            status,
            temperature_air_c,
            humidity_pct,
            pressure_hpa,
            lux,
            harvested_now,
            harvest_total
        FROM production_snapshots
        WHERE greenhouse_id = :greenhouse_id
        AND YEAR(captured_at) = :compare_year
        ORDER BY captured_at ASC
    ");

    $stmtCompare->execute([
        ':greenhouse_id' => $greenhouseId,
        ':compare_year' => $compareYear
    ]);

    $compareRows = $stmtCompare->fetchAll();
}

$stmtSeasonHarvest = $pdo->prepare("
    SELECT
        COALESCE(MAX(harvest_total), 0) - COALESCE(MIN(harvest_total), 0) AS season_harvest_total
    FROM production_snapshots
    WHERE greenhouse_id = :greenhouse_id
    AND YEAR(captured_at) = :year
");

$stmtSeasonHarvest->execute([
    ':greenhouse_id' => $greenhouseId,
    ':year' => $latestYear
]);

$seasonHarvestTotal = (int)$stmtSeasonHarvest->fetchColumn();
   echo json_encode([
    'success' => true,
    'greenhouse_id' => $greenhouseId,
    'season_year' => $latestYear,
    'compare_year' => $compareYear,
    'last' => $lastRow,
    'history' => $rows,
    'compare_history' => $compareRows,
    'monthly_production' => $monthlyProduction,
    'season_harvest_total' => $seasonHarvestTotal
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}