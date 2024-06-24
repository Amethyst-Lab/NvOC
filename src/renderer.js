function sendReady() {
    window.api.send("ready", true);
}

window.api.receive("fromMain", (data) => {
    console.log(data);
    document.getElementById('slider1').value = data[1];
    document.getElementById('value1').value = data[1];
    document.getElementById('slider2').value = data[2]/2;
    document.getElementById('value2').value = data[2]/2;
    if (data[3]) {
        document.getElementById('slider3').value = data[3];
        document.getElementById('value3').value = data[3];
        document.getElementById("enablepowermanagement").checked = true;
        document.getElementById('slider3').disabled = false;
        document.getElementById('value3').disabled = false;
    }
});

function updateValue(sliderNumber) {
    let slider = document.getElementById(`slider${sliderNumber}`);
    let value = document.getElementById(`value${sliderNumber}`);
    value.value = slider.value;
}

function updateSlider(sliderNumber) {
    let slider = document.getElementById(`slider${sliderNumber}`);
    let value = document.getElementById(`value${sliderNumber}`);
    if (value.value >= slider.min && value.value <= slider.max) {
        slider.value = value.value;
    } else {

    }
}

function getSliderValues() {
    let slider1Value = document.getElementById('value1').value;
    let slider2Value = document.getElementById('value2').value;
    let slider3Value = document.getElementById('value3').value;
    if (document.getElementById('slider3').disabled) {
        slider3Value = "NotEnabled";
    }

    window.api.send("toMain", [slider1Value, slider2Value*2, slider3Value]);
}


function ResetValues() {
    document.getElementById('slider1').value = 0;
    document.getElementById('value1').value = 0;
    document.getElementById('slider2').value = 0;
    document.getElementById('value2').value = 0;
    document.getElementById('slider3').value = 0;
    document.getElementById('value3').value = 0;
    document.getElementById("enablepowermanagement").checked = false;
    document.getElementById('slider3').disabled = true;
    document.getElementById('value3').disabled = true;
    getSliderValues();
}


function confirmCheckbox(event) {
    const checkbox = event.target;
    if (checkbox.checked) {
        if (!confirm("Are you sure you want to enable power management ?\nThis is a dangerous feature and you should know what you're doing before enabling it.\nThis feature won't work on Laptop GPU.")) {
            checkbox.checked = false;
        } else {
            document.getElementById('slider3').disabled = false;
            document.getElementById('value3').disabled = false;
        }
    } else {
        document.getElementById('slider3').disabled = true;
        document.getElementById('value3').disabled = true;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const checkbox = document.getElementById("enablepowermanagement");
    checkbox.addEventListener("change", confirmCheckbox);

    document.getElementById('slider3').disabled = true;
    document.getElementById('value3').disabled = true;
});