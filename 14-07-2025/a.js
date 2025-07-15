
function myfun() {
    let num1 = parseInt(document.getElementById("number1").value)
    let num2 = parseInt(document.getElementById("number2").value)
    if (num1 && num2){
       
        sum = num1 + num2; 
        document.getElementById("result").innerHTML=`sum of ${num1} and ${num2} is :${sum}`;
    }
    else{
        alert("Please enter valid numbers");
    }
}
let s = {
    "name":"suresh",
    "age":20,
    "address":"hyderabad",
    "phone":9863456789
}
console.log(s);
console.log(s.name)
console.log(s.age)
console.log(s.address)
console.log(s.phone)