window.onload=function(){
var kurde={
  test:function(){
    alert(this.name)
  },
  toString:function(){
    alert('oo');
  }
}
  function Person(name){
    this.name=name;
    this.show=function(){
      alert(this.name)
    }
  }
Person.prototype=kurde;
  var seba=new Person('Sebastian');

 Person.prototype.mow=function(word){
    alert(this.name+' powiedział:' +word);
  }
for(var i in seba){
  console.log(i)
}
  alert(Person.prototype.toString())
}
