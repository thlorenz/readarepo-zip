var neuron  =  require('neuron')
  , manager =  new neuron.JobManager()
  ;

manager.addJob('highlight', {
    concurrency: 10
  , work: function (msg) {
      var self = this;

      console.log('queued', msg);

      setTimeout(function () {
        console.log('done', msg); 
        self.msg = msg;
        self.finished = true;
      }, 200);
    }
  });

manager.on('finish', function (job, worker) {
  console.log('finish');
  console.log(worker);
});


var i = 0;

console.log('enqueueing', manager.enqueue('highlight', 'job' + i++));
console.log('enqueueing', manager.enqueue('highlight', 'job' + i++));
