<?php
    $data = array();

    // PostgreSQL Connect
    $dbconn = pg_connect("host=localhost user=postgres password=postgres dbname=postgres");
    // SQL
    $sql = "SELECT * FROM bihakunavi;";
    $result = pg_query($dbconn, $sql);

    // get result
    $rownum = pg_numrows( $result );
    for ($i = 0; $i < $rownum; $i++) {
        $rowdata = pg_fetch_array( $result, NULL, PGSQL_ASSOC );
        $data[] = $rowdata;
    }

    // PostgreSQL Disconnect
    pg_close( $dbconn );

    header( 'Content-Type: application/json; charset=utf-8' );
    echo json_encode( $data );
?>
