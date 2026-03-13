<?php
// ══════════════════════════════════════════════
// SELF-HEALING REVERSE PROXY
// Routes all requests to Node.js backend on port 5001
// Auto-restarts PM2 if the backend is unreachable
// ══════════════════════════════════════════════

$backend = "http://127.0.0.1:5001";
$request_uri = $_SERVER['REQUEST_URI'];
$url = $backend . $request_uri;
$method = $_SERVER['REQUEST_METHOD'];

// ── Paths ──
$node_path = '/opt/alt/alt-nodejs20/root/usr/bin';
$app_dir = '/home/u704589227/domains/aiforeveryone.mindsetai.co.uk';
$pm2_bin = $app_dir . '/server/node_modules/.bin/pm2';

// ── Auto-Restart logic moved to watchdog daemon ──
function proxy_request($url, $method)
{
    // ── Bulletproof Authorization Header Recovery ──
    // Hostinger LiteSpeed/FastCGI may strip the Authorization header.
    // We try EVERY possible source to recover it.
    $auth_header = '';

    // Source 1: getallheaders()
    $all_headers = getallheaders();
    if ($all_headers) {
        foreach ($all_headers as $name => $value) {
            if (strtolower($name) === 'authorization') {
                $auth_header = $value;
                break;
            }
        }
    }

    // Source 2: $_SERVER['HTTP_AUTHORIZATION'] (set by .htaccess SetEnvIf)
    if (empty($auth_header) && !empty($_SERVER['HTTP_AUTHORIZATION'])) {
        $auth_header = $_SERVER['HTTP_AUTHORIZATION'];
    }

    // Source 3: $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] (set after RewriteRule)
    if (empty($auth_header) && !empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $auth_header = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }

    // Source 4: apache_request_headers() as a separate call
    if (empty($auth_header) && function_exists('apache_request_headers')) {
        $apache_headers = apache_request_headers();
        if (isset($apache_headers['Authorization'])) {
            $auth_header = $apache_headers['Authorization'];
        }
    }

    // Build the outgoing headers array
    $headers = [];
    $auth_included = false;

    if ($all_headers) {
        foreach ($all_headers as $name => $value) {
            if (strtolower($name) === 'host')
                continue;
            if (strtolower($name) === 'authorization') {
                // Replace with our recovered auth header
                $headers[] = "Authorization: $auth_header";
                $auth_included = true;
                continue;
            }
            $headers[] = "$name: $value";
        }
    }

    // If Authorization was never in getallheaders, inject it manually
    if (!$auth_included && !empty($auth_header)) {
        $headers[] = "Authorization: $auth_header";
    }

    $headers[] = "X-Forwarded-For: " . $_SERVER['REMOTE_ADDR'];
    $headers[] = "Proxy-Connection: Keep-Alive";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);

    if ($method === 'POST' || $method === 'PUT' || $method === 'PATCH') {
        $input = file_get_contents('php://input');
        curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
    }

    $response = curl_exec($ch);
    $err = curl_errno($ch);
    $info = curl_getinfo($ch);
    curl_close($ch);

    return ['response' => $response, 'error' => $err, 'info' => $info];
}

function send_response($result)
{
    $response = $result['response'];
    $info = $result['info'];

    // Split headers and body
    $header_size = $info['header_size'];
    $headers_raw = substr($response, 0, $header_size);
    $body = substr($response, $header_size);

    // Forward response headers
    header_remove('Content-Type');
    $header_lines = explode("\r\n", $headers_raw);
    foreach ($header_lines as $line) {
        $trimmed = trim($line);
        if (empty($trimmed))
            continue;
        if (stripos($trimmed, 'HTTP/') === 0)
            continue;
        if (stripos($trimmed, 'Transfer-Encoding:') !== false)
            continue;
        if (stripos($trimmed, 'Content-Encoding:') !== false)
            continue;

        $parts = explode(':', $trimmed, 2);
        if (count($parts) === 2 && strtolower(trim($parts[0])) === 'set-cookie') {
            header($trimmed, false);
        } else {
            header($trimmed, true);
        }
    }

    http_response_code($info['http_code']);
    echo $body;
}

// ══════════════════════════════════════════════
// MAIN: Proxy the request, auto-heal if needed
// ══════════════════════════════════════════════

// Attempt 1: Normal proxy
$result = proxy_request($url, $method);

if ($result['error'] === 0 && $result['info']['http_code'] > 0) {
    send_response($result);
    exit;
}

// Backend is down — return 502 gracefully instead of aggressive restart
http_response_code(502);
header('Content-Type: application/json');
echo json_encode([
    'error' => 'Service temporarily unavailable',
    'message' => 'The backend API could not be reached. The background watchdog daemon will recover it within 1-2 minutes. Please try again later.',
    'retry_after' => 60
]);
?>