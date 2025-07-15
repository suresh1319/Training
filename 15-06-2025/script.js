n = 10
if (n%5==0){
    console.log("Divisible by 5")
}
console.log("Even Number")
for(let i=0;i<101;i++){
    if (i%2==0){
        console.log(i)
    }
}
console.log("Odd Numbers")
for(let i=0;i<101;i++){
    if (i%2!=0){
        console.log(i)
    }
}
marks = 99;
if(marks>=90 && marks<=100){
    console.log("A");
}else if(marks>=80 && marks<90){
    console.log("B");
}else if(marks>=70 && marks<80){
    console.log("c");
}else if(marks>=60 && marks<70){
    console.log("D");
}else if(marks>=50 && marks<60){
    console.log("E");
}
else{
    console.log("Fail");
}