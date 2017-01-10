var app = angular.module('pokeyCtrl', []);
app.controller('pokeyCtrl', function($scope) {
  console.log('controller running');
  $scope.sendOnoff = sendOnoff;
  $scope.sendRegister = sendRegister;
  $scope.audc1 = new Array(8).fill(false);
  $scope.audc2 = new Array(8).fill(false);
  $scope.audc3 = new Array(8).fill(false);
  $scope.audc4 = new Array(8).fill(false);
  $scope.audctl = new Array(8).fill(false);
  $scope.audf1 = 0;
  $scope.audf2 = 0;
  $scope.audf3 = 0;
  $scope.audf4 = 0;
  var outputs = [];
  var inputs;

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

    // Grab an array of all available devices
    var iter = interface.outputs.values();
    for (var i = iter.next(); i && !i.done; i = iter.next()) {
      outputs.push(i.value);
    }
    console.log('outputs', outputs);
   
    inputs = interface.inputs;
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
    let byte = byteFromArray($scope.audc1);
    byte = onoff === 'on' ? byte | 0x07 : byte & 0xF0;
    $scope.audc1 = arrayFromByte(byte);  // reload $scope.audc1 array to reflect new volume
    sendRegister("audc1", byte)
  }


  function sendRegister(name, byte) {  // byte can be a byte or a T/F array
    let addr = {"audc1" : 0,
                "audf1" : 1,
                "audc2" : 2,
                "audf2" : 3,
                "audc3" : 4,
                "audf3" : 5,
                "audc4" : 6,
                "audf4" : 7,
                "audctl": 8,
                "skctls": 15 };
    let data_bytes = [];
    if (typeof byte === 'object') {  // "byte" is T/F array?
      data_bytes = splitByte(byteFromArray(byte));
    } else {                         // "byte" is a byte
      data_bytes = splitByte(byte);
    }
    console.log("sending 0x" + (addr[name] + 0xB0).toString(16).toUpperCase() + ", 0x" + data_bytes[0].toString(16).toUpperCase() + ", 0x" + data_bytes[1].toString(16).toUpperCase());
    outputs[0].send([addr[name] + 0xB0, data_bytes[0], data_bytes[1]]);
  }


  function arrayFromByte(byte) {
    let arr = [];
    for(let i = 0; i < 8; i++) {
       arr.push((byte >> i & 1) ? true : false);
    }
    return arr;
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


  function splitByte(byte) {
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