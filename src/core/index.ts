type b = string | number
interface A {
  name: b;
}
class a implements A {
  name: b;
  constructor(name: b) {
    this.name = name
  }
}
export const aa = new a('qx');
console.log(aa.name);