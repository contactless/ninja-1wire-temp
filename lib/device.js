var stream = require('stream')
  , util = require('util');

// Give our device a stream interface
util.inherits(Device,stream);

// Export it
module.exports=Device;
fs = require('fs')

/**
 * Creates a new Device Object
 *
 * @property {Boolean} readable Whether the device emits data
 * @property {Boolean} writable Whether the data can be actuated
 *
 * @property {Number} G - the channel of this device
 * @property {Number} V - the vendor ID of this device
 * @property {Number} D - the device ID of this device
 *
 * @property {Function} write Called when data is received from the Ninja Platform
 *
 * @fires data - Emit this when you wish to send data to the Ninja Platform
 */
function Device(uid) {

  var self = this;

  // This device will emit data
  this.readable = true;
  // This device can be actuated
  this.writeable = false;

  this.G = uid; // G is a string a represents the channel
  this.V = 0; // 0 is Ninja Blocks' device list
  this.D = 31;
  this.name = "Temp w1 (" + uid + ")";

  this._uid = uid;


  this.read();
};

/**
 * Called whenever there is data from the Ninja Platform
 * This is required if Device.writable = true
 *
 * @param  {String} data The data received
 */
Device.prototype.write = function(data) {

  // I'm being actuated with data!
  console.log("write " + data);
};

Device.prototype.read = function() {
  //~ console.log('read');
  //~ console.log(this);

  var fname = "/sys/bus/w1/devices/28-" + this._uid + "/w1_slave";

    fs.readFile(fname, 'utf8', function (err,data) {
      setTimeout(this.read.bind(this),  10000);

      if (err) {
        return console.log(err);
      }

      //~ console.log(data);
      if (data.indexOf("YES") != -1) {
          var match = data.match(/t=(-?\d+)/);
          if (match) {
              var temp = parseInt(match[1]);
              if (temp!=127937 && temp!=85000) { // workaround for bug in chineese clones
                  temp /= 1000;
                  this.emit('data', temp);
                  console.log("temp=" + temp);
              }
          }
      }


    }.bind(this));


};
