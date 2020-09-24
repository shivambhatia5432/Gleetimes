const playButton=document.getElementById("play-button");
const pauseButton=document.getElementById("pause-button");
const stopbutton=document.getElementById("stop-button");
const textInput=document.getElementById("postcontent");
const speedInput=document.getElementById("speed");
const status=document.getElementById("status");
let currentChar;

var utterance=new SpeechSynthesisUtterance();
utterance.rate=0.8;//default rate
var voices=window.speechSynthesis.getVoices();

if(playButton){
setTimeout(() => {
    voices=window.speechSynthesis.getVoices()
    utterance.voice =voices.filter(function(voice) {
        return voice.name == "Fiona"
      })[0];
      play();
}, 100);

function play(){
console.log("Play Sound Function Active");
playButton.addEventListener("click",()=>{
    playText("Article reading starting now.   "+textInput.innerHTML);
});

pauseButton.addEventListener("click",pauseText);
stopbutton.addEventListener("click",stopText);

speedInput.addEventListener("input",()=>{
    stopText();
    utterance.rate=speedInput.value||0.8;
    console.log(utterance.rate);
    playText(utterance.text.substring(currentChar));
});

utterance.addEventListener("boundary",e=>{
     currentChar = e.charIndex;
})

function playText(text){
    if(speechSynthesis.paused && speechSynthesis.speaking){
         return speechSynthesis.resume();
    }
    if(speechSynthesis.speaking) return;
    utterance.text=text;
    speechSynthesis.speak(utterance);  
}

function pauseText(){
    if(speechSynthesis.speaking==true) speechSynthesis.pause();
};
}
function stopText(){
    speechSynthesis.resume(); 
    speechSynthesis.cancel();
}
window.onbeforeunload = function () {
    stopText();
    };
}


