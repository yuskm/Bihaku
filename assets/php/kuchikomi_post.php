<?php
    $data = array();
    $lat = $_POST['lat'];
    $lng = $_POST['lng'];

    // PostgreSQL Connect
    $dbconn = pg_connect("host=localhost user=postgres password=postgres dbname=postgres");
    // SQL
    $sql = "insert into bihakunavi (userid,lat,lng) values ('0'," . $lat .",". $lng . ");";
    $result = pg_query($dbconn, $sql);

    // PostgreSQL Disconnect
    pg_close( $dbconn );
?>
