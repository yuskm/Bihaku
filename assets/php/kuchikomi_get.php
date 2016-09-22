<?php
    $data = array();

    // PostgreSQL Connect
    $url = parse_url(getenv('DATABASE_URL'));
    $str = "host=" . $url['host'] . "user=" . $url['user'] . "password=" . $url['pass'] . "dbname=" . substr($url['path'], 1);

    $dbconn = pg_connect("host=" . $url['host'] . " user=" . $url['user'] . " password=" . $url['pass'] . " dbname=" . substr($url['path'], 1));
/*
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
*/
    pg_close( $dbconn );

//    header( 'Content-Type: application/json; charset=utf-8' );
//    echo json_encode( $data );

    echo ($url);
    var_dump($url);
    var_dump($dbconn);
    var_dump($str);
?>
