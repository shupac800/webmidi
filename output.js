
// Check if the Web MIDI API is supported by the browser
if (navigator.requestMIDIAccess) {
 
  // Try to connect to the MIDI interface.
  navigator.requestMIDIAccess({sysex:true}).then(onSuccess, onFailure);
 
} else {
  console.log("Web MIDI API not supported!");
}
 
// Function executed on successful connection
function onSuccess(interface) {
 
  var noteon,
      noteoff,
      outputs = [];
 
  // Grab an array of all available devices
  var iter = interface.outputs.values();
  for (var i = iter.next(); i && !i.done; i = iter.next()) {
    outputs.push(i.value);
  }
 
  // Craft 'note on' and 'note off' messages (channel 1, note number 60 [C3], max velocity)
  noteon = [0x90, 60, 127];
  noteoff = [0x80, 60, 127];

  //Send SysEx
  outputs[0].send([240, 126, 127, 6, 1, 247]);
 
  // Send the 'note on' and schedule the 'note off' for 1 second later
  outputs[0].send(noteon);
  setTimeout(
    function() {
      outputs[0].send(noteoff);
    },
    1000
  );
 
}
 
// Function executed on failed connection
function onFailure(error) {
  console.log("Could not connect to the MIDI interface");
}