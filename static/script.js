var vue = new Vue({
  
  el: '.content',
  
  data: {
    events: [],
    eventName: "",
    eventTime: "",
    inputToggle: "",
    isStart: false,
    isEnded: false,
    colors: [],
    interval: 0,
    timer: {
      position: 0,
      elapseEval: 0,
      elapseComputed: 0
    }
  },
  
  created: function () {
    
    this.inputToggle = "Start";
    this.colors = [
      "#c0392b",
      "#8e44ad",
      "#34495e",
      "#d35400",
      "#2980b9",
      "#1abc9c"
    ];
    
    this.eventName = "Start";
    this.eventTime = "00:00:03";
    this.add();
    
    this.eventName = "Presentation";
    this.eventTime = "00:15:00";
    this.add();
    
    this.calcColors();
  },
  
  methods: {
    calcColors: function() {
      
      colorI = 0;
      for (var i in this.events) {
        
        colorI--;
        if (colorI < 0) {
          colorI = this.colors.length-1;
        }
        
        this.events[i].color = this.colors[colorI];
        
      }
      
    },
    add: function() {
      
      if (this.eventName === "" || this.eventTime === "") {
        return;
      }
      
      if ((this.eventTime.match(/:/g) || []).length === 1) {
        this.eventTime+= ":00";
      }
      
      this.events.push({
        name: this.eventName,
        durationComputed: this.eventTime,
        durationEval: this.durationToEval(this.eventTime),
        elapseEval: 0,
        elapseComputed: 0
      });
      
      this.calcColors();
      this.eventName = "";
      
    },
    remove: function(key) {
      
      events = [];
      
      for (var i in this.events) {
        if (i == key) {
          continue;
        }
        events.push(this.events[i]);
      }
      
      this.events = events;
      this.calcColors();
      
    },
    toggle: function() {
      
      if (this.isStart) {
        this.stop();
      } else {
        this.start();
      }
      
    },
    start: function() {
      
      if (this.isEnded === true) {
        this.isEnded = false;
        this.reset();
      }
      
      this.isStart = true;
      this.inputToggle = "Stop";
      
      this.calcTimer();
      
      var self = this;
      var audio = new Audio('static/pop.mp3');
      
      this.interval = setInterval(function() {
        
        if (typeof self.events[self.timer.position] !== "undefined") {
          
          event = self.events[self.timer.position];
          
          if (event.elapseEval === 0 && self.timer.position > 0) {
            audio.play();
          }
          
          event.elapseEval+= 0.25;
          event.elapseComputed = self.pourc(event.elapseEval, event.durationEval);
          
          if (event.elapseEval >= event.durationEval) {
            event.elapseEval = event.durationEval;
            self.timer.position++;
          }
          
          event.durationComputed = self.durationToComputed(event.durationEval-event.elapseEval);
          
        } else {
          self.end();
        }
        
      }, 250);
      
    },
    stop: function() {
      
      this.isStart = false;
      this.inputToggle = "Start";
      
      if (this.interval) {
        
        clearInterval(this.interval);
        this.interval = 0;
        
      }
      
    },
    reset: function() {
      
      this.timer.position = 0;
      this.timer.elapseEval = 0;
      this.timer.elapseComputed = 0;
      
      for (var i in this.events) {
        
        this.events[i].elapseEval = 0;
        this.events[i].elapseComputed = 0;
        
      }
      
    },
    end: function() {
      
      this.stop();
      this.isEnded = true;
      
      var audio = new Audio('static/glass.mp3');
      audio.play();
      
    },
    durationToEval: function(durationComputed) {
      
      if ((durationComputed.match(/:/g) || []).length !== 2) {
        return 3600;
      }
      
      durationEval = 0;
      duration = durationComputed.split(":");
      
      durationEval+= parseInt(duration[0])*3600;
      durationEval+= parseInt(duration[1])*60;
      durationEval+= parseInt(duration[2]);
      
      return durationEval;
      
    },
    durationToComputed: function(durationEval) {
      
      duration = [
        0,
        0,
        0
      ];
      
      while (durationEval >= 3600) {
        duration[0]++;
        durationEval-= 3600;
      }
      if ((duration[0]+"").length == 1) {
        duration[0] = "0"+duration[0];
      }
      
      while (durationEval >= 60) {
        duration[1]++;
        durationEval-= 60;
      }
      if ((duration[1]+"").length == 1) {
        duration[1] = "0"+duration[1];
      }
      
      duration[2] = Math.floor(durationEval);
      if ((duration[2]+"").length == 1) {
        duration[2] = "0"+duration[2];
      }
      
      return duration.join(':');
      
    },
    pourc: function(elapse, duration) {
      
      result = Math.round(elapse/duration*100);
      
      if (result < 0) {
        result = 0;
      }
      
      if (result > 100) {
        result = 100;
      }
      
      return result;
      
    },
    calcTimer: function() {
      
      this.timer.position = 0;
      elapse = 0;
      duration = 0;
      for (var i in this.events) {
        
        elapse+= this.events[i].elapseEval;
        duration+= this.events[i].durationEval;
        
        if (this.events[i].elapseEval == this.events[i].durationEval) {
          continue;
        }
        
        if (elapse > this.timer.elapseEval) {
          this.timer.position = i;
        }
        
      }
      
      this.timer.elapseEval = elapse;
      this.timer.elapseComputed = this.pourc(elapse, duration);
      
    }
  }
  
});