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

@WebServlet("/getgeometry")
public class GetGeometry extends HttpServlet {
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String layer_name = request.getParameter("layer_name");
        System.out.println("The Layer name is: " + layer_name);
        try {
            JSONArray list = GetGeometry.format(layer_name);
            response.getWriter().write(list.toString());
        } catch (SQLException e){
            System.out.println("SQL error was fired");
        } catch (JSONException e){
            System.out.println("JSON Exception was fired");
        }

    }
    public static ResultSet sqlSearch(String sql) {
        System.out.println("The SQL for this request is: " + sql);
        DBUtility dbutil = new DBUtility();
        ResultSet res = dbutil.queryDB(sql);
        return res;
    }

    public static JSONObject geoJSONprep (JSONObject geometry , JSONObject properties) throws JSONException{
        JSONObject masterObject = new JSONObject();
        masterObject.put("type" , "Feature");
        masterObject.put("geometry" , geometry );
        masterObject.put("properties" , properties);

        return masterObject;
    }

    public static JSONArray format(String layer_name) throws SQLException, JSONException {
        JSONArray list = new JSONArray();

        ResultSet res;

        switch(layer_name) {
            case "hydro_line":
                res = GetGeometry.sqlSearch("SELECT ST_AsGeoJSON(ST_Transform(geom, 4326)) as geom, name FROM hydro_line;");
                while (res.next()) {
                    JSONObject geometry = new JSONObject(res.getString("geom"));
                    JSONObject properties = new JSONObject();
                    properties.put("name" , res.getString("name"));
                    JSONObject outputJSONObject =  geoJSONprep(geometry, properties);
                    list.put(outputJSONObject);
                }
                break;
            case "hydro_poly":
                res = GetGeometry.sqlSearch("SELECT ST_AsGeoJSON(ST_Transform(geom, 4326)) as geom, name FROM hydro_poly;");
                while (res.next()) {
                    JSONObject geometry = new JSONObject(res.getString("geom"));
                    JSONObject properties = new JSONObject();
                    properties.put("name" , res.getString("name"));
                    JSONObject outputJSONObject =  geoJSONprep(geometry, properties);
                    list.put(outputJSONObject);
                }
                break;
            case "parkboundary;":
                res = GetGeometry.sqlSearch("SELECT ST_AsGeoJSON(ST_Transform(geom, 4326)) as geom from parkboundary;");
                while (res.next()) {
                    JSONObject geometry = new JSONObject(res.getString("geom"));
                    JSONObject properties = new JSONObject();
                    JSONObject outputJSONObject =  geoJSONprep(geometry, properties);
                    list.put(outputJSONObject);
                }
                break;
            case "trailhead":
                res = GetGeometry.sqlSearch("SELECT ST_AsGeoJSON(ST_Transform(geom, 4326)) as geom, descriptio, material, type from recreation_point WHERE type = 'Trailhead';");
                while (res.next()) {
                    JSONObject geometry = new JSONObject(res.getString("geom"));
                    JSONObject properties = new JSONObject();

                    properties.put("descriptio" , res.getString("descriptio"));
                    properties.put("material" , res.getString("material"));
                    properties.put("type" , res.getString("type"));
                    JSONObject outputJSONObject =  geoJSONprep(geometry, properties);
                    list.put(outputJSONObject);
                }
                break;
            case "water_trailhead":
                res = GetGeometry.sqlSearch("SELECT ST_AsGeoJSON(ST_Transform(geom, 4326)) as geom, descriptio, material, type from recreation_point WHERE type = 'Water Trailhead';");
                while (res.next()) {
                    JSONObject geometry = new JSONObject(res.getString("geom"));
                    JSONObject properties = new JSONObject();

                    properties.put("descriptio" , res.getString("descriptio"));
                    properties.put("material" , res.getString("material"));
                    properties.put("type" , res.getString("type"));
                    JSONObject outputJSONObject =  geoJSONprep(geometry, properties);
                    list.put(outputJSONObject);
                }
                break;
            case "mtb_trailhead":
                res = GetGeometry.sqlSearch("SELECT ST_AsGeoJSON(ST_Transform(geom, 4326)) as geom, descriptio, material, type from recreation_point WHERE type = 'MTB Trailhead';");
                while (res.next()) {
                    JSONObject geometry = new JSONObject(res.getString("geom"));
                    JSONObject properties = new JSONObject();

                    properties.put("descriptio" , res.getString("descriptio"));
                    properties.put("material" , res.getString("material"));
                    properties.put("type" , res.getString("type"));
                    JSONObject outputJSONObject =  geoJSONprep(geometry, properties);
                    list.put(outputJSONObject);
                }
                break;
            case "bike":
                res = GetGeometry.sqlSearch("SELECT ST_AsGeoJSON(ST_Transform(geom, 4326)) as geom, name, material from recreation_trail_line WHERE design_cat ='Bike';");
                while (res.next()) {
                    JSONObject geometry = new JSONObject(res.getString("geom"));
                    JSONObject properties = new JSONObject();

                    properties.put("name" , res.getString("name"));
                    properties.put("material" , res.getString("material"));
                    JSONObject outputJSONObject =  geoJSONprep(geometry, properties);
                    list.put(outputJSONObject);
                }
                break;
            case "water":
                res = GetGeometry.sqlSearch("SELECT ST_AsGeoJSON(ST_Transform(geom, 4326)) as geom, name, material from recreation_trail_line WHERE design_cat ='Water';");
                while (res.next()) {
                    JSONObject geometry = new JSONObject(res.getString("geom"));
                    JSONObject properties = new JSONObject();

                    properties.put("name" , res.getString("name"));
                    properties.put("material" , res.getString("material"));
                    JSONObject outputJSONObject =  geoJSONprep(geometry, properties);
                    list.put(outputJSONObject);
                }
                break;
            case "foot":
                res = GetGeometry.sqlSearch("SELECT ST_AsGeoJSON(ST_Transform(geom, 4326)) as geom, name, material from recreation_trail_line WHERE design_cat ='Foot';");
                while (res.next()) {
                    JSONObject geometry = new JSONObject(res.getString("geom"));
                    JSONObject properties = new JSONObject();

                    properties.put("name" , res.getString("name"));
                    properties.put("material" , res.getString("material"));
                    JSONObject outputJSONObject =  geoJSONprep(geometry, properties);
                    list.put(outputJSONObject);
                }
                break;
            case "transportation_polygon":
                res = GetGeometry.sqlSearch("SELECT ST_AsGeoJSON(ST_Transform(geom, 4326)) as geom from transportation_polygon;");
                while (res.next()) {
                    JSONObject geometry = new JSONObject(res.getString("geom"));
                    JSONObject properties = new JSONObject();

                    JSONObject outputJSONObject =  geoJSONprep(geometry, properties);
                    list.put(outputJSONObject);
                }
                break;

        }
        return list;
    }
}
