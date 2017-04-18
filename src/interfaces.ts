let x = () => ({ name: "Alice" });
let y = () => ({ name: "Alice", location: "Seattle" });

x = y;
y = x;


let xx = { name: "Alice" };
let yy = { name: "Alice", location: "Seattle" };

xx = yy;
yy = xx;

