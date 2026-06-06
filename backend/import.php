<?php

header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . "/config.php";

$greenhouseId = isset($_GET['greenhouse_id']) ? (int)$_GET['greenhouse_id'] : 1;
$range = $_GET['range'] ?? 'season';
$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

try {
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
        'last' => null,
        'history' => [],
        'monthly_production' => []
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$stmtMaxDate = $pdo->prepare("
    SELECT MAX(captured_at)
    FROM production_snapshots
    WHERE greenhouse_id = :greenhouse_id
");

$stmtMaxDate->execute([
    ':greenhouse_id' => $greenhouseId
]);

$latestDate = $stmtMaxDate->fetchColumn();

$dateCondition = "YEAR(captured_at) = :year";
$dateParams = [
    ':greenhouse_id' => $greenhouseId,
    ':year' => $latestYear
];

$startDate = null;
$endDate = null;

if ($range === "day" || $range === "week" || $range === "month") {
    $baseDate = new DateTime($latestDate);

    if ($range === "day") {
        $baseDate->modify(($offset * 24) . " hours");
        $endDate = clone $baseDate;
        $startDate = clone $baseDate;
        $startDate->modify("-24 hours");
    }

    if ($range === "week") {
        $baseDate->modify(($offset * 7) . " days");
        $endDate = clone $baseDate;
        $startDate = clone $baseDate;
        $startDate->modify("-7 days");
    }

    if ($range === "month") {
        $baseDate->modify($offset . " months");
        $endDate = clone $baseDate;
        $startDate = clone $baseDate;
        $startDate->modify("-1 month");
    }

    $dateCondition = "captured_at >= :start_date AND captured_at <= :end_date";

    $dateParams = [
        ':greenhouse_id' => $greenhouseId,
        ':start_date' => $startDate->format("Y-m-d H:i:s"),
        ':end_date' => $endDate->format("Y-m-d H:i:s")
    ];
}

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

 $hasPrevious = false;

if ($startDate !== null) {
    $previousEnd = clone $startDate;
    $previousStart = clone $startDate;

    if ($range === "day") {
        $previousStart->modify("-24 hours");
    }

    if ($range === "week") {
        $previousStart->modify("-7 days");
    }

    if ($range === "month") {
        $previousStart->modify("-1 month");
    }

    $stmtPrevious = $pdo->prepare("
        SELECT COUNT(*)
        FROM production_snapshots
        WHERE greenhouse_id = :greenhouse_id
        AND captured_at >= :previous_start
        AND captured_at < :previous_end
    ");

    $stmtPrevious->execute([
        ':greenhouse_id' => $greenhouseId,
        ':previous_start' => $previousStart->format("Y-m-d H:i:s"),
        ':previous_end' => $previousEnd->format("Y-m-d H:i:s")
    ]);

    $hasPrevious = ((int)$stmtPrevious->fetchColumn()) > 0;
}
$hasNext = $offset < 0;   

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
    'offset' => $offset,
    'has_previous' => $hasPrevious,
    'has_next' => $hasNext,
    'last' => $lastRow,
    'history' => $rows,
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