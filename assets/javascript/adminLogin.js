



function validateFeild(){
let username =document.getElementById("username")
let password =document.getElementById("password")
if(username.value.trim()==""){
    username.style.border="solid 2px red"
    
return false
}
else if(password.value.trim()==""){
    password.style.border="solid 2px red"
    return false
}
else{
    return true;
}
}





function addProVlidation(){
    let productPrice=document.getElementById("productPrice").value
    let stockCount=document.getElementById("stockCount").value

    if(productPrice<0){
        alert(" price cannot be  negative")
    
        return false;
    }
    else if(stockCount<0){
        alert("stock cannot be negative")
        return false;
    }
    else{
        return true;

}
}




 
