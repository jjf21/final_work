var mode_edition = 0;

$(document).on("keyup", "#paragraphes", function(leContexe) {
  // Appui sur ESC
  if ((leContexe.key == "Escape") && (mode_edition === 1)) {
    $("#paragraphes textarea").each(function() {
      var contenuPrecedent = $(this).data("content");
      var metaT = $(this).data();
      var jP = $("<p>").html(contenuPrecedent).data(metaT);
      $(this).replaceWith(jP);
    });
  }
});

$(document).on("click", "#paragraphes p", function() {
  console.log();
  if (mode_edition === 1) {
    // clic sur un futur P.
    var contenuP = $(this).html();
    var metaP = $(this).data();
    // préparer le futur textarea
    var jT = $("<textarea class='materialize-textarea'>")
      .val(contenuP)
      .data(metaP);

    // insertion dans le DOM
    $(this).replaceWith(jT);
  }
});


$(document).on("keydown", "#paragraphes textarea", function(leContexe) {
  // Validation d'une saisie entré
  if (leContexe.which == 13) {
    // On prépare le nouveau P.
    var content = $(this).val();
    var metaT = $(this).data();
    var jP = $("<p>").html(content).data(metaT);

    // On met à jour ses méta-données
    // car le contenu a changé

    jP.data("content", content);
    //On envoie une requete au serveur
    $.getJSON("api/data.php", {
        "action": "update_paragraphe",
        "paragraphe_id": metaT.id,
        "position": metaT.position,
        "content": content
      },
      function(oRep) {
        if (oRep.feedback != "ok") {
          alert("Rechargez votre navigateur...");
        }
      });
    // On l'insère
    $(this).replaceWith(jP);
  }
});


// Meta données au survol
$(document).on("mouseover", "#paragraphes div p, #paragraphes div textarea", function() {
  //console.log($(this).data());
});


function request_articles() {
  // On recupère les articles en bases via une requête vers notre API
  $.ajax({
    url: "api/data.php",
    dataType: 'json',
    async: false,
    data: {
      "action": "find_articles"
    },
    success: function(oRep) {
      if (oRep.feedback != "ok") {
        alert("Erreur, veuillez recharger votre navigateur");
      } else {
        console.log(oRep);
        // ajout des articles dans le select
        $.each(oRep.articles, function(i, item) {
          $('#articles').append($('<option>', {
            value: item.id,
            text: item.title
          }));
        });
        $('select').material_select();
      }
    }
  });
}

function load_paragrahes(article_id) {
  var res = $.ajax({
    url: "api/data.php",
    dataType: 'json',
    async: false,
    data: {
      "action": "find_paragraphes",
      "article_id": article_id
    },
    success: function(oRep) {
      return oRep;
    }
  });
  $("#edit").show();
  return res.responseText;
}


function display_paragraphes(paragraphes) {
  console.log(paragraphes);
  $('#paragraphes').html('');
  $.each(paragraphes, function(i, item) {
    var jP = $("<p>")
      .html(item.content);
    // ON change la structure... <div><span><p>
    var jS = $("<div class='item'><span class='poignee'><i class='material-icons right'>drag_handle</i></span></div>");
    jS.append(jP);
    $("#paragraphes").append(jS);
    // TODO: y associer leurs méta-données
    jP.data(item);
  });
}


function buttons() {
  // Gestion des boutons

  // Mode Edition
  $("#edit").click(function() {
    $("#edit").hide();
    $("#normal").show();
    $("#add_paragraphe").show();

    mode_edition = 1;
  });

  if (mode_edition === 1) {
    $("p").hover(function() {
      $(this).css("cursor", "pointer")
    });
  }
  // Mode Normal
  $("#normal").click(function() {
    $("#edit").show();
    $("#normal").hide();
    $("#edit").removeClass("normal");
    mode_edition = 0;
  });

  // Nouvel Article
  $("#create_article").click(function() {
    $("#new_article").show();
  })

  // Creation Article
  $("#create_a").click(function() {
    var title = $("#title").val();
    $.getJSON("api/data.php", {
        "action": "create_article",
        "title": title
      },
      function(oRep) {

        if (oRep.feedback != "ok") {
          alert("Erreur, veuillez recharger votre navigateur");
        } else {
          console.log('article saved');
          $("#new_article").hide();
          $("#title").val("");
          $('#articles').append($('<option>', {
            value: oRep.article_id,
            text: title
          }));
          $('select').material_select();
        }
      });
  })

  // Nouveau Paragraphe
  $("#add_paragraphe").click(function() {
    $("#new_paragraphe").show();
    create_article_empyt()
  })

  // Creation paragraphe
  //$("#create_p").click(function()
  function create_article_empyt() {
    var article_id = $('#articles').val();
    var content = " "
    if (last_data = $("#paragraphes div p, #paragraphes div textarea").last().data()) {
      next_pos = parseInt(last_data.position) + 1;
    } else {
      next_pos = 1;
    }
    console.log("article_id: ", article_id, "content ", content, "last_data: ", last_data, "next_pos: ", next_pos);

    $.getJSON("api/data.php", {
        "action": "create_paragraphe",
        "content": content,
        "article_id": article_id,
        "position": next_pos
      },
      function(oRep) {
        if (oRep.feedback != "ok") {
          alert("Erreur, veuillez recharger votre navigateur");
        } else {
          $("#new_paragraphe").hide();
          $("#content").val("");

          var item = {
            'article_id': article_id,
            'content': content,
            'id': oRep.paragraphe_id,
            'position': next_pos
          };

          var jP = $("<p>")
            .html(item.content);
          // ON change la structure... <div><span><p>
          var jS = $("<div class='item'><span class='poignee'><i class='material-icons right'>drag_handle</i></span></div>");
          jS.append(jP);
          if ($(".item").length === 0) {
            $("#paragraphes").html('');
          }
          $("#paragraphes").append(jS);
          // TODO: y associer leurs méta-données
          jP.data(item);

          //simuler le click sur le paragraphe
          $(".item:last p").trigger("click");
          $(".item:last textarea").focus();
          // $('#paragraphe').append($('<option>', {
          // 		value: oRep.article_id,
          // 		text : title
          // }));

        }
      });
    // $( "#new_paragraphe" ).show();
  };

}



// Permet le drag&drop
function sortable() {
  $("#paragraphes").sortable({
    connectWith: ".ui-sortable",
    handle: ".poignee",
    placeholder: "emplacement",
    start: function() {
      $('p').each(function(i) {
        console.log($(this).data('position'), 'ordreStart'); // updates the data object
      });
    },
    update: function() {
      $('p').each(function(i) {
        var item = $(this).data(); // updates the data object
        $.ajax({
          url: "api/data.php",
          dataType: 'json',
          async: false,
          data: {
            "action": "update_positions",
            "article_id": item.id,
            "position": i + 1
          },
          success: function(oRep) {
            if (oRep.feedback != "ok") {
              alert("Erreur, veuillez recharger votre navigateur");
            } else {
              console.log(oRep);
            }
          }
        });
        i = i + 1;
      });

    },
    stop: function(event, ui) {
      // console.log("id de l'item modifie : ", $("p",ui.item).data("id"));
      // console.log("ordre de l'element precedent : ", $("p",ui.item.prev()).data("position"));
      // console.log("ordre de l'element suivant : ", $("p",ui.item.next()).data("position"));
    }
  });
}



$(document).ready(function() {
  $('.modal').modal();


  // recupère les articles
  request_articles();

  // écoute le champ select
  $('#articles').change(function() {
    $("#edit").show();
    $("#normal").hide();
    $("#add_paragraphe").hide();

    // récupères les paragraphres
    var paragraphes = JSON.parse(load_paragrahes(this.value)).paragraphes;


    display_paragraphes(paragraphes);
    if (paragraphes.length < 1) {
      $("#paragraphes").html('');
      $("#paragraphes").append("<i class='center material-icons sad-icon'>mood_bad</i><h5 class='center'>Aucun paragraphe, passez en mode edition pour en ajouter</h5>");
    }
    // display_paragraphes(paragraphes);
    // TODO afficher les paragraphes --> et mode edition
    sortable();
    $("#paragraphes").disableSelection();
  });

  // Gestion des boutons
  buttons();


  // $(function() {
  // 	$("#paragraphes").sortable({
  // 		connectWith: ".ui-sortable",
  // 			start: function(){
  // 				$('p').each(function(i) {
  //          console.log($(this).data('position'), 'ordreStart'); // updates the data object
  //       	});
  // 			},
  // 			update : function () {
  // 				$('p').each(function(i) {
  //          console.log($(this).data('position'), 'OrdreAfter'); // updates the data object
  //       	});
  // 			}
  // 	}).disableSelection();
  //  });

});