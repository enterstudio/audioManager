var nodeAddress = "http://localhost:8080";
var padn = [];
var tracklistUrl = "tracklists/3.json";


document.body.addEventListener('touchmove', function(e) {
    e.preventDefault();
});

function pad(url, col, title, nb) {
    this.nb = nb;
    this.url = url;
    this.title = title;
    this.col = col;
    this.file = undefined;

    this.createElement();
    if(this.url !== undefined) this.initAudio();

    if ('ontouchstart' in document.documentElement) {
        this.el.addEventListener('touchend', this.trigged.bind(this), false);
        this.el.addEventListener('touchmove', function(e) {
            e.stopPropagation();
        }, false);
        this.el.addEventListener('touchstart', function(e) {
            this.el.className = "j jst";
            this.posY = e.pageY;
            this.posX = e.pageX;
        }.bind(this), false);
    }
    else{
        this.el.addEventListener('click', this.trigged.bind(this), false);
    }
}

pad.prototype.trigged = function(e) {
    if((this.posY - e.pageY) < -20 || (this.posY - e.pageY) > 20)
        window.locked = true;
    else
        window.locked = false;

    if(!window.locked) {
        if(this.file.playing){
            this.stop();
        }
        else{
            for (var i = padn.length - 1; i >= 0; i--) {
                if(padn[i].file.playing) padn[i].stop();
            }

            this.file.play(0);
            this.el.style.backgroundColor = "#113F59";
        }
    }
    window.locked = false;
};
pad.prototype.timeupdate = function() {
    this.el.childNodes[1].style.width =  "calc(" + (this.file.currentTime/this.file.duration)*100 + "% - 24px - 2px)";
    if(!this.file.playing) this.el.childNodes[1].style.width =  "calc(100% - 24px - 2px)";
    if((this.file.currentTime - Math.round(this.file.currentTime)) > 0.1){
    }
};
pad.prototype.stop = function() {
    this.file.stop();
    this.el.style.backgroundColor = "#19BEC0";
};
pad.prototype.createElement = function() {
    this.el = document.createElement("div");
    this.el.innerHTML = this.title + "<div class=jstatus></div><div class=jtotal></div>";
    this.el.className = "j";
    document.getElementById("col" + this.col).appendChild(this.el);
};
pad.prototype.initAudio = function() {
    this.file = new audioManager(this.url);
    this.file.onend = function() {
    }.bind(this);

    this.file.ontimechange = this.timeupdate.bind(this);
};

function loadTrackList(tk) {
    for (var i = 0; i < Object.keys(tk).length; i++) {
        padn.push(new pad(tk[i]["url"], tk[i]["c"], tk[i]["title"], i));
    };
}

function getTracklist(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url + "?q=" + Date.now(), true);
    xhr.onreadystatechange = function () {
        if (xhr.status == 404) {
            xhr.abort();
        }
        else if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 0) {
            loadTrackList(JSON.parse(xhr.responseText));
        }
    };
    xhr.send(null);
}

getTracklist(tracklistUrl);



/**
 * Socket.io

var socket = io.connect(nodeAddress);
socket.on('play', function(r) {
    console.log('Play command from socket.io', r);
    if(padn[r.nb].file.playing()) padn[r.nb].file.stop();
    else{
            padn[r.nb].file.play();
            padn[r.nb].file.currentTime = (Date.now() - r.time)/1000;
    }
});

socket.on('timer', function(r) {
    padn[r['nb']].el.childNodes[1].style.width = r['time'];
    padn[r['nb']].el.style.backgroundColor = "lightgreen";
});
*/



function filter(nb)
{
    var source = audioManager.context.createMediaElementSource(audioManager.allInstances[nb].AudioElement);
    var filter = audioManager.context.createBiquadFilter();
    filter.type = "allpass";
    source.connect(filter);
    filter.connect(audioManager.speakers);
    return filter;
}