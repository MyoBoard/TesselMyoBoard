var MAX_DEG = 45.0;
var MAX_DEC = 0.75;
var MIN_DEC = 0.0;

var tessel = require('tessel');
var servolib = require('servo-pca9685');
var blelib = require('ble-ble113a');

var servo = servolib.use(tessel.port['D']);
var ble = blelib.use(tessel.port['A']);

var servo1 = 1; // We have a servo plugged in at position 1
var positions = [MIN_DEC, MAX_DEC/2, MAX_DEC, MAX_DEC/2];
var currentIndex = 0; 

function initBle(){
  ble.on('ready', function(err) {
    // ble.write(, 'helloworld', function(err){
    //   console.log(err);
    // });
    if(err){
      console.log(err);
      return;
    }
    // console.log('hi');
    // for(var i = 0; i < ble.profile.services.length; i++){
    //   console.log(ble.profile.services[i]);
    //   if(ble.profile.services[i].id === "generic_access"){
    //     ble.profile.services[i].characteristics[0].value = "Myo Board";
    //   }
    //   console.log(ble.profile.services[i]);
    // }   
    ble.startAdvertising();
    
  });

  ble.on('discover', function(peripheral) {
    console.log("Discovered peripheral!", peripheral.toString());
  });


  ble.on('connect', function(master, A) { 
    console.log('connected');
  });

  ble.on('disconnect', function() {
    clearInterval(interval);
    ble.startAdvertising();
  });

  ble.on('remoteWrite', function(connection, index, valueWritten){
    var floatVal = parseFloat(valueWritten);
    floatVal = Math.min(45, floatVal);
    floatVal = Math.max(-45, floatVal);
    floatVal += 45;
    floatVal /= 90;

    // var newDec = (MAX_DEC) * (floatVal / MAX_DEG);
    // if(floatVal < 0){
    //   newDec = 1 - Math.abs(newDec);
    // }
    console.log(floatVal);
    servo.move(servo1, floatVal);

    console.log(valueWritten + '° from origin.');
  }); 
}

servo.on('ready', function () {
  //  Set the minimum and maximum duty cycle for servo 1.
  //  If the servo doesn't move to its full extent or stalls out
  //  and gets hot, try tuning these values (0.05 and 0.12).
  //  Moving them towards each other = less movement range
  //  Moving them apart = more range, more likely to stall and burn out
  servo.configure(servo1, 0.05, 0.12, function () {
    servo.move(servo1, MAX_DEC/2);
    initBle();  
  });
});