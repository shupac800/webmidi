var onoff = document.querySelector('input[name="onoff"]').value;
console.log(onoff);
var audc1 = document.forms['myForm'].elements['audc1[]'];
console.log(audc1);

var bar = document.querySelector('input[name=audf1]');
bar.addEventListener('keydown', function(event)
{
    if (event.which === 13 || event.which === 9) {
      console.log('input changed to: ', bar.value);
    }
});

function showMe() {
  console.log(audc1[0].checked);
}

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
  var noteon,
      noteoff,
      outputs = [];
 
  // Grab an array of all available devices
  var iter = interface.outputs.values();
  for (var i = iter.next(); i && !i.done; i = iter.next()) {
    outputs.push(i.value);
  }
 


  var inputs = interface.inputs;

  console.log("Found " + inputs.size + " MIDI input(s)");

  //connect to first device found
  if(inputs.size > 0) {
    var iterator = inputs.values(); // returns an iterator that loops over all inputs
    var input = iterator.next().value; // get the first input
    console.log("Connected first input: " + input.name);
    input.onmidimessage = handleMIDIMessage;
  }

  // Craft 'note on' and 'note off' messages (channel 1, note number 60 [C3], max velocity)
  noteon = [0x90, 66, 127];
  //noteoff = [145, 102, 122];
  noteoff = [0xF0,15,100];

  // Send the 'note on' and schedule the 'note off' for 1 second later
  // outputs[0].send(noteon);
  // setTimeout(
  //   function() {
  //     console.log("sending",noteoff);
  //     outputs[0].send(noteoff);
  //   },
  //   1000
  // );


 
  function handleMIDIMessage(event){
    if (event.data.length === 3) {
      console.log("status byte:",event.data[0].toString(16));
      console.log("data byte 1:",event.data[1].toString(16));
      console.log("data byte 2:",event.data[2].toString(16));
    }
  }

}
 
// Function executed on failed connection
function onFailure(error) {
  console.log("Could not connect to the MIDI interface");
}