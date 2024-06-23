document.addEventListener("DOMContentLoaded", () => {
    const enablePowerManagementCheckbox = document.getElementById("enablepowermanagement");
    const slider1 = document.getElementById('slider1');
    const value1 = document.getElementById('value1');
    const slider2 = document.getElementById('slider2');
    const value2 = document.getElementById('value2');
    const slider3 = document.getElementById('slider3');
    const value3 = document.getElementById('value3');

    enablePowerManagementCheckbox.addEventListener("change", (event) => {
        if (event.target.checked) {
            if (confirm("Are you sure you want to enable power management?\nThis is a dangerous feature and you should know what you're doing before enabling it.\nThis feature won't work on Laptop GPU.")) {
                slider3.disabled = false;
                value3.disabled = false;
            } else {
                event.target.checked = false;
            }
        } else {
            slider3.disabled = true;
            value3.disabled = true;
        }
    });

    slider3.disabled = true;
    value3.disabled = true;

    window.api.receive("fromMain", (data) => {
        console.log(data);
        slider1.value = data[1];
        value1.value = data[1];
        slider2.value = data[2] / 2;
        value2.value = data[2] / 2;

        if (data[3]) {
            slider3.value = data[3];
            value3.value = data[3];
            enablePowerManagementCheckbox.checked = true;
            slider3.disabled = false;
            value3.disabled = false;
        }
    });
});

function sendToMain(channel, message) {
    window.api.send(channel, message);
}

function exemple() {
    sendToMain("toMain", "installps");
}

function sendReady() {
    sendToMain("ready", true);
}

function updateValue(sliderNumber) {
    const slider = document.getElementById(`slider${sliderNumber}`);
    const value = document.getElementById(`value${sliderNumber}`);
    value.value = slider.value;
}

function updateSlider(sliderNumber) {
    const slider = document.getElementById(`slider${sliderNumber}`);
    const value = document.getElementById(`value${sliderNumber}`);
    const val = parseFloat(value.value);
    if (val >= slider.min && val <= slider.max) {
        slider.value = value.value;
    }
}

function getSliderValues() {
    const slider1Value = document.getElementById('value1').value;
    const slider2Value = document.getElementById('value2').value;
    let slider3Value = document.getElementById('value3').value;
    if (document.getElementById('slider3').disabled) {
        slider3Value = "NotEnabled";
    }
    sendToMain("toMain", [slider1Value, slider2Value * 2, slider3Value]);
}

function resetValues() {
    const sliders = [1, 2, 3];
    sliders.forEach(num => {
        document.getElementById(`slider${num}`).value = 0;
        document.getElementById(`value${num}`).value = 0;
    });
    document.getElementById("enablepowermanagement").checked = false;
    document.getElementById('slider3').disabled = true;
    document.getElementById('value3').disabled = true;
    getSliderValues();
}
