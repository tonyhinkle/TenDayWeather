<html>
        <head>
        
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
        <link rel="icon" href="/favicon.ico" type="image/x-icon">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min.js"></script>
        <link rel="stylesheet" href="style.css">
        <script src="script.js"></script>
        <script src="http://www.geoplugin.net/javascript.gp" type="text/javascript"></script>

        <META HTTP-EQUIV="Pragma" CONTENT="no-cache">

    </head>

<body style="margin-top: 20px; background-color: white; text-align: center">
    <div class="HideMe RetrievedLocation" id="TapADayMsg">Tap a day to see details</div>
    <div class="HideMe RetrievedLocation" id="TapToContMsg">Tap to continue</div>
    <div class="RetrievedLocation" id="TopMsgContainer">
        <div id="TopMsg">Tap a day to see details</div>
    </div>
    <div id="MainContent">
        <div class='responsive' id='10dayforecast'>
            <div class="row">
            <?php 
            
	        $city = $_GET["city"];
		$state = $_GET["state"];
            	
            	if(is_null($city)){
	            $city = $_COOKIE["city"];
        	    $state = $_COOKIE["state"];
		}

		if(!is_null($city) and $city != "null"){
			getWeather($city, $state);
		}
				
		function getWeather($city, $state) {

		setcookie( "city", $city, strtotime( '+365 days' ) );
		setcookie( "state", $state, strtotime( '+365 days' ) );
		
		$cityParam = str_replace(" ", "%20", $city) ;
		
		$jsonUrl = "http://api.wunderground.com/api/dc7c6e717d1e922e/forecast10day/q/${state}/${cityParam}.json";
		$json_string = file_get_contents($jsonUrl);

                //Code to generate day overview content      
                $parsed_json = json_decode($json_string, TRUE);

                for ($x = 0; $x <= 9; $x++) {
                    
                    $iconUrl = $parsed_json['forecast']['simpleforecast']['forecastday'][$x]['icon_url'];
		    $iconUrl = str_replace("/k/", "/i/", $iconUrl);
                    
                    $dayOfWeek = $parsed_json['forecast']['simpleforecast']['forecastday'][$x]['date']['weekday_short'] . ".";
                    $monthAndDay = $parsed_json['forecast']['simpleforecast']['forecastday'][$x]['date']['monthname_short'] . ". ";
                    $monthAndDay .= $parsed_json['forecast']['simpleforecast']['forecastday'][$x]['date']['day'];
                    $hiTemp = $parsed_json['forecast']['simpleforecast']['forecastday'][$x]['high']['fahrenheit'];
                    $loTemp = $parsed_json['forecast']['simpleforecast']['forecastday'][$x]['low']['fahrenheit'];
                    $humidityPct = $parsed_json['forecast']['simpleforecast']['forecastday'][$x]['avehumidity'];
                    $precipPct = $parsed_json['forecast']['simpleforecast']['forecastday'][$x]['pop'];
                    
                    $outHtml .= "<div id='day${x}' class='col-lg-2 col-md-3 col-sm-4 col-xs-6'>";
                    $outHtml .= "<table class='DayOverview ClickyTable' align='center'>";
                    $outHtml .= "<tr class='TopRow'>";
                    $outHtml .= "<td class='tdDayForecast'>";
                    $outHtml .= "<img class='addShadow' src='${iconUrl}'></td>";
                    $outHtml .= "<td class='tdDayForecast'><h4>${dayOfWeek}<br>${monthAndDay}</h4></td></tr>";
                    $outHtml .= "<td class='tdDayForecast tdDayForecastBottom' colspan='2'>";
                    $outHtml .= "Hi/Lo: <b>${hiTemp}&deg; / ${loTemp}&deg;</b><br>";
                    $outHtml .= "Humidity: <b>${humidityPct}%</b><br>";
                    $outHtml .= "Precip.: <b>${precipPct}%</b></td></tr>";
                    $outHtml .= "</table></div>";
                };
                
            	$outHtml .= "</div></div>";
                echo $outHtml;
               
                //Code to generate day detail content
                
                $outHtml = "<div class='container' id='DayForecasts'> ";
                
                $isNight = 0;
                $dayCounter = 0;
                $otherDivToToggle = "";
                                
                for ($x = 0; $x <= 19; $x++) {
                    
                    $dayNightId = "day${dayCounter}${isNight}";
                    if($isNight == 0){
                        $otherDivToToggle = "#day${dayCounter}1";
                    } else {
                        $otherDivToToggle = "#10dayforecast";
                    }
  
                    $dayForecast = $parsed_json['forecast']['txt_forecast']['forecastday'][$x]['fcttext'];
                    $dayForecast = str_replace(". ", ".</p><p>", $dayForecast);
                    $dayForecast = str_replace("F.", "&deg;F.", $dayForecast);
                    
                    $iconUrl = $parsed_json['forecast']['txt_forecast']['forecastday'][$x]['icon_url'];
                    $iconUrl = str_replace("/k/", "/i/", $iconUrl);
                    
                    $title = $parsed_json['forecast']['txt_forecast']['forecastday'][$x]['title'];
                    $title = str_replace(" ", "<br>", $title) ;
                    
                    $outHtml .= "<div class='DayDetail' id='${dayNightId}'>";
                    $outHtml .= "<table class='ClickyTable' align='center'><tr class='TopRow'>";
                    $outHtml .= "<td class='tdImgCell'><img class='addShadow' src='${iconUrl}'></td>";
                    $outHtml .= "<td class='DayDetailTopRight'><h3>${title}</h3></td></tr>";
                    $outHtml .= "<tr><td class='tdDayDetail' colspan=2><p><b>${dayForecast}</b></p></td></tr></table></div>";
                    $outHtml .= "";
                    
                    if($isNight == 1){
                        $isNight = 0;
                        $dayCounter++;
                    } else {
                        $isNight++;
                    }
                    
                };

               	$ouHtml .= "</div>";
                echo $outHtml;
                
                }
            ?>      
                
<?php 

    echo "<div class='HideMe RetrievedLocation' id='ForecastFor'>Forecast for ${city}, ${state}</div>";

?>
<div id="LocationForm">
            <table align="center">
                <tr>
                    <td>&nbsp;</td>
                </tr>
                <tr>
                    <td valign="bottom" style="text-align: right; padding-left: 10px; padding-bottom: 5px;">
                        <label for="zipCode">ZIP Code:&nbsp;</label>
                    </td>
                    <td valign="bottom" style="text-align: left; padding-bottom: 5px;">
                        <input type="text" class="text medium" name="zipCode" id="zipCode" size=10 />
                    </td>
                </tr>
                <tr>
                    <td valign="bottom" style="text-align: right">
                        <label for="city">City:&nbsp;</label>
                    </td>
                    <td valign="bottom" style="text-align: left; padding-right: 10px">
                        <input type="text" class="text medium" name="city" id="city" />
                    </td>
                </tr>
                <tr>
                    <td valign="bottom" style="text-align: right">
                        <label for="state">State:&nbsp;</label>
                    </td>
                    <td valign="bottom" style="text-align: left; padding-top: 5px;">
                        <select id="state" class="auto">
                            <option value="" selected="selected"></option>
                            <option value="AL">AL</option>
                            <option value="AK">AK</option>
                            <option value="AZ">AZ</option>
                            <option value="AR">AR</option>
                            <option value="CA">CA</option>
                            <option value="CO">CO</option>
                            <option value="CT">CT</option>
                            <option value="DE">DE</option>
                            <option value="DC">DC</option>
                            <option value="FL">FL</option>
                            <option value="GA">GA</option>
                            <option value="HI">HI</option>
                            <option value="ID">ID</option>
                            <option value="IL">IL</option>
                            <option value="IN">IN</option>
                            <option value="IA">IA</option>
                            <option value="KS">KS</option>
                            <option value="KY">KY</option>
                            <option value="LA">LA</option>
                            <option value="ME">ME</option>
                            <option value="MD">MD</option>
                            <option value="MA">MA</option>
                            <option value="MI">MI</option>
                            <option value="MN">MN</option>
                            <option value="MS">MS</option>
                            <option value="MO">MO</option>
                            <option value="MT">MT</option>
                            <option value="NE">NE</option>
                            <option value="NV">NV</option>
                            <option value="NH">NH</option>
                            <option value="NJ">NJ</option>
                            <option value="NM">NM</option>
                            <option value="NY">NY</option>
                            <option value="NC">NC</option>
                            <option value="ND">ND</option>
                            <option value="OH">OH</option>
                            <option value="OK">OK</option>
                            <option value="OR">OR</option>
                            <option value="PA">PA</option>
                            <option value="RI">RI</option>
                            <option value="SC">SC</option>
                            <option value="SD">SD</option>
                            <option value="TN">TN</option>
                            <option value="TX">TX</option>
                            <option value="UT">UT</option>
                            <option value="VT">VT</option>
                            <option value="VA">VA</option>
                            <option value="WA">WA</option>
                            <option value="WV">WV</option>
                            <option value="WI">WI</option>
                            <option value="WY">WY</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td>&nbsp;</td>
                </tr>
            </table>
            <button class="btn btn-default" id="btnGetForecast" disabled style="margin-top: 10px; color: white; background-color: #55aaff"><b>Get Forecast</b>

            </button>
        </div>
        <div style="text-align: center; padding-top: 10px; margin-top: 20px; border-top: thin solid #eeeeee"> <a href="http://www.wunderground.com/?apiref=deaaf33c4587676b">
                <img style="width: 1.75in" src="http://icons.wxug.com/logos/JPG/wundergroundLogo_4c_horz.jpg"/>
            </a>

            <p id="dataprovider" class="small">Powered by Weather Underground</p>
        </div>
    </div>
<body>
</html>