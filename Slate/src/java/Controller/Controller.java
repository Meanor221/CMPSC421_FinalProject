
package Controller;

import DAO.CrudDao;
import Model.Entity;
import Model.Lecture;
import Model.Page;
import java.io.IOException;
import java.util.ArrayList;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


public class Controller extends HttpServlet {
    //public static final String NAME_HEADER = "LECTURE_NAME"   ; // header value for the name of a lecture
    //public static final String ID_HEADER   = "LECTURE_ID"      ; // header value for the id of a lecture
    CrudDao lectureDB = new CrudDao();
    
    @Override
    protected void doGet(HttpServletRequest request,
            HttpServletResponse response) throws ServletException, IOException {
        if (request.getRequestURI().endsWith("side.jsp")) {
            RequestDispatcher dispatcher = request.getRequestDispatcher("/views/side.jsp");
        dispatcher.forward(request, response);
        }
        doPost(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request,
            HttpServletResponse response) throws ServletException, IOException {
        String action = request.getParameter("action");
        response.setContentType("application/json");
        if(action != null){
            /*
                actions:
                newLecture
                newPage
                newEntity
                deleteEntity
                deletePage
                deleteLecture
                changeEntity
                changePage
                changeLecture
                getLecture
                getLectureList
             */
            System.out.println("ID: " + request.getParameter("id") + "\t\tAction: " +
                    request.getParameter("action"));
            switch (action) {
                case "newLecture": //
                    Lecture newLecture = new Lecture();
                    lectureDB.addLecture(newLecture);
                    //response.sendRedirect("views/createLecture.jsp");
                    break;
                case "newPage": //
                    break;
                case "newEntity":
                    break;
                case "deleteEntity":
                    break;
                case "deletePage": //
                    break;
                case "deleteLecture": //
                    break;
                case "changeEntity":
                    break;
                case "updatePage": //
                    break;
                case "updateLecture": //
                    break;
                case "getLecture":
                    break;
                case "getLectureList":
                    break;
                default:
                    break;
            }
        }
    }
    
    private Lecture getLecture(HttpServletRequest request){
        return null;
    }
}
