const typeBtn = document.querySelectorAll("button")
const typeSound = document.getElementById("click-ui")

function typing (){
    typeSound.currentTime = 0; 
    typeSound.play();
}

typeBtn.forEach(btn => {
    btn.addEventListener("click",typing);})