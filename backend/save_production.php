<?php
header('Content-Type: application/json; charset=utf-8');

$API_KEY = 'CHANGE_MOI_AVEC_UNE_CLE_SECRETE_LONGUE';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Méthode non autorisée'
    ]);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'JSON invalide'
    ]);
    exit;
}

if (!isset($data['api_key']) || $data['api_key'] !== $API_KEY) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Clé API invalide'
    ]);
    exit;
}

$requiredFields = [
    'captured_at',
    'flowers_white',
    'fruits_green',
    'fruits_yellow',
    'fruits_red',
    'status',
    'temperature_air_c',
    'humidity_pct',
    'pressure_hpa',
    'lux',
    "harvested_now",
    "harvest_total"
   
];

foreach ($requiredFields as $field) {
    if (!array_key_exists($field, $data)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => "Champ manquant : $field"
        ]);
        exit;
    }
}

$greenhouseId = isset($data['greenhouse_id']) ? (int)$data['greenhouse_id'] : 1;

$host = 'theocortheocorwp.mysql.db';
$dbname = 'theocortheocorwp';
$user = 'theocortheocorwp';
$pass = 'theocorWP5150';

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

    $sql = "
        INSERT INTO production_snapshots (
            greenhouse_id,
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
        ) VALUES (
            :greenhouse_id,
            :captured_at,
            :flowers_white,
            :fruits_green,
            :fruits_yellow,
            :fruits_red,
            :status,
            :temperature_air_c,
            :humidity_pct,
            :pressure_hpa,
            :lux,
            :harvested_now,
            :harvest_total
            
        )
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ':greenhouse_id'   => $greenhouseId,
        ':captured_at'     => $data['captured_at'],
        ':flowers_white'   => (int)$data['flowers_white'],
        ':fruits_green'    => (int)$data['fruits_green'],
        ':fruits_yellow'   => (int)$data['fruits_yellow'],
        ':fruits_red'      => (int)$data['fruits_red'],
        ':status'          => (string)$data['status'],
        ':temperature_air_c' => $data['temperature_air_c'] !== null ? (float)$data['temperature_air_c'] : null,
        ':humidity_pct'    => $data['humidity_pct'] !== null ? (float)$data['humidity_pct'] : null,
        ':pressure_hpa'    => $data['pressure_hpa'] !== null ? (float)$data['pressure_hpa'] : null,
        ':lux'             => $data['lux'] !== null ? (float)$data['lux'] : null,
        ':harvested_now'   => (int)$data['harvested_now'],
        ':harvest_total'      => (int)$data['harvest_total'],
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Snapshot enregistré',
        'insert_id' => $pdo->lastInsertId()
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur base de données',
        'error' => $e->getMessage()
    ]);
}