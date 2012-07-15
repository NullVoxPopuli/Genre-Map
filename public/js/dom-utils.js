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

Array.prototype.minOfObjectForField = function(field){
  var min = Infinity;
  var curValue;
  for (var i = 0; i < this.length; i++){
    curValue = this[i][field];
    if (curValue != "" && (curValue < min)){
      min = curValue;
    }
  }
  return min;
}

Array.prototype.maxOfObjectForField = function(field){
  var max = -1 * Infinity;
  var curValue;
  for (var i = 0; i < this.length; i++){
    curValue = this[i][field]
    if (curValue != "" && (curValue > max)){
      max = curValue;
    }
  }
  return max;
}

Array.prototype.addAll = function(a) {
//Adds all the elements in a to this array. 
// By L. Preston Sego III (MIT Licensed)
  for (var i = 0;  i < a.length;  i++) {
      this.push(a[i]);
  }
    
}

Array.prototype.addAllUniq = function(a){
//Adds all the elements in a to this array, maintaining uniqness.
//  Assumes the source array is already unique 
// By L. Preston Sego III (MIT Licensed)
  var curElement;
  for (var i = 0;  i < a.length;  i++) {
    curElement = a[i]
    if (this.indexOf(curElement) == -1){
      this.push(curElement);
    }
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

Array.prototype.min = function() {
// http://stackoverflow.com/questions/1669190/javascript-min-max-array-values
    var r = this[0];
    this.forEach(function(v,i,a){if (v<r) r=v;});
    return r;
};





// ← Kenneth Tynan prophesies CGIThe BBC, Glow and jQuery →
// Additional methods for JavaScript Array
// Posted on 7 October, 2010 
// Below is a basic set of additions to the JavaScript Array prototype to make it easier to work with numeric arrays.

// Disclaimer: these additions work for me, but I can’t vouch for their correctness or efficiency, with all values in all situations on all platforms.

// I’m also aware that adding methods to an existing class is, in many situations, a bad idea! These additions were useful to me in a highly constrained context but, obviously, this kind of approach does not scale well, particularly with multiple coders and multiple JavaScript libraries.

Array.prototype.absMax = function(){
  return Math.max.apply({}, Math.abs(this));
};

Array.prototype.absMin = function(){
  return Math.min.apply({}, Math.abs(this));
};

Array.prototype.avg = function(){
  return this.sum() / this.length;
};

Array.prototype.max = function(){
  return Math.max.apply({}, this);
};

Array.prototype.median = function(){
  var sortedArray = this.slice().sort(function(a, b){return a - b;}); // make a deep copy and sort it
return sortedArray[Math.floor(this.length / 2)]; // for one item, i = 0; two items, i = 1; 3 items, i = 1...
};

Array.prototype.min = function(){
  return Math.min.apply({}, this);
};

Array.prototype.numSort = function(){
  return this.sort(function(a, b){return a - b;});
};

Array.prototype.sum = function(){
  for (var i = 0, sum = 0 ; i != this.length; ++i) {
    var n = this[i];
    if(!isNaN(n)) {
      sum += n;
    }
  }
  return sum;
};