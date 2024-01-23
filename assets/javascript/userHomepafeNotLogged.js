
document.addEventListener("DOMContentLoaded", function () {
    let carouselIds = ['carouselExampleControls0', 'bottomCarousel0', 'bottom2Carousel0'];

    carouselIds.forEach(carouselId => {
        let myCarousel0 = document.getElementById(carouselId);

        myCarousel0.addEventListener('slide.bs.carousel', function (event) {
            let textColors = ["#3498db", "#e74c3c", "#2ecc71", "#f1c40f", "#e91e63", "#ecf0f1"];
            let randomIndex = Math.floor(Math.random() * textColors.length);
            let taglineElement = myCarousel0.querySelector('.carousel-caption');
            taglineElement.style.color = textColors[randomIndex];
        });
    });
});


function validateSignup(){
    let username=document.getElementById("username")
    let email=document.getElementById("email")
    let phone=document.getElementById("phone")
    let password=document.getElementById("password")

    if(username.value.trim()==""){
        username.style.border="solid 2px red"
        return false;
    }
    else if(email.value.trim()==""){
        email.style.border="solid 2px red"
        
        return false;
    }
    else if(phone.value.trim()==""){
        phone.style.border="solid 2px red"
        return false;
    }
    else if(password.value.trim()==""){
        password.style.border="solid 2px red"
        return false;
    }
    else if(password.value.trim().length<9){
        password.style.border="solid 2px red"

        return false;
    }

    else{
        return true;
    }

}

function validateLogin(){

    console.log("calling from login validation")
    let username=document.getElementById("username")
    let password=document.getElementById("password")

    if(username.value.trim()==""){
        username.style.border="solid 2px red"
        return false;
    }
    else if(password.value.trim()==""||password.value.trim().length<9){
        password.style.border="solid 2px red"
        return false;
    }
    else{
        return true;
    }

}