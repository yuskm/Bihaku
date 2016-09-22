<?php
    $data = array();
    $lat = $_POST['lat'];
    $lng = $_POST['lng'];

    // PostgreSQL Connect
    $url = parse_url(getenv('DATABASE_URL'));
    $dbconn = pg_connect("host=" . $url['host'] . " user=" . $url['user'] . " password=" . $url['pass'] . " dbname=" . substr($url['path'], 1));

    // SQL
    $sql = "insert into bihakunavi (userid,lat,lng) values ('0'," . $lat .",". $lng . ");";
    $result = pg_query($dbconn, $sql);

    // PostgreSQL Disconnect
    pg_close( $dbconn );
?>
