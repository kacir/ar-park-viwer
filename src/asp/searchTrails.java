package asp;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.ResultSet;

@WebServlet("/searchTrails")
public class searchTrails extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //collect the parameters from front end
        String foot = request.getParameter("foot");
        String bike = request.getParameter("bike");
        String water = request.getParameter("water");

        String whereClause = "WHERE ";
        if (!(foot == "") || !(bike == "") || !(water == "")) {
            if (!(foot == "")){
                whereClause += "design_cat = 'foot'";
            }
            if (!(bike == "")){
                if (whereClause == "WHERE "){
                    whereClause += "design_cat = 'bike'";
                } else {
                    whereClause += "OR design_cat = 'bike'";
                }
            }
            if (!(water == "")){
                if (whereClause == "WHERE "){
                    whereClause += "design_cat = 'water'";
                } else {
                    whereClause += "OR design_cat = 'water'";
                }
            }
        }

        String natural = request.getParameter("natural");
        String paved = request.getParameter("paved");
        if (!(natural == "")){
            whereClause += "material = 'Natural'";
        }

        String sql = "SELECT geom, name, design_cat, material FROM recreation_trail_line";

        DBUtility dbutil = new DBUtility();
        ResultSet res = dbutil.queryDB(sql);

    }
}
