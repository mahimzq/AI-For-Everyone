<?php
$headers = getallheaders();
echo "Authorization: " . (isset($headers['Authorization']) ? $headers['Authorization'] : "MISSING") . "\n";
echo "HTTP_AUTHORIZATION: " . (isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : "MISSING") . "\n";
