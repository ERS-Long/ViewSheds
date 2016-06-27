# ViewSheds

This is a purely testing widget I put together to test the functionality of draw a viewshed and then export the shed to a shp file.
I did not refine the code at all. 

User hae to add the following reference line in the index.html

        <script type="text/javascript" src="lib/FileSaveTools.js"></script>
        <script type="text/javascript" src="lib/JS2Shapefile.js"></script>           

in my map, i also use jquery stuff, so i have the following refernce line 

        <script type="text/javascript" src="//code.jquery.com/jquery-1.7.1.min.js"></script>

my test shows it does not conflict with the jquery stuff i am using in my CMV project.


cmv settings


            ViewSheds: {
                include: true,
                id: 'ViewSheds',
                type: 'titlePane',
                canFloat: true,
                path: 'widgets/ViewSheds',
                title: '<i class="icon-large icon-upload"></i>&nbsp;&nbsp;Create View Shed',
                position: 32,
                open: false,
                options: {
                    map: true
                }
            },   

in CMV
 ![alt tag](/Capture11.PNG)

open the exported shp file in QGIS Desktop 
  ![alt tag](/Capture22.PNG)
