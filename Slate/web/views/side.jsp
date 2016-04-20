

<%@page import="DAO.CrudDao"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="Model.*" %>
<!DOCTYPE html>
<html>
    <head>
        <link rel="stylesheet" href="css/side.css">
        <link href='https://fonts.googleapis.com/css?family=Roboto:400,900,700' rel='stylesheet' type='text/css'>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>
        <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js"></script>
        <script src="js/side.js"></script>
    </head>
    <body>
        <fieldset class="sideDiv">
            <legend> Show & Tell </legend>
            <select id="lecture">
                <%
                    for (Lecture lecture : new CrudDao().getLectures()) {
                %>
                <option value="<%=lecture.getLectureID()%>"><%=lecture.getLectureTitle()%></option>
                <%
                    }
                %>
            </select>

            <button id="editLecture" onclick="editLecture()">Edit Lecture</button>
            <button id="deleteLecture" onclick="deleteLecture()">Delete Lecture</button>
        </fieldset><br>
        <fieldset class="sideDiv">
            <button id="createLecture" onclick="createLecture()">Create Lecture</button>
        </fieldset><br>
    </body>
</html>
