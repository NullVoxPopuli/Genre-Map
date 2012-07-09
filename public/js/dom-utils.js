Array.prototype.remove = function(from, to) {
  // Array Remove - By John Resig (MIT Licensed)
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};


Array.prototype.indexOfObjectForField = function(field, itemToSearchFor, startIndex){
  // By L. Preston Sego III (MIT Licensed)
  // only for arrays where every element in the array is an object containing feilds
  // aka, array of hashes/dictionaries
  // returns -1 if the object isn't found.
  // startIndex is optional
  startIndex = (typeof(startIndex) == "undefined" ? 0 : startIndex);
  for (var i = startIndex; i < this.length; i++){
    if (this[i][field] == itemToSearchFor){
      return i;
    }
  }
  return -1;
}

Array.prototype.addAll = function(a) {
//Adds all the elements in a to this array. 
// By L. Preston Sego III (MIT Licensed)
  for (var i = 0;  i < a.length;  i++) {
      this.push(a[i]);
  }
    
}

Array.prototype.firstNonUndefined = function(startIndex){
// By L. Preston Sego III (MIT Licencsed)
// Returns the first value in the array that isn't undefined

  startIndex = (typeof(startIndex) == "undefined" ? 0 : startIndex);

  for (var i = startIndex; i < this.length; i++){
    if (typeof(this[i]) != "undefined"){
      return this[i];
    }
  }
}


Array.prototype.clean = function(deleteValue) {
  // http://stackoverflow.com/questions/281264/remove-empty-elements-from-an-array-in-javascript
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

Array.prototype.clear = function(){
  // returns this, which is an empty array
  this.length = 0;
  return this;
}