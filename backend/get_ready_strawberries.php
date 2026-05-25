<?php
session_start();
header("Content-Type: application/json");

require_once __DIR__ . "/config.php";

if (!isset($_SESSION["user_id"])) {
    echo json_encode([
        "success" => false,
        "message" => "User not connected"
    ]);
    exit;
}

$user_id = $_SESSION["user_id"];

$stmt = $pdo->prepare("
    SELECT COALESCE(SUM(ps.fruits_red), 0) AS ready_strawberries
    FROM production_snapshots ps
    INNER JOIN greenhouses g 
        ON ps.greenhouse_id = g.greenhouse_id
    INNER JOIN (
        SELECT ps2.greenhouse_id, MAX(ps2.captured_at) AS last_capture
        FROM production_snapshots ps2
        INNER JOIN greenhouses g2 
            ON ps2.greenhouse_id = g2.greenhouse_id
        WHERE g2.user_id = :user_id
        AND YEAR(ps2.captured_at) = (
            SELECT MAX(YEAR(ps3.captured_at))
            FROM production_snapshots ps3
            INNER JOIN greenhouses g3 
                ON ps3.greenhouse_id = g3.greenhouse_id
            WHERE g3.user_id = :user_id
        )
        GROUP BY ps2.greenhouse_id
    ) latest
        ON ps.greenhouse_id = latest.greenhouse_id
        AND ps.captured_at = latest.last_capture
    WHERE g.user_id = :user_id
");

$stmt->execute([
    ":user_id" => $user_id
]);

$result = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "ready_strawberries" => (int)$result["ready_strawberries"]
]);