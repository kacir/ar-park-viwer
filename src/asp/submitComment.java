package asp;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/submitcomment")
public class submitComment extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //harvest all the parameters from the comments url parameters
        String lat = request.getParameter("lat");
        String lon = request.getParameter("lon");
        String rate = request.getParameter("rate");
        String explain = request.getParameter("explain");
        String email = request.getParameter("email");
        String phone = request.getParameter("phone");
        String prime = request.getParameter("prime");

        String sql = "INSERT INTO comments (geom , rate, explain, email, phone, prime)" +
                "VALUES ( ST_SetSRID(ST_MakePoint( " + lat + " , " + lon + " ), 4326), " + rate + "," +  explain + "," + email + "," + phone + "," + prime + " ); ";
        System.out.println("Following is the sql code for inserting the record");
        System.out.println(sql);

        DBUtility dbutil = new DBUtility();
        dbutil.modifyDB(sql);
        System.out.println("finished inserting record");

    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }
}
