function myFunction() {
    for(let i=1;i<=100;i++){
        let count = 0;
        for(let j=i;j>0;j--){
            if(i%j==0){
                count++;
            }
        }
        if(count == 2){
            console.log(`${i}`);
        }
    }
} // Added closing brace for myFunction here

myFunction();
let name = "suresh"
let str = `hi my name is ${name}`
console.log(str);

m = prompt("enter the number");
for(let i=1;i<=10;i++){
    console.log(`${m} * ${i} = ${m*i}`)
}
