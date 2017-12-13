<?php

error_reporting(E_ERROR); // enlever les messages 'deprecated'...

include("../config/config.php");
// penser à maj le nom de la base et le mot de passe
include("../helpers/maLibSQL.pdo.php");

/*
http://.../data.php?action=updateP&id=2&content=test
{"feedback":"ok","paragraphe":[]}

http://.../data.php?action=getP

{"feedback":"ok","paragraphe":[{"id":"1","content":"premier","position":"1"},{"id":"2","content":"test","position":"2"},{"id":"3","content":"toto","position":"3"}]}

http://.../data.php?action=addP&position=3&content=toto
{"feedback":"ok","paragraphe":[],"id":4}

http://.../data.php?action=delP&id=3
{"feedback":"ok","paragraphe":[]}
*/


$data["feedback"] = "ko";


if (isset($_GET["action"]))
{
	switch($_GET["action"]) {

		case "find_articles" :
			// Renvoie tous les paragraphe de la base de données
			$data["articles"] = array();
			$SQL = "SELECT * FROM article";
			$res = parcoursRs(SQLSelect($SQL));
			$data["feedback"] = "ok";
			$data["articles"] = $res;
		break;

		case "create_article" :
			// Renvoie tous les paragraphe de la base de données
			if (isset($_GET["title"])) $title = addslashes($_GET["title"]);
			$SQL = "INSERT INTO article (title) VALUES ('{$title}');";
			if ($last_id = SQLInsert($SQL)){
				$data["feedback"] = "ok";
			};
			$data["article_id"] = $last_id;

		break;

		case "find_paragraphes" :
			// Renvoie tous les paragraphe de la base de données
			if (isset($_GET["article_id"])) $id = $_GET["article_id"];
			if ($id) {
				$SQL = "SELECT * FROM paragraphe WHERE article_id = {$id} ORDER BY position ASC";
				$res = parcoursRs(SQLSelect($SQL));
				$data["feedback"] = "ok";
				$data["paragraphes"] = $res;
			}else{
				$data["feedback"] = "No article params in article_id";
			}
		break;

		case "create_paragraphe" :
			if (isset($_GET["article_id"])) $article_id = $_GET["article_id"];
			if ($article_id) {
				if (isset($_GET["content"])) $content = $_GET["content"];
				if (isset($_GET["position"])) $position = $_GET["position"];
				if ($content && $position){
					$SQL = "INSERT INTO paragraphe(article_id, content, position) VALUES ('$article_id', '$content', '$position')";
					$nextId = SQLInsert($SQL);
					$data["feedback"] = "ok";
					$data["paragraphe_id"] = $nextId;
				}
			}else{
				$data["feedback"] = "Didn't receive correct datas to add paragraphes";
			}
		break;


		case "delete_paragraphe" :
			if (isset($_GET["paragraphe_id"])) $id = $_GET["paragraphe_id"];
			if ($id) {
				$SQL = "DELETE FROM paragraphe WHERE id='$id'";
				SQLUpdate($SQL);
				$data["feedback"] = "ok";
			}else{
				$data["feedback"] = "No article params in paragraphe_id";
			}
		break;


		case "update_paragraphe" :
			// Modifie un P. dont le nom est passé en paramètre
			if (isset($_GET["content"])) $content = addslashes($_GET["content"]);
			if (isset($_GET["paragraphe_id"])) $id = $_GET["paragraphe_id"];

			if ($id && $content) {
				$SQL = "UPDATE paragraphe SET content='{$content}' WHERE id= {$id}";
				echo $SQL;
				SQLUpdate($SQL);
				$data["feedback"] = "ok";
			}
		break;

		case "update_positions" :
			if (isset($_GET["article_id"])) $id = $_GET["article_id"];
			if (isset($_GET["position"])) $position = $_GET["position"];
			if ($id && $position) {
				$SQL = "UPDATE paragraphe SET position = '$position'
							WHERE id = '$id'";
				SQLUpdate($SQL);
				$data["feedback"] = "ok";
			}
		break;


	}
}

echo json_encode($data);
?>
