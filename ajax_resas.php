<?php
if(isset($_GET["url"]) && preg_match("/^https?:/",$_GET["url"])){
    // リクエストヘッダ
    $header = array(
        "X-API-KEY:jjkM0EseFvxFfRxusehbPXvFojg2qJ13sPiwjNPK",
        "Content-Type:application/json",
    );

    // HTTPコンテキスト
    $options = array('http' =>
            array(
            "method" => 'GET',
            "header" => implode("\r\n", $header),
        )
    );
    echo file_get_contents($_GET["url"], false ,stream_context_create($options));
}else{
    echo "error";
}
