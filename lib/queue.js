
module.exports.up = up = function (workerFunc) {

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

