<html>
    <head>
        <style type="text/css">
            table {
                border-collapse: collapse;
            }
            
            table, td, tr {
                border: 1px solid;
                padding: 5px;
            }
        </style>    
    </head>
    <body>
        <h2>100 latest maps created</h2>
        <?php
        require dirname(__FILE__) . '/../classes/headstart/persistence/SQLitePersistence.php';
        require_once dirname(__FILE__) . '/../classes/headstart/library/CommUtils.php';
        require_once dirname(__FILE__) . '/../classes/headstart/library/toolkit.php';

        use headstart\library;

        function arrayToTable($data = array()) {
            $rows = array();
            $rows[] = "<tr><th>id</th><th>timestamp</th><th>query</th><th>source</th></tr>";
            foreach ($data as $row) {
                $cells = array();
                foreach ($row as $cell) {
                    $cells[] = "<td>{$cell}</td>";
                }
                $rows[] = "<tr>" . implode('', $cells) . "</tr>";
            }
            return "<table>" . implode('', $rows) . "</table>";
        }

        $INI_DIR = dirname(__FILE__) . "/../preprocessing/conf/";

        $ini_array = library\Toolkit::loadIni($INI_DIR);

        $persistence = new \headstart\persistence\SQLitePersistence($ini_array["connection"]["sqlite_db"]);

        $settings = $ini_array["general"];

        $latest_revisions = $persistence->getLatestRevisions($limit = 100);

        $reduced_array = array();
        foreach ($latest_revisions as $revision) {
            $reduced_array[] = array_unique($revision);
        }

        echo arrayToTable($reduced_array);
        ?>
    </body>
</html>

