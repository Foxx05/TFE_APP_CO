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

try {
    $stmtUser = $pdo->prepare("
        SELECT email, username
        FROM users
        WHERE user_id = :user_id
        LIMIT 1
    ");

    $stmtUser->execute([
        ":user_id" => $user_id
    ]);

    $user = $stmtUser->fetch(PDO::FETCH_ASSOC);

    if (!$user || empty($user["email"])) {
        echo json_encode([
            "success" => false,
            "message" => "User email not found"
        ]);
        exit;
    }

    $stmt = $pdo->prepare("
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
        WHERE g.user_id = :user_id
        ORDER BY ps.greenhouse_id ASC, ps.captured_at ASC
    ");

    $stmt->execute([
        ":user_id" => $user_id
    ]);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (!$rows) {
        echo json_encode([
            "success" => false,
            "message" => "No production data found"
        ]);
        exit;
    }

    $filename = "production_snapshots_user_" . $user_id . "_" . date("Y-m-d") . ".csv";
    $filepath = sys_get_temp_dir() . "/" . $filename;

    $file = fopen($filepath, "w");

    fputcsv($file, [
        "id",
        "greenhouse_id",
        "greenhouse_name",
        "captured_at",
        "flowers_white",
        "fruits_green",
        "fruits_yellow",
        "fruits_red",
        "status",
        "temperature_air_c",
        "humidity_pct",
        "pressure_hpa",
        "lux",
        "harvested_now",
        "harvest_total"
    ]);

    foreach ($rows as $row) {
        fputcsv($file, $row);
    }

    fclose($file);

    $to = $user["email"];
    $subject = "Your BerryCam production CSV";
    $message = "Hello " . $user["username"] . ",\n\n";
    $message .= "You will find attached your production snapshots CSV export.\n\n";
    $message .= "BerryCam";

    $boundary = md5(time());

    $headers = "From: BerryCam <no-reply@theocolpaert.be>\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: multipart/mixed; boundary=\"" . $boundary . "\"\r\n";

    $body = "--" . $boundary . "\r\n";
    $body .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
    $body .= $message . "\r\n";

    $fileContent = chunk_split(base64_encode(file_get_contents($filepath)));

    $body .= "--" . $boundary . "\r\n";
    $body .= "Content-Type: text/csv; name=\"" . $filename . "\"\r\n";
    $body .= "Content-Disposition: attachment; filename=\"" . $filename . "\"\r\n";
    $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
    $body .= $fileContent . "\r\n";
    $body .= "--" . $boundary . "--";

    $sent = mail($to, $subject, $body, $headers);

    unlink($filepath);

    if (!$sent) {
        echo json_encode([
            "success" => false,
            "message" => "Email could not be sent"
        ]);
        exit;
    }

    echo json_encode([
        "success" => true,
        "message" => "CSV sent successfully"
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}