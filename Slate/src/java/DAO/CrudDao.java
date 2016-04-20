package DAO;

import Model.Entity;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import java.util.ArrayList;
import java.util.function.Function;
import java.util.List;
import java.util.Scanner;

import JDBC.DBUtility;
import Model.*;


public class CrudDao {
    // The path to the SQL file containing the queries to insert the necessary
    // tables in the database.
    private static final String INIT_SQL_FILE = "/DAO/initDatabase.sql";
    // The connection to the LectureDB database.
    private final Connection connection;
    
    /**
     * Constructs a new CrudDao instance that interfaces with the LectureDB
     * database.
     */
    public CrudDao() {
        // Retrieve the connection for the LectureDB database.
        connection = DBUtility.getConnection();
    }
    
    /**
     * Inserts an entity into the Database.
     * 
     * @param entity an Entity object whose properties should be added to the 
     *               database.
     */
    public void addEntity(Entity entity) {
        // Create a query to insert the entity into the database.
        String query = String.format(
                "insert into ENTITY (PAGEID, LECTUREID, ENTITYTYPE, ENTITYX, "
                        + "ENTITYY, ENTITYZ, ENTITYCONTENT, ENTITYANIMATION, "
                        + "ENTITYWIDTH, ENTITYHEIGHT) values (%s, %s, '%s', %s "
                        + "%s, %s, '%s', '%s')",
                entity.getPageID(),
                entity.getLectureID(),
                entity.getEntityType(),
                entity.getEntityX(),
                entity.getEntityY(),
                entity.getEntityZ(),
                entity.getEntityContent(),
                entity.getEntityAnimation(),
                entity.getEntityWidth(),
                entity.getEntityHeight()
        );
        
        // Execute the query.
        query(query);
    }
    
    /**
     * Inserts a Lecture into the database.
     * 
     * @param lecture the Lecture object whose properties should be added into
     *                the database.
     */
    public void addLecture(Lecture lecture) {
        // Create a query to insert the lecture into the database.
        String query = String.format(
                "insert into LECTURE (LECTURETITLE, COURSETITLE, INSTRUCTOR) "
                + "values ('%s', '%s', '%s')",
                lecture.getLectureTitle(),
                lecture.getCourseTitle(),
                lecture.getInstructor()
        );
        
        // Execute the query.
        query(query);
    }
    
    /**
     * Inserts the Page into the database.
     * 
     * @param page the Page object whose properties should be added into the
     *             database.
     */
    public void addPage(Page page) {
        // Create a query to insert the page into the database.
        String query = String.format(
                "insert into PAGE (LECTUREID, PAGESEQUENCE, PAGEAUDIOURL) "
                + "values (%s, %s, '%s')",
                page.getLectureID(),
                page.getPageSequence(),
                page.getPageAudioURL()
        );
        
        // Execute the query.
        query(query);
    }
    
    /**
     * Deletes the specified Entity in the database.
     * 
     * @param entityID the ID of the entity in the database.
     * @param pageID the ID of the page in the database.
     * @param lectureID the ID of the lecture in the database.
     */
    public void deleteEntity(int entityID, int pageID, int lectureID) {
        // Create a query to delete the entity with the specified ID.
        String query = String.format(
                "delete from ENTITY "
                        + "where ENTITYID=%s "
                        + "and PAGEID=%s "
                        + "and LECTUREID=%s",
                entityID,
                pageID,
                lectureID
        );
        
        // Execute the query.
        query(query);
    }
    
    /**
     * Deletes the specified Lecture in the database.
     * 
     * @param lectureID the ID of the lecture to delete in the database.
     */
    public void deleteLecture(int lectureID) {
        // Create a query to delete the lecture with the specified ID.
        String query = String.format(
                "delete from LECTURE "
                        + "where LECTUREID=%s",
                lectureID
        );
        
        // Execute the query.
        query(query);
    }
    
    public void deletePage(int lectureID, int pageID) {
        // Create a query to delete the page in the database.
        String query = String.format(
                "delete from PAGE "
                        + "where LECTUREID=%s "
                        + "and PAGEID=%s",
                lectureID,
                pageID
        );
        
        // Execute the query.
        query(query);
    }
    
    /**
     * Retrieves all of the Entity objects in the database for the specified
     * page in the specified lecture.
     * 
     * @param pageID the ID of the page to get the elements for.
     * @param lectureID the ID of the lecture that the page corresponds to.
     * @return an array of Entities retrieved from the database.
     */
    public Entity[] getEntities(int pageID, int lectureID) {
        // Create a query to select every row from the entity table.
        String query = String.format("select * from ENTITY where PAGEID = %s "
                + "and LECTUREID = %s", pageID, lectureID);
        
        // Retrieve the list of objects for the query.
        List<Entity> entities = getResultsFromQuery(query, (results) -> {
            try {
                // Create a new Lecture object with the information from the row.
                Entity entity = new Entity();
                entity.setEntityID("" + results.getInt("ENTITYID"));
                entity.setPageID("" + results.getInt("PAGEID"));
                entity.setLectureID("" + results.getInt("LECTUREID"));
                entity.setEntityType(results.getString("ENTITYTYPE"));
                entity.setEntityContent(results.getString("ENTITYCONTENT"));
                entity.setEntityAnimation(results.getString("ENTITYANIMATION"));
                entity.setEntityX("" + results.getInt("ENTITYX"));
                entity.setEntityY("" + results.getInt("ENTITYY"));
                entity.setEntityZ("" + results.getInt("ENTITYZ"));
                entity.setEntityWidth("" + results.getInt("ENTITYWIDTH"));
                entity.setEntityHeight("" + results.getInt("ENTITYHEIGHT"));
                return entity;
            } catch (SQLException e) {
                System.err.println(e.getMessage());
                return null;
            }
        });
        
        return entities.toArray(new Entity[0]);
    }
    
    /**
     * Retrieves all of the Lecture objects in the database sorted by their names.
     * 
     * @return an array of Lectures retrieved from the database.
     */
    public Lecture[] getLectures() {
        // Create a query to select every row from the Lecture table and order
        // them alphabetically by name.
        String query = "select * from LECTURE order by LECTURETITLE";
        
        // Retrieve the list of objects for the query.
        List<Lecture> lectures = getResultsFromQuery(query, (results) -> {
            try {
                // Create a new Lecture object with the information from the row.
                Lecture lecture = new Lecture();
                lecture.setLectureID("" + results.getInt("LECTUREID"));
                lecture.setLectureTitle(results.getString("LECTURETITLE"));
                lecture.setCourseTitle(results.getString("COURSETITLE"));
                lecture.setInstructor(results.getString("INSTRUCTOR"));
                return lecture;
            } catch (SQLException e) {
                System.err.println(e.getMessage());
                return null;
            }
        });
                
        // Return the lectures.
        return lectures.toArray(new Lecture[0]);
    }
    
    /**
     * Retrieves all of the pages for the lecture with the specified ID.
     * 
     * @param lectureID the ID of the lecture to retrieve the pages for.
     * @return an array of all pages retrieved from the database.
     */
    public Page[] getPages(int lectureID) {
        // Create a query to select all of the pages corresponding to the 
        // specified lecture.
        String query = String.format("select * from PAGE where LECTUREID = %s"
                + " order by PAGESEQUENCE",
                lectureID);
        
        // Retrieve the list of objects from the query.
        List<Page> pages = getResultsFromQuery(query, (results) -> {
            try {
                Page page = new Page();
                page.setPageID("" + results.getInt("PAGEID"));
                page.setLectureID("" + results.getInt("LECTUREID"));
                page.setPageSequence("" + results.getInt("PAGESEQUENCE"));
                page.setPageAudioURL(results.getString("PAGEAUDIOURL"));
                return page;
            } catch (SQLException e) {
                System.err.println(e.getMessage());
                return null;
            }
        });
        
        // Return the pages.
        return pages.toArray(new Page[0]);
    }
    
    /**
     * Returns a list of objects resulting from a SQL query.
     * 
     * In order to convert the results of the SQL query to the appropriate
     * object type, a mapping function must also be supplied.
     * 
     * @param <T> the object types that should be returned in the list.
     * @param query a string representing a SQL query to execute on the current
     *              connection.
     * @param mapper a mapping function that takes a ResultSet object and returns
     *               an object of type T.
     * @return a list of objects of the specified type or null if the query
     *         failed horribly.
     */
    public <T> List<T> getResultsFromQuery(String query, 
            Function<ResultSet, T> mapper) {
        
        // Attempt to run an SQL statement.
        try {
            
            // Create a list to hold all of the objects.
            ArrayList<T> list = new ArrayList<>();
            
            // Create a new SQL statement.
            Statement statement = connection.createStatement();
            
            // Execute the given query.
            ResultSet results = statement.executeQuery(query);
            
            // Iterate through all of the rows returned by the query.
            while (results.next())
                // Map each row to an object and add it to the list.
                list.add(mapper.apply(results));
            
            // Return the created list.
            return list;
            
        } catch (SQLException e) {
            System.err.println(e.getMessage());
            
            // Initialize the database.
            initTables();
            
            // Attempt to retry the query.
            try {
                return getResultsFromQuery(query, mapper);
            } catch (StackOverflowError error) {
                // If the query failed this many times, it's an invalid query,
                return null;
            }
        }
    }
    
    /**
     * Ensures the database's tables have been created.
     * 
     * If the tables have not been created, the tables are created using the
     * queries specified in initDatabase.sql.
     */
    public void initTables() {
        // Attempt to execute a SQL statement.
        try {
            // Open the init SQL file.
            try (Scanner in = new Scanner(getClass().getClassLoader()
                    .getResourceAsStream(INIT_SQL_FILE))) {
                
                // Start building a string.
                StringBuilder s = new StringBuilder();
                
                // Add each line to the string.
                while (in.hasNextLine())
                    s.append(in.nextLine());
                
                // Create a new SQL statement.
                Statement statement = connection.createStatement();
                
                // Iterate through all of the statements in the file.
                for (String query : s.toString().split(";"))
                    statement.execute(query);
            }
        } catch (SQLException e) {
            // Print the error message.
            System.err.println(e.getMessage());
        }
    }
    
    /**
     * Runs the specified query.
     * 
     * @param query a string representing a SQL query.
     */
    public void query(String query) {
        try {
            // Create a new statement for the database connection.
            Statement statement = connection.createStatement();
            
            // Execute the query.
            statement.executeQuery(query);
        
        // Print any errors.
        } catch (SQLException e) {
            System.err.println(e.getMessage());
            System.err.println("Messed up query: " + query);
        }
    }
    
    /**
     * Updates the specified Entity in the database.
     * 
     * @param entity an Entity object whose properties should be updated in the
     *               database. The Entity object must have an ID that is
     *               in the database, as the record with that ID will be the
     *               one that is updated.
     */
    public void updateEntity(Entity entity) {
        // Create a query to update the entity in the database.
        String query = String.format(
                "update ENTITY set "
                        + "ENTITYTYPE='%s',"
                        + "ENTITYX=%s,"
                        + "ENTITYY=%s,"
                        + "ENTITYZ=%s,"
                        + "ENTITYCONTENT='%s',"
                        + "ENTITYANIMATION='%s'"
                        + "ENTITYWIDTH=%s,"
                        + "ENTITYHEIGHT=%s"
                        + "where ENTITYID=%s"
                        + "and PAGEID=%s"
                        + "and LECTUREID=%s",
                entity.getEntityType(),
                entity.getEntityX(),
                entity.getEntityY(),
                entity.getEntityZ(),
                entity.getEntityContent(),
                entity.getEntityAnimation(),
                entity.getEntityWidth(),
                entity.getEntityHeight(),
                entity.getEntityID(),
                entity.getPageID(),
                entity.getLectureID()
        );
        
        // Execute the query.
        query(query);
    }
    
    /**
     * Updates the specified lecture in the database.
     * 
     * @param lecture a Lecture object whose properties should be updated in the
     *                database. The Lecture object must have an ID that is in
     *                the database, as the record with that ID will be the one
     *                that is updated.
     */
    public void updateLecture(Lecture lecture) {
        // Create a query to update the lecture in the database.
        String query = String.format(
                "update LECTURE set "
                        + "LECTURETITLE='%s',"
                        + "COURSETITLE='%s',"
                        + "INSTRUCTOR='%s'"
                        + "where LECTUREID=%s",
                lecture.getLectureTitle(),
                lecture.getCourseTitle(),
                lecture.getInstructor(),
                lecture.getLectureID()
        );
        
        // Execute the query.
        query(query);
    }
    
    /**
     * Updates the specified page in the database.
     * 
     * @param page a Page object whose properties should be updated in the
     *                database. The Page object must have an ID that is in
     *                the database, as the record with that ID will be the one
     *                that is updated.
     */
    public void updatePage(Page page) {
        // Create a query to update the Page in the database.
        String query = String.format(
                "update PAGE set "
                        + "PAGESEQUENCE=%s,"
                        + "PAGEAUDIOURL='%s'"
                        + "where PAGEID=%s"
                        + "and LECTUREID=%s",
                page.getPageSequence(),
                page.getPageAudioURL(),
                page.getPageID(),
                page.getLectureID()
        );
        
        // Execute the query.
        query(query);
    }
}
