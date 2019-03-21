package asp;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.ResultSet;
import java.sql.SQLException;

@WebServlet("/searchtrails")
public class searchTrails extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //set the response characteristics
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        //collect the parameters from front end
        Boolean foot = Boolean.parseBoolean(request.getParameter("foot"));
        Boolean bike = Boolean.parseBoolean(request.getParameter("bike"));
        Boolean water = Boolean.parseBoolean(request.getParameter("water"));

        String whereClause = "";

        if (foot == false && bike == false && water == false) {
            //nothing is needed at all
            whereClause = "";
        } else {
            if (foot){
                whereClause += " design_cat = 'Foot' ";
            }
            if (bike){
                if (whereClause.length() == 0) {
                    whereClause += " design_cat = 'Bike' ";
                } else {
                    whereClause += " OR design_cat = 'Bike' ";
                }
            }
            if (water) {
                if (whereClause.length() == 0) {
                    whereClause += " design_cat = 'Water' ";
                }
                whereClause += " OR design_cat = 'Water' ";
            }
            whereClause = " ( " + whereClause + ") ";
        }



        Boolean natural = Boolean.parseBoolean(request.getParameter("natural"));
        Boolean paved = Boolean.parseBoolean(request.getParameter("paved"));
        String surfaceSQL = "";
        if (natural == false && paved == false){
            //do nothing, no query to be added to SQL
        } else {

            if (natural){
                surfaceSQL += " material = 'Natural' ";
                if (paved){
                    surfaceSQL += " OR material = 'Paved' ";
                }
            } else {
                if (paved){
                    surfaceSQL += " material = 'Paved' ";
                }
            }

            whereClause = whereClause + " AND ( " + surfaceSQL + " ) ";
        }

        String sql;
        if (whereClause == ""){
            sql = "SELECT ST_AsGeoJSON(ST_Transform(geom, 4326)) as geom, name, design_cat, material FROM recreation_trail_line ";
        } else {
            sql = "SELECT ST_AsGeoJSON(ST_Transform(geom, 4326)) as geom, name, design_cat, material FROM recreation_trail_line WHERE " + whereClause + ";";
        }

        System.out.println("entire SQL string has been generated. it is the following");
        System.out.println(sql);


        JSONArray list = new JSONArray();

        DBUtility dbutil = new DBUtility();
        ResultSet res = dbutil.queryDB(sql);
        try {
            while (res.next()) {
                JSONObject geometry = new JSONObject(res.getString("geom"));
                JSONObject properties = new JSONObject();
                properties.put("name" , res.getString("name"));
                properties.put("design_cat" , res.getString("design_cat"));
                properties.put("material" , res.getString("material"));

                JSONObject masterObject = new JSONObject();
                masterObject.put("type" , "Feature");
                masterObject.put("geometry" , geometry);
                masterObject.put("properties" , properties);

                list.put(masterObject);
            }

            response.getWriter().write(list.toString());

        } catch (SQLException e) {
            System.out.println("SQL exception occured");
        } catch (JSONException e) {
            System.out.println("JSON exception Occured");
        }


    }
}
