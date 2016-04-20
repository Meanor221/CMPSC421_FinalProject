/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).ready(function () {
    // Animate the side div in.
    $("#sideDiv").hide().fadeIn();

    // Add hover functionality to each button.
    var buttons = $("button");
    for (var i = 0; i < buttons.length; i++) {
        // Add the hover class when the mouse enters the button.
        $(buttons[i]).mouseenter(function () {
            $(this).switchClass("", "hover", 200);
        });
        // Remove the hover class when the mouse leaves the button.
        $(buttons[i]).mouseleave(function () {
            $(this).switchClass("hover", "", 200);
        });
    }
});

function createLecture(){
    $.post("/ShowAndTellProject/Controller", {
        action: "newLecture",
        success: function (res) {
            parent.document.getElementById('cframe').contentWindow.location =
                    "http://localhost:8080/ShowAndTellProject/views/createLecture.jsp";
        }
    });
}

function editLecture(){
    var id = $("#lecture").val();
    $.post("/ShowAndTellProject/Controller", {
        id: id,
        action: "changeLecture",
        success: function (res) {
            document.location.href = document.location.href;
        }
    });
}

function deleteLecture() {
    var id = $("#lecture").val();
    $.post("/ShowAndTellProject/Controller", {
        id: id,
        action: "deleteLecture",
        success: function (res) {
            document.location.href = document.location.href;
        }
    });
}
