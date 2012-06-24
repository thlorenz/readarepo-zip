
module.exports.make = make = function (workerFunc) {

  var self = {
      _pending: []
    , _running: 0
    , _active: false
    , _workerFunc: workerFunc
    , concurrency: 50
    , _run: function () {
        if (self._active === true) return;
        self._active = true;
        
        while(self._pending.length > 0  && self._running < self.concurrency) {
          var args = self._pending.shift();
          self._workerFunc.apply(self, args);
          self._running++;
        }

        self._active = false; 
      }
    , enqueue: function () { 
        self._pending.push(Array.prototype.slice.call(arguments)); 
        self._run();
      }
    , done: function () {
        self._running--;
        if (self._running === 0 && self._pending.length === 0) {
          if(self.allDone) self.allDone();
        } else {
          self._run();
        }
      }
    , allDone: undefined
  };

  return self;
};

// Example:

/*
var q = make (function (msg, o) { 
  console.log('called', o); 
  var that = this;

  setTimeout(function () {
    console.log('Pending: %s, Running: %s', that._pending.length, that._running);
    that.done(); 
    if (o.index < 10) { 
      that.enqueue('later', { index: o.index + 10, name: 'crazy' });
      that.enqueue('later', { index: o.index + 10, name: 'crazy' });
    }
  }, 200 + 100 * o.index);
});

q.allDone = function () {
  console.log('all done');
};

for (var i = 0; i < 10; i++) {
  q.enqueue('hello-' + i, { index: i, name: 'name ' + i });
  console.log('Pending: %s, Running: %s', q._pending.length, q._running);
}
*/
