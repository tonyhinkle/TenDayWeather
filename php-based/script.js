function setSubmitButton() {
    if ($('#city').val() != "" && $('#state').val() != "") {
        $("#btnGetForecast").prop('disabled', false);
    } else {
        $("#btnGetForecast").prop('disabled', true);
    }
}

jQuery(document).ready(function ($) {

    window.history.pushState('','','/');

    /* If DayForecasts is empty, get the location via geoplugin and get the forecast */
    if (!$('#DayForecasts').length){
        get_weather(geoplugin_city(), geoplugin_region());
    }
    
    $(".tdDayForecast").fadeIn();

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
        var state = $("#state option:selected").text();
        var city = $("#city").val();
        get_weather(city, state);
        $('.DayDetail').hide();
        $('#10dayforecast').show();
    });

    $("#10dayforecast").on("click", ".DayOverview", function (event) {

        var dayId = $(this).parent().attr('id');
        $('#10dayforecast').toggle();
        $('#' + dayId + '0').fadeIn(600);
        $('body').animate({
            scrollTop: 0
        }, 'slow');

        $("#LocationForm").hide();
        $('#TopMsg').html($('#TapToContMsg').html()).fadeTo(1000, 1);

    });

    $("#DayForecasts").on("click", ".DayDetail", function (event) {
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

});

function get_weather(city, state) {

	var url = "index.php?state=" + state + "&city=" + city;
	window.location.href = url;

}

function replaceAll(string, find, replace) {
    return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

PulseTopMsg();

setInterval(PulseTopMsg, 6000);

function PulseTopMsg() {

    /* Don't change the message if it's loading */
    if ($('#TopMsg:contains("Loading forecast for")').length > 0) {
        return;
    }
    
    /* Display special message if no data was retrieved */
    if (!$('#DayForecasts').length){
	 $('#TopMsg').html('Enter a city and state.');
	 return;
    }

    var MsgToShow = "";

    if ($("#ForecastFor").html() == "Please enter a city and state!") {
        MsgToShow = '#ForecastFor';
    } else {
        /* Determine which message to show */
        if ($('.DayDetail:visible').length != 0) {
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