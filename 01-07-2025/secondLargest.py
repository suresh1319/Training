a=[0,5,7,9,10,33,23,14]
f = s = a[0]
for i in a:
    if f<i:
        s = f
        f = i
    elif s<i and i<f:
        s=i
print(s)