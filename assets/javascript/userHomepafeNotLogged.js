
document.addEventListener("DOMContentLoaded", function () {
    let carouselIds = ['carouselExampleControls0', 'bottomCarousel0', 'bottom2Carousel0','tx1'];

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
    let usernameMessage = document.getElementById("usernameMessage");
    let passwordMessage = document.getElementById("passwordMessage");
    let phoneMessage=document.getElementById("phoneMessage")
    let emailMessage=document.getElementById("emailMessage")
    if(username.value.trim()==""){
        username.style.border="solid 2px red"
        usernameMessage.innerHTML = 'Username cannot be empty';
        return false;
    }
    else if(email.value.trim()==""){
        email.style.border="solid 2px red"
        emailMessage.innerHTML = 'Email cannot be empty';
        return false;
    }
    else if(!email.value.includes('@')){
        email.style.border="solid 2px red"
        emailMessage.innerHTML = 'Invalid email address';
        return false;
    }

    else if(phone.value.trim()==""){
        phone.style.border="solid 2px red"
        phoneMessage.innerHTML = 'Phone number cannot be empty';
        return false;
    }
    else if(password.value.trim()==""){
        password.style.border="solid 2px red"
        passwordMessage.innerHTML = 'Password cannot be empty';
        return false;
    }
    else if(password.value.trim().length<9){
        password.style.border="solid 2px red"
        passwordMessage.innerHTML = 'Password must be at least 9 characters';
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
    let usernameMessage = document.getElementById("usernameMessage");
    let passwordMessage = document.getElementById("passwordMessage");
    if(username.value.trim()==""){
        username.style.border="solid 2px red"
        usernameMessage.innerHTML = 'Username cannot be empty';

        return false;
    }
    else if(password.value.trim()==""||password.value.trim().length<9){
        password.style.border="solid 2px red"
        passwordMessage.innerHTML = 'Password cannot be empty or must be at least 9 characters';
        return false;
    }
    else{
        return true;
    }

}


