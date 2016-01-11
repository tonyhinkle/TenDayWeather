function setSubmitButton() {
    if ($('#city').val() !== "" && $('#state').val() !== "") {
        $("#btnGetForecast").prop('disabled', false);
        $("#btnGetForecast").focus();
    } else {
        $("#btnGetForecast").prop('disabled', true);
    }
}

jQuery(document).ready(function ($) {

    if ($.cookie("city")) {
        console.log("Using cookies for " + $.cookie("city") + ", " + $.cookie("state"));
        get_weather($.cookie("city"), $.cookie("state"))
    } else {
        get_weather(geoplugin_city(), geoplugin_region())
    }

    setcss();

    $('#city').keyup(function (e) {
        setSubmitButton();
    });

    $('#state').change(function (e) {
        setSubmitButton();
    });

    $('#zipCode').keyup(function (e) {
        var zipCode = $(this).val();

        if (zipCode.length === 5 && $.isNumeric(zipCode)) {
            var requestURL = 'http://ziptasticapi.com/' + zipCode;
            $.getJSON(requestURL, null, function (data) {
                if (data.city) $('#city').val(data.city);
                if (data.state) $('#state').val(data.state);
                setSubmitButton();
            });
        }
    });

    $("#btnGetForecast").click(function getforecast() {

        window.scrollTo(0, 0);

        /* If a city or state wasn't entered, notify user and abort */
        if (!$("#city").val() || !$("#state").val()) {
            $("#ForecastFor").html("Please enter a city and state!");
            $("#10dayforecast").html("");
            return;
        }

        $(".tdDayForecast").fadeTo(600, 0);
        $("#DayForecasts").empty();
        var state = $("#state option:selected").text();
        var city = $("#city").val();
        get_weather(city, state);
        $('.DayDetail').hide();
        $('#10dayforecast').show();
    });
});

function get_weather(city, state) {
  
    $('#TopMsg').html("Loading forecast for <br>" + city + ", " + state);
    $.ajax({
        url: "http://api.wunderground.com/api/dc7c6e717d1e922e/forecast10day/q/" + state + "/" + city + ".json",
        dataType: 'JSON',
        type: 'POST',
        success: function (parsed_json) {

            var failMessage = "Couldn't find a city match for " + city + ", " + state + ".";

            if (typeof (parsed_json.response.error) != "undefined") {
                $("#ForecastFor").html(failMessage);
                $("#10dayforecast").html("");
                setcss();
                window.scrollTo(0, 0);
                return;
            }

            $.cookie("city", city, {
                expires: 365
            });
            $.cookie("state", state, {
                expires: 365
            });

            /*Build the div that contains the tables for the 10 day overviews  */
            var formattedOutput = "<div class='row' style='padding-bottom: 10px'>";

            $.each(parsed_json.forecast.simpleforecast.forecastday, function (index, value) {

                formattedOutput += "<div id='day" + index + "' class='col-lg-2 col-md-3 col-sm-4 col-xs-6' style='margin-bottom: 10px'>";
                formattedOutput += "<table class='DayOverview ClickyTable' align='center'><tr class='TopRow'>"
                formattedOutput += "<td class='tdDayForecast'><img class='addShadow' src='" + value.icon_url.replace("/k/", "/i/") + "'></td>";
                formattedOutput += "<td class='tdDayForecast'><h4>" + value.date.weekday_short + ".<br>" + value.date.monthname_short
                formattedOutput += ". " + value.date.day + "</h4></td></tr>";
                formattedOutput += "<tr><td class='tdDayForecast tdDayForecastBottom'; padding-top: 5px' colspan=2>Hi/Lo: <b>"
                formattedOutput += value.high.fahrenheit + "&deg; / " + value.low.fahrenheit + "&deg;</b>";
                formattedOutput += "<br>Humidity: <b>" + value.avehumidity + "%</b><br>Precip.: <b>" + value.pop + "%</b></td></tr>";
                formattedOutput += "</table></div>";

            });

            $("#ForecastFor").html("Forecast for " + city + ", " + state);
            $("#TopMsg").html($("#ForecastFor").html());

            formattedOutput += "</div>";
            $("#10dayforecast").html(formattedOutput);

            /* Populate the DIVs that contain the day and night text forcast*/
            var isNight = 0
            var dayCounter = 0
            var OtherDivToToggle = ""
            var forecastHtml = ""

            $.each(parsed_json.forecast.txt_forecast.forecastday, function (index, value) {

                var dayNightId = "day" + dayCounter.toString() + isNight.toString();
                if (isNight === 0) {
                    OtherDivToToggle = "#day" + dayCounter + "1";
                } else {
                    OtherDivToToggle = "#10dayforecast"
                }

                formattedOutput = "<div class='DayDetail' id='" + dayNightId + "' style='display: none'>";
                formattedOutput += "<table class='ClickyTable' align='center'><tr style='border-bottom: thin solid white'>";
                formattedOutput += "<td style='vertical-align: center; padding: 10px; width: 50px'><img class='addShadow' src='"
                formattedOutput += value.icon_url.replace("/k/", "/i/") + "'></td>";
                formattedOutput += "<td class='tdDate' style='padding: 10px;'><h3>" + value.title.replace(' ', '<br>'); + "</h3></td>";
                formattedOutput += "<tr><td class='tdDayDetail' style='text-align: left; padding: 10px' colspan=2><p>";
                formattedOutput += "<b>" + (value.fcttext.split(". ").join(".</p><p>")).replace('F.', '&deg;F.') + "</b>";
                formattedOutput += "</p></td></tr></table>";
                $("#DayForecasts").append(formattedOutput);

                if (isNight == 1) {
                    isNight = 0;
                    dayCounter++;
                } else {
                    isNight++;
                }

                /* End of the each loop for day and night text forcast DIVs*/
            });

            setcss();
            window.scrollTo(0, 0);
        }
    });
}

function setcss() {

    $("img").css("backgroundColor", "white").css("borderRadius", "10px");
    $(".TopRow").css("borderBottom", "thin solid white");
    $("td").css('whiteSpace', 'nowrap');
    $(".tdDayDetail").css('whiteSpace', 'normal').css('maxWidth', '250px').css('minWidth', '200px');
    $(".tdDayForecast").css('padding', '10px').css('color', 'white');
    $("table").css("backgroundColor", "#55aaff").css("borderRadius", "20px");
    $(".TopRow td:first-child").css("padding-right", "0px");
    $(".tdDayForecast").hide();
    $(".tdDayForecast").fadeIn();
    registerEvents();

}

function replaceAll(string, find, replace) {
    return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

setInterval(PulseTopMsg, 6000);

function PulseTopMsg() {
  
  /* Don't change the message if it's loading */
	if ($('#TopMsg:contains("Loading forecast for")').length > 0){ return; }


  var MsgToShow = "";

  if ($("#ForecastFor").html() == "Please enter a city and state!") {
    MsgToShow = '#ForecastFor';
  } else {
    /* Determine which message to show */
    if ($('.DayDetail:visible').length !== 0) {
      MsgToShow = '#TapToContMsg';
    } else {
      MsgToShow = '#TapADayMsg';
    }
  }

  /* Fade out the message, switch the text, and fade it back in */
  $('#TopMsg').fadeTo(1000, 0, function () {

    if ($('#TopMsg').html() == $('#ForecastFor').html()) {
      $('#TopMsg').html($(MsgToShow).html());
    } else {
      $('#TopMsg').html($('#ForecastFor').html());
    }

    $('#TopMsg').fadeTo(1000, 1);
  });
}

function registerEvents() {

    $(".DayOverview").click(function () {

        var dayId = $(this).parent().attr('id');
        $('#10dayforecast').toggle();
        $('#' + dayId + '0').fadeIn(600);
        $('body').animate({
            scrollTop: 0
        }, 'slow');
        
        $("#LocationForm").hide();
        $('#TopMsg').html($('#TapToContMsg').html()).fadeTo(1000, 1);
        
    });

    $(".DayDetail").click(function () {

        var dayId = $('.DayDetail:visible:first').attr('id');
        console.log(dayId);
        var nextShown;

        //Determine what to show next
        if (dayId.substr(dayId.length - 1) == "0") {
            //Show the night
            nextShown = dayId.slice(0, -1) + "1";
        } else {
            //Show the 10 day
            nextShown = '10dayforecast';
            $('#TopMsg').html($('#TapADayMsg').html()).fadeTo(1000, 1);
            $("#LocationForm").show();
        }

        $('#' + nextShown).fadeIn();
        $('#' + dayId).toggle();
        $('body').animate({
            scrollTop: 0
        }, 'slow');
    });
}