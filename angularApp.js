var app = angular.module('pokeyCtrl', []);
app.controller('pokeyCtrl', function($scope) {
  console.log('controller running');
  $scope.sendOnoff = sendOnoff;
  $scope.sendRegister = sendRegister;
  $scope.audc1 = [false, false, false, false, false, false, false, false];
  $scope.audc2 = [false, false, false, false, false, false, false, false];
  $scope.audc3 = [false, false, false, false, false, false, false, false];
  $scope.audc4 = [false, false, false, false, false, false, false, false];
  $scope.audctl = [false, false, false, false, false, false, false, false];
  $scope.audf1 = 0;
  $scope.audf2 = 0;
  $scope.audf3 = 0;
  $scope.audf4 = 0;

  // Check if the Web MIDI API is supported by the browser
  if (navigator.requestMIDIAccess) {
    // Try to connect to the MIDI interface.
    navigator.requestMIDIAccess({sysex:true}).then(onSuccess, onFailure);
  } else {
    console.log("Web MIDI API not supported!");
  }


  // Function executed on successful connection
  function onSuccess(interface) {
    console.log("Detected MIDI device:",interface);

    let outputs = [];

    // Grab an array of all available devices
    var iter = interface.outputs.values();
    for (var i = iter.next(); i && !i.done; i = iter.next()) {
      outputs.push(i.value);
    }
    console.log('outputs', outputs);
   
    var inputs = interface.inputs;
    console.log("Found " + inputs.size + " MIDI input(s)");

    //connect to first device found
    if(inputs.size > 0) {
      var iterator = inputs.values(); // returns an iterator that loops over all inputs
      var input = iterator.next().value; // get the first input
      console.log("Connected first input: " + input.name);
      input.onmidimessage = handleMIDIMessage;
    }
  }


  function sendOnoff(onoff) {
    let audctl = $scope.audctl;
    let byte = byteFromArray(audctl);
    byte = onoff === 'on' ? byte | 0x07 : byte & 0xF0;
    $scope.audctl = [];
    for(let i = 0; i < 8; i++) {
       $scope.audctl.push((byte >> i & 1) ? true : false);
    }
    let data_bytes = convertByte(byte);
    console.log("sending 0xC8, " + data_bytes[0].toString(16).toUpperCase() + ", " + data_bytes[1].toString(16).toUpperCase());
    //outputs[0].send(0xC8, data_bytes[0], data_bytes[1]);
  }


  function sendRegister(reg) {
    let data_bytes = [];
    if (typeof reg === 'object') {
      data_bytes = convertByte(byteFromArray(reg));
    } else {
      data_bytes = convertByte(reg);
    }
    console.log("sending 0xC0, " + data_bytes[0].toString(16).toUpperCase() + ", " + data_bytes[1].toString(16).toUpperCase());
    //outputs[0].send(0xC0, data_bytes[0], data_bytes[1]);
  }


  function byteFromArray(arr) {
    // note, array is [bit0 ... bit7]
    let byte = 0;
    arr.forEach((bit, idx) => {
      bit = bit ? 1 : 0;
      byte += Math.pow(2, idx) * bit;
    });
    return byte;
  }


  function convertByte(byte) {
    // have to split one 8-bit byte into two 7-bit bytes
    // because MIDI data values can only be 0-127
    let byte1 = byte & 0x7F;
    let byte2 = byte >> 7;
    return [byte1, byte2]
  }


  function handleMIDIMessage(event){
    if (event.data.length === 3) {
      console.log("status byte:",event.data[0].toString(16));
      console.log("data byte 1:",event.data[1].toString(16));
      console.log("data byte 2:",event.data[2].toString(16));
    }
  }


  // Function executed on failed connection
  function onFailure(error) {
    console.log("Could not connect to the MIDI interface");
  }

});